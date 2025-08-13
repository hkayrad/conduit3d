using System;
using AuthService.Domain;

namespace AuthService.Infrastructure.Services;

public class PostgresqlUserService(IUnitOfWork unitOfWork) : IUserService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    public async Task<List<User>> GetAllUsersAsync(CancellationToken cancellationToken, int pageSize, int pageNumber, string sortBy, bool ascending)
    {
        return await _unitOfWork.UserRepository.GetAllAsync(cancellationToken, pageNumber, pageSize, sortBy, ascending);
    }
}
