using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using UserService.Domain;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.DTOs;
using UserService.Infrastructure.Repositories;
using UserService.IntegrationTests.Helpers;
using Xunit;
using Xunit.Abstractions;

namespace UserService.IntegrationTests.Infrastructure.Repositories;

public class ConfigRepositoryTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public ConfigRepositoryTests(ITestOutputHelper output)
    {
        _output = output;

        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:17")
            .WithDatabase("conduit3d_config_repo_test")
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

        services.AddScoped<IConfigRepository, ConfigRepository>();

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
        string resultKey;
        using (var scope = _serviceProvider.CreateScope())
        {
            var repo = scope.ServiceProvider.GetRequiredService<IConfigRepository>();
            resultKey = await repo.SetConfigValueAsync(configDto);
        }

        // Assert
        resultKey.Should().Be(configDto.Key);

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
            var repo = scope.ServiceProvider.GetRequiredService<IConfigRepository>();
            await repo.SetConfigValueAsync(originalDto); // Seed
        }

        // Act
        using (var scope = _serviceProvider.CreateScope())
        {
            var repo = scope.ServiceProvider.GetRequiredService<IConfigRepository>();
            await repo.SetConfigValueAsync(updatedDto);
        }

        // Assert by verifying in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbConfig = await context.Configs.FindAsync(originalDto.Key);
        dbConfig.Should().NotBeNull();
        dbConfig!.Value.Should().Be("updated.value");
    }

    [Fact]
    public async Task GetConfigValueAsync_WithExistingKey_ShouldReturnValue()
    {
        await CleanDatabase();
        // Arrange
        var configDto = TestDataGenerator.GenerateConfigDto("get.key", "get.value");
        using (var scope = _serviceProvider.CreateScope())
        {
            var repo = scope.ServiceProvider.GetRequiredService<IConfigRepository>();
            await repo.SetConfigValueAsync(configDto);
        }

        // Act
        string result;
        using (var scope = _serviceProvider.CreateScope())
        {
            var repo = scope.ServiceProvider.GetRequiredService<IConfigRepository>();
            result = await repo.GetConfigValueAsync("get.key");
        }

        // Assert
        result.Should().Be("get.value");
    }

    [Fact]
    public async Task GetConfigValueAsync_WithNonExistingKey_ShouldReturnEmptyString()
    {
        await CleanDatabase();
        // Act
        string result;
        using (var scope = _serviceProvider.CreateScope())
        {
            var repo = scope.ServiceProvider.GetRequiredService<IConfigRepository>();
            result = await repo.GetConfigValueAsync("non.existent.key");
        }

        // Assert
        result.Should().Be(string.Empty);
    }

    [Fact]
    public async Task DeleteConfigValueAsync_WithExistingKey_ShouldDeleteAndReturnKey()
    {
        await CleanDatabase();
        // Arrange
        var keyToDelete = "delete.key";
        var configDto = TestDataGenerator.GenerateConfigDto(keyToDelete, "some.value");
        using (var scope = _serviceProvider.CreateScope())
        {
            var repo = scope.ServiceProvider.GetRequiredService<IConfigRepository>();
            await repo.SetConfigValueAsync(configDto);
        }

        // Act
        string resultKey;
        using (var scope = _serviceProvider.CreateScope())
        {
            var repo = scope.ServiceProvider.GetRequiredService<IConfigRepository>();
            resultKey = await repo.DeleteConfigValueAsync(keyToDelete);
        }

        // Assert
        resultKey.Should().Be(keyToDelete);

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbConfig = await context.Configs.FindAsync(keyToDelete);
        dbConfig.Should().BeNull();
    }

    [Fact]
    public async Task DeleteConfigValueAsync_WithoutExistingKey_ShouldReturnEmptyString()
    {
        await CleanDatabase();

        // Act
        string resultKey;
        using (var scope = _serviceProvider.CreateScope())
        {
            var repo = scope.ServiceProvider.GetRequiredService<IConfigRepository>();
            resultKey = await repo.DeleteConfigValueAsync("non.existent.key");
        }

        // Assert
        resultKey.Should().BeEmpty();

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbConfig = await context.Configs.FindAsync("non.existent.key");
        dbConfig.Should().BeNull();
    }
}
