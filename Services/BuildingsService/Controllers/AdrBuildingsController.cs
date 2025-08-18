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
    public class AdrBuildingsController(IAdrBuildingsService adrBuildingsService) : ControllerBase
    {
        private readonly IAdrBuildingsService _adrBuildingsService = adrBuildingsService ?? throw new ArgumentNullException(nameof(adrBuildingsService));

        [MapToApiVersion("1.0")]
        [HttpGet]
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
        [HttpGet("{id}")]
        public async Task<Response<AdrBuilding>> GetByIdAdrBuildingsAsync(int id, CancellationToken cancellationToken)
        {
            return await _adrBuildingsService.GetByIdAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAdrBuildingsAsync(
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _adrBuildingsService.GetCountAsync(extent, cancellationToken);
        }
    }
}
