using System;
using Conduit3D.Common.Infrastructure.Repositories;
using LinesService.Domain;

namespace LinesService.Infrastructure.Repositories;

/// <summary>
/// Repository interface for managing OgHat entities.
/// </summary>
public interface IOgHatRepository : IGenericRepository<OgHat>
{
    public Task<List<string>> GetTipListAsync(CancellationToken cancellationToken);
    Task<OgHat> AddAsync(OgHat entity, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<OgHat> UpdateAsync(OgHat entity, CancellationToken cancellationToken);
}
