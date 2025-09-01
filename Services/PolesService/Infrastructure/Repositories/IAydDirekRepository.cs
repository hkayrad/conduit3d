using System;
using Conduit3D.Common.Infrastructure.Repositories;
using PolesService.Domain;

namespace PolesService.Infrastructure.Repositories;

/// <summary>
/// Repository interface for managing AydDirek entities.
/// </summary>
public interface IAydDirekRepository : IGenericRepository<AydDirek>
{
    public Task<List<string>> GetTipListAsync(CancellationToken cancellationToken);

}
