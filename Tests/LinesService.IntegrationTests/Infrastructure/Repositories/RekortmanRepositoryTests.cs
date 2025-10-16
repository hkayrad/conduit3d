using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using LinesService.Domain;
using LinesService.Infrastructure.Data;
using LinesService.Infrastructure.Repositories;
using LinesService.IntegrationTests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using Xunit;
using Xunit.Abstractions;

namespace LinesService.IntegrationTests.Infrastructure.Repositories;

public class RekortmanRepositoryTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public RekortmanRepositoryTests(ITestOutputHelper output)
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
            options.UseNpgsql(_postgresContainer.GetConnectionString(), o => o.UseNetTopologySuite());
            options.EnableSensitiveDataLogging();
            options.LogTo(message => _output.WriteLine(message));
        }, ServiceLifetime.Scoped);

        services.AddScoped<IRekortmanRepository, RekortmanRepository>();

        _serviceProvider = services.BuildServiceProvider();

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<LinesContext>();

            // Just test the connection
            await context.Database.ExecuteSqlRawAsync("SELECT 1");

            // Create the pgcrypto extension
            await context.Database.ExecuteSqlRawAsync("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
            _output.WriteLine("pgcrypto extension created");

            // Drop existing table if any
            await context.Database.ExecuteSqlRawAsync(@"DROP TABLE IF EXISTS ""SBK_rEKORTMAN"" CASCADE;");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE OR REPLACE FUNCTION generate_searchable_text_rekortman(
                    id_val INT, 
                    kodu_val TEXT,
                    adi_val TEXT, 
                    kesit_val TEXT,
                    tipi_val TEXT
                )
                RETURNS tsvector
                AS $$
                SELECT to_tsvector('simple', 
                    coalesce(cast(id_val as text), '') || ' ' ||
                    coalesce(kodu_val, '') || ' ' ||
                    coalesce(adi_val, '') || ' ' ||
                    coalesce(kesit_val, '') || ' ' ||
                    coalesce(tipi_val, '')
                );
                $$ LANGUAGE SQL IMMUTABLE;
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS public.""SBK_rEKORTMAN"" (
                    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
                    geometry geometry(LineString,3857),
                    adi character varying(50) COLLATE pg_catalog.default,
                    kodu character varying(50) COLLATE pg_catalog.default,
                    kesit character varying(40) COLLATE pg_catalog.default,
                    tipi character varying(20) COLLATE pg_catalog.default,
                    CONSTRAINT ""SBK_rEKORTMAN_pkey"" PRIMARY KEY (id)
                )
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""SBK_rEKORTMAN"" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
                    generate_searchable_text_rekortman(id, kodu, adi, kesit, tipi)
                ) STORED;
            ");

            _output.WriteLine("SBK_rEKORTMAN table created");

            var canConnect = await context.Database.CanConnectAsync();
            _output.WriteLine($"Can connect to database: {canConnect}");

            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_rEKORTMAN""(
                    geometry, kodu, adi, kesit, tipi)
                    VALUES (ST_GeomFromText('LINESTRING(4595580.275 4851101.9493,4595628.03 4851138.0794)', 3857), 'Test Kodu', 'Test 1', 'Test Kesit', 'Test Tipi 1');
                ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_rEKORTMAN""(
                    geometry, kodu, adi, kesit, tipi)
                    VALUES (ST_GeomFromText('LINESTRING(4595580.275 4851101.9493,4595628.03 4851138.0794)', 3857), 'Test Kodu 2', 'Test 2', 'Test Kesit 2', 'Test Tipi 2');
                ");
            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO ""SBK_rEKORTMAN""(
                    geometry, kodu, adi, kesit, tipi)
                    VALUES (ST_GeomFromText('LINESTRING(4595580.275 4851101.9493,4595628.03 4851138.0794)', 3857), 'Test Kodu 3', 'Test 3', 'Test Kesit 3', 'Test Tipi 3');
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
        // Act
        var result = await scope.ServiceProvider.GetRequiredService<IRekortmanRepository>()
            .GetByIdAsync(1, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result!.Wkb.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        using var scope = _serviceProvider.CreateScope();
        // Act
        var result = await scope.ServiceProvider.GetRequiredService<IRekortmanRepository>()
            .GetByIdAsync(999, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllEntitiesWithWkb()
    {
        using var scope = _serviceProvider.CreateScope();
        // Act
        var results = await scope.ServiceProvider.GetRequiredService<IRekortmanRepository>()
            .GetAllAsync(1, 100, "Id", false, TestDataGenerator.GenerateExtent(), string.Empty, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Count.Should().Be(3);
        results.All(r => r.Wkb != null).Should().BeTrue();
    }

    [Fact]
    public async Task GetAllAsync_WithSearchText_ShouldReturnFilteredEntities()
    {
        using var scope = _serviceProvider.CreateScope();
        // Act
        var results = await scope.ServiceProvider.GetRequiredService<IRekortmanRepository>()
            .GetAllAsync(1, 100, "Id", false, TestDataGenerator.GenerateExtent(), "Test 1", CancellationToken.None);
        // Assert
        results.Should().NotBeNull();
        results.Count.Should().Be(1);
        results.First().Adi.Should().Be("Test 1");
    }

    [Fact]
    public async Task GetAllAsync_WithSorting_ShouldReturnSortedEntities()
    {
        using var scope = _serviceProvider.CreateScope();
        // Act
        var results = await scope.ServiceProvider.GetRequiredService<IRekortmanRepository>()
            .GetAllAsync(1, 100, "Adi", false, TestDataGenerator.GenerateExtent(), string.Empty, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Count.Should().Be(3);
        results.Should().BeInDescendingOrder(r => r.Adi);
    }

    [Fact]
    public async Task GetCountAsync_ShouldReturnCount()
    {
        using var scope = _serviceProvider.CreateScope();
        // Act
        var count = await scope.ServiceProvider.GetRequiredService<IRekortmanRepository>()
            .GetCountAsync(TestDataGenerator.GenerateExtent(), string.Empty, CancellationToken.None);

        // Assert
        count.Should().Be(3);
    }

    [Fact]
    public async Task GetCountAsync_WithSearchText_ShouldReturnFilteredCount()
    {
        using var scope = _serviceProvider.CreateScope();
        // Act
        var count = await scope.ServiceProvider.GetRequiredService<IRekortmanRepository>()
            .GetCountAsync(TestDataGenerator.GenerateExtent(), "Test 1", CancellationToken.None);

        // Assert
        count.Should().Be(1);
    }

    [Fact]
    public async Task GetTipListAsync_ShouldReturnDistinctTypes()
    {
        using var scope = _serviceProvider.CreateScope();
        // Act
        var types = await scope.ServiceProvider.GetRequiredService<IRekortmanRepository>()
            .GetTipListAsync(CancellationToken.None);

        // Assert
        types.Should().NotBeNull();
        types.Count.Should().Be(3);
        types.Should().Contain("Test Tipi 1");
        types.Should().Contain("Test Tipi 2");
        types.Should().Contain("Test Tipi 3");
    }
}