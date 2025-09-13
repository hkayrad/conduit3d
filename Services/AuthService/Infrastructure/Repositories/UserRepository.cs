using System;
using AuthService.Domain;
using AuthService.Infrastructure.Data;
using AuthService.Infrastructure.DTOs;
using AuthService.Infrastructure.Utilities;
using Conduit3D.Common.Infrastructure.Utilities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace AuthService.Infrastructure.Repositories;

/// <summary>
/// Entity framework implementation of <see cref="IUserRepository"/> for managing user data.
/// </summary>
/// <param name="context">User database context.</param>
/// <remarks>
/// This class implements the IUserRepository interface and provides methods for managing user data.
/// </remarks>
public class UserRepository(UsersContext context) : IUserRepository
{
    /// <summary>
    /// User database context.
    /// </summary>
    private readonly UsersContext _context = context;

    /// <summary>
    /// DbSet for user entities.
    /// </summary>
    private readonly DbSet<User> _users = context.Set<User>();

    /// <inheritdoc />
    /// <remarks>
    /// This implementation uses PostgreSQL's native SQL capabilities.
    /// </remarks>
    public async Task<User> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken)
    {
        var sql = @"INSERT INTO users (username, email, user_role, name, is_active, password_hash)
                VALUES (
                    @Username, 
                    @Email, 
                    @UserRole, 
                    @Name, 
                    @IsActive,
                    crypt(@Password, gen_salt('bf', 13))
                )
                RETURNING id, created_at";

        await using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.Add(new NpgsqlParameter("@Username", addUserDto.Username));
        command.Parameters.Add(new NpgsqlParameter("@Email", addUserDto.Email));
        command.Parameters.Add(new NpgsqlParameter("@UserRole", addUserDto.UserRole));
        command.Parameters.Add(new NpgsqlParameter("@Name", addUserDto.Name));
        command.Parameters.Add(new NpgsqlParameter("@Password", addUserDto.Password));
        command.Parameters.Add(new NpgsqlParameter("@IsActive", addUserDto.IsActive));

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        await reader.ReadAsync(cancellationToken);

        var userId = reader.GetInt32(0);
        var createdAt = reader.GetDateTime(1);

        var user = new User
        {
            Id = userId,
            Username = addUserDto.Username,
            Email = addUserDto.Email,
            UserRole = addUserDto.UserRole,
            Name = addUserDto.Name,
            CreatedAt = createdAt,
            IsActive = addUserDto.IsActive ?? true
        };

        return user;
    }

    /// <inheritdoc />
    /// <remarks>
    /// This implementation uses Entity Framework Core's LINQ capabilities.
    /// </remarks>
    public async Task<List<User>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            string? query,
                                            CancellationToken cancellationToken)
    {
        var dbQuery = _users.AsQueryable();

        if (ascending)
            dbQuery = dbQuery.OrderBy(u => EF.Property<object>(u, sortBy));
        else
            dbQuery = dbQuery.OrderByDescending(u => EF.Property<object>(u, sortBy));

        if (!string.IsNullOrWhiteSpace(query))
            dbQuery = dbQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        dbQuery = dbQuery.Skip((pageNumber - 1) * pageSize)
                     .Take(pageSize);

        return await dbQuery.ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// This implementation uses Entity Framework Core's LINQ capabilities.
    /// </remarks>
    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await _users.FindAsync([id], cancellationToken: cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// This implementation uses Entity Framework Core's LINQ capabilities.
    /// </remarks>
    public async Task<UserCountsDto> GetCountAsync(string? query, CancellationToken cancellationToken)
    {
        int totalCount;
        int activeCount;
        int inactiveCount;

        if (string.IsNullOrWhiteSpace(query))
        {
            totalCount = await _users.CountAsync(cancellationToken);
            activeCount = await _users.CountAsync(u => u.IsActive, cancellationToken);
            inactiveCount = await _users.CountAsync(u => !u.IsActive, cancellationToken);
        }
        else
        {
            var dbQuery = _users.AsQueryable();
            dbQuery = dbQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

            totalCount = await dbQuery.CountAsync(cancellationToken);
            activeCount = await dbQuery.CountAsync(u => u.IsActive, cancellationToken);
            inactiveCount = await dbQuery.CountAsync(u => !u.IsActive, cancellationToken);
        }

        return new UserCountsDto
        {
            TotalUsers = totalCount,
            ActiveUsers = activeCount,
            InactiveUsers = inactiveCount
        };
    }

    /// <inheritdoc />
    /// <remarks>
    /// This implementation uses PostgreSQL's native SQL capabilities.
    /// </remarks>
    public async Task<User?> UpdateAsync(int id, UpdateUserDto updateUserDto, CancellationToken cancellationToken)
    {
        var user = await _users.FindAsync([id], cancellationToken: cancellationToken);

        if (user == null)
            return null!;

        var sql = @"UPDATE users
                    SET username = @Username,
                        email = @Email,
                        name = @Name,
                        user_role = @UserRole,
                        is_active = @IsActive,
                        password_hash = crypt(@Password, gen_salt('bf'))
                    WHERE id = @Id
                    RETURNING id;";

        await using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.Add(new NpgsqlParameter("@Id", id));
        command.Parameters.Add(new NpgsqlParameter("@Username", updateUserDto.Username ?? user.Username));
        command.Parameters.Add(new NpgsqlParameter("@Email", updateUserDto.Email ?? user.Email));
        command.Parameters.Add(new NpgsqlParameter("@Name", updateUserDto.Name ?? user.Name));
        command.Parameters.Add(new NpgsqlParameter("@UserRole", updateUserDto.UserRole ?? user.UserRole));
        command.Parameters.Add(new NpgsqlParameter("@Password", updateUserDto.Password));
        command.Parameters.Add(new NpgsqlParameter("@IsActive", updateUserDto.IsActive ?? user.IsActive));

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        await reader.ReadAsync(cancellationToken);

        var updatedUser = new User
        {
            Id = id,
            Username = updateUserDto.Username ?? user.Username,
            Email = updateUserDto.Email ?? user.Email,
            Name = updateUserDto.Name ?? user.Name,
            UserRole = updateUserDto.UserRole ?? user.UserRole,
            CreatedAt = user.CreatedAt,
            IsActive = updateUserDto.IsActive ?? user.IsActive
        };

        return updatedUser;
    }

    /// <inheritdoc />
    /// <remarks>
    /// This implementation uses Entity Framework Core's LINQ capabilities.
    /// </remarks>
    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var user = await _users.FindAsync([id], cancellationToken: cancellationToken);

        if (user == null)
            return false;

        _users.Remove(user);

        return true;
    }

    /// <inheritdoc />
    /// <remarks>
    /// This implementation uses PostgreSQL's native SQL capabilities.
    /// </remarks>
    public async Task<UserWithTokenDto> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken)
    {
        var sql = @"SELECT id, username, email, user_role, name, is_active
                    FROM users 
                    WHERE username = @Username 
                        AND password_hash = crypt(@Password, password_hash)";

        await using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.Add(new NpgsqlParameter("@Username", loginUserDto.Username));
        command.Parameters.Add(new NpgsqlParameter("@Password", loginUserDto.Password));

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (await reader.ReadAsync(cancellationToken))
        {
            var isActive = reader.GetBoolean(reader.GetOrdinal("is_active"));

            if (isActive)
            {
                var user = new User
                {
                    Id = reader.GetInt32(reader.GetOrdinal("id")),
                    Username = reader.GetString(reader.GetOrdinal("username")),
                    Email = reader.GetString(reader.GetOrdinal("email")),
                    UserRole = reader.GetString(reader.GetOrdinal("user_role")),
                    Name = reader.GetString(reader.GetOrdinal("name"))
                };

                return new UserWithTokenDto
                {
                    User = user,
                    Token = TokenProvider.GenerateToken(user)
                };
            }

            return null!;
        }

        return null!;

    }
}
