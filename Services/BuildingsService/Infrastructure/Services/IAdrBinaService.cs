using System;
using BuildingsService.Domain;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;

namespace BuildingsService.Infrastructure.Services;

/// <summary>
/// Service interface for managing AdrBina entities.
/// </summary>
public interface IAdrBinaService : IGenericService<AdrBina>
{
    Task<AdrBinaResponse> GetAllAsProtobufAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken);

    /// <summary>
    /// Adds a new AdrBina entity.
    /// </summary>
    /// <param name="entity">The entity to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added entity.</returns>
    Task<Response<AdrBina>> AddAsync(AdrBina entity, CancellationToken cancellationToken);

    /// <summary>
    /// Deletes an AdrBina entity by its ID.
    /// </summary>
    /// <param name="id">The ID of the entity to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A response indicating success or failure.</returns>
    Task<Response<bool>> DeleteAsync(int id, CancellationToken cancellationToken);
}
