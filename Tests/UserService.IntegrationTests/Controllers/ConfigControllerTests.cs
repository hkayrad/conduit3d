using System.Net;
using System.Net.Http.Json;
using Conduit3D.Common.Domain;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using Xunit.Abstractions;
using Testcontainers.PostgreSql;
using UserService.IntegrationTests.Helpers;
using UserService.Infrastructure.Data;
using UserService.Infrastructure;

namespace UserService.IntegrationTests.Controllers;

public class ConfigControllerTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;

    public ConfigControllerTests(WebApplicationFactory<Program> factory, ITestOutputHelper output)
    {
        _output = output;

        // Create a PostgreSQL container for testing
        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:17")
            .WithDatabase("conduit3d_config_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<UsersContext>));

                if (dbContextDescriptor != null)
                {
                    services.Remove(dbContextDescriptor);
                }

                services.AddDbContext<UsersContext>(options =>
                {
                    options.UseNpgsql(_postgresContainer.GetConnectionString());
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
        var context = scope.ServiceProvider.GetRequiredService<UsersContext>();

        try
        {
            // Test the connection
            await context.Database.ExecuteSqlRawAsync("SELECT 1");

            // Drop existing table if any
            await context.Database.ExecuteSqlRawAsync("DROP TABLE IF EXISTS public.configs CASCADE;");

            // Create the configs table
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS public.config (
                    key character varying(255) COLLATE pg_catalog.default NOT NULL,
                    value character varying(512) COLLATE pg_catalog.default NOT NULL,
                    CONSTRAINT config_pkey PRIMARY KEY (key)
                )
            ");

            _output.WriteLine("Configs table created");

            var canConnect = await context.Database.CanConnectAsync();
            _output.WriteLine($"Can connect to database: {canConnect}");
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
    public async Task CreateConfig_WithValidData_ReturnsCreatedConfig()
    {
        // Arrange
        var newConfigDto = TestDataGenerator.GenerateConfigDto(
            key: "test.setting",
            value: "test-value"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/config", newConfigDto);

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine("=== RESPONSE DETAILS ===");
        _output.WriteLine($"HTTP Status: {(int)response.StatusCode} {response.StatusCode}");
        _output.WriteLine($"Response Body: {content}");
        _output.WriteLine("========================");

        // Assert
        response.EnsureSuccessStatusCode();

        content.Should().NotBeNullOrEmpty();
        content.Should().Contain("\"isSuccess\":true", "validation error should mention isSuccess");
        content.Should().Contain(newConfigDto.Key);

        // Verify the config was actually created in the database
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbConfig = await context.Configs.FirstOrDefaultAsync(c => c.Key == newConfigDto.Key);
        dbConfig.Should().NotBeNull();
        dbConfig!.Value.Should().Be(newConfigDto.Value);
    }

    [Fact]
    public async Task OverrideConfig_WithDuplicateKey_ReturnsCreatedConfig()
    {
        // Arrange - Create first config
        var firstConfigDto = TestDataGenerator.GenerateConfigDto(
            key: "duplicate.key",
            value: "first-value"
        );
        await _client.PostAsJsonAsync("/api/v1/config", firstConfigDto);

        // Arrange - Try to create second config with same key
        var duplicateConfigDto = TestDataGenerator.GenerateConfigDto(
            key: "duplicate.key",
            value: "second-value"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/config", duplicateConfigDto);

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        content.Should().NotBeNull();
        content.Should().Contain("\"isSuccess\":true", "creating a config with duplicate key should override the existing one");
    }

    [Fact]
    public async Task GetConfigByKey_WithExistingKey_ReturnsConfig()
    {
        // Arrange - Create a config
        var newConfigDto = TestDataGenerator.GenerateConfigDto(
            key: "get.by.key.test",
            value: "test-value"
        );
        await _client.PostAsJsonAsync("/api/v1/config", newConfigDto);

        // Act
        var response = await _client.GetAsync($"/api/v1/config/{newConfigDto.Key}");

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        content.Should().NotBeNull();
        content.Should().Contain("\"isSuccess\":true");
        content.Should().Contain(newConfigDto.Value);
    }

    [Fact]
    public async Task GetConfigByKey_WithNonExistingKey_ReturnsNotFound()
    {
        // Arrange
        var nonExistingKey = "non.existing.key";

        // Act
        var response = await _client.GetAsync($"/api/v1/config/{nonExistingKey}");

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        content.Should().NotBeNull();
        content.Should().Contain("\"isSuccess\":true");
        content.Should().Contain("\"data\":\"\"");
    }

    [Fact]
    public async Task DeleteConfig_WithExistingConfig_ReturnsSuccess()
    {
        // Arrange - Create a config
        var newConfigDto = TestDataGenerator.GenerateConfigDto(
            key: "delete.test.config",
            value: "test-value"
        );
        await _client.PostAsJsonAsync("/api/v1/config", newConfigDto);
        var configKey = newConfigDto.Key;

        // Act
        var response = await _client.DeleteAsync($"/api/v1/config/{configKey}");

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        content.Should().NotBeNullOrEmpty();
        content.Should().Contain("\"isSuccess\":true", "deleting an existing config should succeed");
        content.Should().Contain(configKey);

        // Verify the config is actually deleted from the database
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbConfig = await context.Configs.FirstOrDefaultAsync(c => c.Key == configKey);
        dbConfig.Should().BeNull();
    }

    [Fact]
    public async Task DeleteConfig_WithNonExistingConfig_ReturnsNotFound()
    {
        // Arrange
        var nonExistingConfigId = "non.existing.config";

        // Act
        var response = await _client.DeleteAsync($"/api/v1/config/{nonExistingConfigId}");

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        var result = await response.Content.ReadFromJsonAsync<Response<object>>();
        result.Should().NotBeNull();
        result!.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetAllConfigs_ReturnsConfigList()
    {
        // Arrange - Create multiple configs
        var config1Dto = TestDataGenerator.GenerateConfigDto(
            key: "list.config.one",
            value: "value-one"
        );
        var config2Dto = TestDataGenerator.GenerateConfigDto(
            key: "list.config.two",
            value: "value-two"
        );

        await _client.PostAsJsonAsync("/api/v1/config", config1Dto);
        await _client.PostAsJsonAsync("/api/v1/config", config2Dto);

        // Act
        var response = await _client.GetAsync("/api/v1/config");

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response Status: {response.StatusCode}");
        _output.WriteLine($"Response: {content}");

        // Assert
        var result = await response.Content.ReadFromJsonAsync<Response<List<Domain.Config>>>();
        result.Should().NotBeNull();

        // Log the actual result
        _output.WriteLine($"IsSuccess: {result!.IsSuccess}");
        _output.WriteLine($"Message: {result.Message}");
        _output.WriteLine($"StatusCode: {result.StatusCode}");
        _output.WriteLine($"Data count: {result.Data?.Count ?? 0}");

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Count.Should().BeGreaterThanOrEqualTo(2);
    }
}