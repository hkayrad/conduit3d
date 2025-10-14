using System;
using BuildingsService.Infrastructure;
using BuildingsService.Infrastructure.Data;
using BuildingsService.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace BuildingsService.Infrastructure;

public sealed class UnitOfWork(BuildingsContext context) : IUnitOfWork
{
    private readonly BuildingsContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private IBuildingsRepository? _buildingsRepository;
    private IAdrBinaRepository? _adrBuildingsRepository;
    private ITrafoBinaRepository? _trafoBuildingsRepository;
    private IAdrYolRepository? _adrYolRepository;
    private IDbContextTransaction? _transaction;
    private bool _disposed = false;

    /// <inheritdoc />
    public IBuildingsRepository BuildingsRepository
    {
        get
        {
            return _buildingsRepository ??= new BuildingsRepository(_context);
        }
    }

    /// <inheritdoc />
    public IAdrBinaRepository AdrBuildingsRepository
    {
        get
        {
            return _adrBuildingsRepository ??= new AdrBinaRepository(_context);
        }
    }

    /// <inheritdoc />
    public ITrafoBinaRepository TrafoBuildingsRepository
    {
        get
        {
            return _trafoBuildingsRepository ??= new TrafoBinaRepository(_context);
        }
    }

    public IAdrYolRepository AdrYolRepository
    {
        get
        {
            return _adrYolRepository ??= new AdrYolRepository(_context);
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
