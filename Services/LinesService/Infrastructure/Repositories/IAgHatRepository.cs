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
}
