using Asp.Versioning;
using AuthService.Domain;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [ApiVersion("1.0")]
    public class AuthController : ControllerBase
    {
        [MapToApiVersion("1.0")]
        [HttpGet]
        public async Task<Response<List<User>>> GetAll()
        { 
            return await Task.FromResult(Response<List<User>>.Success(new List<User>
            {
                new User { Id = 1, Username = "user1", Email = "user1@example.com", UserType = 'A' },
                new User { Id = 2, Username = "user2", Email = "user2@example.com", UserType = 'B' }
            }, "Success"));
        }
    }
}
