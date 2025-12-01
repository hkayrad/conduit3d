using Asp.Versioning;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Services;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BuildingsService.DTOs;

namespace BuildingsService.Controllers
{
    /// <summary>
    /// Controller for managing Trafo buildings.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing Trafo buildings.
    /// </remarks>
    /// <param name="trafoBuildingsService">Trafo buildings service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class TrafoBinaController(ITrafoBinaService trafoBuildingsService) : ControllerBase
    {
        private readonly ITrafoBinaService _trafoBuildingsService = trafoBuildingsService ?? throw new ArgumentNullException(nameof(trafoBuildingsService));

        /// <summary>
        /// Retrieves a paginated list of Trafo buildings.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="query">The search query.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of Trafo buildings.</returns>
        /// <response code="200">Returns a paginated list of Trafo buildings.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No Trafo buildings found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/trafoBina?pageNumber=1&pageSize=10&sortBy=name&ascending=true&minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<TrafoBina>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _trafoBuildingsService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves an Trafo building by its ID.
        /// </summary>
        /// <param name="id">The ID of the Trafo building to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The Trafo building with the specified ID.</returns>
        /// <response code="200">Returns the Trafo building.</response>
        /// <response code="400">Invalid Trafo building ID.</response>
        /// <response code="404">Trafo building not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/trafoBina/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<TrafoBina>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _trafoBuildingsService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Retrieves a paginated list of Trafo buildings.
        /// </summary>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of Trafo buildings.</returns>
        /// <response code="200">Returns the count of Trafo buildings.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/trafoBina/count?minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _trafoBuildingsService.GetCountAsync(extent, query, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("pbf")]
        [Produces("application/x-protobuf")]
        public async Task<TrafoBinaResponse> GetAllAsProtobufAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _trafoBuildingsService.GetAllAsProtobufAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }
        [MapToApiVersion("1.0")]
        [HttpPost]
        public async Task<Response<TrafoBina>> CreateAsync([FromBody] TrafoBinaDto dto, CancellationToken cancellationToken)
        {
            var entity = new TrafoBina
            {
                Id = 0, // Generated by DB
                Adi = dto.Adi,
                Kodu = dto.Kodu,
                Wkb = Convert.FromBase64String(dto.Wkb)
            };
            return await _trafoBuildingsService.CreateAsync(entity, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpDelete("{id}")]
        public async Task<Response<bool>> DeleteAsync(int id, CancellationToken cancellationToken)
        {
            return await _trafoBuildingsService.DeleteAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpPut("{id}")]
        public async Task<Response<TrafoBina>> UpdateAsync(int id, [FromBody] TrafoBinaDto dto, CancellationToken cancellationToken)
        {
            var entity = new TrafoBina
            {
                Id = id,
                Adi = dto.Adi,
                Kodu = dto.Kodu,
                Wkb = Convert.FromBase64String(dto.Wkb),
                SearchableText = null! // Ignored by update logic
            };
            return await _trafoBuildingsService.UpdateAsync(entity, cancellationToken);
        }
    }
}
