using System;
using Microsoft.EntityFrameworkCore.Storage;
using PolesService.Infrastructure.Data;
using PolesService.Infrastructure.Repositories;

namespace PolesService.Infrastructure;

public class UnitOfWork(PolesContext context) : IUnitOfWork
{
    private readonly PolesContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private AgDirekRepository? _agDirekRepository;
    private IDbContextTransaction? _transaction;
    private bool _disposed = false;

    public AgDirekRepository AgDirekRepository
    {
        get
        {
            return _agDirekRepository ??= new AgDirekRepository(_context);
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
