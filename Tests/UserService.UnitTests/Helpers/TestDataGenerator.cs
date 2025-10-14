using System;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using UserService.Domain;
using UserService.Infrastructure.DTOs;

namespace UserService.UnitTests.Helpers;

public class TestDataGenerator
{
    public static User GenerateTestUser(
        int id = 1,
        string username = "testuser",
        string email = "test@example.com",
        string name = "Test User",
        string userRole = Roles.User,
        DateTime createdAt = default,
        bool isActive = true
    )
    {
        return new User
        {
            Id = id,
            Username = username,
            Email = email,
            Name = name,
            UserRole = userRole,
            CreatedAt = createdAt == default ? DateTime.UtcNow : createdAt,
            IsActive = isActive
        };
    }

    public static List<User> GenerateTestUsers(int count)
    {
        var users = new List<User>();
        for (int i = 1; i <= count; i++)
        {
            users.Add(GenerateTestUser(
                id: i,
                username: $"testuser{i}",
                email: $"test{i}@example.com",
                name: $"Test User {i}",
                userRole: i % 2 == 0 ? Roles.Admin : Roles.User,
                createdAt: DateTime.UtcNow.AddDays(-i),
                isActive: i % 3 == 0
            ));
        }
        return users;
    }

    public static AddUserDto GenerateAddUserDto(
        string username = "newuser",
        string email = "new@example.com",
        string name = "New User",
        string password = "SecureP@ssw0rd",
        string userRole = Roles.User,
        bool isActive = true
    )
    {
        return new AddUserDto
        {
            Username = username,
            Email = email,
            Name = name,
            Password = password,
            UserRole = userRole,
            IsActive = isActive
        };
    }

    public static Config GenerateConfig(
        string key = "SampleKey",
        string value = "SampleValue"
    )
    {
        return new Config
        {
            Key = key,
            Value = value
        };
    }

    public static ConfigDto GenerateConfigDto(
        string key = "SampleKey",
        string value = "SampleValue"
    )
    {
        return new ConfigDto
        {
            Key = key,
            Value = value
        };
    }

    public static LoginUserDto GenerateLoginUserDto(
        string username = "testuser",
        string password = "SecureP@ssw0rd"
    )
    {
        return new LoginUserDto
        {
            Username = username,
            Password = password
        };
    }

    public static UpdateUserDto GenerateUpdateUserDto(
        string username = "updateduser",
        string email = "updated@example.com",
        string name = "Updated User",
        string userRole = Roles.User,
        string password = "NewP@ssw0rd",
        bool isActive = false
    )
    {
        return new UpdateUserDto
        {
            Username = username,
            Email = email,
            Name = name,
            UserRole = userRole,
            Password = password,
            IsActive = isActive
        };
    }

    public static UserCountsDto GenerateUserCountsDto(
        int totalUsers = 100,
        int activeUsers = 80,
        int inactiveUsers = 20
    )
    {
        return new UserCountsDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            InactiveUsers = inactiveUsers
        };
    }

    public static UserDto GenerateUserDto(
        string username = "testuser",
        string email = "test@example.com",
        string name = "Test User",
        string userRole = Roles.User,
        bool isActive = true
    )
    {
        return new UserDto
        {
            Username = username,
            Email = email,
            Name = name,
            UserRole = userRole,
            IsActive = isActive
        };
    }

    public static UserWithTokenDto GenerateUserWithTokenDto(
        User? user = null,
        string token = "sample.jwt.token"
    )
    {
        return new UserWithTokenDto
        {
            User = user ?? GenerateTestUser(),
            Token = token
        };
    }
}
