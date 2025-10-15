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

public class PostgresqlUserServiceTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;
    private IServiceProvider _serviceProvider = null!;

    public PostgresqlUserServiceTests(ITestOutputHelper output)
    {
        _output = output;

        Environment.SetEnvironmentVariable("JWT_SECRET", "JsonWebTokenSecretForTestingAndHopefullyLongEnoughForHS256");
        Environment.SetEnvironmentVariable("JWT_ISSUER", "Testing");
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", "Testing");
        Environment.SetEnvironmentVariable("JWT_EXPIRATION_TIME_HRS", "1");

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
        services.AddScoped<IUserService, PostgresqlUserService>();

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
        // Clean database after all tests complete
        try
        {
            await CleanDatabase();
        }
        catch { /* ignore errors during cleanup */ }

        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldCreateUser()
    {
        await CleanDatabase();

        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "service_test_user",
            email: "service@test.com",
            password: "Password123!"
        );

        // Act & Assert
        Response<User> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            response = await userService.CreateAsync(addUserDto, CancellationToken.None);
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Data.Should().NotBeNull();
        response.Data!.Username.Should().Be(addUserDto.Username);

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbUser = await context.Users.FindAsync(response.Data.Id);
        dbUser.Should().NotBeNull();
        dbUser!.Email.Should().Be(addUserDto.Email);
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateUsername_ShouldReturnDatabaseError()
    {
        await CleanDatabase();

        // Arrange
        var firstUserDto = TestDataGenerator.GenerateAddUserDto("duplicate_user", "first@test.com");
        var secondUserDto = TestDataGenerator.GenerateAddUserDto("duplicate_user", "second@test.com");

        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            // Create the first user
            await userService.CreateAsync(firstUserDto, CancellationToken.None);
        }

        Response<User> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            // Try to create the second user with the same username
            response = await userService.CreateAsync(secondUserDto, CancellationToken.None);
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingUser_ShouldReturnUser()
    {
        await CleanDatabase();

        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto("get_user", "get@test.com");
        int userId;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            var createdUserResponse = await userService.CreateAsync(addUserDto, CancellationToken.None);
            userId = createdUserResponse.Data!.Id;
        }

        // Act
        Response<User> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            response = await userService.GetByIdAsync(userId, CancellationToken.None);
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Data.Should().NotBeNull();
        response.Data!.Id.Should().Be(userId);
        response.Data.Username.Should().Be("get_user");
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingUser_ShouldReturnNotFound()
    {
        await CleanDatabase();

        // Arrange
        var nonExistentId = 999;

        // Act
        Response<User> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            response = await userService.GetByIdAsync(nonExistentId, CancellationToken.None);
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        response.Message.Should().Contain("No user found");
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_ShouldUpdateUser()
    {
        await CleanDatabase();

        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto("update_user", "update@test.com");
        int userId;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            var createdUserResponse = await userService.CreateAsync(addUserDto, CancellationToken.None);
            userId = createdUserResponse.Data!.Id;
        }

        var updateUserDto = TestDataGenerator.GenerateUpdateUserDto(
            name: "Updated Name",
            email: "updated.email@test.com",
            userRole: Roles.Admin,
            isActive: false
        );

        // Act
        Response<User> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            response = await userService.UpdateAsync(userId, updateUserDto, CancellationToken.None);
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Data.Should().NotBeNull();
        response.Data!.Name.Should().Be("Updated Name");
        response.Data.Email.Should().Be("updated.email@test.com");
        response.Data.IsActive.Should().BeFalse();

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbUser = await context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        dbUser.Should().NotBeNull();
        dbUser!.Name.Should().Be("Updated Name");
        dbUser.UserRole.Should().Be(Roles.Admin);
    }

    [Fact]
    public async Task DeleteAsync_WithExistingUser_ShouldDeleteUser()
    {
        await CleanDatabase();

        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto("delete_user", "delete@test.com");
        int userId;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            var createdUserResponse = await userService.CreateAsync(addUserDto, CancellationToken.None);
            userId = createdUserResponse.Data!.Id;
        }

        // Act
        Response<object> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            response = await userService.DeleteAsync(userId, CancellationToken.None);
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify in DB
        using var verifyScope = _serviceProvider.CreateScope();
        var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbUser = await context.Users.FindAsync(userId);
        dbUser.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingUser_ShouldReturnNotFound()
    {
        await CleanDatabase();

        // Arrange
        var nonExistentId = 999;

        // Act
        Response<object> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            response = await userService.DeleteAsync(nonExistentId, CancellationToken.None);
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnUserWithToken()
    {
        await CleanDatabase();

        // Arrange
        var password = "ValidPassword123!";
        var addUserDto = TestDataGenerator.GenerateAddUserDto("login_user", "login@test.com", password: password);
        var loginDto = TestDataGenerator.GenerateLoginUserDto("login_user", password);

        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            // Create the user
            await userService.CreateAsync(addUserDto, CancellationToken.None);
        }

        Response<UserWithTokenDto> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            // Act: Try to login
            response = await userService.LoginAsync(loginDto, CancellationToken.None);
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Data.Should().NotBeNull();
        response.Data.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LoginAsync_WithInvalidCredentials_ShouldReturnValidationError()
    {
        await CleanDatabase();

        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto("login_fail_user", "login.fail@test.com", password: "CorrectPassword");
        var loginDto = TestDataGenerator.GenerateLoginUserDto("login_fail_user", "WrongPassword");

        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            // Create the user
            await userService.CreateAsync(addUserDto, CancellationToken.None);
        }

        Response<UserWithTokenDto> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            // Act: Try to login
            response = await userService.LoginAsync(loginDto, CancellationToken.None);
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Message.Should().Contain("No user found with given credentials"); // This comes from the service layer
    }

    [Fact]
    public async Task GetAllUsersAsync_WithMultipleUsers_ShouldReturnPaginatedList()
    {
        await CleanDatabase();

        // Arrange - Create each user in separate scope
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            var result1 = await userService.CreateAsync(TestDataGenerator.GenerateAddUserDto("user_a", "a@test.com"), CancellationToken.None);
            _output.WriteLine($"User A: IsSuccess={result1.IsSuccess}, StatusCode={result1.StatusCode}, Message={result1.Message}");
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            var result2 = await userService.CreateAsync(TestDataGenerator.GenerateAddUserDto("user_b", "b@test.com"), CancellationToken.None);
            _output.WriteLine($"User B: IsSuccess={result2.IsSuccess}, StatusCode={result2.StatusCode}, Message={result2.Message}");
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            var result3 = await userService.CreateAsync(TestDataGenerator.GenerateAddUserDto("user_c", "c@test.com"), CancellationToken.None);
            _output.WriteLine($"User C: IsSuccess={result3.IsSuccess}, StatusCode={result3.StatusCode}, Message={result3.Message}");
        }

        // Verify how many users actually exist
        using (var verifyScope = _serviceProvider.CreateScope())
        {
            var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
            var allUsers = await context.Users.ToListAsync();
            _output.WriteLine($"Total users in database: {allUsers.Count}");
            foreach (var user in allUsers)
            {
                _output.WriteLine($"  - {user.Username} ({user.Email})");
            }
        }

        Response<List<User>> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            // Act: Get first 2 users
            response = await userService.GetAllUsersAsync(
                pageSize: 2,
                pageNumber: 1,
                sortBy: "Username",
                ascending: true,
                query: null,
                cancellationToken: CancellationToken.None
            );
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeTrue();
        response.Data.Should().NotBeNull();
        response.Data!.Count.Should().Be(2);
        response.Data[0].Username.Should().Be("user_a");
        response.Data[1].Username.Should().Be("user_b");
    }

    [Fact]
    public async Task GetCountAsync_ShouldReturnCorrectCounts()
    {
        await CleanDatabase();

        // Arrange - Create each user in separate scope
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            var result1 = await userService.CreateAsync(TestDataGenerator.GenerateAddUserDto("user_a", "a@test.com"), CancellationToken.None);
            _output.WriteLine($"User A: IsSuccess={result1.IsSuccess}, StatusCode={result1.StatusCode}, Message={result1.Message}");
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            var result2 = await userService.CreateAsync(TestDataGenerator.GenerateAddUserDto("user_b", "b@test.com"), CancellationToken.None);
            _output.WriteLine($"User B: IsSuccess={result2.IsSuccess}, StatusCode={result2.StatusCode}, Message={result2.Message}");
        }

        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            var result3 = await userService.CreateAsync(TestDataGenerator.GenerateAddUserDto("user_c", "c@test.com", isActive: false), CancellationToken.None);
            _output.WriteLine($"User C: IsSuccess={result3.IsSuccess}, StatusCode={result3.StatusCode}, Message={result3.Message}");
        }

        // Verify how many users actually exist
        using (var verifyScope = _serviceProvider.CreateScope())
        {
            var context = verifyScope.ServiceProvider.GetRequiredService<UsersContext>();
            var allUsers = await context.Users.ToListAsync();
            _output.WriteLine($"Total users in database: {allUsers.Count}");
            foreach (var user in allUsers)
            {
                _output.WriteLine($"  - {user.Username} ({user.Email})");
            }
        }

        Response<UserCountsDto> response;
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            // Act: Get counts
            response = await userService.GetCountAsync(null, CancellationToken.None);
        }

        // Debug output
        _output.WriteLine($"CreateAsync response: IsSuccess={response.IsSuccess}, StatusCode={response.StatusCode}, Message={response.Message}");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccess.Should().BeTrue();
        response.Data.Should().NotBeNull();
        response.Data!.TotalUsers.Should().Be(3);
        response.Data.ActiveUsers.Should().Be(2);
        response.Data.InactiveUsers.Should().Be(1);
    }
}