using System;
using AuthService.Domain;

namespace AuthService.Infrastructure.Services;

public interface IUserService
{
    Task<List<User>> GetAllUsersAsync(CancellationToken cancellationToken, int pageSize, int pageNumber, string sortBy, bool ascending);
}
