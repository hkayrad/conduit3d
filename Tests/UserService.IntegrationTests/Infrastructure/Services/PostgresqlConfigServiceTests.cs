using System.Net;
using Conduit3D.Common.Domain;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using UserService.Domain;
using UserService.Infrastructure;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.DTOs;
using UserService.Infrastructure.Services;
using UserService.IntegrationTests.Helpers;
using Xunit;
using Xunit.Abstractions;

namespace UserService.IntegrationTests.Infrastructure.Services;

public class PostgresqlConfigServiceTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public PostgresqlConfigServiceTests(ITestOutputHelper output)
    {
        _output = output;

        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:17")
            .WithDatabase("conduit3d_service_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _postgresContainer.StartAsync();
        _output.WriteLine($"PostgreSQL container started: {_postgresContainer.GetConnectionString()}");

        var services = new ServiceCollection();

        services.AddDbContext<UsersContext>(options =>
        {
            options.UseNpgsql(_postgresContainer.GetConnectionString());
            options.EnableSensitiveDataLogging();
            options.LogTo(message => _output.WriteLine(message));
        }, ServiceLifetime.Scoped);

        services.AddTransient<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IConfigService, PostgresqlConfigService>();

        _serviceProvider = services.BuildServiceProvider();

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<UsersContext>();
            // DO NOT USE EnsureCreatedAsync() - it tries to create tables from entity model
            // Just test the connection
            await context.Database.ExecuteSqlRawAsync("SELECT 1");

            // Drop existing table if any
            await context.Database.ExecuteSqlRawAsync("DROP TABLE IF EXISTS public.config CASCADE;");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS public.config (
                    key character varying(255) COLLATE pg_catalog.default NOT NULL,
                    value character varying(512) COLLATE pg_catalog.default NOT NULL,
                    CONSTRAINT config_pkey PRIMARY KEY (key)
                )
            ");

            _output.WriteLine("Config table created");

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

    private async Task CleanDatabase()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<UsersContext>();
        await context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE public.config RESTART IDENTITY;");
    }

    public async Task DisposeAsync()
    {
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task SetConfigValueAsync_WhenKeyIsNew_ShouldCreateConfig()
    {
        await CleanDatabase();
        // Arrange
        var configDto = TestDataGenerator.GenerateConfigDto("new.key", "new.value");

        // Act
        Response<string> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var configService = scope.ServiceProvider.GetRequiredService<IConfigService>();
            response = await configService.SetConfigValueAsync(configDto);
        }

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.Data.Should().Be(configDto.Key);

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbConfig = await context.Configs.FindAsync(configDto.Key);
        dbConfig.Should().NotBeNull();
        dbConfig!.Value.Should().Be(configDto.Value);
    }

    [Fact]
    public async Task SetConfigValueAsync_WhenKeyExists_ShouldUpdateConfig()
    {
        await CleanDatabase();
        // Arrange
        var originalDto = TestDataGenerator.GenerateConfigDto("existing.key", "original.value");
        var updatedDto = TestDataGenerator.GenerateConfigDto("existing.key", "updated.value");

        using (var scope = _serviceProvider.CreateScope())
        {
            var configService = scope.ServiceProvider.GetRequiredService<IConfigService>();
            await configService.SetConfigValueAsync(originalDto); // Seed the initial value
        }

        // Act
        Response<string> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var configService = scope.ServiceProvider.GetRequiredService<IConfigService>();
            response = await configService.SetConfigValueAsync(updatedDto);
        }

        // Assert
        response.IsSuccess.Should().BeTrue();

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbConfig = await context.Configs.FindAsync(originalDto.Key);
        dbConfig.Should().NotBeNull();
        dbConfig!.Value.Should().Be("updated.value");
    }

    [Fact]
    public async Task GetAllConfigsAsync_WithExistingConfigs_ShouldReturnAll()
    {
        await CleanDatabase();
        // Arrange
        using (var scope = _serviceProvider.CreateScope())
        {
            var configService = scope.ServiceProvider.GetRequiredService<IConfigService>();
            await configService.SetConfigValueAsync(TestDataGenerator.GenerateConfigDto("key1", "val1"));
            await configService.SetConfigValueAsync(TestDataGenerator.GenerateConfigDto("key2", "val2"));
        }

        // Act
        Response<List<Config>> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var configService = scope.ServiceProvider.GetRequiredService<IConfigService>();
            response = await configService.GetAllConfigsAsync();
        }

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.Data.Should().NotBeNull();
        response.Data.Should().HaveCount(2);
        response.Data.Should().Contain(c => c.Key == "key1");
    }

    [Fact]
    public async Task GetConfigValueAsync_WithExistingKey_ShouldReturnValue()
    {
        await CleanDatabase();
        // Arrange
        using (var scope = _serviceProvider.CreateScope())
        {
            var configService = scope.ServiceProvider.GetRequiredService<IConfigService>();
            await configService.SetConfigValueAsync(TestDataGenerator.GenerateConfigDto("get.key", "get.value"));
        }

        // Act
        Response<string> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var configService = scope.ServiceProvider.GetRequiredService<IConfigService>();
            response = await configService.GetConfigValueAsync("get.key");
        }

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.Data.Should().Be("get.value");
    }

    [Fact]
    public async Task DeleteConfigValueAsync_WithExistingKey_ShouldDeleteConfig()
    {
        await CleanDatabase();
        // Arrange
        var keyToDelete = "delete.key";
        using (var scope = _serviceProvider.CreateScope())
        {
            var configService = scope.ServiceProvider.GetRequiredService<IConfigService>();
            await configService.SetConfigValueAsync(TestDataGenerator.GenerateConfigDto(keyToDelete, "some.value"));
        }

        // Act
        Response<string> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var configService = scope.ServiceProvider.GetRequiredService<IConfigService>();
            response = await configService.DeleteConfigValueAsync(keyToDelete);
        }

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.Data.Should().Be(keyToDelete);

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbConfig = await context.Configs.FindAsync(keyToDelete);
        dbConfig.Should().BeNull();
    }

    [Fact]
    public async Task DeleteConfigValueAsync_WithNonExistingKey_ShouldReturnNotFound()
    {
        await CleanDatabase();
        // Arrange
        var nonExistentKey = "non.existent.key";

        // Act
        Response<string> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var configService = scope.ServiceProvider.GetRequiredService<IConfigService>();
            response = await configService.DeleteConfigValueAsync(nonExistentKey);
        }

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}