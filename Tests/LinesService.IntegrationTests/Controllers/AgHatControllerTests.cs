using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Conduit3D.Common.Domain;
using FluentAssertions;
using LinesService.Domain;
using LinesService.Infrastructure;
using LinesService.Infrastructure.Data;
using LinesService.IntegrationTests.Helpers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using Xunit;
using Xunit.Abstractions;

namespace LinesService.IntegrationTests.Controllers;

public class AgHatControllerTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public AgHatControllerTests(WebApplicationFactory<Program> factory, ITestOutputHelper output)
    {
        _output = output;

        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgis/postgis:17-master") // Using PostGIS image for geometry support
            .WithDatabase("conduit3d_lines_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<LinesContext>));

                if (dbContextDescriptor != null)
                {
                    services.Remove(dbContextDescriptor);
                }

                services.AddDbContext<LinesContext>(options =>
                {
                    options.UseNpgsql(_postgresContainer.GetConnectionString(), o => o.UseNetTopologySuite());
                    options.EnableSensitiveDataLogging();
                    options.LogTo(message => _output.WriteLine(message));
                }, ServiceLifetime.Scoped);

                services.AddScoped<IUnitOfWork, UnitOfWork>();
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
        var context = scope.ServiceProvider.GetRequiredService<LinesContext>();

        try
        {
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
        _factory.Dispose();
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task GetAllAsync_WhenLinesExist_ReturnsPaginatedData()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/AgHat?pageNumber=1&pageSize=3&minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<List<AgHat>>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsLine()
    {
        // Arrange
        const int existingId = 1;

        // Act
        var response = await _client.GetAsync($"/api/v1/AgHat/{existingId}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<AgHat>>(_jsonOptions);

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
        var response = await _client.GetAsync($"/api/v1/AgHat/{nonExistingId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK); // Controller returns service response directly
        var content = await response.Content.ReadFromJsonAsync<Response<AgHat>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeFalse();
        content.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCountAsync_ReturnsCorrectCount()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/AgHat/count?minX=-180&minY=-90&maxX=180&maxY=90");

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
        var response = await _client.GetAsync("/api/v1/AgHat/types");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<List<string>>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data.Should().Contain("Test Cinsi");
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_ReturnsProtobufContentType()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/AgHat/pbf?minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();

        // Optional: Deserialize and verify content
        var contentBytes = await response.Content.ReadAsByteArrayAsync();
        var pbfResponse = AgHatResponse.Parser.ParseFrom(contentBytes);

        pbfResponse.Should().NotBeNull();
        pbfResponse.IsSuccess.Should().BeTrue();
        pbfResponse.Data.Should().HaveCount(3);
        pbfResponse.Data.First().Id.Should().Be(1);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ReturnsCreatedLine()
    {
        // Arrange
        var newLine = new
        {
            Kodu = "HAT-004",
            Adi = "Hat 4",
            Cinsi = "Havai",
            Kesit = "4x50",
            Tipi = "Tip D",
            Wkb = Convert.ToBase64String(new byte[] { 1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64 })
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/AgHat", newLine);

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<AgHat>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data!.Kodu.Should().Be("HAT-004");
        content.Data.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_ReturnsUpdatedLine()
    {
        // Arrange
        const int existingId = 1;
        var updateLine = new
        {
            Id = existingId,
            Kodu = "HAT-001-UPDATED",
            Adi = "Hat 1 Updated",
            Cinsi = "Havai Updated",
            Kesit = "4x50 Updated",
            Tipi = "Tip A Updated",
            Wkb = Convert.ToBase64String(new byte[] { 1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64 })
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/v1/AgHat/{existingId}", updateLine);

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<AgHat>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data!.Kodu.Should().Be("HAT-001-UPDATED");
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_ReturnsSuccess()
    {
        // Arrange
        const int existingId = 2;

        // Act
        var response = await _client.DeleteAsync($"/api/v1/AgHat/{existingId}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<bool>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().BeTrue();
    }
}