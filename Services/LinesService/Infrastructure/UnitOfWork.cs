using System;
using LinesService.Infrastructure;
using LinesService.Infrastructure.Data;
using LinesService.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace LinesService.Infrastructure;

/// <summary>
/// Unit of Work for managing database operations.
/// </summary>
/// <param name="context"></param>
public sealed class UnitOfWork(LinesContext context) : IUnitOfWork
{
    private readonly LinesContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private IAgHatRepository? _agHatRepository;
    private IOgHatRepository? _ogHatRepository;
    private IRekortmanRepository? _rekortmanRepository;
    private IDbContextTransaction? _transaction;
    private bool _disposed = false;

    /// <inheritdoc />
    public IAgHatRepository AgHatRepository
    {
        get
        {
            return _agHatRepository ??= new AgHatRepository(_context);
        }
    }

    /// <inheritdoc />
    public IOgHatRepository OgHatRepository
    {
        get
        {
            return _ogHatRepository ??= new OgHatRepository(_context);
        }
    }

    /// <inheritdoc />
    public IRekortmanRepository RekortmanRepository
    {
        get
        {
            return _rekortmanRepository ??= new RekortmanRepository(_context);
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
