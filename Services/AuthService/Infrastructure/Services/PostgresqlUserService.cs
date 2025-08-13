using System;
using System.Net;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;
using Conduit3D.Common.Domain;

namespace AuthService.Infrastructure.Services;

public class PostgresqlUserService(IUnitOfWork unitOfWork) : IUserService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    public async Task<Response<List<User>>> GetAllUsersAsync(int pageSize, int pageNumber, string sortBy, bool ascending, CancellationToken cancellationToken)
    {
        var users = await _unitOfWork.UserRepository.GetAllAsync(pageNumber, pageSize, sortBy, ascending, cancellationToken);

        if (users == null || users.Count == 0)
            return Response<List<User>>.Failure("No users found.", HttpStatusCode.NotFound);

        return Response<List<User>>.Success(users, "Users retrieved successfully.");
    }

    public async Task<Response<User>> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken)
    {
        if (addUserDto == null)
            return Response<User>.Failure("Invalid user data.", HttpStatusCode.BadRequest);

        var user = await _unitOfWork.UserRepository.CreateAsync(addUserDto, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Response<User>.Success(user, "User created successfully.", HttpStatusCode.Created);
    }

    public async Task<Response<string>> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken)
    {
        if (loginUserDto == null)
            return Response<string>.Failure("Invalid login data.", HttpStatusCode.BadRequest);

        var token = await _unitOfWork.UserRepository.LoginAsync(loginUserDto, cancellationToken);

        if (token == null)
            return Response<string>.Failure("Invalid email or password.", HttpStatusCode.Unauthorized);

        return Response<string>.Success(token, "Login successful.");
    }
}
