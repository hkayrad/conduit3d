using System;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;
using Conduit3D.Common.Domain;

namespace AuthService.Infrastructure.Services;

/// <summary>
/// User service interface for managing user-related operations.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Creates a new user.
    /// </summary>
    /// <param name="addUserDto">User creation data transfer object.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created user information</returns>
    /// <response code="201">User created successfully</response>
    /// <response code="400">Invalid user data</response>
    /// <response code="500">Internal server error</response>
    Task<Response<User>> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves a paginated list of users.
    /// </summary>
    /// <param name="pageSize">The number of users to retrieve per page.</param>
    /// <param name="pageNumber">The page number to retrieve.</param>
    /// <param name="sortBy">The field to sort by.</param>
    /// <param name="ascending">Whether to sort in ascending order.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of users.</returns>
    /// <response code="200">Returns a list of users.</response>
    /// <response code="400">Invalid parameters.</response>
    /// <response code="404">No users found.</response>
    /// <response code="500">Internal server error.</response>
    Task<Response<List<User>>> GetAllUsersAsync(int pageSize, int pageNumber, string sortBy, bool ascending, string? query, CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves a user by their ID.
    /// </summary>
    /// <param name="id">The ID of the user to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user with the specified ID.</returns>
    /// <response code="200">Returns the user.</response>
    /// <response code="400">Invalid user ID.</response>
    /// <response code="404">User not found.</response>
    /// <response code="500">Internal server error.</response>
    Task<Response<User>> GetByIdAsync(int id, CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves the total number of users.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The total number of users.</returns>
    /// <response code="200">Returns the total number of users.</response>
    /// <response code="500">Internal server error.</response>
    Task<Response<UserCountsDto>> GetCountAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Updates a user.
    /// </summary>
    /// <param name="id">The ID of the user to update.</param>
    /// <param name="updateUserDto">The updated user data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated user.</returns>
    /// <response code="200">Returns the updated user.</response>
    /// <response code="400">Invalid user ID or data.</response>
    /// <response code="404">User not found.</response>
    /// <response code="500">Internal server error.</response>
    Task<Response<User>> UpdateAsync(int id, UpdateUserDto updateUserDto, CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves a user by their ID.
    /// </summary>
    /// <param name="id">The ID of the user to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user with the specified ID.</returns>
    /// <response code="200">Returns the user.</response>
    /// <response code="400">Invalid user ID.</response>
    /// <response code="404">User not found.</response>
    /// <response code="500">Internal server error.</response>
    Task<Response<object>> DeleteAsync(int id, CancellationToken cancellationToken);

    /// <summary>
    /// Authenticates a user.
    /// </summary>
    /// <param name="loginUserDto">The login user data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The authenticated user and their token as a cookie.</returns>
    /// <response code="200">User authenticated successfully.</response>
    /// <response code="400">Invalid login data.</response>
    /// <response code="500">Internal server error.</response>
    Task<Response<UserWithTokenDto>> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken);
}
