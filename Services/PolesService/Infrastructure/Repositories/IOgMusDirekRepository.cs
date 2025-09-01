using System;
using Conduit3D.Common.Infrastructure.Repositories;
using PolesService.Domain;

namespace PolesService.Infrastructure.Repositories;

/// <summary>
/// Repository interface for managing OgMusDirek entities.
/// </summary>
public interface IOgMusDirekRepository : IGenericRepository<OgMusDirek>
{
    public Task<List<string>> GetTipListAsync(CancellationToken cancellationToken);

}
