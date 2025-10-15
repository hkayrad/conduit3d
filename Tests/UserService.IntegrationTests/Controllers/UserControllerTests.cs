using System.Net;
using System.Net.Http.Json;
using Conduit3D.Common.Domain;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.DependencyInjection;
using UserService.Domain;
using UserService.Infrastructure;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.Repositories;
using UserService.IntegrationTests.Helpers;
using Xunit;
using UserService.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Xunit.Abstractions;
using Testcontainers.PostgreSql;

namespace UserService.IntegrationTests.Controllers;

public class UserControllerTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;
    private readonly ITestOutputHelper _output;
    private readonly PostgreSqlContainer _postgresContainer;

    public UserControllerTests(WebApplicationFactory<Program> factory, ITestOutputHelper output)
    {
        _output = output;

        Environment.SetEnvironmentVariable("JWT_SECRET", "JsonWebTokenSecretForTestingAndHopefullyLongEnoughForHS256");
        Environment.SetEnvironmentVariable("JWT_ISSUER", "Testing");
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", "Testing");
        Environment.SetEnvironmentVariable("JWT_EXPIRATION_TIME_HRS", "1");

        // Create a PostgreSQL container for testing
        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:17")
            .WithDatabase("conduit3d_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType ==
                         typeof(DbContextOptions<UsersContext>));

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

    public async Task DisposeAsync()
    {
        _factory.Dispose();
        await _postgresContainer.DisposeAsync();
    }

    [Fact]
    public async Task CreateUser_WithValidData_ReturnsCreatedUser()
    {
        // Arrange
        var newUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "integrationtestuser",
            email: "integrationtest@example.com",
            name: "Integration Test User",
            password: "SecureP@ssw0rd",
            userRole: Roles.User,
            isActive: true
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/user", newUserDto);

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine("=== RESPONSE DETAILS ===");
        _output.WriteLine($"HTTP Status: {(int)response.StatusCode} {response.StatusCode}");
        _output.WriteLine($"Response Body: {content}");
        _output.WriteLine("========================");

        // Assert
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<Response<User>>();
        result.Should().NotBeNull();
        result.StatusCode.Should().Be(HttpStatusCode.Created);
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Username.Should().Be(newUserDto.Username);

        // Verify the user was actually created in the database
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<UsersContext>();
        var dbUser = await context.Users.FirstOrDefaultAsync(u => u.Username == newUserDto.Username);
        dbUser.Should().NotBeNull();
        dbUser.Email.Should().Be(newUserDto.Email);
    }

    [Fact]
    public async Task CreateUser_WithDuplicateUsername_ReturnsBadRequest()
    {
        // Arrange - Create first user
        var firstUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "duplicateuser",
            email: "first@example.com",
            name: "First User",
            password: "SecureP@ssw0rd1",
            userRole: Roles.User,
            isActive: true
        );
        await _client.PostAsJsonAsync("/api/v1/user", firstUserDto);

        // Arrange - Try to create second user with same username
        var duplicateUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "duplicateuser",
            email: "second@example.com",
            name: "Second User",
            password: "SecureP@ssw0rd2",
            userRole: Roles.User,
            isActive: true
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/user", duplicateUserDto);

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");




        // Assert
        var result = await response.Content.ReadFromJsonAsync<Response<User>>();
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("username");
    }

    [Fact]
    public async Task CreateUser_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Arrange - Create first user
        var firstUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "user1",
            email: "duplicate@example.com",
            name: "First User",
            password: "SecureP@ssw0rd1",
            userRole: Roles.User,
            isActive: true
        );
        await _client.PostAsJsonAsync("/api/v1/user", firstUserDto);

        // Arrange - Try to create second user with same email
        var duplicateUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "user2",
            email: "duplicate@example.com",
            name: "Second User",
            password: "SecureP@ssw0rd2",
            userRole: Roles.User,
            isActive: true
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/user", duplicateUserDto);

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        var result = await response.Content.ReadFromJsonAsync<Response<User>>();
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("email");
    }

    [Fact]
    public async Task CreateUser_WithInvalidEmail_ReturnsBadRequest()
    {
        // Arrange
        var invalidUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "testuser",
            email: "invalid-email",
            name: "Test User",
            password: "SecureP@ssw0rd",
            userRole: Roles.User,
            isActive: true
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/user", invalidUserDto);

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Don't try to deserialize as Response<User> since validation errors have a different structure
        content.Should().Contain("Email", "validation error should mention email");
    }

    [Fact]
    public async Task GetUserById_WithExistingUser_ReturnsUser()
    {
        // Arrange - Create a user
        var newUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "getusertest",
            email: "getuser@example.com",
            name: "Get User Test",
            password: "SecureP@ssw0rd",
            userRole: Roles.User,
            isActive: true
        );
        var createResponse = await _client.PostAsJsonAsync("/api/v1/user", newUserDto);
        var createResult = await createResponse.Content.ReadFromJsonAsync<Response<User>>();
        var userId = createResult!.Data!.Id;

        // Act
        var response = await _client.GetAsync($"/api/v1/user/{userId}");

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<Response<User>>();
        result.Should().NotBeNull();
        result!.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(userId);
        result.Data.Username.Should().Be(newUserDto.Username);
    }

    [Fact]
    public async Task GetUserById_WithNonExistingUser_ReturnsNotFound()
    {
        // Arrange
        var nonExistingUserId = 99999;

        // Act
        var response = await _client.GetAsync($"/api/v1/user/{nonExistingUserId}");

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        var result = await response.Content.ReadFromJsonAsync<Response<User>>();
        result.Should().NotBeNull();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateUser_WithValidData_ReturnsUpdatedUser()
    {
        // Arrange - Create a user
        var newUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "updateusertest",
            email: "updateuser@example.com",
            name: "Update User Test",
            password: "SecureP@ssw0rd",
            userRole: Roles.User,
            isActive: true
        );
        var createResponse = await _client.PostAsJsonAsync("/api/v1/user", newUserDto);
        var createResult = await createResponse.Content.ReadFromJsonAsync<Response<User>>();
        var userId = createResult!.Data!.Id;

        // Arrange - Update data
        var updateUserDto = TestDataGenerator.GenerateUpdateUserDto(
            name: "Updated Name",
            email: "updated@example.com",
            userRole: Roles.Admin,
            isActive: false
        );

        // Act
        var response = await _client.PutAsJsonAsync($"/api/v1/user/{userId}", updateUserDto);

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<Response<User>>();
        result.Should().NotBeNull();
        result!.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be("Updated Name");
        result.Data.Email.Should().Be("updated@example.com");
        result.Data.UserRole.Should().Be(Roles.Admin);
        result.Data.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateUser_WithNonExistingUser_ReturnsNotFound()
    {
        // Arrange
        var nonExistingUserId = 99999;
        var updateUserDto = TestDataGenerator.GenerateUpdateUserDto(
            name: "Updated Name",
            email: "updated@example.com",
            userRole: Roles.User,
            isActive: true
        );

        // Act
        var response = await _client.PutAsJsonAsync($"/api/v1/user/{nonExistingUserId}", updateUserDto);

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        var result = await response.Content.ReadFromJsonAsync<Response<User>>();
        result.Should().NotBeNull();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteUser_WithExistingUser_ReturnsSuccess()
    {
        // Arrange - Create a user
        var newUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "deleteusertest",
            email: "deleteuser@example.com",
            name: "Delete User Test",
            password: "SecureP@ssw0rd",
            userRole: Roles.User,
            isActive: true
        );
        var createResponse = await _client.PostAsJsonAsync("/api/v1/user", newUserDto);
        var createResult = await createResponse.Content.ReadFromJsonAsync<Response<User>>();
        var userId = createResult!.Data!.Id;

        // Act
        var response = await _client.DeleteAsync($"/api/v1/user/{userId}");

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        var result = await response.Content.ReadFromJsonAsync<Response<object>>();
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();

        // Verify user is deleted
        var getResponse = await _client.GetAsync($"/api/v1/user/{userId}");
        var getResult = await getResponse.Content.ReadFromJsonAsync<Response<User>>();
        getResult.Should().NotBeNull();
        getResult.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteUser_WithNonExistingUser_ReturnsNotFound()
    {
        // Arrange
        var nonExistingUserId = 99999;

        // Act
        var response = await _client.DeleteAsync($"/api/v1/user/{nonExistingUserId}");

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        var result = await response.Content.ReadFromJsonAsync<Response<object>>();
        result.Should().NotBeNull();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetAllUsers_ReturnsUserList()
    {
        // Arrange - Create multiple users
        var user1Dto = TestDataGenerator.GenerateAddUserDto(
            username: "listuser_one",
            email: "listuser1@example.com",
            name: "List User",
            password: "SecureP@ssw0rd1",
            userRole: Roles.User,
            isActive: true
        );
        var user2Dto = TestDataGenerator.GenerateAddUserDto(
            username: "listuser_two",
            email: "listuser2@example.com",
            name: "List User Two",
            password: "SecureP@ssw0rd2",
            userRole: Roles.Admin,
            isActive: true
        );

        await _client.PostAsJsonAsync("/api/v1/user", user1Dto);
        await _client.PostAsJsonAsync("/api/v1/user", user2Dto);

        // Act
        var response = await _client.GetAsync("/api/v1/user");

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response Status: {response.StatusCode}");
        _output.WriteLine($"Response: {content}");

        // Assert
        var result = await response.Content.ReadFromJsonAsync<Response<List<User>>>();
        result.Should().NotBeNull();

        // Log the actual result to see what's wrong
        _output.WriteLine($"IsSuccess: {result.IsSuccess}");
        _output.WriteLine($"Message: {result.Message}");
        _output.WriteLine($"StatusCode: {result.StatusCode}");
        _output.WriteLine($"Data count: {result.Data?.Count ?? 0}");

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Count.Should().BeGreaterThanOrEqualTo(2);
    }

    [Fact]
    public async Task GetCount_ReturnsCount()
    {
        // Arrange - Create multiple users
        var user1Dto = TestDataGenerator.GenerateAddUserDto(
            username: "countuser_one",
            email: "countuser1@example.com",
            name: "Count User",
            password: "SecureP@ssw0rd1",
            userRole: Roles.User,
            isActive: true
        );
        var user2Dto = TestDataGenerator.GenerateAddUserDto(
            username: "countuser_two",
            email: "countuser2@example.com",
            name: "Count User Two",
            password: "SecureP@ssw0rd2",
            userRole: Roles.Admin,
            isActive: true
        );

        await _client.PostAsJsonAsync("/api/v1/user", user1Dto);
        await _client.PostAsJsonAsync("/api/v1/user", user2Dto);

        // Act
        var response = await _client.GetAsync("/api/v1/user/count");

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}");

        // Assert
        content.Should().Contain("\"totalUsers\":2", "validation error should mention totalUsers");
        content.Should().Contain("\"activeUsers\":2", "validation error should mention activeUsers");
        content.Should().Contain("\"inactiveUsers\":0", "validation error should mention inactiveUsers");
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsJwtToken()
    {
        // Arrange - Create a user
        var password = "SecureP@ssw0rd";
        var newUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "logintestuser",
            email: "login@example.com",
            name: "Login Test User",
            password: password,
            userRole: Roles.User,
            isActive: true
        );
        await _client.PostAsJsonAsync("/api/v1/user", newUserDto);

        // Arrange - Login data
        var loginUserDto = TestDataGenerator.GenerateLoginUserDto(
            username: newUserDto.Username,
            password: password
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/user/login", loginUserDto);

        response.EnsureSuccessStatusCode();

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response Status: {response.Headers}");
        _output.WriteLine($"Response: {content}");

        // Assert
        content.Should().Contain("Login successful", "validation error should mention login successful");
        content.Should().Contain("\"username\":\"logintestuser\"", "validation error should mention token");

        response.Headers.Should().ContainKey("Set-Cookie");
        var setCookie = response.Headers.GetValues("Set-Cookie").FirstOrDefault();
        setCookie.Should().NotBeNull();
        setCookie.Should().Contain("user_session=");
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange - Create a user
        var password = "SecureP@ssw0rd";
        var newUserDto = TestDataGenerator.GenerateAddUserDto(
            username: "invalidlogintestuser",
            email: "invalidlogin@example.com",
            name: "Invalid Login Test User",
            password: password,
            userRole: Roles.User,
            isActive: true
        );
        await _client.PostAsJsonAsync("/api/v1/user", newUserDto);

        // Arrange - Login data
        var loginUserDto = TestDataGenerator.GenerateLoginUserDto(
            username: newUserDto.Username,
            password: "InvalidPassword"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/user/login", loginUserDto);

        // Debug output
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response: {content}"); 

        // Assert
        var result = await response.Content.ReadFromJsonAsync<Response<object>>();
        result.Should().NotBeNull();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Contain("No user found with given credentials", "validation error should mention invalid credentials");
    }
}