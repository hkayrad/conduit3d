using Asp.Versioning;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PolesService.Domain;
using PolesService.Infrastructure.Services;

namespace PolesService.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class OgMusDirekController(IOgMusDirekService ogMusDirekService) : ControllerBase
    {
        private readonly IOgMusDirekService _ogMusDirekService = ogMusDirekService ?? throw new ArgumentNullException(nameof(ogMusDirekService));

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

        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<OgMusDirek>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _ogMusDirekService.GetByIdAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _ogMusDirekService.GetCountAsync(extent, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("types")]
        public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
        {
            return await _ogMusDirekService.GetTipListAsync(cancellationToken);
        }
    }
}
