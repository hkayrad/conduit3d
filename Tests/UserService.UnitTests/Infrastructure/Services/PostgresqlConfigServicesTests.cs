using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Conduit3D.Common.Domain;
using FluentAssertions;
using Moq;
using UserService.Domain;
using UserService.Infrastructure;
using UserService.Infrastructure.DTOs;
using UserService.Infrastructure.Repositories;
using UserService.Infrastructure.Services;
using UserService.UnitTests.Helpers;
using Xunit;

namespace UserService.UnitTests.Infrastructure.Services;

public class PostgresqlConfigServicesTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IConfigRepository> _mockConfigRepository;
    private readonly PostgresqlConfigService _configService;

    public PostgresqlConfigServicesTests()
    {
        _mockConfigRepository = new Mock<IConfigRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockUnitOfWork.Setup(uow => uow.ConfigRepository).Returns(_mockConfigRepository.Object);
        _configService = new PostgresqlConfigService(_mockUnitOfWork.Object);
    }

    [Fact]
    public void Constructor_WithNullUnitOfWork_ShouldThrowArgumentNullException()
    {
        // Act
        Action act = () => new PostgresqlConfigService(null!);

        // Assert
        act.Should().Throw<ArgumentNullException>()
            .WithMessage("Value cannot be null. (Parameter 'unitOfWork')");
    }

    #region GetAllConfigsAsync Tests

    [Fact]
    public async Task GetAllConfigsAsync_WhenConfigsExist_ShouldReturnSuccessWithConfigList()
    {
        // Arrange
        var configs = new List<Config>
        {
            TestDataGenerator.GenerateConfig("Key1", "Value1"),
            TestDataGenerator.GenerateConfig("Key2", "Value2")
        };
        _mockConfigRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(configs);

        // Act
        var response = await _configService.GetAllConfigsAsync();

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.Data.Should().BeEquivalentTo(configs);
    }

    [Fact]
    public async Task GetAllConfigsAsync_WhenRepositoryThrowsException_ShouldReturnFailure()
    {
        // Arrange
        var exception = new Exception("Database error");
        _mockConfigRepository.Setup(repo => repo.GetAllAsync()).ThrowsAsync(exception);

        // Act
        var response = await _configService.GetAllConfigsAsync();

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.Message.Should().Contain("configsRetrievalFailed");
    }

    #endregion

    #region GetConfigValueAsync Tests

    [Fact]
    public async Task GetConfigValueAsync_WithExistingKey_ShouldReturnSuccessWithValue()
    {
        // Arrange
        var key = "TestKey";
        var value = "TestValue";
        _mockConfigRepository.Setup(repo => repo.GetConfigValueAsync(key)).ReturnsAsync(value);

        // Act
        var response = await _configService.GetConfigValueAsync(key);

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.Data.Should().Be(value);
    }

    [Fact]
    public async Task GetConfigValueAsync_WhenRepositoryThrowsException_ShouldReturnFailure()
    {
        // Arrange
        var key = "TestKey";
        var exception = new Exception("Database error");
        _mockConfigRepository.Setup(repo => repo.GetConfigValueAsync(key)).ThrowsAsync(exception);

        // Act
        var response = await _configService.GetConfigValueAsync(key);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.Message.Should().Contain("configValueRetrievalFailed");
    }

    #endregion

    #region SetConfigValueAsync Tests

    [Fact]
    public async Task SetConfigValueAsync_WithValidDto_ShouldReturnSuccess()
    {
        // Arrange
        var configDto = TestDataGenerator.GenerateConfigDto("NewKey", "NewValue");
        _mockConfigRepository
            .Setup(repo => repo.SetConfigValueAsync(configDto))
            .ReturnsAsync(configDto.Key);

        // Act
        var response = await _configService.SetConfigValueAsync(configDto);

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.Data.Should().Be(configDto.Key);
        response.Message.Should().Contain("Config value set successfully");
    }

    [Fact]
    public async Task SetConfigValueAsync_WhenRepositoryThrowsException_ShouldReturnFailure()
    {
        // Arrange
        var configDto = TestDataGenerator.GenerateConfigDto("NewKey", "NewValue");
        var exception = new Exception("Database error");
        _mockConfigRepository.Setup(repo => repo.SetConfigValueAsync(configDto)).ThrowsAsync(exception);

        // Act
        var response = await _configService.SetConfigValueAsync(configDto);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.Message.Should().Contain("configValueSettingFailed");
    }

    #endregion

    #region DeleteConfigValueAsync Tests

    [Fact]
    public async Task DeleteConfigValueAsync_WithExistingKey_ShouldReturnSuccess()
    {
        // Arrange
        var key = "KeyToDelete";
        var configs = new List<Config> { TestDataGenerator.GenerateConfig(key, "Value") };
        _mockConfigRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(configs);
        _mockConfigRepository.Setup(repo => repo.DeleteConfigValueAsync(key)).ReturnsAsync(key);

        // Act
        var response = await _configService.DeleteConfigValueAsync(key);

        // Assert
        response.IsSuccess.Should().BeTrue();
        response.Data.Should().Be(key);
        response.Message.Should().Contain("Config value deleted successfully");
    }

    [Fact]
    public async Task DeleteConfigValueAsync_WithNonExistingKey_ShouldReturnFailure()
    {
        // Arrange
        var key = "NonExistentKey";
        _mockConfigRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync([]);

        // Act
        var response = await _configService.DeleteConfigValueAsync(key);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.Message.Should().Contain("No config found for the given key");
    }

    [Fact]
    public async Task DeleteConfigValueAsync_WhenRepositoryThrowsException_ShouldReturnFailure()
    {
        // Arrange
        var key = "KeyToDelete";
        var exception = new Exception("Database error");
        _mockConfigRepository.Setup(repo => repo.GetAllAsync()).ThrowsAsync(exception);

        // Act
        var response = await _configService.DeleteConfigValueAsync(key);

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.Message.Should().Contain("Config deletion failed");
    }

    #endregion
}
