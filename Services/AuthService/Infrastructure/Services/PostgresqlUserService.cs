using System;
using System.Net;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;
using AuthService.Resources;
using Conduit3D.Common.Domain;

namespace AuthService.Infrastructure.Services;

public class PostgresqlUserService(IUnitOfWork unitOfWork) : IUserService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    public async Task<Response<List<User>>> GetAllUsersAsync(int pageSize, int pageNumber, string sortBy, bool ascending, CancellationToken cancellationToken)
    {
        var users = await _unitOfWork.UserRepository.GetAllAsync(pageNumber, pageSize, sortBy, ascending, cancellationToken);

        if (users == null || users.Count == 0)
            return Response<List<User>>.Failure(AuthResources.GetString("noUserFound"), HttpStatusCode.NotFound);

        return Response<List<User>>.Success(users, AuthResources.GetString("usersRetrieved"), HttpStatusCode.OK);
    }

    public async Task<Response<User>> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken)
    {
        if (addUserDto == null)
            return Response<User>.Failure(AuthResources.GetString("invalidUserData"), HttpStatusCode.BadRequest);

        var user = await _unitOfWork.UserRepository.CreateAsync(addUserDto, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Response<User>.Success(user, AuthResources.GetString("userCreated"), HttpStatusCode.Created);
    }

    public async Task<Response<string>> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken)
    {
        if (loginUserDto == null)
            return Response<string>.Failure(AuthResources.GetString("invalidLoginData"), HttpStatusCode.BadRequest);

        var token = await _unitOfWork.UserRepository.LoginAsync(loginUserDto, cancellationToken);

        if (token == null)
            return Response<string>.Failure(AuthResources.GetString("invalidLoginData"), HttpStatusCode.Unauthorized);

        return Response<string>.Success(token, AuthResources.GetString("loginSuccessful"), HttpStatusCode.OK);
    }
}
