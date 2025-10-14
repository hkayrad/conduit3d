using System;
using BuildingsService.Infrastructure.Repositories;

namespace BuildingsService.Infrastructure;

/// <summary>
/// Unit of Work interface for managing repositories.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Gets the repository for managing Buildings entities.
    /// </summary>
    IBuildingsRepository BuildingsRepository { get; }

    /// <summary>
    /// Gets the repository for managing AdrBina entities.
    /// </summary>
    IAdrBinaRepository AdrBuildingsRepository { get; }

    /// <summary>
    /// Gets the repository for managing TrafoBina entities.
    /// </summary>
    ITrafoBinaRepository TrafoBuildingsRepository { get; }

    /// <summary>
    /// Gets the repository for managing AdrYol entities.
    /// </summary>
    IAdrYolRepository AdrYolRepository { get; }

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