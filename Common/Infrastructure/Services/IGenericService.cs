using System;
using Conduit3D.Common.Domain;

namespace Conduit3D.Common.Infrastructure.Services;

/// <summary>
/// Generic service interface for managing entities of type T.
/// </summary>
/// <typeparam name="T"></typeparam>
public interface IGenericService<T> where T : class
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
    /// <response code="200">Returns a list of entities of type T.</response>
    /// <response code="400">If the request is invalid.</response>
    /// <response code="404">If no entities are found.</response>
    /// <response code="500">If an internal server error occurs.</response>
    Task<Response<List<T>>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves an entity by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the entity to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token to cancel the operation.</param>
    /// <returns>The entity with the specified unique identifier, or null if not found.</returns>
    /// <response code="200">Returns the entity with the specified unique identifier.</response>
    /// <response code="400">If the request is invalid.</response>
    /// <response code="404">If the entity is not found.</response>
    /// <response code="500">If an internal server error occurs.</response>
    Task<Response<T>> GetByIdAsync(int id, CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves the total count of entities in the data store.
    /// </summary>
    /// <param name="extent">The extent to which to filter the results.</param>
    /// <param name="cancellationToken">Cancellation token to cancel the operation.</param>
    /// <returns>The total count of entities in the data store.</returns>
    /// <response code="200">Returns the total count of entities in the data store.</response>
    /// <response code="400">If the request is invalid.</response>
    /// <response code="500">If an internal server error occurs.</response>
    Task<Response<int>> GetCountAsync(Extent? extent, string? query, CancellationToken cancellationToken);
}
