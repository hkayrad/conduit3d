using Asp.Versioning;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Services;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BuildingsService.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class BuildingsController(IBuildingsService buildingsService,
                                    IAdrBuildingsService adrBuildingsService) : ControllerBase
    {
        private readonly IBuildingsService _buildingsService = buildingsService ?? throw new ArgumentNullException(nameof(buildingsService));
        private readonly IAdrBuildingsService _adrBuildingsService = adrBuildingsService ?? throw new ArgumentNullException(nameof(adrBuildingsService));

        [MapToApiVersion("1.0")]
        [HttpGet("buildings")]
        public async Task<Response<List<Building>>> GetAllBuildingsAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _buildingsService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("buildings/{id}")]
        public async Task<Response<Building>> GetByIdBuildingsAsync(int id, CancellationToken cancellationToken)
        {
            return await _buildingsService.GetByIdAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("buildings/count")]
        public async Task<Response<int>> GetCountBuildingsAsync(
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _buildingsService.GetCountAsync(extent, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("adrBuildings")]
        public async Task<Response<List<AdrBuilding>>> GetAllAdrBuildingsAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _adrBuildingsService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("adrBuildings/{id}")]
        public async Task<Response<AdrBuilding>> GetByIdAdrBuildingsAsync(int id, CancellationToken cancellationToken)
        {
            return await _adrBuildingsService.GetByIdAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("adrBuildings/count")]
        public async Task<Response<int>> GetCountAdrBuildingsAsync(
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _adrBuildingsService.GetCountAsync(extent, cancellationToken);
        }
    }
}
