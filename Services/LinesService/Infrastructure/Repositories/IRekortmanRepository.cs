using System;
using Conduit3D.Common.Infrastructure.Repositories;
using LinesService.Domain;

namespace LinesService.Infrastructure.Repositories;

/// <summary>
/// Repository interface for managing Rekortman entities.
/// </summary>
public interface IRekortmanRepository : IGenericRepository<Rekortman>
{
    public Task<List<string>> GetTipListAsync(CancellationToken cancellationToken);
    Task<Rekortman> AddAsync(Rekortman entity, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<Rekortman> UpdateAsync(Rekortman entity, CancellationToken cancellationToken);
}
