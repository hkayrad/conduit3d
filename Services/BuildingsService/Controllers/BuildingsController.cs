using Asp.Versioning;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Services;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BuildingsService.Controllers
{
    /// <summary>
    /// Controller for managing other buildings.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing other buildings.
    /// </remarks>
    /// <param name="buildingsService">Buildings service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class BuildingsController(IBuildingsService buildingsService) : ControllerBase
    {
        private readonly IBuildingsService _buildingsService = buildingsService ?? throw new ArgumentNullException(nameof(buildingsService));

        /// <summary>
        /// Retrieves a paginated list of other buildings.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="query">The search query.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of other buildings.</returns>
        /// <response code="200">Returns a paginated list of other buildings.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No other buildings found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/buildings?pageNumber=1&pageSize=10&sortBy=name&ascending=true&minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<Building>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _buildingsService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves an other building by its ID.
        /// </summary>
        /// <param name="id">The ID of the other building to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The other building with the specified ID.</returns>
        /// <response code="200">Returns the other building.</response>
        /// <response code="400">Invalid other building ID.</response>
        /// <response code="404">other building not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/buildings/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<Building>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _buildingsService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Retrieves a paginated list of other buildings.
        /// </summary>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of other buildings.</returns>
        /// <response code="200">Returns the count of other buildings.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/buildings/count?minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
                                                        [FromQuery] Extent? extent = null,
                                                        [FromQuery] string? query = null,
                                                        CancellationToken cancellationToken = default)
        {
            return await _buildingsService.GetCountAsync(extent, query, cancellationToken);
        }
    }
}
