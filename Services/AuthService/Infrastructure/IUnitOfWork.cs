using System;
using AuthService.Infrastructure.Repositories;

namespace AuthService.Infrastructure;

public interface IUnitOfWork
{
    IUserRepository UserRepository { get; }

    Task SaveChangesAsync(CancellationToken cancellationToken);
    Task BeginTransactionAsync(CancellationToken cancellationToken);
    Task CommitTransactionAsync(CancellationToken cancellationToken);
    Task RollbackTransactionAsync(CancellationToken cancellationToken);
}
