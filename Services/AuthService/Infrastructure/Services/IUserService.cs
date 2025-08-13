using System;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;

namespace AuthService.Infrastructure.Services;

public interface IUserService
{
    Task<List<User>> GetAllUsersAsync(int pageSize, int pageNumber, string sortBy, bool ascending, CancellationToken cancellationToken);

    Task<User> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken);
}
