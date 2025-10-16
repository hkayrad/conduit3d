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

public class TrafoBinaControllerTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public TrafoBinaControllerTests(WebApplicationFactory<Program> factory, ITestOutputHelper output)
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

            await context.Database.ExecuteSqlRawAsync(@"DROP TABLE IF EXISTS ""SBK_TRAFOBINATIP"" CASCADE;");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE OR REPLACE FUNCTION generate_searchable_text_trafo_bina(
                    id_val INT, 
                    kodu_val TEXT,
                    adi_val TEXT
                )
                RETURNS tsvector
                AS $$
                SELECT to_tsvector('simple', 
                    coalesce(cast(id_val as text), '') || ' ' ||
                    coalesce(kodu_val, '') || ' ' ||
                    coalesce(adi_val, '')
                );
                $$ LANGUAGE SQL IMMUTABLE;
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS public.""SBK_TRAFOBINATIP"" (
                    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
                    geometry geometry(Point,3857),
                    adi character varying(100) COLLATE pg_catalog.default,
                    kodu character varying(100) COLLATE pg_catalog.default,
                    CONSTRAINT ""SBK_TRAFOBINATIP_pkey"" PRIMARY KEY (id)
                )
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""SBK_TRAFOBINATIP"" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
                    generate_searchable_text_trafo_bina(id, kodu, adi)
                ) STORED;
            ");

            _output.WriteLine("SBK_TRAFOBINATIP table created");

            var canConnect = await context.Database.CanConnectAsync();
            _output.WriteLine($"Can connect to database: {canConnect}");

            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_TRAFOBINATIP""(
                geometry, adi, kodu)
                VALUES (ST_GeomFromText('POINT(4595828 4851338)', 3857), 'Trafo Binası 1', 'TRAFO-001');
            ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_TRAFOBINATIP""(
                geometry, adi, kodu)
                VALUES (ST_GeomFromText('POINT(4595928 4851438)', 3857), 'Trafo Binası 2', 'TRAFO-002');
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
    public async Task GetAllAsync_WhenBuildingsExist_ReturnsPaginatedData()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/TrafoBina?pageNumber=1&pageSize=2&minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<List<TrafoBina>>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsBuilding()
    {
        // Arrange
        const int existingId = 1;

        // Act
        var response = await _client.GetAsync($"/api/v1/TrafoBina/{existingId}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<TrafoBina>>(_jsonOptions);

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
        var response = await _client.GetAsync($"/api/v1/TrafoBina/{nonExistingId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK); // Controller returns service response directly
        var content = await response.Content.ReadFromJsonAsync<Response<TrafoBina>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeFalse();
        content.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCountAsync_ReturnsCorrectCount()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/TrafoBina/count?minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<int>>(_jsonOptions);

        _output.WriteLine($"Response content: {JsonSerializer.Serialize(content)}");

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().Be(2); // Based on seeded data
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_ReturnsProtobufContentType()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/TrafoBina/pbf?minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/x-protobuf");

        // Optional: Deserialize and verify content
        var contentBytes = await response.Content.ReadAsByteArrayAsync();
        var pbfResponse = TrafoBinaResponse.Parser.ParseFrom(contentBytes);

        pbfResponse.Should().NotBeNull();
        pbfResponse.IsSuccess.Should().BeTrue();
        pbfResponse.Data.Should().HaveCount(2);
        pbfResponse.Data.First().Id.Should().Be(1);
    }
}