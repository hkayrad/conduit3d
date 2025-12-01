using System;
using Conduit3D.Common.Infrastructure.Repositories;
using LinesService.Domain;

namespace LinesService.Infrastructure.Repositories;

/// <summary>
/// Repository interface for managing AgHat entities.
/// </summary>
public interface IAgHatRepository : IGenericRepository<AgHat>
{
    public Task<List<string>> GetTipListAsync(CancellationToken cancellationToken);
    Task<AgHat> AddAsync(AgHat entity, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<AgHat> UpdateAsync(AgHat entity, CancellationToken cancellationToken);
}
