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
    public class TrafoBinaController(ITrafoBinaService trafoBuildingsService) : ControllerBase
    {
        private readonly ITrafoBinaService _trafoBuildingsService = trafoBuildingsService ?? throw new ArgumentNullException(nameof(trafoBuildingsService));

        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<TrafoBina>>> GetAllAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100000,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _trafoBuildingsService.GetAllAsync(pageNumber,
                                                    pageSize,
                                                    sortBy,
                                                    ascending,
                                                    extent,
                                                    cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<TrafoBina>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _trafoBuildingsService.GetByIdAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(
            [FromQuery] Extent? extent = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _trafoBuildingsService.GetCountAsync(extent, cancellationToken);
        }
    }
}
