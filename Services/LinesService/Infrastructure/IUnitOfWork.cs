using System;
using LinesService.Infrastructure.Repositories;

namespace LinesService.Infrastructure;

/// <summary>
/// Unit of Work interface for managing repositories.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Gets the repository for managing AgHat entities.
    /// </summary>
    IAgHatRepository AgHatRepository { get; }

    /// <summary>
    /// Gets the repository for managing OgHat entities.
    /// </summary>
    IOgHatRepository OgHatRepository { get; }

    /// <summary>
    /// Gets the repository for managing Rekortman entities.
    /// </summary>
    IRekortmanRepository RekortmanRepository { get; }

    /// <summary>
    /// Saves changes to the database.
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