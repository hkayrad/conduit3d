using System;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;
using Conduit3D.Common.Domain;

namespace AuthService.Infrastructure.Services;

public interface IUserService
{
    Task<Response<List<User>>> GetAllUsersAsync(int pageSize, int pageNumber, string sortBy, bool ascending, CancellationToken cancellationToken);
    Task<Response<User>> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken);
    Task<Response<string>> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken);
}
