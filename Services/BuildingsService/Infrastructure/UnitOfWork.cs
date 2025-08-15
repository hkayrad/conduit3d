using System;
using BuildingsService.Infrastructure;
using BuildingsService.Infrastructure.Data;
using BuildingsService.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace BuildingsService.Infrastructure;

public class UnitOfWork(BuildingsContext context) : IUnitOfWork
{
    private readonly BuildingsContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private BuildingsRepository? _buildingsRepository;
    private IDbContextTransaction? _transaction;
    private bool _disposed = false;

    public BuildingsRepository BuildingsRepository
    {
        get
        {
            return _buildingsRepository ??= new BuildingsRepository(_context);
        }
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _context.Dispose();
            _disposed = true;
        }
    }
}
