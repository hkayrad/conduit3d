using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;
using PolesService.Domain;

namespace PolesService.Infrastructure.Services;

/// <summary>
/// Service interface for managing AgDirek entities.
/// </summary>
public interface IAgDirekService : IGenericService<AgDirek>
{
    public Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken);
}
