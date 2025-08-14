using Asp.Versioning;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;
using AuthService.Infrastructure.Services;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [ApiVersion("1.0")]
    public class AuthController(IUserService userService) : ControllerBase
    {
        private readonly IUserService _userService = userService ?? throw new ArgumentNullException(
            nameof(userService));


        [MapToApiVersion("1.0")]
        [HttpPost]
        public async Task<Response<User>> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken)
        {
            return await _userService.CreateAsync(addUserDto, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<User>>> GetAll(
            [FromQuery] int pageSize = 10,
            [FromQuery] int pageNumber = 1,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true,
            CancellationToken cancellationToken = default)
        {
            return await _userService.GetAllUsersAsync(pageSize, pageNumber, sortBy, ascending, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<User>> GetByIdAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            return await _userService.GetByIdAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(CancellationToken cancellationToken = default)
        {
            return await _userService.GetCountAsync(cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpPut("{id}")]
        public async Task<Response<User>> UpdateAsync(
            int id,
            UpdateUserDto updateUserDto,
            CancellationToken cancellationToken = default)
        {
            return await _userService.UpdateAsync(id, updateUserDto, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpDelete("{id}")]
        public async Task<Response<object>> DeleteAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            return await _userService.DeleteAsync(id, cancellationToken);
        }

        [MapToApiVersion("1.0")]
        [HttpPost("login")]
        public async Task<Response<string>> LoginAsync(
            LoginUserDto loginUserDto,
            CancellationToken cancellationToken = default)
        {
            return await _userService.LoginAsync(loginUserDto, cancellationToken);
        }
    }
}
