using Asp.Versioning;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PolesService.Domain;
using PolesService.Infrastructure.Services;

namespace PolesService.Controllers
{
    /// <summary>
    /// Controller for managing AydDirek entities.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing AydDirek entities.
    /// </remarks>
    /// <param name="aydDirekService">AydDirek service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class AydDirekController(IAydDirekService aydDirekService) : ControllerBase
    {
        private readonly IAydDirekService _aydDirekService = aydDirekService ?? throw new ArgumentNullException(nameof(aydDirekService));

        /// <summary>
        /// Retrieves a paginated list of AydDirek entities.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="query">The search query.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of AydDirek entities.</returns>
        /// <response code="200">Returns a paginated list of AydDirek entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No AydDirek entities found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/aydDirek?pageNumber=1&pageSize=10&sortBy=name&ascending=true&minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<AydDirek>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _aydDirekService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves an AydDirek entity by its ID.
        /// </summary>
        /// <param name="id">The ID of the AydDirek entity to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The AydDirek entity with the specified ID.</returns>
        /// <response code="200">Returns the AydDirek entity.</response>
        /// <response code="400">Invalid AydDirek entity ID.</response>
        /// <response code="404">AydDirek entity not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/aydDirek/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<AydDirek>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _aydDirekService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Gets the count of AydDirek entities.
        /// </summary>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of AydDirek entities.</returns>
        /// <response code="200">Returns the count of AydDirek entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/aydDirek/count?minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _aydDirekService.GetCountAsync(extent, query, cancellationToken);
        }

        /// <summary>
        /// Retrieves a list of AydDirek types.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of AydDirek types.</returns>
        /// <response code="200">Returns a list of AydDirek types.</response>
        /// <response code="404">No AydDirek types found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/aydDirek/types
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("types")]
        public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
        {
            return await _aydDirekService.GetTipListAsync(cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("pbf")]
        [Produces("application/x-protobuf")]
        public async Task<AydDirekResponse> GetAllAsProtobufAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _aydDirekService.GetAllAsProtobufAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }
    }
}
