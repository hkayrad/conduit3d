using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BuildingsService.Domain;
using BuildingsService.Infrastructure;
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

public class AdrBinaControllerTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public AdrBinaControllerTests(WebApplicationFactory<Program> factory, ITestOutputHelper output)
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

            await context.Database.ExecuteSqlRawAsync(@"DROP TABLE IF EXISTS ""ADR_BINA"" CASCADE;");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE OR REPLACE FUNCTION generate_searchable_text_adr_bina(
                    id_val INT, 
                    kodu_val TEXT,
                    site_adi_val TEXT,
                    adi_val TEXT, 
                    bina_kat_sayisi_val FLOAT8,
                    daire_sayisi_val FLOAT8,
                    isyeri_sayisi_val FLOAT8,
                    yukseklik_val FLOAT8
                )
                RETURNS tsvector
                AS $$
                SELECT to_tsvector('simple', 
                    coalesce(cast(id_val as text), '') || ' ' ||
                    coalesce(kodu_val, '') || ' ' ||
                    coalesce(site_adi_val, '') || ' ' ||
                    coalesce(adi_val, '') || ' ' ||
                    coalesce(cast(bina_kat_sayisi_val as text), '') || ' ' ||
                    coalesce(cast(daire_sayisi_val as text), '') || ' ' ||
                    coalesce(cast(isyeri_sayisi_val as text), '') || ' ' ||
                    coalesce(cast(yukseklik_val as text), '')
                );
                $$ LANGUAGE SQL IMMUTABLE;
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS public.""ADR_BINA"" (
                    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
                    geometry geometry(Polygon,3857),
                    kodu character varying(100) COLLATE pg_catalog.default,
                    site_adi character varying(100) COLLATE pg_catalog.default,
                    adi character varying(100) COLLATE pg_catalog.default,
                    bina_kat_sayisi double precision,
                    daire_sayisi double precision,
                    isyeri_sayisi double precision,
                    yukseklik double precision,
                    CONSTRAINT ""ADR_BINA_pkey"" PRIMARY KEY (id)
                )
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""ADR_BINA"" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
                    generate_searchable_text_adr_bina(id, kodu, site_adi, adi, bina_kat_sayisi, daire_sayisi, isyeri_sayisi, yukseklik)
                ) STORED;
            ");

            _output.WriteLine("ADR_BINA table created");

            var canConnect = await context.Database.CanConnectAsync();
            _output.WriteLine($"Can connect to database: {canConnect}");

            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""ADR_BINA""(
                geometry, kodu, site_adi, adi, bina_kat_sayisi, daire_sayisi, isyeri_sayisi, yukseklik)
                VALUES (ST_GeomFromText('POLYGON((4595728 4851238, 4595738 4851238, 4595738 4851248, 4595728 4851248, 4595728 4851238))', 3857), 'BINA-001', 'Site A', 'Bina 1', 5, 10, 2, 15);
            ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""ADR_BINA""(
                geometry, kodu, site_adi, adi, bina_kat_sayisi, daire_sayisi, isyeri_sayisi, yukseklik)
                VALUES (ST_GeomFromText('POLYGON((4595728 4851238, 4595738 4851238, 4595738 4851248, 4595728 4851248, 4595728 4851238))', 3857), 'BINA-002', 'Site B', 'Bina 2', 8, 16, 4, 24);
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
        var response = await _client.GetAsync("/api/v1/AdrBina?pageNumber=1&pageSize=2&minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<List<AdrBina>>>(_jsonOptions);

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
        var response = await _client.GetAsync($"/api/v1/AdrBina/{existingId}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<AdrBina>>(_jsonOptions);

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
        var response = await _client.GetAsync($"/api/v1/AdrBina/{nonExistingId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK); // Controller returns service response directly
        var content = await response.Content.ReadFromJsonAsync<Response<AdrBina>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeFalse();
        content.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCountAsync_ReturnsCorrectCount()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/AdrBina/count?minX=-180&minY=-90&maxX=180&maxY=90");

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
        var response = await _client.GetAsync("/api/v1/AdrBina/pbf?minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/x-protobuf");

        // Optional: Deserialize and verify content
        var contentBytes = await response.Content.ReadAsByteArrayAsync();
        var pbfResponse = AdrBinaResponse.Parser.ParseFrom(contentBytes);

        pbfResponse.Should().NotBeNull();
        pbfResponse.IsSuccess.Should().BeTrue();
        pbfResponse.Data.Should().HaveCount(2);
        pbfResponse.Data.First().Id.Should().Be(1);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ReturnsCreatedBuilding()
    {
        // Arrange
        var newBuilding = new
        {
            Kodu = "BINA-003",
            SiteAdi = "Site C",
            Adi = "Bina 3",
            BinaKatSayisi = 6.0,
            DaireSayisi = 12.0,
            IsyeriSayisi = 3.0,
            Yukseklik = 18.0,
            Wkb = Convert.ToBase64String(new byte[] { 1, 3, 0, 0, 0, 1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64 })
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/AdrBina", newBuilding);

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<AdrBina>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data!.Kodu.Should().Be("BINA-003");
        content.Data.Adi.Should().Be("Bina 3");
        content.Data.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_ReturnsUpdatedBuilding()
    {
        // Arrange
        const int existingId = 1;
        var updateBuilding = new
        {
            Id = existingId,
            Kodu = "BINA-001-UPDATED",
            SiteAdi = "Site A Updated",
            Adi = "Bina 1 Updated",
            BinaKatSayisi = 6.0,
            DaireSayisi = 12.0,
            IsyeriSayisi = 3.0,
            Yukseklik = 18.0,
            Wkb = Convert.ToBase64String(new byte[] { 1, 3, 0, 0, 0, 1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64 })
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/v1/AdrBina/{existingId}", updateBuilding);

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<AdrBina>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data!.Kodu.Should().Be("BINA-001-UPDATED");
        content.Data.Adi.Should().Be("Bina 1 Updated");
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistingId_ReturnsNotFound()
    {
        // Arrange
        const int nonExistingId = 999;
        var updateBuilding = new
        {
            Id = nonExistingId,
            Kodu = "BINA-999",
            SiteAdi = "Site X",
            Adi = "Bina X",
            BinaKatSayisi = 1.0,
            DaireSayisi = 1.0,
            IsyeriSayisi = 1.0,
            Yukseklik = 3.0,
            Wkb = Convert.ToBase64String(new byte[] { 1, 3, 0, 0, 0, 1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64 })
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/v1/AdrBina/{nonExistingId}", updateBuilding);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<Response<AdrBina>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeFalse();
        content.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_ReturnsSuccess()
    {
        // Arrange
        const int existingId = 2;

        // Act
        var response = await _client.DeleteAsync($"/api/v1/AdrBina/{existingId}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<bool>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().BeTrue();

        // Verify it's actually deleted
        var getResponse = await _client.GetAsync($"/api/v1/AdrBina/{existingId}");
        var getContent = await getResponse.Content.ReadFromJsonAsync<Response<AdrBina>>(_jsonOptions);
        getContent!.IsSuccess.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingId_ReturnsNotFound()
    {
        // Arrange
        const int nonExistingId = 999;

        // Act
        var response = await _client.DeleteAsync($"/api/v1/AdrBina/{nonExistingId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<Response<bool>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeFalse();
        content.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}