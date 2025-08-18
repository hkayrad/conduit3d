using System;
using LinesService.Infrastructure;
using LinesService.Infrastructure.Data;
using LinesService.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace LinesService.Infrastructure;

public class UnitOfWork(LinesContext context) : IUnitOfWork
{
    private readonly LinesContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private AgHatRepository? _agHatRepository;
    private OgHatRepository? _ogHatRepository;
    private RekortmanRepository? _rekortmanRepository;
    private IDbContextTransaction? _transaction;
    private bool _disposed = false;

    public AgHatRepository AgHatRepository
    {
        get
        {
            return _agHatRepository ??= new AgHatRepository(_context);
        }
    }

    public OgHatRepository OgHatRepository
    {
        get
        {
            return _ogHatRepository ??= new OgHatRepository(_context);
        }
    }

    public RekortmanRepository RekortmanRepository
    {
        get
        {
            return _rekortmanRepository ??= new RekortmanRepository(_context);
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
