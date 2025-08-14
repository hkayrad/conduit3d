using System;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;

namespace AuthService.Infrastructure.Repositories;

public interface IUserRepository
{
   public Task<User> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken);
   public Task<List<User>> GetAllAsync(int pageNumber, int pageSize, string sortBy, bool ascending, CancellationToken cancellationToken);
   public Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken);
   public Task<User?> UpdateAsync(int id, UpdateUserDto updateUserDto, CancellationToken cancellationToken);
   public Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
   public Task<string> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken);
}
