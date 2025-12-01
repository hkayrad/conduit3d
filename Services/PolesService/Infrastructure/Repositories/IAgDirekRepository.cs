using System;
using Conduit3D.Common.Infrastructure.Repositories;
using PolesService.Domain;

namespace PolesService.Infrastructure.Repositories;

/// <summary>
/// Repository interface for managing AgDirek entities.
/// </summary>
public interface IAgDirekRepository : IGenericRepository<AgDirek>
{
    public Task<List<string>> GetTipListAsync(CancellationToken cancellationToken);
    Task<AgDirek> AddAsync(AgDirek entity, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<AgDirek> UpdateAsync(AgDirek entity, CancellationToken cancellationToken);
}
