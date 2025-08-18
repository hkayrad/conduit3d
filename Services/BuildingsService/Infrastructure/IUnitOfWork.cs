using System;
using BuildingsService.Infrastructure.Repositories;

namespace BuildingsService.Infrastructure;

public interface IUnitOfWork : IDisposable
{
    BuildingsRepository BuildingsRepository { get; }

    AdrBuildingsRepository AdrBuildingsRepository { get; }

    Task SaveChangesAsync(CancellationToken cancellationToken);
    Task BeginTransactionAsync(CancellationToken cancellationToken);
    Task CommitTransactionAsync(CancellationToken cancellationToken);
    Task RollbackTransactionAsync(CancellationToken cancellationToken);
}