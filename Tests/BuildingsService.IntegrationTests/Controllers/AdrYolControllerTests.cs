using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Data;
using Conduit3D.Common.Domain;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using Xunit;
using Xunit.Abstractions;

namespace BuildingsService.IntegrationTests.Controllers;

public class AdrYolControllerTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public AdrYolControllerTests(WebApplicationFactory<Program> factory, ITestOutputHelper output)
    {
        _output = output;

        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgis/postgis:17-master") // Using PostGIS image for geometry support
            .WithDatabase("conduit3d_buildings_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<BuildingsContext>));

                if (dbContextDescriptor != null)
                {
                    services.Remove(dbContextDescriptor);
                }

                services.AddDbContext<BuildingsContext>(options =>
                {
                    options.UseNpgsql(_postgresContainer.GetConnectionString(), o => o.UseNetTopologySuite());
                    options.EnableSensitiveDataLogging();
                    options.LogTo(message => _output.WriteLine(message));
                }, ServiceLifetime.Scoped);

                // Assuming BuildingsService has a similar UnitOfWork pattern.
                // If not, this might need adjustment based on BuildingsService's DI setup.
                // services.AddScoped<IUnitOfWork, UnitOfWork>();
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
        var context = scope.ServiceProvider.GetRequiredService<BuildingsContext>();

        try
        {
            await context.Database.ExecuteSqlRawAsync("SELECT 1");

            await context.Database.ExecuteSqlRawAsync(@"DROP TABLE IF EXISTS ""ADR_YOL"" CASCADE;");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE OR REPLACE FUNCTION generate_searchable_text_adr_yol(
                    id_val INT, 
                    genislik_val FLOAT8,
                    serit_sayisi_val FLOAT8,
                    yapisi_val TEXT,
                    tipi_val TEXT,
                    kodu_val TEXT,
                    adi_val TEXT
                )
                RETURNS tsvector
                AS $$
                SELECT to_tsvector('simple', 
                    coalesce(cast(id_val as text), '') || ' ' ||
                    coalesce(cast(genislik_val as text), '') || ' ' ||
                    coalesce(cast(serit_sayisi_val as text), '') || ' ' ||
                    coalesce(yapisi_val, '') || ' ' ||
                    coalesce(tipi_val, '') || ' ' ||
                    coalesce(kodu_val, '') || ' ' ||
                    coalesce(adi_val, '')
                );
                $$ LANGUAGE SQL IMMUTABLE;
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS public.""ADR_YOL"" (
                    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
                    geometry geometry(LineString,3857),
                    genislik double precision,
                    serit_sayisi double precision,
                    yapisi character varying(30) COLLATE pg_catalog.default,
                    tipi character varying(25) COLLATE pg_catalog.default,
                    kodu character varying(20) COLLATE pg_catalog.default,
                    adi character varying(100) COLLATE pg_catalog.default,
                    CONSTRAINT ""ADR_YOL_pkey"" PRIMARY KEY (id)
                );
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""ADR_YOL"" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
                    generate_searchable_text_adr_yol(id, genislik, serit_sayisi, yapisi, tipi, kodu, adi)
                ) STORED;
            ");

            _output.WriteLine("ADR_YOL table created");

            var canConnect = await context.Database.CanConnectAsync();
            _output.WriteLine($"Can connect to database: {canConnect}");

            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""ADR_YOL""(
                geometry, genislik, serit_sayisi, yapisi, tipi, kodu, adi)
                VALUES (ST_GeomFromText('LINESTRING(4595828 4851338, 4595928 4851438)', 3857), 10, 2, 'Asfalt', 'Sokak', 'YOL-003', 'Cumhuriyet Bulvarı');
            ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""ADR_YOL""(geometry, genislik, serit_sayisi, yapisi, tipi, kodu, adi)
                VALUES (ST_GeomFromText('LINESTRING(4595128 4851538, 4595228 4851638)', 3857), 15, 4, 'Asfalt', 'Cadde', 'YOL-001', 'Atatürk Caddesi');
            ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""ADR_YOL""(geometry, genislik, serit_sayisi, yapisi, tipi, kodu, adi)
                VALUES (ST_GeomFromText('LINESTRING(4595428 4851738, 4595528 4851838)', 3857), 15, 4, 'Asfalt', 'Cadde', 'YOL-002', 'İstiklal Caddesi');
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
    public async Task GetAllAsync_WhenRoadsExist_ReturnsPaginatedData()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/AdrYol?pageNumber=1&pageSize=3&minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<List<AdrYol>>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsRoad()
    {
        // Arrange
        const int existingId = 1;

        // Act
        var response = await _client.GetAsync($"/api/v1/AdrYol/{existingId}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<AdrYol>>(_jsonOptions);

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
        var response = await _client.GetAsync($"/api/v1/AdrYol/{nonExistingId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK); // Controller returns service response directly
        var content = await response.Content.ReadFromJsonAsync<Response<AdrYol>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeFalse();
        content.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCountAsync_ReturnsCorrectCount()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/AdrYol/count?minX=-180&minY=-90&maxX=180&maxY=90");

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
        var response = await _client.GetAsync("/api/v1/AdrYol/types");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<List<string>>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data.Should().HaveCount(2);
        content.Data.Should().Contain("Cadde");
        content.Data.Should().Contain("Sokak");
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_ReturnsProtobufContentType()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/AdrYol/pbf?minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/x-protobuf");

        // Optional: Deserialize and verify content
        var contentBytes = await response.Content.ReadAsByteArrayAsync();
        var pbfResponse = AdrYolResponse.Parser.ParseFrom(contentBytes);

        pbfResponse.Should().NotBeNull();
        pbfResponse.IsSuccess.Should().BeTrue();
        pbfResponse.Data.Should().HaveCount(3);
        pbfResponse.Data.First().Id.Should().Be(1);
    }
}