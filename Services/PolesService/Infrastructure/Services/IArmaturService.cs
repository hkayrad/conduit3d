using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;
using PolesService.Domain;

namespace PolesService.Infrastructure.Services;

/// <summary>
/// Service interface for managing AgDirek entities.
/// </summary>
public interface IArmaturService : IGenericService<Armatur>
{
    public Task<ArmaturResponse> GetAllAsProtobufAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken);
}
