using System;
using BuildingsService.Domain;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;

namespace BuildingsService.Infrastructure.Services;

/// <summary>
/// Service interface for managing Building entities.
/// </summary>
public interface IBuildingsService : IGenericService<Building>
{
    Task<BuildingsResponse> GetAllAsProtobufAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken);
}
