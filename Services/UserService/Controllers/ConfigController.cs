using Asp.Versioning;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UserService.Domain;
using UserService.Infrastructure.DTOs;
using UserService.Infrastructure.Services;

namespace UserService.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class ConfigController(IConfigService configService) : ControllerBase
    {
        private readonly IConfigService _configService = configService ?? throw new ArgumentNullException(nameof(configService));

        [HttpGet]
        [MapToApiVersion("1.0")]
        public async Task<Response<List<Config>>> GetAllConfigsAsync()
        {
            return await _configService.GetAllConfigsAsync();
        }

        [HttpGet("{key}")]
        [MapToApiVersion("1.0")]
        public async Task<Response<string>> GetConfigValueAsync(string key)
        {
            return await _configService.GetConfigValueAsync(key);
        }

        [HttpPost]
        [MapToApiVersion("1.0")]
        public async Task<Response<string>> SetConfigValueAsync(
            ConfigDto configDto
        )
        {
            return await _configService.SetConfigValueAsync(configDto);
        }

        [HttpDelete("{key}")]
        [MapToApiVersion("1.0")]
        public async Task<Response<string>> DeleteConfigValueAsync(string key)
        {
            return await _configService.DeleteConfigValueAsync(key);
        }
    }
}
