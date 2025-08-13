using Asp.Versioning;
using AuthService.Domain;
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
        private readonly IUserService _userService = userService ?? throw new ArgumentNullException(nameof(userService));

        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<User>>> GetAll(CancellationToken cancellationToken = default,
            [FromQuery] int pageSize = 10,
            [FromQuery] int pageNumber = 1,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool ascending = true)
        {
            try
            {
                var users = await _userService.GetAllUsersAsync(cancellationToken, pageSize, pageNumber, sortBy, ascending);
                return Response<List<User>>.Success(users, "Users retrieved successfully.");
            }
            catch (Exception ex)
            {
                return Response<List<User>>.Failure($"Error retrieving users: {ex.Message}");
            }
        }
    }
}
