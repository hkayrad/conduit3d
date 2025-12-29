using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Conduit3D.Common.Domain;
using FluentAssertions;
using LinesService.Domain;
using LinesService.Infrastructure.Data;
using LinesService.Infrastructure.Repositories;
using LinesService.IntegrationTests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using Testcontainers.PostgreSql;
using Xunit;
using Xunit.Abstractions;

namespace LinesService.IntegrationTests.Infrastructure.Repositories;

public class AgHatRepositoryTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public AgHatRepositoryTests(ITestOutputHelper output)
    {
        _output = output;

        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgis/postgis:17-master") // Using PostGIS image for geometry support
            .WithDatabase("conduit3d_lines_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _postgresContainer.StartAsync();
        _output.WriteLine($"PostgreSQL container started: {_postgresContainer.GetConnectionString()}");

        var services = new ServiceCollection();

        services.AddDbContext<LinesContext>(options =>
        {
            options.UseNpgsql(_postgresContainer.GetConnectionString());
            options.EnableSensitiveDataLogging();
            options.LogTo(message => _output.WriteLine(message));
        }, ServiceLifetime.Scoped);

        services.AddScoped<IAgHatRepository, AgHatRepository>();

        _serviceProvider = services.BuildServiceProvider();

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<LinesContext>();

            // DO NOT USE EnsureCreatedAsync() - it tries to create tables from entity model
            // Just test the connection
            await context.Database.ExecuteSqlRawAsync("SELECT 1");

            // Drop existing table if any
            await context.Database.ExecuteSqlRawAsync(@"DROP TABLE IF EXISTS ""SBK_AGHAT"" CASCADE;");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE OR REPLACE FUNCTION generate_searchable_text_ag_hat(
                        id_val INT, 
                        kodu_val TEXT,
                        adi_val TEXT, 
                        cinsi_val TEXT,
                        kesit_val TEXT,
                        tipi_val TEXT
                    )
                    RETURNS tsvector
                    AS $$
                    SELECT to_tsvector('simple', 
                        coalesce(cast(id_val as text), '') || ' ' ||
                        coalesce(kodu_val, '') || ' ' ||
                        coalesce(adi_val, '') || ' ' ||
                        coalesce(cinsi_val, '') || ' ' ||
                    	coalesce(kesit_val, '') || ' ' ||
                    	coalesce(tipi_val, '')
                    );
                    $$ LANGUAGE SQL IMMUTABLE;
            ");

            // If EnsureCreated doesn't work, manually create the users table
            // You'll need to adjust this based on your actual User entity structure
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS ""SBK_AGHAT""
                (
                    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
                    geometry geometry(LineString,3857),
                    kodu character varying(150) COLLATE pg_catalog.default,
                    adi character varying(50) COLLATE pg_catalog.default,
                    cinsi character varying(20) COLLATE pg_catalog.default,
                    kesit character varying(40) COLLATE pg_catalog.default,
                    tipi character varying(20) COLLATE pg_catalog.default,
                    CONSTRAINT SBK_AGHAT_pkey PRIMARY KEY (id)
                )
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""SBK_AGHAT"" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
                    generate_searchable_text_ag_hat(id, kodu, adi, cinsi, kesit, tipi)
                ) STORED;
            ");

            _output.WriteLine("SBK_AGHAT table created");

            var canConnect = await context.Database.CanConnectAsync();
            _output.WriteLine($"Can connect to database: {canConnect}");

            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_AGHAT""(
                    geometry, kodu, adi, cinsi, kesit, tipi)
                    VALUES (ST_GeomFromText('LINESTRING(4595580.275 4851101.9493,4595628.03 4851138.0794)', 3857), 'Test Kodu', 'Test 1', 'Test Cinsi', 'Test Kesit', 'Test Tipi');
                ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_AGHAT""(
                    geometry, kodu, adi, cinsi, kesit, tipi)
                    VALUES (ST_GeomFromText('LINESTRING(4595580.275 4851101.9493,4595628.03 4851138.0794)', 3857), 'Test Kodu 2', 'Test 2', 'Test Cinsi 2', 'Test Kesit 2', 'Test Tipi');
                ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_AGHAT""(
                    geometry, kodu, adi, cinsi, kesit, tipi)
                    VALUES (ST_GeomFromText('LINESTRING(4595580.275 4851101.9493,4595628.03 4851138.0794)', 3857), 'Test Kodu 3', 'Test 3', 'Test Cinsi 3', 'Test Kesit 3', 'Test Tipi');
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
        using (var scope = _serviceProvider.CreateScope())
        {
            // Act
            var result = await scope.ServiceProvider.GetRequiredService<IAgHatRepository>()
                .GetByIdAsync(1, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(1);
            result!.Wkb.Should().NotBeNull();
        }
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            // Act
            var result = await scope.ServiceProvider.GetRequiredService<IAgHatRepository>()
                .GetByIdAsync(999, CancellationToken.None);

            // Assert
            result.Should().BeNull();
        }
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllEntitiesWithWkb()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            // Act
            var results = await scope.ServiceProvider.GetRequiredService<IAgHatRepository>()
                .GetAllAsync(1, 100, "Id", false, TestDataGenerator.GenerateExtent(), string.Empty, CancellationToken.None);

            // Assert
            results.Should().NotBeNull();
            results.Count.Should().BeGreaterThan(0);
            results.All(r => r.Wkb != null).Should().BeTrue();
        }
    }

    [Fact]
    public async Task GetAllAsync_WithSearchText_ShouldReturnFilteredEntities()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            // Act
            var results = await scope.ServiceProvider.GetRequiredService<IAgHatRepository>()
                .GetAllAsync(1, 100, "Id", false, TestDataGenerator.GenerateExtent(), "Test 1", CancellationToken.None);
            // Assert
            results.Should().NotBeNull();
            results.Count.Should().Be(1);
            results.First().Adi.Should().Be("Test 1");
        }
    }

    [Fact]
    public async Task GetAllAsync_WithSorting_ShouldReturnSortedEntities()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            // Act
            var results = await scope.ServiceProvider.GetRequiredService<IAgHatRepository>()
                .GetAllAsync(1, 100, "Adi", true, TestDataGenerator.GenerateExtent(), string.Empty, CancellationToken.None);

            // Assert
            results.Should().NotBeNull();
            results.Count.Should().BeGreaterThan(0);
            results.Should().BeInAscendingOrder(r => r.Adi);
        }
    }

    [Fact]
    public async Task GetCountAsync_ShouldReturnCount()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            // Act
            var count = await scope.ServiceProvider.GetRequiredService<IAgHatRepository>()
                .GetCountAsync(TestDataGenerator.GenerateExtent(), string.Empty, CancellationToken.None);

            // Assert
            count.Should().BeGreaterThan(0);
        }
    }

    [Fact]
    public async Task GetCountAsync_WithSearchText_ShouldReturnFilteredCount()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            // Act
            var count = await scope.ServiceProvider.GetRequiredService<IAgHatRepository>()
                .GetCountAsync(TestDataGenerator.GenerateExtent(), "Test 1", CancellationToken.None);

            // Assert
            count.Should().Be(1);
        }
    }

    [Fact]
    public async Task GetTipListAsync_ShouldReturnDistinctTypes()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            // Act
            var types = await scope.ServiceProvider.GetRequiredService<IAgHatRepository>()
                .GetTipListAsync(CancellationToken.None);

            // Assert
            types.Should().NotBeNull();
            types.Count.Should().Be(3);
            types.First().Should().Be("Test Cinsi 3");
        }
    }

    [Fact]
    public async Task AddAsync_WithValidEntity_ShouldAddToDatabase()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var repository = scope.ServiceProvider.GetRequiredService<IAgHatRepository>();

            var newLine = new AgHat
            {
                Id = 0,
                Kodu = "AGHAT-004",
                Adi = "Test AG Hat 4",
                Cinsi = "Test Cinsi",
                Kesit = "50",
                Tipi = "Test Tipi",
                Wkb = new byte[] { 1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64 }
            };

            // Act
            var result = await repository.AddAsync(newLine, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().BeGreaterThan(0);
            result.Kodu.Should().Be("AGHAT-004");
            result.Adi.Should().Be("Test AG Hat 4");
        }
    }

    [Fact]
    public async Task UpdateAsync_WithValidEntity_ShouldUpdateInDatabase()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var repository = scope.ServiceProvider.GetRequiredService<IAgHatRepository>();

            var existingLine = await repository.GetByIdAsync(1, CancellationToken.None);
            existingLine!.Adi = "Updated AG Hat Name";
            existingLine.Kesit = "150";

            // Act
            var result = await repository.UpdateAsync(existingLine, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Adi.Should().Be("Updated AG Hat Name");
            result.Kesit.Should().Be("150");
        }
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistentEntity_ShouldThrowException()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var repository = scope.ServiceProvider.GetRequiredService<IAgHatRepository>();

            var nonExistentLine = new AgHat
            {
                Id = 999,
                Kodu = "AGHAT-999",
                Adi = "Non-existent Line",
                Cinsi = "Test",
                Kesit = "50",
                Tipi = "Test",
                Wkb = new byte[] { 1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64 }
            };

            // Act & Assert
            await repository.Invoking(r => r.UpdateAsync(nonExistentLine, CancellationToken.None))
                .Should().ThrowAsync<KeyNotFoundException>();
        }
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_ShouldRemoveFromDatabase()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var repository = scope.ServiceProvider.GetRequiredService<IAgHatRepository>();

            // Act
            var result = await repository.DeleteAsync(2, CancellationToken.None);

            // Assert
            result.Should().BeTrue();

            var deletedLine = await repository.GetByIdAsync(2, CancellationToken.None);
            deletedLine.Should().BeNull();
        }
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistentId_ShouldReturnFalse()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var repository = scope.ServiceProvider.GetRequiredService<IAgHatRepository>();

            // Act
            var result = await repository.DeleteAsync(999, CancellationToken.None);

            // Assert
            result.Should().BeFalse();
        }
    }
}