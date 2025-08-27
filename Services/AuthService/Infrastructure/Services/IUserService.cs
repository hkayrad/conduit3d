using System;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;
using Conduit3D.Common.Domain;

namespace AuthService.Infrastructure.Services;

public interface IUserService
{
    Task<Response<User>> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken);
    Task<Response<List<User>>> GetAllUsersAsync(int pageSize, int pageNumber, string sortBy, bool ascending, CancellationToken cancellationToken);
    Task<Response<User>> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<Response<int>> GetCountAsync(CancellationToken cancellationToken);
    Task<Response<User>> UpdateAsync(int id, UpdateUserDto updateUserDto, CancellationToken cancellationToken);
    Task<Response<object>> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<Response<UserWithToken>> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken);
}
