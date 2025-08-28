using Asp.Versioning;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LinesService.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class OgHatController(IOgHatService ogHatService) : ControllerBase
    {
        private readonly IOgHatService _ogHatService = ogHatService ?? throw new ArgumentNullException(nameof(ogHatService));

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

        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<OgHat>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _ogHatService.GetByIdAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _ogHatService.GetCountAsync(extent, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("types")]
        public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
        {
            return await _ogHatService.GetTipListAsync(cancellationToken);
        }
    }
}
