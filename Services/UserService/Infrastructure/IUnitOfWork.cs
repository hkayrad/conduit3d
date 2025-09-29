using System;
using UserService.Infrastructure.Repositories;

namespace UserService.Infrastructure;

/// <summary>
/// Unit of Work interface for managing repositories and transactions.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Gets the user repository.
    /// </summary>
    IUserRepository UserRepository { get; }

    /// <summary>
    /// Saves changes to the data store.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SaveChangesAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Begins a new transaction.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task BeginTransactionAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Commits the current transaction.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CommitTransactionAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Rolls back the current transaction.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task RollbackTransactionAsync(CancellationToken cancellationToken);
}
