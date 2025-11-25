using System;
using PolesService.Infrastructure.Repositories;

namespace PolesService.Infrastructure;

/// <summary>
/// Unit of Work interface for managing repositories.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Gets the repository for managing AgDirek entities.
    /// </summary>
    IAgDirekRepository AgDirekRepository { get; }

    /// <summary>
    /// Gets the repository for managing AydDirek entities.
    /// </summary>
    IAydDirekRepository AydDirekRepository { get; }

    /// <summary>
    /// Gets the repository for managing OgMusDirek entities.
    /// </summary>
    IOgMusDirekRepository OgMusDirekRepository { get; }

    /// <summary>
    /// Gets the repository for managing Armatur entities.
    /// </summary>
    IArmaturRepository ArmaturRepository { get; }

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
