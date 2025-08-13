using System;
using AuthService.Domain;
using AuthService.Infrastructure.Data;
using AuthService.Infrastructure.DTOs;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace AuthService.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly UsersContext _context;
    private readonly DbSet<User> _users;

    public UserRepository(UsersContext context)
    {
        _context = context;
        _users = context.Set<User>();
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

    public async Task<User> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken)
    {
        var sql = @"INSERT INTO users (username, email, user_type, name, password_hash)
                VALUES (
                    @Username, 
                    @Email, 
                    @UserType, 
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
        command.Parameters.Add(new NpgsqlParameter("@UserType", addUserDto.UserType));
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
            UserType = addUserDto.UserType,
            Name = addUserDto.Name,
            CreatedAt = createdAt
        };

        return user;
    }

}
