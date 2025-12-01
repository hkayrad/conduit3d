using Asp.Versioning;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PolesService.Domain;
using PolesService.Infrastructure.Services;
using PolesService.DTOs;

namespace PolesService.Controllers
{
    /// <summary>
    /// Controller for managing OgMusDirek entities.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing OgMusDirek entities.
    /// </remarks>
    /// <param name="ogMusDirekService">OgMusDirek service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class OgMusDirekController(IOgMusDirekService ogMusDirekService) : ControllerBase
    {
        private readonly IOgMusDirekService _ogMusDirekService = ogMusDirekService ?? throw new ArgumentNullException(nameof(ogMusDirekService));

        /// <summary>
        /// Retrieves a paginated list of OgMusDirek entities.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="query">The search query.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of OgMusDirek entities.</returns>
        /// <response code="200">Returns a paginated list of OgMusDirek entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No OgMusDirek entities found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/ogmusdirek?pageNumber=1&pageSize=10&sortBy=name&ascending=true&minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<OgMusDirek>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _ogMusDirekService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves an OgMusDirek entity by its ID.
        /// </summary>
        /// <param name="id">The ID of the OgMusDirek entity to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The OgMusDirek entity with the specified ID.</returns>
        /// <response code="200">Returns the OgMusDirek entity.</response>
        /// <response code="400">Invalid OgMusDirek entity ID.</response>
        /// <response code="404">OgMusDirek entity not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/ogMusDirek/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<OgMusDirek>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _ogMusDirekService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Gets the count of OgMusDirek entities.
        /// </summary>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of OgMusDirek entities.</returns>
        /// <response code="200">Returns the count of OgMusDirek entities.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/ogMusDirek/count?minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _ogMusDirekService.GetCountAsync(extent, query, cancellationToken);
        }

        /// <summary>
        /// Retrieves a list of OgMusDirek types.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of OgMusDirek types.</returns>
        /// <response code="200">Returns a list of OgMusDirek types.</response>
        /// <response code="404">No OgMusDirek types found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/ogMusDirek/types
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("types")]
        public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
        {
            return await _ogMusDirekService.GetTipListAsync(cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("pbf")]
        [Produces("application/x-protobuf")]
        public async Task<OgMusDirekResponse> GetAllAsProtobufAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _ogMusDirekService.GetAllAsProtobufAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }
        [MapToApiVersion("1.0")]
        [HttpPost]
        public async Task<Response<OgMusDirek>> CreateAsync([FromBody] OgMusDirekDto dto, CancellationToken cancellationToken)
        {
            var entity = new OgMusDirek
            {
                Id = 0, // Generated by DB
                Kodu = dto.Kodu,
                Adi = dto.Adi,
                Cinsi = dto.Cinsi,
                Tipi = dto.Tipi,
                DirekNo = dto.DirekNo,
                BoyOzellik = dto.BoyOzellik,
                DirekBoyId = dto.DirekBoyId,
                Wkb = Convert.FromBase64String(dto.Wkb)
            };
            return await _ogMusDirekService.CreateAsync(entity, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpDelete("{id}")]
        public async Task<Response<bool>> DeleteAsync(int id, CancellationToken cancellationToken)
        {
            return await _ogMusDirekService.DeleteAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpPut("{id}")]
        public async Task<Response<OgMusDirek>> UpdateAsync(int id, [FromBody] OgMusDirekDto dto, CancellationToken cancellationToken)
        {
            var entity = new OgMusDirek
            {
                Id = id,
                Kodu = dto.Kodu,
                Adi = dto.Adi,
                Cinsi = dto.Cinsi,
                Tipi = dto.Tipi,
                DirekNo = dto.DirekNo,
                BoyOzellik = dto.BoyOzellik,
                DirekBoyId = dto.DirekBoyId,
                Wkb = Convert.FromBase64String(dto.Wkb),
                SearchableText = null! // Ignored by update logic
            };
            return await _ogMusDirekService.UpdateAsync(entity, cancellationToken);
        }
    }
}
