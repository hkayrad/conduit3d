using System;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;

namespace AuthService.Infrastructure.Repositories;

public interface IUserRepository
{
   public Task<List<User>> GetAllAsync(int pageNumber, int pageSize, string sortBy, bool ascending, CancellationToken cancellationToken);
   public Task<User> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken);
   public Task<string> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken);
}
