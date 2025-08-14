using System;
using AuthService.Domain;
using AuthService.Infrastructure.Data;
using AuthService.Infrastructure.DTOs;
using AuthService.Infrastructure.Utilities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace AuthService.Infrastructure.Repositories;

public class UserRepository(UsersContext context) : IUserRepository
{
    private readonly UsersContext _context = context;
    private readonly DbSet<User> _users = context.Set<User>();

    public async Task<User> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken)
    {
        var sql = @"INSERT INTO users (username, email, user_role, name, password_hash)
                VALUES (
                    @Username, 
                    @Email, 
                    @UserRole, 
                    @Name, 
                    crypt(@Password, gen_salt('bf'))
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
            CreatedAt = createdAt
        };

        return user;
    }

    public async Task<List<User>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            CancellationToken cancellationToken)
    {
        var query = _users.AsQueryable();

        if (ascending)
            query = query.OrderBy(u => EF.Property<object>(u, sortBy));
        else
            query = query.OrderByDescending(u => EF.Property<object>(u, sortBy));

        query = query.Skip((pageNumber - 1) * pageSize)
                     .Take(pageSize);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await _users.FindAsync([id], cancellationToken: cancellationToken);
    }

    public async Task<object> UpdateAsync(int id, UpdateUserDto updateUserDto, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var user = await _users.FindAsync([id], cancellationToken: cancellationToken);

        if (user == null)
            return false;

        _users.Remove(user);

        return true;
    }

    public async Task<string> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken)
    {
        var sql = @"SELECT username, email, user_role 
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
            var username = reader.GetString(reader.GetOrdinal("username"));
            var email = reader.GetString(reader.GetOrdinal("email"));
            var userRole = reader.GetString(reader.GetOrdinal("user_role"));

            return TokenProvider.GenerateToken(username, email, userRole);
        }

        return null!;
    }

}
