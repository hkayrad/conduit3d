using Asp.Versioning;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PolesService.Domain;
using PolesService.Infrastructure.Services;

namespace PolesService.Controllers
{
    /// <summary>
    /// Controller for managing AgDirek entities.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing AgDirek entities.
    /// </remarks>
    /// <param name="agDirekService">AgDirek service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class AgDirekController(IAgDirekService agDirekService) : ControllerBase
    {
        private readonly IAgDirekService _agDirekService = agDirekService ?? throw new ArgumentNullException(nameof(agDirekService));

        /// <summary>
        /// Retrieves a paginated list of AgDirek entities.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="query">The search query.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of AgDirek entities.</returns>
        /// <response code="200">Returns a paginated list of AgDirek entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No AgDirek entities found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/agDirek?pageNumber=1&pageSize=10&sortBy=name&ascending=true&minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<AgDirek>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _agDirekService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves an AgDirek entity by its ID.
        /// </summary>
        /// <param name="id">The ID of the AgDirek entity to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The AgDirek entity with the specified ID.</returns>
        /// <response code="200">Returns the AgDirek entity.</response>
        /// <response code="400">Invalid AgDirek entity ID.</response>
        /// <response code="404">AgDirek entity not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/agDirek/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<AgDirek>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _agDirekService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Gets the count of AgDirek entities.
        /// </summary>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of AgDirek entities.</returns>
        /// <response code="200">Returns the count of AgDirek entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/agDirek/count?minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _agDirekService.GetCountAsync(extent, cancellationToken);
        }

        /// <summary>
        /// Retrieves a list of AgDirek types.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of AgDirek types.</returns>
        /// <response code="200">Returns a list of AgDirek types.</response>
        /// <response code="404">No AgDirek types found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/agDirek/types
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("types")]
        public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
        {
            return await _agDirekService.GetTipListAsync(cancellationToken);
        }
    }
}
