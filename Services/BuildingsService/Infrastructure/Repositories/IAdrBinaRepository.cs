using System;
using BuildingsService.Domain;
using Conduit3D.Common.Infrastructure.Repositories;

namespace BuildingsService.Infrastructure.Repositories;

/// <summary>
/// Repository interface for managing AdrBina entities.
/// </summary>
public interface IAdrBinaRepository : IGenericRepository<AdrBina>
{
    /// <summary>
    /// Adds a new AdrBina entity.
    /// </summary>
    /// <param name="entity">The entity to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added entity.</returns>
    Task<AdrBina> AddAsync(AdrBina entity, CancellationToken cancellationToken);
    /// <summary>
    /// Deletes an ADR_BINA entity by its ID.
    /// </summary>
    /// <param name="id">The ID of the entity to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the entity was deleted, false otherwise.</returns>
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);

    /// <summary>
    /// Updates an existing AdrBina entity.
    /// </summary>
    /// <param name="entity">The entity to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated entity.</returns>
    Task<AdrBina> UpdateAsync(AdrBina entity, CancellationToken cancellationToken);
}
