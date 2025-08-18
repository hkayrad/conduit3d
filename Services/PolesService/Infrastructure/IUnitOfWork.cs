using System;
using PolesService.Infrastructure.Repositories;

namespace PolesService.Infrastructure;

public interface IUnitOfWork
{
    AgDirekRepository AgDirekRepository { get; }
    AydDirekRepository AydDirekRepository { get; }
    OgMusDirekRepository OgMusDirekRepository { get; }

    Task SaveChangesAsync(CancellationToken cancellationToken);
    Task BeginTransactionAsync(CancellationToken cancellationToken);
    Task CommitTransactionAsync(CancellationToken cancellationToken);
    Task RollbackTransactionAsync(CancellationToken cancellationToken);
}
