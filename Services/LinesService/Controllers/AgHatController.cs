using Asp.Versioning;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace LinesService.Controllers
{
    /// <summary>
    /// Controller for managing AgHat entities.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing AgHat entities.
    /// </remarks>
    /// <param name="agHatService">AgHat service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class AgHatController(IAgHatService agHatService) : ControllerBase
    {
        private readonly IAgHatService _agHatService = agHatService ?? throw new ArgumentNullException(nameof(agHatService));

        /// <summary>
        /// Retrieves a paginated list of AgHat entities.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="query">The search query.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of AgHat entities.</returns>
        /// <response code="200">Returns a paginated list of AgHat entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No AgHat entities found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/agHat?pageNumber=1&pageSize=10&sortBy=name&ascending=true&minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<AgHat>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _agHatService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves an AgHat entity by its ID.
        /// </summary>
        /// <param name="id">The ID of the AgHat entity to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The AgHat entity with the specified ID.</returns>
        /// <response code="200">Returns the AgHat entity.</response>
        /// <response code="400">Invalid AgHat entity ID.</response>
        /// <response code="404">AgHat entity not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/agHat/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<AgHat>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _agHatService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Gets the count of AgHat entities.
        /// </summary>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of AgHat entities.</returns>
        /// <response code="200">Returns the count of AgHat entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/agHat/count?minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _agHatService.GetCountAsync(extent, query, cancellationToken);
        }

        /// <summary>
        /// Retrieves a list of AgHat types.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of AgHat types.</returns>
        /// <response code="200">Returns a list of AgHat types.</response>
        /// <response code="404">No AgHat types found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/agHat/types
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("types")]
        public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
        {
            return await _agHatService.GetTipListAsync(cancellationToken);
        }
    }
}
