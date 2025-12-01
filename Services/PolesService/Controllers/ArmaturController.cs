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
    /// Controller for managing AgDirek entities.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing AgDirek entities.
    /// </remarks>
    /// <param name="agDirekService">AgDirek service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class ArmaturController(IArmaturService armaturService) : ControllerBase
    {
        private readonly IArmaturService _armaturService = armaturService ?? throw new ArgumentNullException(nameof(armaturService));

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
        public async Task<Response<List<Armatur>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _armaturService.GetAllAsync(pageNumber,
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
        public async Task<Response<Armatur>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _armaturService.GetByIdAsync(id, cancellationToken);
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
                [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _armaturService.GetCountAsync(extent, query, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("pbf")]
        [Produces("application/x-protobuf")]
        public async Task<ArmaturResponse> GetAllAsProtobufAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _armaturService.GetAllAsProtobufAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpPost]
        public async Task<Response<Armatur>> CreateAsync([FromBody] ArmaturDto dto, CancellationToken cancellationToken)
        {
            var entity = new Armatur
            {
                Id = 0, // Generated by DB
                BagliTabloId = dto.BagliTabloId,
                BagliTabloKayitId = dto.BagliTabloKayitId,
                Wkb = Convert.FromBase64String(dto.Wkb)
            };
            return await _armaturService.CreateAsync(entity, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpDelete("{id}")]
        public async Task<Response<bool>> DeleteAsync(int id, CancellationToken cancellationToken)
        {
            return await _armaturService.DeleteAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpPut("{id}")]
        public async Task<Response<Armatur>> UpdateAsync(int id, [FromBody] ArmaturDto dto, CancellationToken cancellationToken)
        {
            var entity = new Armatur
            {
                Id = id,
                BagliTabloId = dto.BagliTabloId,
                BagliTabloKayitId = dto.BagliTabloKayitId,
                Wkb = Convert.FromBase64String(dto.Wkb)
            };
            return await _armaturService.UpdateAsync(entity, cancellationToken);
        }
    }
}
