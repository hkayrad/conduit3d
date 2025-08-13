using System;
using AuthService.Domain;

namespace AuthService.Infrastructure.Repositories;

public interface IUserRepository
{
   public Task<List<User>> GetAllAsync(CancellationToken cancellationToken, int pageNumber, int pageSize, string sortBy, bool ascending);
}
