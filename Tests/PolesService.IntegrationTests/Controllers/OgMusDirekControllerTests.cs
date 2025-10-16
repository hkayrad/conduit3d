using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Conduit3D.Common.Domain;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PolesService.Domain;
using PolesService.Infrastructure;
using PolesService.Infrastructure.Data;
using Testcontainers.PostgreSql;
using Xunit;
using Xunit.Abstractions;

namespace PolesService.IntegrationTests.Controllers;

public class OgMusDirekControllerTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public OgMusDirekControllerTests(WebApplicationFactory<Program> factory, ITestOutputHelper output)
    {
        _output = output;

        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgis/postgis:17-master") // Using PostGIS image for geometry support
            .WithDatabase("conduit3d_poles_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<PolesContext>));

                if (dbContextDescriptor != null)
                {
                    services.Remove(dbContextDescriptor);
                }

                services.AddDbContext<PolesContext>(options =>
                {
                    options.UseNpgsql(_postgresContainer.GetConnectionString(), o => o.UseNetTopologySuite());
                    options.EnableSensitiveDataLogging();
                    options.LogTo(message => _output.WriteLine(message));
                }, ServiceLifetime.Scoped);

                services.AddScoped<IUnitOfWork, UnitOfWork>();
            });
        });

        _client = _factory.CreateClient();
        _client.DefaultRequestHeaders.Add("Role", Roles.Admin);
    }

    public async Task InitializeAsync()
    {
        await _postgresContainer.StartAsync();
        _output.WriteLine($"PostgreSQL container started: {_postgresContainer.GetConnectionString()}");

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PolesContext>();

        try
        {
            await context.Database.ExecuteSqlRawAsync("SELECT 1");

            await context.Database.ExecuteSqlRawAsync(@"DROP TABLE IF EXISTS ""SBK_OGMUSDIREK"" CASCADE;");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE OR REPLACE FUNCTION generate_searchable_text_ayd_direk(
                    id_val INT, 
                    kodu_val TEXT,
                    adi_val TEXT, 
                    cinsi_val TEXT,
                    tipi_val TEXT,
                    direk_no_val TEXT,
                    boy_ozellik_val TEXT,
                    direk_boy_id_val FLOAT8
                )
                RETURNS tsvector
                AS $$
                SELECT to_tsvector('simple', 
                    coalesce(cast(id_val as text), '') || ' ' ||
                    coalesce(kodu_val, '') || ' ' ||
                    coalesce(adi_val, '') || ' ' ||
                    coalesce(cinsi_val, '') || ' ' ||
                    coalesce(tipi_val, '') || ' ' ||
                    coalesce(direk_no_val, '') || ' ' ||
                    coalesce(boy_ozellik_val, '') || ' ' ||
                    coalesce(cast(direk_boy_id_val as text), '')
                );
                $$ LANGUAGE SQL IMMUTABLE;
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS public.""SBK_OGMUSDIREK"" (
                    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
                    geometry geometry(Point,3857),
                    kodu character varying(50) COLLATE pg_catalog.default,
                    adi character varying(50) COLLATE pg_catalog.default,
                    cinsi character varying(20) COLLATE pg_catalog.default,
                    tipi character varying(50) COLLATE pg_catalog.default,
                    direk_no character varying(40) COLLATE pg_catalog.default,
                    boy_ozellik character varying(20) COLLATE pg_catalog.default,
                    direk_boy_id double precision,
                    CONSTRAINT ""SBK_OGMUSDIREK_pkey"" PRIMARY KEY (id)
                )
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""SBK_OGMUSDIREK"" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
                    generate_searchable_text_ayd_direk(id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id)
                ) STORED;
            ");

            _output.WriteLine("SBK_OGMUSDIREK table created");

            var canConnect = await context.Database.CanConnectAsync();
            _output.WriteLine($"Can connect to database: {canConnect}");

            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_OGMUSDIREK""(
                    geometry, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id)
                    VALUES (ST_GeomFromText('POINT(4595628.03 4851138.0794)', 3857), 'DIREK-001', 'Direk 1', 'Demir', 'Tip 1', 'Direk No 1', 'Boy Özellik 1', 1);
                ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_OGMUSDIREK""(
                    geometry, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id)
                    VALUES (ST_GeomFromText('POINT(4595628.03 4851138.0794)', 3857), 'DIREK-002', 'Direk 2', 'Demir', 'Tip 2', 'Direk No 2', 'Boy Özellik 2', 2);
                ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_OGMUSDIREK""(
                    geometry, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id)
                    VALUES (ST_GeomFromText('POINT(4595680.5 4851180.1)', 3857), 'DIREK-003', 'Direk 3', 'Demir', 'Tip 3', 'Direk No 3', 'Boy Özellik 3', 3);
                ");
        }
        catch (Exception ex)
        {
            _output.WriteLine($"Database initialization failed: {ex.Message}");
            _output.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task DisposeAsync()
    {
        _factory.Dispose();
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task GetAllAsync_WhenPolesExist_ReturnsPaginatedData()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/OgMusDirek?pageNumber=1&pageSize=3&minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<List<OgMusDirek>>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsPole()
    {
        // Arrange
        const int existingId = 1;

        // Act
        var response = await _client.GetAsync($"/api/v1/OgMusDirek/{existingId}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<OgMusDirek>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data!.Id.Should().Be(existingId);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ReturnsNotFoundResponse()
    {
        // Arrange
        const int nonExistingId = 999;

        // Act
        var response = await _client.GetAsync($"/api/v1/OgMusDirek/{nonExistingId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK); // Controller returns service response directly
        var content = await response.Content.ReadFromJsonAsync<Response<OgMusDirek>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeFalse();
        content.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCountAsync_ReturnsCorrectCount()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/OgMusDirek/count?minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<int>>(_jsonOptions);

        _output.WriteLine($"Response content: {JsonSerializer.Serialize(content)}");

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().Be(3); // Based on seeded data
    }

    [Fact]
    public async Task GetTipListAsync_ReturnsDistinctTypes()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/OgMusDirek/types");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<List<string>>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data.Should().HaveCount(3);
        content.Data.Should().Contain("Tip 1");
        content.Data.Should().Contain("Tip 2");
        content.Data.Should().Contain("Tip 3");
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_ReturnsProtobufContentType()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/OgMusDirek/pbf?minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();

        // Optional: Deserialize and verify content
        var contentBytes = await response.Content.ReadAsByteArrayAsync();
        var pbfResponse = OgMusDirekResponse.Parser.ParseFrom(contentBytes);

        pbfResponse.Should().NotBeNull();
        pbfResponse.IsSuccess.Should().BeTrue();
        pbfResponse.Data.Should().HaveCount(3);
        pbfResponse.Data.First().Id.Should().Be(1);
    }
}