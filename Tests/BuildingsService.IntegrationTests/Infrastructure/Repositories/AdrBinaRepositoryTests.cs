using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Data;
using BuildingsService.Infrastructure.Repositories;
using Conduit3D.Common.Domain;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using Xunit;
using Xunit.Abstractions;

namespace BuildingsService.IntegrationTests.Infrastructure.Repositories;

public class AdrBinaRepositoryTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public AdrBinaRepositoryTests(ITestOutputHelper output)
    {
        _output = output;

        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgis/postgis:17-master") // Using PostGIS image for geometry support
            .WithDatabase("conduit3d_buildings_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _postgresContainer.StartAsync();
        _output.WriteLine($"PostgreSQL container started: {_postgresContainer.GetConnectionString()}");

        var services = new ServiceCollection();

        services.AddDbContext<BuildingsContext>(options =>
        {
            options.UseNpgsql(_postgresContainer.GetConnectionString(), o => o.UseNetTopologySuite());
            options.EnableSensitiveDataLogging();
            options.LogTo(message => _output.WriteLine(message));
        }, ServiceLifetime.Scoped);

        services.AddScoped<IAdrBinaRepository, AdrBinaRepository>();

        _serviceProvider = services.BuildServiceProvider();

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BuildingsContext>();

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
                INSERT INTO ""ADR_BINA""(geometry, kodu, site_adi, adi, bina_kat_sayisi, daire_sayisi, isyeri_sayisi, yukseklik)
                VALUES (ST_GeomFromText('POLYGON((4595728 4851238, 4595738 4851238, 4595738 4851248, 4595728 4851248, 4595728 4851238))', 3857), 'BINA-001', 'Site A', 'Bina 1', 5, 10, 2, 15);
            ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""ADR_BINA""(geometry, kodu, site_adi, adi, bina_kat_sayisi, daire_sayisi, isyeri_sayisi, yukseklik)
                VALUES (ST_GeomFromText('POLYGON((4595828 4851338, 4595838 4851338, 4595838 4851348, 4595828 4851348, 4595828 4851338))', 3857), 'BINA-002', 'Site B', 'Bina 2', 8, 16, 4, 24);
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
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task GetByIdAsync_WhenExists_ShouldReturnEntityWithWkb()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();

        // Act
        var result = await repository.GetByIdAsync(1, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.Wkb.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();

        // Act
        var result = await repository.GetByIdAsync(999, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllEntitiesWithWkb()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var results = await repository.GetAllAsync(1, 10, "Id", true, extent, null, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(2);
        results.All(r => r.Wkb != null).Should().BeTrue();
    }

    [Fact]
    public async Task GetAllAsync_WithSearchText_ShouldReturnFilteredEntities()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var results = await repository.GetAllAsync(1, 10, "Id", true, extent, "Bina", CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(2);
        results.First().Adi.Should().Be("Bina 1");
    }

    [Fact]
    public async Task GetAllAsync_WithSorting_ShouldReturnSortedEntities()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var results = await repository.GetAllAsync(1, 10, "Adi", false, extent, null, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(2);
        results.Should().BeInDescendingOrder(r => r.Adi);
    }

    [Fact]
    public async Task GetCountAsync_ShouldReturnCorrectCount()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var count = await repository.GetCountAsync(extent, null, CancellationToken.None);

        // Assert
        count.Should().Be(2);
    }

    [Fact]
    public async Task GetCountAsync_WithSearchText_ShouldReturnFilteredCount()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var count = await repository.GetCountAsync(extent, "Site A", CancellationToken.None);

        // Assert
        count.Should().Be(1);
    }

    [Fact]
    public async Task AddAsync_WithValidEntity_ShouldAddAndReturnEntity()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();
        var context = scope.ServiceProvider.GetRequiredService<BuildingsContext>();

        // Arrange
        var newBuilding = new AdrBina
        {
            Id = 0,
            Kodu = "BINA-003",
            SiteAdi = "Site C",
            Adi = "Bina 3",
            BinaKatSayisi = 7,
            DaireSayisi = 14,
            IsyeriSayisi = 3,
            Yukseklik = 21,
            Wkb = new byte[] { 1, 3, 0, 0, 0, 1, 0, 0, 0, 5, 0, 0, 0, 
                0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64,
                0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64,
                0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64,
                0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64,
                0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64 }
        };

        // Act
        var result = await repository.AddAsync(newBuilding, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.Kodu.Should().Be("BINA-003");
        result.Adi.Should().Be("Bina 3");

        // Verify it was added to database
        var retrievedBuilding = await repository.GetByIdAsync(result.Id, CancellationToken.None);
        retrievedBuilding.Should().NotBeNull();
        retrievedBuilding!.Kodu.Should().Be("BINA-003");
    }

    [Fact]
    public async Task UpdateAsync_WithValidEntity_ShouldUpdateAndReturnEntity()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();

        // Arrange
        var existingBuilding = await repository.GetByIdAsync(1, CancellationToken.None);
        existingBuilding.Should().NotBeNull();
        
        existingBuilding!.Kodu = "BINA-001-UPDATED";
        existingBuilding.Adi = "Bina 1 Updated";
        existingBuilding.BinaKatSayisi = 10;

        // Act
        var result = await repository.UpdateAsync(existingBuilding, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(1);
        result.Kodu.Should().Be("BINA-001-UPDATED");
        result.Adi.Should().Be("Bina 1 Updated");
        result.BinaKatSayisi.Should().Be(10);

        // Verify it was updated in database
        var retrievedBuilding = await repository.GetByIdAsync(1, CancellationToken.None);
        retrievedBuilding.Should().NotBeNull();
        retrievedBuilding!.Kodu.Should().Be("BINA-001-UPDATED");
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistingId_ShouldThrowKeyNotFoundException()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();

        // Arrange
        var nonExistingBuilding = new AdrBina
        {
            Id = 999,
            Kodu = "BINA-999",
            SiteAdi = "Site X",
            Adi = "Bina X",
            BinaKatSayisi = 1,
            DaireSayisi = 1,
            IsyeriSayisi = 1,
            Yukseklik = 3,
            Wkb = new byte[] { 1, 3, 0, 0, 0, 1, 0, 0, 0, 5, 0, 0, 0, 
                0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64,
                0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 0, 64,
                0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64,
                0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64,
                0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64 }
        };

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => 
            repository.UpdateAsync(nonExistingBuilding, CancellationToken.None));
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_ShouldDeleteAndReturnTrue()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();

        // Act
        var result = await repository.DeleteAsync(2, CancellationToken.None);

        // Assert
        result.Should().BeTrue();

        // Verify it was deleted from database
        var deletedBuilding = await repository.GetByIdAsync(2, CancellationToken.None);
        deletedBuilding.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingId_ShouldReturnFalse()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrBinaRepository>();

        // Act
        var result = await repository.DeleteAsync(999, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }
}