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

public class TrafoBinaRepositoryTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public TrafoBinaRepositoryTests(ITestOutputHelper output)
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

        services.AddScoped<ITrafoBinaRepository, TrafoBinaRepository>();

        _serviceProvider = services.BuildServiceProvider();

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BuildingsContext>();

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
                INSERT INTO ""SBK_TRAFOBINATIP""(geometry, adi, kodu)
                VALUES (ST_GeomFromText('POINT(4595828 4851338)', 3857), 'Trafo Binası 1', 'TRAFO-001');
            ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_TRAFOBINATIP""(geometry, adi, kodu)
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
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task GetByIdAsync_WhenExists_ShouldReturnEntityWithWkb()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<ITrafoBinaRepository>();

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
        var repository = scope.ServiceProvider.GetRequiredService<ITrafoBinaRepository>();

        // Act
        var result = await repository.GetByIdAsync(999, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllEntitiesWithWkb()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<ITrafoBinaRepository>();
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
        var repository = scope.ServiceProvider.GetRequiredService<ITrafoBinaRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var results = await repository.GetAllAsync(1, 10, "Id", true, extent, "Trafo Binası 2", CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(1);
        results.First().Adi.Should().Be("Trafo Binası 2");
    }

    [Fact]
    public async Task GetCountAsync_ShouldReturnCorrectCount()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<ITrafoBinaRepository>();
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
        var repository = scope.ServiceProvider.GetRequiredService<ITrafoBinaRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var count = await repository.GetCountAsync(extent, "TRAFO-001", CancellationToken.None);

        // Assert
        count.Should().Be(1);
    }
}