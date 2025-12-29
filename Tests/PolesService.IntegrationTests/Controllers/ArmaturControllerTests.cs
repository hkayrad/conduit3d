using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Conduit3D.Common.Domain;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PolesService.Domain;
using PolesService.Infrastructure;
using PolesService.Infrastructure.Data;
using Testcontainers.PostgreSql;
using Xunit;
using Xunit.Abstractions;

namespace PolesService.IntegrationTests.Controllers;

public class ArmaturControllerTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public ArmaturControllerTests(WebApplicationFactory<Program> factory, ITestOutputHelper output)
    {
        _output = output;

        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgis/postgis:17-master") // Using PostGIS image for geometry support
            .WithDatabase("conduit3d_poles_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<PolesContext>));

                if (dbContextDescriptor != null)
                {
                    services.Remove(dbContextDescriptor);
                }

                services.AddDbContext<PolesContext>(options =>
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
        var context = scope.ServiceProvider.GetRequiredService<PolesContext>();

        try
        {
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
        _factory.Dispose();
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task GetAllAsync_WhenArmaturExist_ReturnsPaginatedData()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/Armatur?pageNumber=1&pageSize=3&minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<List<Armatur>>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data.Should().HaveCount(3);
        content.Data!.First().Id.Should().Be(1);
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsArmatur()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/Armatur/1");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<Armatur>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data!.Id.Should().Be(1);
        content.Data.BagliTabloId.Should().Be(1);
        content.Data.BagliTabloKayitId.Should().Be(101);
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/Armatur/999");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<Armatur>>(_jsonOptions);
        
        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeFalse();
    }

    [Fact]
    public async Task GetCountAsync_ReturnsCorrectCount()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/Armatur/count?minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<int>>(_jsonOptions);

        _output.WriteLine($"Response content: {JsonSerializer.Serialize(content)}");

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().Be(3); // Based on seeded data
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_ReturnsProtobufContentType()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/Armatur/pbf?minX=-180&minY=-90&maxX=180&maxY=90");

        // Assert
        response.EnsureSuccessStatusCode();

        // Optional: Deserialize and verify content
        var contentBytes = await response.Content.ReadAsByteArrayAsync();
        var pbfResponse = ArmaturResponse.Parser.ParseFrom(contentBytes);

        pbfResponse.Should().NotBeNull();
        pbfResponse.IsSuccess.Should().BeTrue();
        pbfResponse.Data.Should().HaveCount(3);
        pbfResponse.Data.First().Id.Should().Be(1);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ReturnsCreatedArmatur()
    {
        // Arrange
        var newArmatur = new
        {
            BagliTabloId = 3,
            BagliTabloKayitId = 301,
            Wkb = Convert.ToBase64String(new byte[] { 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64 })
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/Armatur", newArmatur);

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<Armatur>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().NotBeNull();
        content.Data!.BagliTabloId.Should().Be(3);
        content.Data.BagliTabloKayitId.Should().Be(301);
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_ReturnsUpdatedArmatur()
    {
        // Arrange
        const int existingId = 1;
        var updateArmatur = new
        {
            Id = existingId,
            BagliTabloId = 5,
            BagliTabloKayitId = 501,
            Wkb = Convert.ToBase64String(new byte[] { 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 64, 0, 0, 0, 0, 0, 0, 16, 64 })
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/v1/Armatur/{existingId}", updateArmatur);

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<Armatur>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data!.BagliTabloId.Should().Be(5);
        content.Data.BagliTabloKayitId.Should().Be(501);
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_ReturnsSuccess()
    {
        // Arrange
        const int existingId = 2;

        // Act
        var response = await _client.DeleteAsync($"/api/v1/Armatur/{existingId}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<Response<bool>>(_jsonOptions);

        content.Should().NotBeNull();
        content!.IsSuccess.Should().BeTrue();
        content.Data.Should().BeTrue();
    }
}
