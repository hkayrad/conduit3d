using Asp.Versioning;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Services;

namespace BuildingsService.Controllers
{
    /// <summary>
    /// Controller for managing ADR yols.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing ADR yols.
    /// </remarks>
    /// <param name="adrYolService">ADR yols service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class AdrYolController(IAdrYolService adrYolService) : ControllerBase
    {
        private readonly IAdrYolService _adrYolService = adrYolService ?? throw new ArgumentNullException(nameof(adrYolService));

        /// <summary>
        /// Retrieves a paginated list of ADR roads.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="query">The search query.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of ADR roads.</returns>
        /// <response code="200">Returns a paginated list of ADR roads.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No ADR roads found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/adrYol?pageNumber=1&pageSize=10&sortBy=name&ascending=true&minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<AdrYol>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _adrYolService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves an ADR Yol by its ID.
        /// </summary>
        /// <param name="id">The ID of the ADR Yol to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The ADR yol with the specified ID.</returns>
        /// <response code="200">Returns the ADR yol.</response>
        /// <response code="400">Invalid ADR yol ID.</response>
        /// <response code="404">ADR yol not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>s
        /// GET /api/v1/adrYol/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<AdrYol>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _adrYolService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Retrieves a paginated list of ADR yols.
        /// </summary>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of ADR yols.</returns>
        /// <response code="200">Returns the count of ADR yols.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/adrYol/count?minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _adrYolService.GetCountAsync(extent, query, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("pbf")]
        [Produces("application/x-protobuf")]
        public async Task<AdrYolResponse> GetAllAsProtobufAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _adrYolService.GetAllAsProtobufAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves a list of adrYol types.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of adrYol types.</returns>
        /// <response code="200">Returns a list of adrYol types.</response>
        /// <response code="404">No adrYol types found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/adrYol/types
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("types")]
        public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
        {
            return await _adrYolService.GetTipListAsync(cancellationToken);
        }
    }
}
