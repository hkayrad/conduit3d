using Asp.Versioning;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LinesService.Controllers
{
    /// <summary>
    /// Controller for managing OgHat entities.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing OgHat entities.
    /// </remarks>
    /// <param name="ogHatService">OgHat service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class OgHatController(IOgHatService ogHatService) : ControllerBase
    {
        private readonly IOgHatService _ogHatService = ogHatService ?? throw new ArgumentNullException(nameof(ogHatService));

        /// <summary>
        /// Retrieves a paginated list of OgHat entities.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="query">The search query.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of OgHat entities.</returns>
        /// <response code="200">Returns a paginated list of OgHat entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No OgHat entities found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/ogHat?pageNumber=1&pageSize=10&sortBy=name&ascending=true&minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<OgHat>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _ogHatService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves an OgHat entity by its ID.
        /// </summary>
        /// <param name="id">The ID of the OgHat entity to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The OgHat entity with the specified ID.</returns>
        /// <response code="200">Returns the OgHat entity.</response>
        /// <response code="400">Invalid OgHat entity ID.</response>
        /// <response code="404">OgHat entity not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/ogHat/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<OgHat>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _ogHatService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Gets the count of OgHat entities.
        /// </summary>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of OgHat entities.</returns>
        /// <response code="200">Returns the count of OgHat entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/ogHat/count?minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _ogHatService.GetCountAsync(extent, query, cancellationToken);
        }

        /// <summary>
        /// Retrieves a list of OgHat types.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of OgHat types.</returns>
        /// <response code="200">Returns a list of OgHat types.</response>
        /// <response code="404">No OgHat types found.</response>
        /// <response code="500">Internal server error.</response>
        /// /// <example>
        /// GET /api/v1/ogHat/types
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("types")]
        public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
        {
            return await _ogHatService.GetTipListAsync(cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("pbf")]
        [Produces("application/x-protobuf")]
        public async Task<OgHatResponse> GetAllAsProtobufAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _ogHatService.GetAllAsProtobufAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }
    }
}
