using System;
using Microsoft.EntityFrameworkCore.Storage;
using PolesService.Infrastructure.Data;
using PolesService.Infrastructure.Repositories;

namespace PolesService.Infrastructure;

public sealed class UnitOfWork(PolesContext context) : IUnitOfWork
{
    private readonly PolesContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private AgDirekRepository? _agDirekRepository;
    private AydDirekRepository? _aydDirekRepository;
    private OgMusDirekRepository? _ogMusDirekRepository;
    private IDbContextTransaction? _transaction;
    private bool _disposed = false;

    /// <inheritdoc />
    public AgDirekRepository AgDirekRepository
    {
        get
        {
            return _agDirekRepository ??= new AgDirekRepository(_context);
        }
    }

    /// <inheritdoc />
    public AydDirekRepository AydDirekRepository
    {
        get
        {
            return _aydDirekRepository ??= new AydDirekRepository(_context);
        }
    }

    /// <inheritdoc />
    public OgMusDirekRepository OgMusDirekRepository
    {
        get
        {
            return _ogMusDirekRepository ??= new OgMusDirekRepository(_context);
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
