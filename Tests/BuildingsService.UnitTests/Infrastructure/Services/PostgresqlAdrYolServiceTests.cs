using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using BuildingsService.Domain;
using BuildingsService.Infrastructure;
using BuildingsService.Infrastructure.Repositories;
using BuildingsService.Infrastructure.Services;
using BuildingsService.Resources;
using BuildingsService.UnitTests.Helpers;
using Conduit3D.Common.Domain;
using FluentAssertions;
using Moq;
using Npgsql;
using Xunit;

namespace BuildingsService.UnitTests.Infrastructure.Services;

public class PostgresqlAdrYolServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IAdrYolRepository> _mockAdrYolRepository;
    private readonly PostgresqlAdrYolService _adrYolService;

    public PostgresqlAdrYolServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockAdrYolRepository = new Mock<IAdrYolRepository>(MockBehavior.Strict);
        _mockUnitOfWork.Setup(uow => uow.AdrYolRepository).Returns(_mockAdrYolRepository.Object);
        _adrYolService = new PostgresqlAdrYolService(_mockUnitOfWork.Object);
    }

    [Fact]
    public void Constructor_WithNullUnitOfWork_ThrowsArgumentNullException()
    {
        // Act
        Action act = () => new PostgresqlAdrYolService(null!);

        // Assert
        act.Should().Throw<ArgumentNullException>().WithParameterName("unitOfWork");
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_WithValidParameters_ReturnsSuccessResponse()
    {
        // Arrange
        var roads = TestDataGenerator.GenerateAdrYolList(3);
        _mockAdrYolRepository.Setup(r => r.GetAllAsync(1, 10, "Id", true, It.IsAny<Extent>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(roads);

        // Act
        var result = await _adrYolService.GetAllAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeEquivalentTo(roads);
        result.Message.Should().Be(BuildingsResources.GetString("roadsRetrieved"));
        result.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(200001)]
    public async Task GetAllAsync_WithInvalidPageSize_ReturnsValidationError(int pageSize)
    {
        // Act
        var result = await _adrYolService.GetAllAsync(1, pageSize, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidPageSize"));
    }

    [Fact]
    public async Task GetAllAsync_WithInvalidPageNumber_ReturnsValidationError()
    {
        // Act
        var result = await _adrYolService.GetAllAsync(0, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidPageNumber"));
    }

    [Fact]
    public async Task GetAllAsync_WithInvalidSortBy_ReturnsValidationError()
    {
        // Act
        var result = await _adrYolService.GetAllAsync(1, 10, "InvalidColumn", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidSortBy"));
    }

    [Fact]
    public async Task GetAllAsync_WithInvalidExtent_ReturnsValidationError()
    {
        // Arrange
        var invalidExtent = TestDataGenerator.GenerateExtent(minX: 1, maxX: 0, minY: -90, maxY: 90);

        // Act
        var result = await _adrYolService.GetAllAsync(1, 10, "Id", true, invalidExtent, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidExtent"));
    }

    [Fact]
    public async Task GetAllAsync_WhenNoRoadsFound_ReturnsNotFound()
    {
        // Arrange
        _mockAdrYolRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        // Act
        var result = await _adrYolService.GetAllAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(BuildingsResources.GetString("noRoadFound"));
    }

    [Fact]
    public async Task GetAllAsync_WhenRoadsIsNull_ReturnsNotFound()
    {
        // Arrange
        _mockAdrYolRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((List<AdrYol>)null!);

        // Act
        var result = await _adrYolService.GetAllAsync(1, 10, "Id", true, null, null, CancellationToken.None);
        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(BuildingsResources.GetString("noRoadFound"));
    }

    [Fact]
    public async Task GetAllAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var exceptionMessage = "DB connection failed";
        _mockAdrYolRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _adrYolService.GetAllAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadRetrievalFailed", exceptionMessage));
    }

    [Fact]
    public async Task GetAllAsync_OnGenericException_ReturnsUnhandledError()
    {
        // Arrange
        var exceptionMessage = "Something went wrong";
        _mockAdrYolRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _adrYolService.GetAllAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadRetrievalFailed", exceptionMessage));
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsSuccessResponse()
    {
        // Arrange
        var road = TestDataGenerator.GenerateAdrYol(id: 1);
        _mockAdrYolRepository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(road);

        // Act
        var result = await _adrYolService.GetByIdAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeEquivalentTo(road);
        result.Message.Should().Be(BuildingsResources.GetString("roadRetrieved"));
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ReturnsValidationError()
    {
        // Act
        var result = await _adrYolService.GetByIdAsync(0, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidRoadId"));
    }

    [Fact]
    public async Task GetByIdAsync_WhenRoadNotFound_ReturnsNotFound()
    {
        // Arrange
        _mockAdrYolRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync((AdrYol)null!);

        // Act
        var result = await _adrYolService.GetByIdAsync(99, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(BuildingsResources.GetString("noRoadFound", 99));
    }

    [Fact]
    public async Task GetByIdAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var exceptionMessage = "DB error";
        _mockAdrYolRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _adrYolService.GetByIdAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadRetrievalFailed", exceptionMessage));
    }

    [Fact]
    public async Task GetByIdAsync_OnGenericException_ReturnsUnhandledError()
    {
        // Arrange
        var exceptionMessage = "Something went wrong";
        _mockAdrYolRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _adrYolService.GetByIdAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadsRetrievalFailed", exceptionMessage));
    }

    #endregion

    #region GetTipListAsync Tests

    [Fact]
    public async Task GetTipListAsync_WhenTipsExist_ReturnsSuccessResponse()
    {
        // Arrange
        var tipList = TestDataGenerator.GenerateTipList(3);
        _mockAdrYolRepository.Setup(r => r.GetTipListAsync(It.IsAny<CancellationToken>())).ReturnsAsync(tipList);

        // Act
        var result = await _adrYolService.GetTipListAsync(CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeEquivalentTo(tipList);
        result.Message.Should().Be(BuildingsResources.GetString("tipListRetrieved"));
    }

    [Fact]
    public async Task GetTipListAsync_WhenNoTipsFound_ReturnsNotFound()
    {
        // Arrange
        _mockAdrYolRepository.Setup(r => r.GetTipListAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);

        // Act
        var result = await _adrYolService.GetTipListAsync(CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(BuildingsResources.GetString("noTipFound"));
    }

    [Fact]
    public async Task GetTipListAsync_WhenTipListIsNull_ReturnsNotFound()
    {
        // Arrange
        _mockAdrYolRepository.Setup(r => r.GetTipListAsync(It.IsAny<CancellationToken>())).ReturnsAsync((List<string>)null!);

        // Act
        var result = await _adrYolService.GetTipListAsync(CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(BuildingsResources.GetString("noTipFound"));
    }

    [Fact]
    public async Task GetTipListAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var exceptionMessage = "DB error";
        _mockAdrYolRepository.Setup(r => r.GetTipListAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _adrYolService.GetTipListAsync(CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("tipListRetrievalFailed", exceptionMessage));
    }

    [Fact]
    public async Task GetTipListAsync_OnGenericException_ReturnsUnhandledError()
    {
        // Arrange
        var exceptionMessage = "Something went wrong";
        _mockAdrYolRepository.Setup(r => r.GetTipListAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _adrYolService.GetTipListAsync(CancellationToken.None);
        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("tipListRetrievalFailed", exceptionMessage));
    }

    #endregion

    #region GetCountAsync Tests

    [Fact]
    public async Task GetCountAsync_WithValidParameters_ReturnsSuccessResponse()
    {
        // Arrange
        _mockAdrYolRepository.Setup(r => r.GetCountAsync(It.IsAny<Extent>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(123);

        // Act
        var result = await _adrYolService.GetCountAsync(null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().Be(123);
        result.Message.Should().Be(BuildingsResources.GetString("roadCountRetrieved"));
    }

    [Fact]
    public async Task GetCountAsync_WithInvalidExtent_ReturnsValidationError()
    {
        // Arrange
        var invalidExtent = TestDataGenerator.GenerateExtent(minX: 1, maxX: 0, minY: -90, maxY: 90);

        // Act
        var result = await _adrYolService.GetCountAsync(invalidExtent, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidExtent"));
    }

    [Fact]
    public async Task GetCountAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var exceptionMessage = "DB error";
        _mockAdrYolRepository.Setup(r => r.GetCountAsync(It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _adrYolService.GetCountAsync(null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadCountRetrievalFailed", exceptionMessage));
    }

    [Fact]
    public async Task GetCountAsync_OnGenericException_ReturnsUnhandledError()
    {
        // Arrange
        var exceptionMessage = "Something went wrong";
        _mockAdrYolRepository.Setup(r => r.GetCountAsync(It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _adrYolService.GetCountAsync(null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadCountRetrievalFailed", exceptionMessage));
    }

    #endregion

    #region GetAllAsProtobufAsync Tests

    [Fact]
    public async Task GetAllAsProtobufAsync_WithValidParameters_ReturnsSuccessResponse()
    {
        // Arrange
        var roads = TestDataGenerator.GenerateAdrYolList(1);
        _mockAdrYolRepository.Setup(r => r.GetAllAsync(1, 10, "Id", true, It.IsAny<Extent>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(roads);

        // Act
        var result = await _adrYolService.GetAllAsProtobufAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.StatusCode.Should().Be((int)HttpStatusCode.OK);
        result.Message.Should().Be(BuildingsResources.GetString("roadsRetrieved"));
        result.Data.Should().HaveCount(1);
        var protoRoad = result.Data.First();
        var originalRoad = roads.First();
        protoRoad.Id.Should().Be(originalRoad.Id);
        protoRoad.Adi.Should().Be(originalRoad.Adi);
        protoRoad.Wkb.Should().Be(Convert.ToBase64String(originalRoad.Wkb));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WithInvalidPageSize_ReturnsBadRequest()
    {
        // Act
        var result = await _adrYolService.GetAllAsProtobufAsync(1, 0, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidPageSize"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WithInvalidPageNumber_ReturnsBadRequest()
    {
        // Act
        var result = await _adrYolService.GetAllAsProtobufAsync(0, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidPageNumber"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WithInvalidSortBy_ReturnsBadRequest()
    {
        // Act
        var result = await _adrYolService.GetAllAsProtobufAsync(1, 10, "InvalidColumn", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidSortBy"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WithInvalidExtent_ReturnsBadRequest()
    {
        // Arrange
        var invalidExtent = TestDataGenerator.GenerateExtent(minX: 1, maxX: 0, minY: -90, maxY: 90);

        // Act
        var result = await _adrYolService.GetAllAsProtobufAsync(1, 10, "Id", true, invalidExtent, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidExtent"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WhenNoRoadsFound_ReturnsNotFound()
    {
        // Arrange
        _mockAdrYolRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        // Act
        var result = await _adrYolService.GetAllAsProtobufAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        result.Message.Should().Be(BuildingsResources.GetString("noRoadFound"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WhenRoadsIsNull_ReturnsNotFound()
    {
        // Arrange
        _mockAdrYolRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((List<AdrYol>)null!);

        // Act
        var result = await _adrYolService.GetAllAsProtobufAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        result.Message.Should().Be(BuildingsResources.GetString("noRoadFound"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_OnNpgsqlException_ReturnsInternalServerError()
    {
        // Arrange
        var exceptionMessage = "DB connection failed";
        _mockAdrYolRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _adrYolService.GetAllAsProtobufAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadRetrievalFailed", exceptionMessage));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_OnGenericException_ReturnsInternalServerError()
    {
        // Arrange
        var exceptionMessage = "Something went wrong";
        _mockAdrYolRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _adrYolService.GetAllAsProtobufAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadRetrievalFailed", exceptionMessage));
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidEntity_ReturnsSuccessResponse()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateAdrYol(id: 1);
        _mockAdrYolRepository.Setup(r => r.AddAsync(entity, It.IsAny<CancellationToken>())).ReturnsAsync(entity);

        // Act
        var result = await _adrYolService.CreateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeEquivalentTo(entity);
        result.Message.Should().Be(BuildingsResources.GetString("roadCreated"));
    }

    [Fact]
    public async Task CreateAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateAdrYol(id: 1);
        var exceptionMessage = "DB error";
        _mockAdrYolRepository.Setup(r => r.AddAsync(entity, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _adrYolService.CreateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadCreationFailed", exceptionMessage));
    }

    [Fact]
    public async Task CreateAsync_OnGenericException_ReturnsUnhandledError()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateAdrYol(id: 1);
        var exceptionMessage = "Generic error";
        _mockAdrYolRepository.Setup(r => r.AddAsync(entity, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _adrYolService.CreateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadCreationFailed", exceptionMessage));
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidEntity_ReturnsSuccessResponse()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateAdrYol(id: 1);
        _mockAdrYolRepository.Setup(r => r.UpdateAsync(entity, It.IsAny<CancellationToken>())).ReturnsAsync(entity);

        // Act
        var result = await _adrYolService.UpdateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeEquivalentTo(entity);
        result.Message.Should().Be(BuildingsResources.GetString("roadUpdated"));
    }

    [Fact]
    public async Task UpdateAsync_WithInvalidId_ReturnsValidationError()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateAdrYol(id: 0);

        // Act
        var result = await _adrYolService.UpdateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(BuildingsResources.GetString("invalidRoadId"));
    }

    [Fact]
    public async Task UpdateAsync_WhenEntityNotFound_ReturnsNotFound()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateAdrYol(id: 99);
        _mockAdrYolRepository.Setup(r => r.UpdateAsync(entity, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException());

        // Act
        var result = await _adrYolService.UpdateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(BuildingsResources.GetString("noRoadFound", 99));
    }

    [Fact]
    public async Task UpdateAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateAdrYol(id: 1);
        var exceptionMessage = "DB error";
        _mockAdrYolRepository.Setup(r => r.UpdateAsync(entity, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _adrYolService.UpdateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadUpdateFailed", exceptionMessage));
    }

    [Fact]
    public async Task UpdateAsync_OnGenericException_ReturnsUnhandledError()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateAdrYol(id: 1);
        var exceptionMessage = "Generic error";
        _mockAdrYolRepository.Setup(r => r.UpdateAsync(entity, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _adrYolService.UpdateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadUpdateFailed", exceptionMessage));
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_WithValidId_ReturnsSuccessResponse()
    {
        // Arrange
        _mockAdrYolRepository.Setup(r => r.DeleteAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        // Act
        var result = await _adrYolService.DeleteAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeTrue();
        result.Message.Should().Be(BuildingsResources.GetString("roadDeleted"));
    }

    [Fact]
    public async Task DeleteAsync_WhenIdNotFound_ReturnsNotFound()
    {
        // Arrange
        _mockAdrYolRepository.Setup(r => r.DeleteAsync(99, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        // Act
        var result = await _adrYolService.DeleteAsync(99, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(BuildingsResources.GetString("noRoadFound", 99));
    }

    [Fact]
    public async Task DeleteAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var exceptionMessage = "DB error";
        _mockAdrYolRepository.Setup(r => r.DeleteAsync(1, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _adrYolService.DeleteAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadDeletionFailed", exceptionMessage));
    }

    [Fact]
    public async Task DeleteAsync_OnGenericException_ReturnsUnhandledError()
    {
        // Arrange
        var exceptionMessage = "Generic error";
        _mockAdrYolRepository.Setup(r => r.DeleteAsync(1, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _adrYolService.DeleteAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(BuildingsResources.GetString("roadDeletionFailed", exceptionMessage));
    }

    #endregion
}