using System;
using System.Net;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;
using AuthService.Infrastructure.Utilities;
using AuthService.Resources;
using Conduit3D.Common.Domain;
using Npgsql;

namespace AuthService.Infrastructure.Services;

/// <summary>
/// PostgreSQL implementation of <see cref="IUserService"/> for managing user data.
/// </summary>
/// <param name="unitOfWork">Unit of Work for database operations.</param>
public class PostgresqlUserService(IUnitOfWork unitOfWork) : IUserService
{
    /// <summary>
    /// Unit of work for managing repositories and transactions.
    /// </summary>
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    /// <inheritdoc />
    public async Task<Response<User>> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken)
    {
        if (addUserDto == null)
            return Response<User>.ValidationError(AuthResources.GetString("invalidUserData"));

        try
        {
            var user = await _unitOfWork.UserRepository.CreateAsync(addUserDto, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Response<User>.Success(user, AuthResources.GetString("userCreated"), HttpStatusCode.Created);
        }
        catch (NpgsqlException ex)
        {
            return Response<User>.DatabaseError(
                AuthResources.GetString(
                    "userCreationFailed",
                    ErrorParser.ParseDatabaseError(ex)
                )
            );
        }
        catch (Exception ex)
        {
            return Response<User>.UnhandledError(AuthResources.GetString("userCreationFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<List<User>>> GetAllUsersAsync(int pageSize,
                                                            int pageNumber,
                                                            string sortBy,
                                                            bool ascending,
                                                            string? query,
                                                            CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 100000)
            return Response<List<User>>.ValidationError(AuthResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<User>>.ValidationError(AuthResources.GetString("invalidPageNumber"));

        var allowedSortColumns = new[] { "Id", "Username", "Email", "UserRole", "Name", "CreatedAt", "IsActive", "Status" };
        if (!allowedSortColumns.Contains(sortBy))
            return Response<List<User>>.ValidationError(AuthResources.GetString("invalidSortBy"));

        try
        {
            var users = await _unitOfWork.UserRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    query,
                                                                    cancellationToken);

            if (users == null || users.Count == 0)
                return Response<List<User>>.NotFound(AuthResources.GetString("noUserFound"));

            return Response<List<User>>.Success(users, AuthResources.GetString("usersRetrieved"), HttpStatusCode.OK);
        }
        catch (NpgsqlException ex)
        {
            return Response<List<User>>.DatabaseError(AuthResources.GetString("userRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<User>>.UnhandledError(AuthResources.GetString("userRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<User>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id < 0)
            return Response<User>.ValidationError(AuthResources.GetString("invalidUserId"));

        try
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(id, cancellationToken);

            if (user == null)
                return Response<User>.NotFound(AuthResources.GetString("noUserFound"));

            return Response<User>.Success(user, AuthResources.GetString("userRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<User>.DatabaseError(AuthResources.GetString("userRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<User>.UnhandledError(AuthResources.GetString("userRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<UserCountsDto>> GetCountAsync(string? query, CancellationToken cancellationToken)
    {
        try
        {
            var count = await _unitOfWork.UserRepository.GetCountAsync(query, cancellationToken);
            return Response<UserCountsDto>.Success(count, AuthResources.GetString("userCountRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<UserCountsDto>.DatabaseError(AuthResources.GetString("userCountRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<UserCountsDto>.UnhandledError(AuthResources.GetString("userCountRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<User>> UpdateAsync(int id,
                                                    UpdateUserDto updateUserDto,
                                                    CancellationToken cancellationToken)
    {
        if (id < 0)
            return Response<User>.ValidationError(AuthResources.GetString("invalidUserId"));

        if (updateUserDto == null)
            return Response<User>.ValidationError(AuthResources.GetString("invalidUserData"));

        try
        {
            var user = await _unitOfWork.UserRepository.UpdateAsync(id, updateUserDto, cancellationToken);
            if (user == null)
                return Response<User>.NotFound(AuthResources.GetString("noUserFound"));

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Response<User>.Success(user, AuthResources.GetString("userUpdated"), HttpStatusCode.OK);
        }
        catch (NpgsqlException ex)
        {
            return Response<User>.DatabaseError(
                AuthResources.GetString(
                    "userUpdateFailed",
                    ErrorParser.ParseDatabaseError(ex)
                )
            );
        }
        catch (Exception ex)
        {
            return Response<User>.UnhandledError(AuthResources.GetString("userUpdateFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<object>> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        if (id < 0)
            return Response<object>.ValidationError(AuthResources.GetString("invalidUserId"));

        try
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(id, cancellationToken);
            if (user == null)
                return Response<object>.NotFound(AuthResources.GetString("noUserFound"));

            var result = await _unitOfWork.UserRepository.DeleteAsync(id, cancellationToken);
            if (!result)
                return Response<object>.Failure(AuthResources.GetString("userDeletionFailed"), HttpStatusCode.NotFound);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Response<object>.Success(null!, AuthResources.GetString("userDeleted"), HttpStatusCode.NoContent);
        }
        catch (NpgsqlException ex)
        {
            return Response<object>.DatabaseError(AuthResources.GetString("userDeletionFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<object>.UnhandledError(AuthResources.GetString("userDeletionFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<UserWithTokenDto>> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken)
    {
        if (loginUserDto == null)
            return Response<UserWithTokenDto>.ValidationError(AuthResources.GetString("invalidLoginData"));

        try
        {
            var response = await _unitOfWork.UserRepository.LoginAsync(loginUserDto, cancellationToken);

            if (response == null)
                return Response<UserWithTokenDto>.ValidationError(AuthResources.GetString("invalidLoginData"));

            return Response<UserWithTokenDto>.Success(response, AuthResources.GetString("loginSuccessful"), HttpStatusCode.OK);
        }
        catch (NpgsqlException ex)
        {
            return Response<UserWithTokenDto>.DatabaseError(AuthResources.GetString("loginFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<UserWithTokenDto>.UnhandledError(AuthResources.GetString("loginFailed", ex.Message));
        }
    }
}
