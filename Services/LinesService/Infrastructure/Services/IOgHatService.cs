using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;
using LinesService.Domain;

namespace LinesService.Infrastructure.Services;

/// <summary>
/// Service interface for managing OgHat entities.
/// </summary>
public interface IOgHatService : IGenericService<OgHat>
{
    public Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken);

}
