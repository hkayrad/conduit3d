using Asp.Versioning;
using AuthService.Domain;
using AuthService.Infrastructure.DTOs;
using AuthService.Infrastructure.Services;
using AuthService.Resources;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    /// <summary>
    /// AuthController is responsible for handling authentication-related requests.
    /// </summary>
    /// <remarks>
    /// This controller provides endpoints for user creation, login, and management.
    /// </remarks>
    /// <param name="userService">User service instance.</param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class AuthController(IUserService userService) : ControllerBase
    {
        private readonly IUserService _userService = userService ?? throw new ArgumentNullException(
            nameof(userService));

        /// <summary>
        /// Creates a new user.
        /// </summary>
        /// <param name="addUserDto">User creation data transfer object.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Created user information</returns>
        /// <response code="201">User created successfully</response>
        /// <response code="400">Invalid user data</response>
        /// <response code="500">Internal server error</response>
        /// <example>
        /// POST /api/v1/auth
        /// {
        ///     "username": "newuser",
        ///     "email": "newuser@example.com",
        ///     "userRole": "User",
        ///     "name": "New User",
        ///     "password": "password123"
        /// }
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpPost]
        public async Task<Response<User>> CreateAsync(AddUserDto addUserDto, CancellationToken cancellationToken)
        {
            return await _userService.CreateAsync(addUserDto, cancellationToken);
        }

        /// <summary>
        /// Retrieves a paginated list of users.
        /// </summary>
        /// <param name="pageSize">The number of users to retrieve per page.</param>
        /// <param name="pageNumber">The page number to retrieve.</param>
        /// <param name="sortBy">The field to sort by.</param>
        /// <param name="ascending">Whether to sort in ascending order.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of users.</returns>
        /// <response code="200">Returns a list of users.</response>
        /// <response code="400">Invalid parameters.</response>
        /// <response code="404">No users found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/auth?pageSize=10&pageNumber=1&sortBy=name&ascending=true
        /// </example>
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

        /// <summary>
        /// Retrieves a user by their ID.
        /// </summary>
        /// <param name="id">The ID of the user to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The user with the specified ID.</returns>
        /// <response code="200">Returns the user.</response>
        /// <response code="400">Invalid user ID.</response>
        /// <response code="404">User not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/auth/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("{id}")]
        public async Task<Response<User>> GetByIdAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            return await _userService.GetByIdAsync(id, cancellationToken);
        }

        /// <summary>
        /// Retrieves the total number of users.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The total number of users.</returns>
        /// <response code="200">Returns the total number of users.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// GET /api/v1/auth/count
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpGet("count")]
        public async Task<Response<int>> GetCountAsync(CancellationToken cancellationToken = default)
        {
            return await _userService.GetCountAsync(cancellationToken);
        }

        /// <summary>
        /// Updates a user.
        /// </summary>
        /// <param name="id">The ID of the user to update.</param>
        /// <param name="updateUserDto">The updated user data.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The updated user.</returns>
        /// <response code="200">Returns the updated user.</response>
        /// <response code="400">Invalid user ID or data.</response>
        /// <response code="404">User not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// PUT /api/v1/auth/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpPut("{id}")]
        public async Task<Response<User>> UpdateAsync(
            int id,
            UpdateUserDto updateUserDto,
            CancellationToken cancellationToken = default)
        {
            return await _userService.UpdateAsync(id, updateUserDto, cancellationToken);
        }

        /// <summary>
        /// Retrieves a user by their ID.
        /// </summary>
        /// <param name="id">The ID of the user to retrieve.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The user with the specified ID.</returns>
        /// <response code="200">Returns the user.</response>
        /// <response code="400">Invalid user ID.</response>
        /// <response code="404">User not found.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// DELETE /api/v1/auth/1
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpDelete("{id}")]
        public async Task<Response<object>> DeleteAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            return await _userService.DeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Authenticates a user.
        /// </summary>
        /// <param name="loginUserDto">The login user data.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The authenticated user and their token as a cookie.</returns>
        /// <response code="200">User authenticated successfully.</response>
        /// <response code="400">Invalid login data.</response>
        /// <response code="500">Internal server error.</response>
        /// <example>
        /// POST /api/v1/auth/login
        /// {
        ///     "username": "<username>",
        ///     "password": "<password>"
        /// }
        /// </example>
        [MapToApiVersion("1.0")]
        [HttpPost("login")]
        public async Task<Response<User>> LoginAsync(
            LoginUserDto loginUserDto,
            CancellationToken cancellationToken = default)
        {
            var response = await _userService.LoginAsync(loginUserDto, cancellationToken);

            if (response.IsSuccess && response.Data != null)
            {
                Response.Cookies.Append("user_session", response.Data.Token, new CookieOptions
                {
                    HttpOnly = false,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddHours(Convert.ToDouble(Environment.GetEnvironmentVariable("JWT_EXPIRATION_TIME_HRS")))
                });

                return Response<User>.Success(response.Data.User, AuthResources.GetString("loginSuccessful"));
            }
            else
            {
                Response.Cookies.Delete("user_session");
                return Response<User>.Failure(AuthResources.GetString("loginFailed", response.Message), response.StatusCode);
            }
        }
    }
}
