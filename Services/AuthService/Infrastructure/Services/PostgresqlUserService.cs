using System;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;

namespace AuthService.Infrastructure.Services;

public class PostgresqlUserService(IUnitOfWork unitOfWork) : IUserService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    public async Task<List<User>> GetAllUsersAsync(int pageSize, int pageNumber, string sortBy, bool ascending, CancellationToken cancellationToken)
    {
        return await _unitOfWork.UserRepository.GetAllAsync(pageNumber, pageSize, sortBy, ascending, cancellationToken);
    }

    public async Task<User> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(addUserDto);

        var user = await _unitOfWork.UserRepository.CreateAsync(addUserDto, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return user;
    }
}
