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

public class AdrYolRepositoryTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public AdrYolRepositoryTests(ITestOutputHelper output)
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

        services.AddScoped<IAdrYolRepository, AdrYolRepository>();

        _serviceProvider = services.BuildServiceProvider();

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BuildingsContext>();

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
                INSERT INTO ""ADR_YOL""(geometry, genislik, serit_sayisi, yapisi, tipi, kodu, adi)
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
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task GetByIdAsync_WhenExists_ShouldReturnEntityWithWkb()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();

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
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();

        // Act
        var result = await repository.GetByIdAsync(999, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllEntitiesWithWkb()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var results = await repository.GetAllAsync(1, 10, "Id", true, extent, null, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(3);
        results.All(r => r.Wkb != null).Should().BeTrue();
    }

    [Fact]
    public async Task GetAllAsync_WithSearchText_ShouldReturnFilteredEntities()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var results = await repository.GetAllAsync(1, 10, "Id", true, extent, "Atatürk", CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(1);
        results.First().Adi.Should().Be("Atatürk Caddesi");
    }

    [Fact]
    public async Task GetAllAsync_WithSorting_ShouldReturnSortedEntities()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var results = await repository.GetAllAsync(1, 10, "Adi", false, extent, null, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(3);
        results.Should().BeInDescendingOrder(r => r.Adi);
    }

    [Fact]
    public async Task GetCountAsync_ShouldReturnCorrectCount()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var count = await repository.GetCountAsync(extent, null, CancellationToken.None);

        // Assert
        count.Should().Be(3);
    }

    [Fact]
    public async Task GetCountAsync_WithSearchText_ShouldReturnFilteredCount()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var count = await repository.GetCountAsync(extent, "Sokak", CancellationToken.None);

        // Assert
        count.Should().Be(1);
    }

    [Fact]
    public async Task GetTipListAsync_ShouldReturnDistinctTypes()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();

        // Act
        var types = await repository.GetTipListAsync(CancellationToken.None);

        // Assert
        types.Should().NotBeNull();
        types.Should().HaveCount(2);
        types.Should().Contain(["Cadde", "Sokak"]);
    }

    [Fact]
    public async Task AddAsync_WithValidEntity_ShouldAddToDatabase()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();

        var newYol = new AdrYol
        {
            Id = 0,
            Kodu = "YOL-004",
            Adi = "Test Yolu",
            Tipi = "Test Tipi",
            Yapisi = "Test Yapısı",
            Genislik = 10.5,
            SeritSayisi = 2,
            Wkb = new byte[] { 1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64 }
        };

        // Act
        var result = await repository.AddAsync(newYol, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.Kodu.Should().Be("YOL-004");
        result.Adi.Should().Be("Test Yolu");
    }

    [Fact]
    public async Task UpdateAsync_WithValidEntity_ShouldUpdateInDatabase()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();

        var existingYol = await repository.GetByIdAsync(1, CancellationToken.None);
        existingYol!.Adi = "Updated Yol Name";
        existingYol.Genislik = 15.5;

        // Act
        var result = await repository.UpdateAsync(existingYol, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Adi.Should().Be("Updated Yol Name");
        result.Genislik.Should().Be(15.5);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistentEntity_ShouldThrowException()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();

        var nonExistentYol = new AdrYol
        {
            Id = 999,
            Kodu = "YOL-999",
            Adi = "Non-existent Yol",
            Tipi = "Test",
            Yapisi = "Test",
            Genislik = 10,
            SeritSayisi = 2,
            Wkb = new byte[] { 1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64 }
        };

        // Act & Assert
        await repository.Invoking(r => r.UpdateAsync(nonExistentYol, CancellationToken.None))
            .Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_ShouldRemoveFromDatabase()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();

        // Act
        var result = await repository.DeleteAsync(2, CancellationToken.None);

        // Assert
        result.Should().BeTrue();

        var deletedYol = await repository.GetByIdAsync(2, CancellationToken.None);
        deletedYol.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistentId_ShouldReturnFalse()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IAdrYolRepository>();

        // Act
        var result = await repository.DeleteAsync(999, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }
}