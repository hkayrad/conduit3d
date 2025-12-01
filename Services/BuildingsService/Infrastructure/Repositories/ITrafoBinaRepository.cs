using System;
using BuildingsService.Domain;
using Conduit3D.Common.Infrastructure.Repositories;

namespace BuildingsService.Infrastructure.Repositories;

/// <summary>
/// Repository interface for managing TrafoBina entities.
/// </summary>
public interface ITrafoBinaRepository : IGenericRepository<TrafoBina>
{
    Task<TrafoBina> AddAsync(TrafoBina entity, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<TrafoBina> UpdateAsync(TrafoBina entity, CancellationToken cancellationToken);
}
