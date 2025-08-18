using System;
using LinesService.Infrastructure.Repositories;

namespace LinesService.Infrastructure;

public interface IUnitOfWork : IDisposable
{
    AgHatRepository AgHatRepository { get; }
    OgHatRepository OgHatRepository { get; }
    RekortmanRepository RekortmanRepository { get; }

    Task SaveChangesAsync(CancellationToken cancellationToken);
    Task BeginTransactionAsync(CancellationToken cancellationToken);
    Task CommitTransactionAsync(CancellationToken cancellationToken);
    Task RollbackTransactionAsync(CancellationToken cancellationToken);
}