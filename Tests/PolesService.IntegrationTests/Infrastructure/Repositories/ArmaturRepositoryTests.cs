using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Conduit3D.Common.Domain;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PolesService.Domain;
using PolesService.Infrastructure.Data;
using PolesService.Infrastructure.Repositories;
using Testcontainers.PostgreSql;
using Xunit;
using Xunit.Abstractions;

namespace PolesService.IntegrationTests.Infrastructure.Repositories;

public class ArmaturRepositoryTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public ArmaturRepositoryTests(ITestOutputHelper output)
    {
        _output = output;

        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgis/postgis:17-master") // Using PostGIS image for geometry support
            .WithDatabase("conduit3d_poles_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _postgresContainer.StartAsync();
        _output.WriteLine($"PostgreSQL container started: {_postgresContainer.GetConnectionString()}");

        var services = new ServiceCollection();

        services.AddDbContext<PolesContext>(options =>
        {
            options.UseNpgsql(_postgresContainer.GetConnectionString(), o => o.UseNetTopologySuite());
            options.EnableSensitiveDataLogging();
            options.LogTo(message => _output.WriteLine(message));
        }, ServiceLifetime.Scoped);

        services.AddScoped<IArmaturRepository, ArmaturRepository>();

        _serviceProvider = services.BuildServiceProvider();

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<PolesContext>();

            await context.Database.ExecuteSqlRawAsync("SELECT 1");

            await context.Database.ExecuteSqlRawAsync(@"DROP TABLE IF EXISTS ""SBK_ARMATUR"" CASCADE;");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS public.""SBK_ARMATUR"" (
                    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
                    bagli_tablo_id integer NOT NULL,
                    bagli_tablo_kayit_id integer NOT NULL,
                    geometry geometry(Point, 3857),
                    CONSTRAINT ""SBK_ARMATUR_pkey"" PRIMARY KEY (id)
                )
            ");

            _output.WriteLine("SBK_ARMATUR table created");

            var canConnect = await context.Database.CanConnectAsync();
            _output.WriteLine($"Can connect to database: {canConnect}");

            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_ARMATUR""(bagli_tablo_id, bagli_tablo_kayit_id, geometry)
                VALUES (1, 101, ST_SetSRID(ST_MakePoint(1.0, 2.0), 3857));
            ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_ARMATUR""(bagli_tablo_id, bagli_tablo_kayit_id, geometry)
                VALUES (1, 102, ST_SetSRID(ST_MakePoint(1.0, 3.0), 3857));
            ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_ARMATUR""(bagli_tablo_id, bagli_tablo_kayit_id, geometry)
                VALUES (2, 201, ST_SetSRID(ST_MakePoint(4.0, 1.0), 3857));
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
        if (_serviceProvider is IDisposable disposable)
        {
            disposable.Dispose();
        }
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task GetByIdAsync_WhenExists_ShouldReturnArmatur()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();

        // Act
        var result = await repository.GetByIdAsync(1, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.BagliTabloId.Should().Be(1);
        result.BagliTabloKayitId.Should().Be(101);
        result.Wkb.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();

        // Act
        var result = await repository.GetByIdAsync(999, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllArmaturWithWkb()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var results = await repository.GetAllAsync(1, 10, "Id", true, extent, null, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(3);
        results.All(r => r.Wkb != null).Should().BeTrue();
    }

    [Fact]
    public async Task GetAllAsync_WithPagination_ShouldReturnPagedResults()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var results = await repository.GetAllAsync(1, 2, "Id", true, extent, null, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(2);
        results.First().Id.Should().Be(1);
    }

    [Fact]
    public async Task GetAllAsync_WithSorting_ShouldReturnSortedEntities()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var results = await repository.GetAllAsync(1, 10, "Id", false, extent, null, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(3);
        results.Should().BeInDescendingOrder(r => r.Id);
    }

    [Fact]
    public async Task GetCountAsync_ShouldReturnCorrectCount()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();
        var extent = new Extent { MinX = -180, MinY = -90, MaxX = 180, MaxY = 90 };

        // Act
        var count = await repository.GetCountAsync(extent, null, CancellationToken.None);

        // Assert
        count.Should().Be(3);
    }

    [Fact]
    public async Task AddAsync_WithValidEntity_ShouldAddToDatabase()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();

        var newArmatur = new Armatur
        {
            Id = 0,
            BagliTabloId = 3,
            BagliTabloKayitId = 301,
            Wkb = new byte[] { 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64 }
        };

        // Act
        var result = await repository.AddAsync(newArmatur, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.BagliTabloId.Should().Be(3);
        result.BagliTabloKayitId.Should().Be(301);
    }

    [Fact]
    public async Task UpdateAsync_WithValidEntity_ShouldUpdateInDatabase()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();

        var existingArmatur = await repository.GetByIdAsync(1, CancellationToken.None);
        existingArmatur!.BagliTabloId = 5;
        existingArmatur.BagliTabloKayitId = 501;

        // Act
        var result = await repository.UpdateAsync(existingArmatur, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.BagliTabloId.Should().Be(5);
        result.BagliTabloKayitId.Should().Be(501);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistentEntity_ShouldThrowException()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();

        var nonExistentArmatur = new Armatur
        {
            Id = 999,
            BagliTabloId = 5,
            BagliTabloKayitId = 501,
            Wkb = new byte[] { 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64 }
        };

        // Act & Assert
        await repository.Invoking(r => r.UpdateAsync(nonExistentArmatur, CancellationToken.None))
            .Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_ShouldRemoveFromDatabase()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();

        // Act
        var result = await repository.DeleteAsync(2, CancellationToken.None);

        // Assert
        result.Should().BeTrue();

        var deletedArmatur = await repository.GetByIdAsync(2, CancellationToken.None);
        deletedArmatur.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistentId_ShouldReturnFalse()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IArmaturRepository>();

        // Act
        var result = await repository.DeleteAsync(999, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }
}
