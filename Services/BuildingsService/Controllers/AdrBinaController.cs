using Asp.Versioning;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Services;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BuildingsService.Controllers
{
    /// <summary>
    /// Controller for managing ADR buildings.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for managing ADR buildings.
    /// </remarks>
    /// <param name="adrBuildingsService">ADR buildings service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class AdrBinaController(IAdrBinaService adrBuildingsService) : ControllerBase
    {
        private readonly IAdrBinaService _adrBuildingsService = adrBuildingsService ?? throw new ArgumentNullException(nameof(adrBuildingsService));

        /// <summary>
        /// Retrieves a paginated list of ADR buildings.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="query">The search query.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A paginated list of ADR buildings.</returns>
        /// <response code="200">Returns a paginated list of ADR buildings.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No ADR buildings found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/adrBina?pageNumber=1&pageSize=10&sortBy=name&ascending=true&minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<AdrBina>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            [FromQuery] string? query = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _adrBuildingsService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    query,
                                                    cancellationToken);
        }

        /// <summary>
        /// Retrieves an ADR building by its ID.
        /// </summary>
        /// <param name="id">The ID of the ADR building to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The ADR building with the specified ID.</returns>
        /// <response code="200">Returns the ADR building.</response>
        /// <response code="400">Invalid ADR building ID.</response>
        /// <response code="404">ADR building not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/adrBina/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<AdrBina>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _adrBuildingsService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Retrieves a paginated list of ADR buildings.
        /// </summary>
        /// <param name="extent">The extent to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of ADR buildings.</returns>
        /// <response code="200">Returns the count of ADR buildings.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/adrBina/count?minX=26&minY=36&maxX=45&maxY=42
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _adrBuildingsService.GetCountAsync(extent, cancellationToken);
        }
    }
}
