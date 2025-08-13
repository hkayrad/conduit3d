using System;
using AuthService.Domain;
using AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

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

    public async Task<List<User>> GetAllAsync(CancellationToken cancellationToken,
                                            int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending)
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

}
