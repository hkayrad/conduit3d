using System;
using Conduit3D.Common.Infrastructure.Repositories;
using PolesService.Domain;

namespace PolesService.Infrastructure.Repositories;

/// <summary>
/// Repository interface for managing Armatur entities.
/// </summary>
public interface IArmaturRepository : IGenericRepository<Armatur>
{
    Task<Armatur> AddAsync(Armatur entity, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<Armatur> UpdateAsync(Armatur entity, CancellationToken cancellationToken);
}
