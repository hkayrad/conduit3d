using Asp.Versioning;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LinesService.Controllers
{
    /// <summary>
    /// Controller for managing Rekortman entities.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing Rekortman entities.
    /// </remarks>
    /// <param name="rekortmanService">Rekortman service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class RekortmanController(IRekortmanService rekortmanService) : ControllerBase
    {
        private readonly IRekortmanService _rekortmanService = rekortmanService ?? throw new ArgumentNullException(nameof(rekortmanService));

        /// <summary>
        /// Retrieves a paginated list of Rekortman entities.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="query">The search query.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of Rekortman entities.</returns>
        /// <response code="200">Returns a paginated list of Rekortman entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No Rekortman entities found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/rekortman?pageNumber=1&pageSize=10&sortBy=name&ascending=true&minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<Rekortman>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _rekortmanService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves an Rekortman entity by its ID.
        /// </summary>
        /// <param name="id">The ID of the Rekortman entity to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The Rekortman entity with the specified ID.</returns>
        /// <response code="200">Returns the Rekortman entity.</response>
        /// <response code="400">Invalid Rekortman entity ID.</response>
        /// <response code="404">Rekortman entity not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/rekortman/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<Rekortman>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _rekortmanService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Gets the count of Rekortman entities.
        /// </summary>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of Rekortman entities.</returns>
        /// <response code="200">Returns the count of Rekortman entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/rekortman/count?minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _rekortmanService.GetCountAsync(extent, query, cancellationToken);
        }

        /// <summary>
        /// Retrieves a list of Rekortman types.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of Rekortman types.</returns>
        /// <response code="200">Returns a list of Rekortman types.</response>
        /// <response code="404">No Rekortman types found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/rekortman/types
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("types")]
        public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
        {
            return await _rekortmanService.GetTipListAsync(cancellationToken);
        }
    }
}
