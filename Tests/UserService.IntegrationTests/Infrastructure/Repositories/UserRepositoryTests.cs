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
using UserService.Infrastructure.Repositories;
using UserService.IntegrationTests.Helpers;
using Xunit;
using Xunit.Abstractions;

namespace UserService.IntegrationTests.Infrastructure.Repositories;

public class UserRepositoryTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public UserRepositoryTests(ITestOutputHelper output)
    {
        _output = output;

        Environment.SetEnvironmentVariable("JWT_SECRET", "JsonWebTokenSecretForTestingAndHopefullyLongEnoughForHS256");
        Environment.SetEnvironmentVariable("JWT_ISSUER", "Testing");
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", "Testing");
        Environment.SetEnvironmentVariable("JWT_EXPIRATION_TIME_HRS", "1");

        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:17")
            .WithDatabase("conduit3d_repo_test")
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

        services.AddScoped<IUserRepository, UserRepository>();

        _serviceProvider = services.BuildServiceProvider();

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<UsersContext>();
            // DO NOT USE EnsureCreatedAsync() - it tries to create tables from entity model
            // Just test the connection
            await context.Database.ExecuteSqlRawAsync("SELECT 1");

            // Create the pgcrypto extension for password hashing
            await context.Database.ExecuteSqlRawAsync("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
            _output.WriteLine("pgcrypto extension created");

            // Drop existing table if any
            await context.Database.ExecuteSqlRawAsync("DROP TABLE IF EXISTS public.users CASCADE;");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE OR REPLACE FUNCTION generate_searchable_text(
                    id_val INT, 
                    is_active_val BOOLEAN, 
                    username_val TEXT, 
                    email_val TEXT, 
                    created_at_val TIMESTAMP WITH TIME ZONE, 
                    user_role_val TEXT, 
                    name_val TEXT
                )
                RETURNS tsvector
                AS $$
                SELECT to_tsvector('simple', 
                    coalesce(cast(id_val as text)) || ' ' ||
                    coalesce((case when is_active_val then 'active' else 'inactive' end), '') || ' ' ||
                    coalesce(username_val, '') || ' ' || 
                    regexp_replace(coalesce(email_val, ''), '[.@]', ' ', 'g') || ' ' || 
                    regexp_replace(coalesce(cast(created_at_val as text), ''), '^(\d{{4}}-\d{{2}}-\d{{2}})\s+(\d{{2}}:\d{{2}}:\d{{2}})\.(\d{{3}})\s+([+-]\d{{4}})$', '\1 \2 \3 \4', 'g') || ' ' ||
                    coalesce(user_role_val, '') || ' ' ||
                    coalesce(name_val, '')
                );
                $$ LANGUAGE SQL IMMUTABLE;
            ");

            // If EnsureCreated doesn't work, manually create the users table
            // You'll need to adjust this based on your actual User entity structure
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS public.users (
                    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
                    username character varying(100) COLLATE pg_catalog.default NOT NULL,
                    email character varying(255) COLLATE pg_catalog.default NOT NULL,
                    user_role character varying(10) COLLATE pg_catalog.default NOT NULL,
                    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                    is_active boolean NOT NULL DEFAULT true,
                    password_hash character varying(128) COLLATE pg_catalog.default NOT NULL,
                    name character varying(100) COLLATE pg_catalog.default NOT NULL,
                    CONSTRAINT users_pkey PRIMARY KEY (id),
                    CONSTRAINT email UNIQUE (email),
                    CONSTRAINT username UNIQUE (username)
                );
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE users ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
                    generate_searchable_text(id, is_active, username, email, created_at, user_role, name)
                ) STORED;
            ");

            _output.WriteLine("Users table created");

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
        await context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE public.users RESTART IDENTITY CASCADE;");
    }

    public async Task DisposeAsync()
    {
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldCreateUser()
    {
        await CleanDatabase();
        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto("repo_user", "repo@test.com");

        // Act
        User createdUser;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            createdUser = await userRepository.CreateAsync(addUserDto, CancellationToken.None);
        }

        // Assert
        createdUser.Should().NotBeNull();
        createdUser.Id.Should().BeGreaterThan(0);
        createdUser.Username.Should().Be(addUserDto.Username);

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbUser = await context.Users.FindAsync(createdUser.Id);
        dbUser.Should().NotBeNull();
        dbUser!.Email.Should().Be(addUserDto.Email);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnUserWithToken()
    {
        await CleanDatabase();
        // Arrange
        var password = "Password123!";
        var addUserDto = TestDataGenerator.GenerateAddUserDto("login_repo_user", "login_repo@test.com", password: password);
        var loginDto = TestDataGenerator.GenerateLoginUserDto("login_repo_user", password);

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(addUserDto, CancellationToken.None);
        }

        // Act
        UserWithTokenDto? result;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            result = await userRepository.LoginAsync(loginDto, CancellationToken.None);
        }

        // Assert
        result.Should().NotBeNull();
        result!.User.Should().NotBeNull();
        result.User.Username.Should().Be(loginDto.Username);
        result.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ShouldReturnNull()
    {
        await CleanDatabase();
        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto("login_fail_user", "login_fail@test.com", password: "CorrectPassword");
        var loginDto = TestDataGenerator.GenerateLoginUserDto("login_fail_user", "WrongPassword");

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(addUserDto, CancellationToken.None);
        }

        // Act
        UserWithTokenDto? result;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            result = await userRepository.LoginAsync(loginDto, CancellationToken.None);
        }

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task LoginAsync_WithInactiveUser_ShouldReturnNull()
    {
        await CleanDatabase();
        // Arrange
        var password = "Password123!";
        var addUserDto = TestDataGenerator.GenerateAddUserDto("login_repo_user", "login_repo@test.com", password: password, isActive: false);
        var loginDto = TestDataGenerator.GenerateLoginUserDto("login_repo_user", password);

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(addUserDto, CancellationToken.None);
        }

        // Act
        UserWithTokenDto? result;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            result = await userRepository.LoginAsync(loginDto, CancellationToken.None);
        }

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetCountAsync_ShouldReturnCorrectCounts()
    {
        await CleanDatabase();
        // Arrange
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("count_1", "c1@test.com", isActive: true), CancellationToken.None);
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("count_2", "c2@test.com", isActive: true), CancellationToken.None);
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("count_3", "c3@test.com", isActive: false), CancellationToken.None);
        }

        // Act
        UserCountsDto counts;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            counts = await userRepository.GetCountAsync(null, CancellationToken.None);
        }

        // Assert
        counts.Should().NotBeNull();
        counts.TotalUsers.Should().Be(3);
        counts.ActiveUsers.Should().Be(2);
        counts.InactiveUsers.Should().Be(1);
    }

    [Fact]
    public async Task GetCountAsync_WithQuery_ShouldReturnCorrectCounts()
    {
        await CleanDatabase();
        // Arrange
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("count_1", "c1@test.com", isActive: true), CancellationToken.None);
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("count_2", "c2@test.com", isActive: true), CancellationToken.None);
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("count_3", "c3@test.com", isActive: false), CancellationToken.None);
        }

        // Act
        UserCountsDto counts;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            counts = await userRepository.GetCountAsync("count_", CancellationToken.None);
        }

        // Assert
        counts.Should().NotBeNull();
        counts.TotalUsers.Should().Be(3);
        counts.ActiveUsers.Should().Be(2);
        counts.InactiveUsers.Should().Be(1);
    }

    [Fact]
    public async Task GetAllAsync_WithQuery_ShouldReturnFilteredResults()
    {
        await CleanDatabase();
        // Arrange
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("alpha_user", "alpha@test.com"), CancellationToken.None);
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("beta_user", "beta@test.com"), CancellationToken.None);
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("target_gamma", "target@test.com"), CancellationToken.None);
        }

        // Act
        List<User> users;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            users = await userRepository.GetAllAsync(1, 10, "Id", true, "target", CancellationToken.None);
        }

        // Assert
        users.Should().NotBeNull();
        users.Should().HaveCount(1);
        users.Single().Username.Should().Be("target_gamma");
    }

    [Fact]
    public async Task GetAllAsync_Descending_ShouldReturnFilteredResults()
    {
        await CleanDatabase();
        // Arrange
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("alpha_user", "alpha@test.com"), CancellationToken.None);
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("beta_user", "beta@test.com"), CancellationToken.None);
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            await userRepository.CreateAsync(TestDataGenerator.GenerateAddUserDto("target_gamma", "target@test.com"), CancellationToken.None);
        }

        // Act
        List<User> users;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            users = await userRepository.GetAllAsync(1, 10, "Id", false, null, CancellationToken.None);
        }

        // Assert
        users.Should().NotBeNull();
        users.Should().HaveCount(3);
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_ShouldUpdateUser()
    {
        await CleanDatabase();
        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto("update_me", "update@test.com");

        User createdUser;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            createdUser = await userRepository.CreateAsync(addUserDto, CancellationToken.None);
        }

        var updateUserDto = TestDataGenerator.GenerateUpdateUserDto(
            name: "Updated Name",
            email: "new_email@test.com",
            password: "NewPassword123!"
        );

        // Act
        User? updatedUser;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            updatedUser = await userRepository.UpdateAsync(createdUser.Id, updateUserDto, CancellationToken.None);
        }

        // Assert
        updatedUser.Should().NotBeNull();
        updatedUser!.Name.Should().Be("Updated Name");
        updatedUser.Email.Should().Be("new_email@test.com");
    }

    [Fact]
    public async Task DeleteAsync_WithExistingUser_ShouldReturnTrue()
    {
        await CleanDatabase();
        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto("delete_me", "delete@test.com");
        User createdUser;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            createdUser = await userRepository.CreateAsync(addUserDto, CancellationToken.None);
        }

        // Act
        bool result;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            result = await userRepository.DeleteAsync(createdUser.Id, CancellationToken.None);
        }

        // Assert
        result.Should().BeTrue();

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbUser = await context.Users.FindAsync(createdUser.Id);
        dbUser.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithoutExistingUser_ShouldReturnFalse()
    {
        await CleanDatabase();

        // Act
        bool result;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            result = await userRepository.DeleteAsync(1, CancellationToken.None);
        }

        // Assert
        result.Should().BeFalse();

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbUser = await context.Users.FindAsync(1);
        dbUser.Should().BeNull();
    }
}