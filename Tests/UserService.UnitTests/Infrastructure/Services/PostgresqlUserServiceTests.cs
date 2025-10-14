using System.Net;
using Moq;
using FluentAssertions;
using Npgsql;
using UserService.Domain;
using UserService.Infrastructure;
using UserService.Infrastructure.DTOs;
using UserService.Infrastructure.Repositories;
using UserService.Infrastructure.Services;
using UserService.Infrastructure.Utilities;
using UserService.UnitTests.Helpers;
using Xunit;
using Conduit3D.Common.Domain;

namespace UserService.UnitTests.Infrastructure.Services;

public class PostgresqlUserServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly PostgresqlUserService _userService;
    private readonly CancellationToken _cancellationToken = CancellationToken.None;

    public PostgresqlUserServiceTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockUnitOfWork.Setup(uow => uow.UserRepository).Returns(_mockUserRepository.Object);

        // Mock the SaveChangesAsync to simulate a successful database save.
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync(_cancellationToken)).Returns(Task.CompletedTask);

        _userService = new PostgresqlUserService(_mockUnitOfWork.Object);
    }

    #region Constructor Tests
    [Fact]
    public void Constructor_WithNullUnitOfWork_ShouldThrowArgumentNullException()
    {
        // Act
        Action act = () => new PostgresqlUserService(null!);

        // Assert
        act.Should().Throw<ArgumentNullException>()
            .WithMessage("Value cannot be null. (Parameter 'unitOfWork')");
    }
    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldReturnCreatedUser()
    {
        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto();
        var expectedUser = TestDataGenerator.GenerateTestUser(
            id: 1,
            username: addUserDto.Username,
            email: addUserDto.Email,
            name: addUserDto.Name,
            userRole: addUserDto.UserRole,
            isActive: addUserDto.IsActive ?? true
        );

        _mockUserRepository
            .Setup(repo => repo.CreateAsync(addUserDto, _cancellationToken))
            .ReturnsAsync(expectedUser);

        // Act
        var response = await _userService.CreateAsync(addUserDto, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Data.Should().BeEquivalentTo(expectedUser);
        _mockUserRepository.Verify(repo => repo.CreateAsync(addUserDto, _cancellationToken), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(_cancellationToken), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithNullDto_ShouldReturnValidationError()
    {
        // Act
        var response = await _userService.CreateAsync(null!, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Message.Should().Contain("Invalid user data");
    }

    [Fact]
    public async Task CreateAsync_WhenRepositoryThrowsNpgsqlException_ShouldReturnDatabaseError()
    {
        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto();
        var npgsqlException = new NpgsqlException("Database connection failed");

        _mockUserRepository
            .Setup(repo => repo.CreateAsync(addUserDto, _cancellationToken))
            .ThrowsAsync(npgsqlException);

        // Act
        var response = await _userService.CreateAsync(addUserDto, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User creation failed");
    }

    [Fact]
    public async Task CreateAsync_WhenRepositoryThrowsGenericException_ShouldReturnUnhandledError()
    {
        // Arrange
        var addUserDto = TestDataGenerator.GenerateAddUserDto();
        var genericException = new Exception("An unexpected error occurred.");

        _mockUserRepository
            .Setup(repo => repo.CreateAsync(addUserDto, _cancellationToken))
            .ThrowsAsync(genericException);

        // Act
        var response = await _userService.CreateAsync(addUserDto, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User creation failed");
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ShouldReturnUser()
    {
        // Arrange
        var userId = 1;
        var expectedUser = TestDataGenerator.GenerateTestUser(id: userId);

        _mockUserRepository
            .Setup(repo => repo.GetByIdAsync(userId, _cancellationToken))
            .ReturnsAsync(expectedUser);

        // Act
        var response = await _userService.GetByIdAsync(userId, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Data.Should().Be(expectedUser);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ShouldReturnNotFound()
    {
        // Arrange
        var userId = 99;
        _mockUserRepository
            .Setup(repo => repo.GetByIdAsync(userId, _cancellationToken))
            .ReturnsAsync((User)null!);

        // Act
        var response = await _userService.GetByIdAsync(userId, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        response.Message.Should().Contain("No user found");
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ShouldReturnValidationError()
    {
        // Act
        var response = await _userService.GetByIdAsync(-1, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Message.Should().Contain("Invalid user ID");
    }

    [Fact]
    public async Task GetByIdAsync_WhenRepositoryThrowsNpgsqlException_ShouldReturnDatabaseError()
    {
        // Arrange
        var userId = 1;
        var npgsqlException = new NpgsqlException("Database connection failed");

        _mockUserRepository
            .Setup(repo => repo.GetByIdAsync(userId, _cancellationToken))
            .ThrowsAsync(npgsqlException);

        // Act
        var response = await _userService.GetByIdAsync(userId, _cancellationToken);
        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User retrieval failed");
    }

    [Fact]
    public async Task GetByIdAsync_WhenRepositoryThrowsGenericException_ShouldReturnUnhandledError()
    {
        // Arrange
        var userId = 1;
        var genericException = new Exception("An unexpected error occurred.");
        _mockUserRepository
            .Setup(repo => repo.GetByIdAsync(userId, _cancellationToken))
            .ThrowsAsync(genericException);
        // Act
        var response = await _userService.GetByIdAsync(userId, _cancellationToken);
        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User retrieval failed");
    }

    #endregion

    #region GetAllUsersAsync Tests

    [Fact]
    public async Task GetAllUsersAsync_WithValidParameters_ShouldReturnUserList()
    {
        // Arrange
        var users = TestDataGenerator.GenerateTestUsers(2);

        _mockUserRepository
            .Setup(repo => repo.GetAllAsync(1, 10, "Id", true, null, _cancellationToken))
            .ReturnsAsync(users);

        // Act
        var response = await _userService.GetAllUsersAsync(10, 1, "Id", true, null, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Data.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAllUsersAsync_WhenNoUsersFound_ShouldReturnNotFound()
    {
        // Arrange - Empty list
        var emptyUsers = new List<User>();
        _mockUserRepository
            .Setup(repo => repo.GetAllAsync(1, 10, "Id", true, null, _cancellationToken))
            .ReturnsAsync(emptyUsers);

        // Act
        var response = await _userService.GetAllUsersAsync(10, 1, "Id", true, null, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        response.Message.Should().Contain("No user found");
    }

    [Fact]
    public async Task GetAllUsersAsync_WhenNullReturned_ShouldReturnNotFound()
    {
        // Arrange - Null list
        _mockUserRepository
            .Setup(repo => repo.GetAllAsync(1, 10, "Id", true, null, _cancellationToken))
            .ReturnsAsync((List<User>)null!);

        // Act
        var response = await _userService.GetAllUsersAsync(10, 1, "Id", true, null, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        response.Message.Should().Contain("No user found");
    }

    [Theory]
    [InlineData(0, 1, "Id")] // Invalid page size
    [InlineData(10, 0, "Id")] // Invalid page number
    [InlineData(10, 1, "InvalidColumn")] // Invalid sort column
    public async Task GetAllUsersAsync_WithInvalidParameters_ShouldReturnValidationError(int pageSize, int pageNumber, string sortBy)
    {
        // Act
        var response = await _userService.GetAllUsersAsync(pageSize, pageNumber, sortBy, true, null, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetAllUsersAsync_WhenRepositoryThrowsException_ShouldReturnUnhandledError()
    {
        // Arrange
        var genericException = new Exception("An unexpected error occurred.");

        _mockUserRepository
            .Setup(repo => repo.GetAllAsync(1, 10, "Id", true, null, _cancellationToken))
            .ThrowsAsync(genericException);

        // Act
        var response = await _userService.GetAllUsersAsync(10, 1, "Id", true, null, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User retrieval failed");
    }

    [Fact]
    public async Task GetAllUsersAsync_WhenRepositoryThrowsNpgsqlException_ShouldReturnDatabaseError()
    {
        // Arrange
        var npgsqlException = new NpgsqlException("Database connection failed");

        _mockUserRepository
            .Setup(repo => repo.GetAllAsync(1, 10, "Id", true, null, _cancellationToken))
            .ThrowsAsync(npgsqlException);

        // Act
        var response = await _userService.GetAllUsersAsync(10, 1, "Id", true, null, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User retrieval failed");
    }

    #endregion

    #region GetCountAsync Tests

    [Fact]
    public async Task GetCountAsync_ShouldReturnUserCount()
    {
        // Arrange
        var expected = TestDataGenerator.GenerateUserCountsDto();
        _mockUserRepository
            .Setup(repo => repo.GetCountAsync(null, _cancellationToken))
            .ReturnsAsync(expected);

        // Act
        var response = await _userService.GetCountAsync(null, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Data.Should().Be(expected);
    }

    [Fact]
    public async Task GetCountAsync_WhenRepositoryThrowsNpgsqlException_ShouldReturnDatabaseError()
    {
        // Arrange
        var npgsqlException = new NpgsqlException("Database connection failed");
        _mockUserRepository
            .Setup(repo => repo.GetCountAsync(null, _cancellationToken))
            .ThrowsAsync(npgsqlException);
        // Act
        var response = await _userService.GetCountAsync(null, _cancellationToken);
        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User count retrieval failed");
    }

    [Fact]
    public async Task GetCountAsync_WhenRepositoryThrowsException_ShouldReturnUnhandledError()
    {
        // Arrange
        var genericException = new Exception("An unexpected error occurred.");
        _mockUserRepository
            .Setup(repo => repo.GetCountAsync(null, _cancellationToken))
            .ThrowsAsync(genericException);

        // Act
        var response = await _userService.GetCountAsync(null, _cancellationToken);
        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User count retrieval failed");
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidData_ShouldReturnUpdatedUser()
    {
        // Arrange
        var userId = 1;
        var updateUserDto = TestDataGenerator.GenerateUpdateUserDto();
        var existingUser = TestDataGenerator.GenerateTestUser(id: userId);
        var updatedUser = TestDataGenerator.GenerateTestUser(
            id: userId,
            username: updateUserDto.Username ?? existingUser.Username,
            email: updateUserDto.Email ?? existingUser.Email,
            name: updateUserDto.Name ?? existingUser.Name,
            userRole: updateUserDto.UserRole ?? existingUser.UserRole,
            isActive: updateUserDto.IsActive ?? existingUser.IsActive
        );

        _mockUserRepository
            .Setup(repo => repo.GetByIdAsync(userId, _cancellationToken))
            .ReturnsAsync(existingUser);

        _mockUserRepository
            .Setup(repo => repo.UpdateAsync(userId, updateUserDto, _cancellationToken))
            .ReturnsAsync(updatedUser);

        // Act
        var response = await _userService.UpdateAsync(userId, updateUserDto, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Data.Should().BeEquivalentTo(updatedUser);
        _mockUserRepository.Verify(repo => repo.UpdateAsync(userId, updateUserDto, _cancellationToken), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(_cancellationToken), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistingId_ShouldReturnNotFound()
    {
        // Arrange
        var userId = 99;
        var updateUserDto = TestDataGenerator.GenerateUpdateUserDto();

        _mockUserRepository
            .Setup(repo => repo.GetByIdAsync(userId, _cancellationToken))
            .ReturnsAsync((User)null!);

        _mockUserRepository
            .Setup(repo => repo.UpdateAsync(userId, updateUserDto, _cancellationToken))
            .ReturnsAsync((User)null!);

        // Act
        var response = await _userService.UpdateAsync(userId, updateUserDto, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        response.Message.Should().Contain("No user found");
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_WithInvalidId_ShouldReturnValidationError()
    {
        // Arrange
        var updateUserDto = TestDataGenerator.GenerateUpdateUserDto();

        // Act
        var response = await _userService.UpdateAsync(-1, updateUserDto, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Message.Should().Contain("Invalid user ID");
        _mockUserRepository.Verify(repo => repo.UpdateAsync(It.IsAny<int>(), It.IsAny<UpdateUserDto>(), It.IsAny<CancellationToken>()), Times.Never);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_WithNullDto_ShouldReturnValidationError()
    {
        // Act
        var response = await _userService.UpdateAsync(1, null!, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Message.Should().Contain("Invalid user data");
        _mockUserRepository.Verify(repo => repo.UpdateAsync(It.IsAny<int>(), It.IsAny<UpdateUserDto>(), It.IsAny<CancellationToken>()), Times.Never);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_WhenRepositoryThrowsNpgsqlException_ShouldReturnDatabaseError()
    {
        // Arrange
        var userId = 1;
        var updateUserDto = TestDataGenerator.GenerateUpdateUserDto();
        var existingUser = TestDataGenerator.GenerateTestUser(id: userId);
        var npgsqlException = new NpgsqlException("Database connection failed");

        _mockUserRepository
            .Setup(repo => repo.GetByIdAsync(userId, _cancellationToken))
            .ReturnsAsync(existingUser);
        _mockUserRepository
            .Setup(repo => repo.UpdateAsync(userId, updateUserDto, _cancellationToken))
            .ThrowsAsync(npgsqlException);

        // Act
        var response = await _userService.UpdateAsync(userId, updateUserDto, _cancellationToken);
        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User update failed");
    }

    [Fact]
    public async Task UpdateAsync_WhenRepositoryThrowsGenericException_ShouldReturnUnhandledError()
    {
        // Arrange
        var userId = 1;
        var updateUserDto = TestDataGenerator.GenerateUpdateUserDto();
        var existingUser = TestDataGenerator.GenerateTestUser(id: userId);
        var genericException = new Exception("An unexpected error occurred.");

        _mockUserRepository
            .Setup(repo => repo.GetByIdAsync(userId, _cancellationToken))
            .ReturnsAsync(existingUser);
        _mockUserRepository
            .Setup(repo => repo.UpdateAsync(userId, updateUserDto, _cancellationToken))
            .ThrowsAsync(genericException);

        // Act
        var response = await _userService.UpdateAsync(userId, updateUserDto, _cancellationToken);
        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User update failed");
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_WithExistingId_ShouldReturnNoContent()
    {
        // Arrange
        var userId = 1;
        var existingUser = TestDataGenerator.GenerateTestUser(id: userId);

        _mockUserRepository.Setup(repo => repo.GetByIdAsync(userId, _cancellationToken)).ReturnsAsync(existingUser);
        _mockUserRepository.Setup(repo => repo.DeleteAsync(userId, _cancellationToken)).ReturnsAsync(true);

        // Act
        var response = await _userService.DeleteAsync(userId, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(_cancellationToken), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingId_ShouldReturnNotFound()
    {
        // Arrange
        var userId = 99;
        _mockUserRepository.Setup(repo => repo.GetByIdAsync(userId, _cancellationToken)).ReturnsAsync((User)null!);

        // Act
        var response = await _userService.DeleteAsync(userId, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WithInvalidId_ShouldReturnValidationError()
    {
        // Act
        var response = await _userService.DeleteAsync(-1, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Message.Should().Contain("Invalid user ID");
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WhenDeletionFailsInRepository_ShouldReturnFailure()
    {
        // Arrange
        var userId = 1;
        var existingUser = TestDataGenerator.GenerateTestUser(id: userId);

        _mockUserRepository.Setup(repo => repo.GetByIdAsync(userId, _cancellationToken)).ReturnsAsync(existingUser);
        _mockUserRepository.Setup(repo => repo.DeleteAsync(userId, _cancellationToken)).ReturnsAsync(false); // Simulate failure

        // Act
        var response = await _userService.DeleteAsync(userId, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.NotFound); // As per current implementation
        response.Message.Should().Contain("User deletion failed");
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WhenRepositoryThrowsNpgsqlException_ShouldReturnDatabaseError()
    {
        // Arrange
        var userId = 1;
        var npgsqlException = new NpgsqlException("Database connection failed");
        var existingUser = TestDataGenerator.GenerateTestUser(id: userId);

        _mockUserRepository.Setup(repo => repo.GetByIdAsync(userId, _cancellationToken)).ReturnsAsync(existingUser);
        _mockUserRepository.Setup(repo => repo.DeleteAsync(userId, _cancellationToken)).ThrowsAsync(npgsqlException);

        // Act
        var response = await _userService.DeleteAsync(userId, _cancellationToken);
        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User deletion failed");
    }

    [Fact]
    public async Task DeleteAsync_WhenRepositoryThrowsGenericException_ShouldReturnUnhandledError()
    {
        // Arrange
        var userId = 1;
        var genericException = new Exception("An unexpected error occurred.");
        var existingUser = TestDataGenerator.GenerateTestUser(id: userId);

        _mockUserRepository.Setup(repo => repo.GetByIdAsync(userId, _cancellationToken)).ReturnsAsync(existingUser);
        _mockUserRepository.Setup(repo => repo.DeleteAsync(userId, _cancellationToken)).ThrowsAsync(genericException);

        // Act
        var response = await _userService.DeleteAsync(userId, _cancellationToken);
        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User deletion failed");
    }

    #endregion

    #region LoginAsync Tests

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnToken()
    {
        // Arrange
        var loginDto = TestDataGenerator.GenerateLoginUserDto();
        var expectedToken = "valid.jwt.token";
        var expectedResponse = TestDataGenerator.GenerateUserWithTokenDto(
            TestDataGenerator.GenerateTestUser(
                id: 1,
                username: loginDto.Username
        ), expectedToken);

        _mockUserRepository
            .Setup(repo => repo.LoginAsync(loginDto, _cancellationToken))
            .ReturnsAsync(expectedResponse);

        // Act
        var response = await _userService.LoginAsync(loginDto, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Data.Should().Be(expectedResponse);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidCredentials_ShouldReturnValidationError()
    {
        // Arrange
        var loginDto = TestDataGenerator.GenerateLoginUserDto();

        _mockUserRepository
            .Setup(repo => repo.LoginAsync(loginDto, _cancellationToken))
            .ReturnsAsync((UserWithTokenDto)null!);

        // Act
        var response = await _userService.LoginAsync(loginDto, _cancellationToken);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Message.Should().Contain("No user found with given credentials");
    }

    [Fact]
    public async Task LoginAsync_WithNullDto_ShouldReturnValidationError()
    {
        // Act
        var response = await _userService.LoginAsync(null!, _cancellationToken);

        // Assert   
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Message.Should().Contain("No user found with given credentials");
    }

    [Fact]
    public async Task LoginAsync_WhenRepositoryThrowsNpgsqlException_ShouldReturnDatabaseError()
    {
        // Arrange
        var loginDto = TestDataGenerator.GenerateLoginUserDto();
        var npgsqlException = new NpgsqlException("Database connection failed");

        _mockUserRepository
            .Setup(repo => repo.LoginAsync(loginDto, _cancellationToken))
            .ThrowsAsync(npgsqlException);

        // Act
        var response = await _userService.LoginAsync(loginDto, _cancellationToken);
        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User login failed");
    }

    [Fact]
    public async Task LoginAsync_WhenRepositoryThrowsGenericException_ShouldReturnUnhandledError()
    {
        // Arrange
        var loginDto = TestDataGenerator.GenerateLoginUserDto();
        var genericException = new Exception("An unexpected error occurred.");

        _mockUserRepository
            .Setup(repo => repo.LoginAsync(loginDto, _cancellationToken))
            .ThrowsAsync(genericException);

        // Act
        var response = await _userService.LoginAsync(loginDto, _cancellationToken);
        // Assert
        response.IsSuccess.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Message.Should().Contain("User login failed");
    }

    #endregion
}