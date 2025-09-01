using System;
using Conduit3D.Common.Domain;

namespace Conduit3D.Common.Infrastructure.Repositories;

/// <summary>
/// Generic repository interface for managing entities of type T.
/// </summary>
/// <typeparam name="T"></typeparam>
public interface IGenericRepository<T> where T : class
{
    /// <summary>
    /// Retrieves a paginated list of entities from the data store.
    /// </summary>
    /// <param name="pageNumber">The page number to retrieve.</param>
    /// <param name="pageSize">The size of the page (i.e., the number of entities to retrieve).</param>
    /// <param name="sortBy">The property by which to sort the results.</param>
    /// <param name="ascending">Whether to sort the results in ascending order.</param>
    /// <param name="extent">The extent to which to filter the results.</param>
    /// <param name="query">An optional search query to filter the results.</param>
    /// <param name="cancellationToken">Cancellation token to cancel the operation.</param>
    /// <returns>A list of entities of type T.</returns>
    public Task<List<T>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent extent,
                                            string? query,
                                            CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves an entity by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the entity to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token to cancel the operation.</param>
    /// <returns>The entity with the specified unique identifier, or null if not found.</returns>
    public Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves the total count of entities in the data store.
    /// </summary>
    /// <param name="extent">The extent to which to filter the results.</param>
    /// <param name="cancellationToken">Cancellation token to cancel the operation.</param>
    /// <returns>The total count of entities in the data store.</returns>
    public Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken);
}
