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
using PolesService.IntegrationTests.Helpers;
using Testcontainers.PostgreSql;
using Xunit;
using Xunit.Abstractions;

namespace PolesService.IntegrationTests.Infrastructure.Repositories;

public class OgMusDirekRepositoryTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public OgMusDirekRepositoryTests(ITestOutputHelper output)
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

        services.AddScoped<IOgMusDirekRepository, OgMusDirekRepository>();

        _serviceProvider = services.BuildServiceProvider();

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<PolesContext>();

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
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task GetByIdAsync_WhenExists_ShouldReturnEntityWithWkb()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IOgMusDirekRepository>();

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
        var repository = scope.ServiceProvider.GetRequiredService<IOgMusDirekRepository>();

        // Act
        var result = await repository.GetByIdAsync(999, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllEntitiesWithWkb()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IOgMusDirekRepository>();

        // Act
        var results = await repository.GetAllAsync(1, 10, "Id", true, TestDataGenerator.GenerateExtent(), null, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(3);
        results.All(r => r.Wkb != null).Should().BeTrue();
    }

    [Fact]
    public async Task GetAllAsync_WithSearchText_ShouldReturnFilteredEntities()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IOgMusDirekRepository>();

        // Act
        var results = await repository.GetAllAsync(1, 10, "Id", true, TestDataGenerator.GenerateExtent(), "Direk 2", CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(1);
        results.First().Adi.Should().Be("Direk 2");
    }

    [Fact]
    public async Task GetAllAsync_WithSorting_ShouldReturnSortedEntities()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IOgMusDirekRepository>();

        // Act
        var results = await repository.GetAllAsync(1, 10, "Adi", false, TestDataGenerator.GenerateExtent(), null, CancellationToken.None);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(3);
        results.Should().BeInDescendingOrder(r => r.Adi);
    }

    [Fact]
    public async Task GetCountAsync_ShouldReturnCorrectCount()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IOgMusDirekRepository>();

        // Act
        var count = await repository.GetCountAsync(TestDataGenerator.GenerateExtent(), null, CancellationToken.None);

        // Assert
        count.Should().Be(3);
    }

    [Fact]
    public async Task GetCountAsync_WithSearchText_ShouldReturnFilteredCount()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IOgMusDirekRepository>();

        // Act
        var count = await repository.GetCountAsync(TestDataGenerator.GenerateExtent(), "Tip 2", CancellationToken.None);

        // Assert
        count.Should().Be(1);
    }

    [Fact]
    public async Task GetTipListAsync_ShouldReturnDistinctTypes()
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IOgMusDirekRepository>();

        // Act
        var types = await repository.GetTipListAsync(CancellationToken.None);

        // Assert
        types.Should().NotBeNull();
        types.Should().HaveCount(3);
        types.Should().Contain(["Tip 1", "Tip 2", "Tip 3"]);
    }
}