using System;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;

namespace AuthService.Infrastructure.Repositories;

/// <summary>
/// User repository interface for managing user entities.
/// </summary>
public interface IUserRepository
{
   /// <summary>
   /// Creates a new user.
   /// </summary>
   /// <param name="addUserDto">User creation data transfer object.</param>
   /// <param name="cancellationToken">Cancellation token.</param>
   /// <returns>Created user information.</returns>
   public Task<User> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken);

   /// <summary>
   /// Gets a paginated list of users.
   /// </summary>
   /// <param name="pageNumber">Page number.</param>
   /// <param name="pageSize">Page size.</param>
   /// <param name="sortBy">Sorting field.</param>
   /// <param name="ascending">Sort order.</param>
   /// <param name="cancellationToken">Cancellation token.</param>
   /// <returns>A list of users.</returns>
   public Task<List<User>> GetAllAsync(int pageNumber, int pageSize, string sortBy, bool ascending, CancellationToken cancellationToken);

   /// <summary>
   /// Gets a user by ID.
   /// </summary>
   /// <param name="id">User ID.</param>
   /// <param name="cancellationToken">Cancellation token.</param>
   /// <returns>The user information, or null if not found.</returns>
   public Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken);

   /// <summary>
   /// Gets the total count of users.
   /// </summary>
   /// <param name="cancellationToken">Cancellation token.</param>
   /// <returns>The total count of users.</returns>
   public Task<int> GetCountAsync(CancellationToken cancellationToken);

   /// <summary>
   /// Updates a user.
   /// </summary>
   /// <param name="id">User ID.</param>
   /// <param name="updateUserDto">User update data transfer object.</param>
   /// <param name="cancellationToken">Cancellation token.</param>
   /// <returns>The updated user information, or null if not found.</returns>
   public Task<User?> UpdateAsync(int id, UpdateUserDto updateUserDto, CancellationToken cancellationToken);

   /// <summary>
   /// Deletes a user by ID.
   /// </summary>
   /// <param name="id">User ID.</param>
   /// <param name="cancellationToken">Cancellation token.</param>
   /// <returns>True if the user was deleted, false otherwise.</returns>
   public Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);

   /// <summary>
   /// Logs in a user.
   /// </summary>
   /// <param name="loginUserDto">User login data transfer object.</param>
   /// <param name="cancellationToken">Cancellation token.</param>
   /// <returns>The user information with token.</returns>
   public Task<UserWithToken> LoginAsync(LoginUserDto loginUserDto, CancellationToken cancellationToken);
}
