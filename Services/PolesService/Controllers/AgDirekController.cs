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
    public class AgDirekController(IAgDirekService agDirekService) : ControllerBase
    {
        private readonly IAgDirekService _agHatService = agDirekService ?? throw new ArgumentNullException(nameof(agDirekService));

        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<AgDirek>>> GetAllAgHatAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _agHatService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<AgDirek>> GetByIdAgHatAsync(int id, CancellationToken cancellationToken)
        {
            return await _agHatService.GetByIdAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAgHatAsync(
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _agHatService.GetCountAsync(extent, cancellationToken);
        }
    }
}
