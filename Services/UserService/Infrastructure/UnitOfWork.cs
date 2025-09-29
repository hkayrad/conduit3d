using System;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace UserService.Infrastructure;

public class UnitOfWork(UsersContext context) : IUnitOfWork
{
    private readonly UsersContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private IUserRepository? _userRepository;
    private IDbContextTransaction? _transaction;
    private bool _disposed = false;

    /// <inheritdoc />
    public IUserRepository UserRepository
    {
        get
        {
            return _userRepository ??= new UserRepository(_context);
        }
    }

    /// <inheritdoc />
    public async Task BeginTransactionAsync(CancellationToken cancellationToken)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task CommitTransactionAsync(CancellationToken cancellationToken)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    /// <inheritdoc />
    public async Task RollbackTransactionAsync(CancellationToken cancellationToken)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    /// <inheritdoc />
    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public void Dispose()
    {
        if (!_disposed)
        {
            _context.Dispose();
            _disposed = true;
        }
    }
}
