using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Conduit3D.Common.Domain;
using FluentAssertions;
using LinesService.Domain;
using LinesService.Infrastructure;
using LinesService.Infrastructure.Repositories;
using LinesService.Infrastructure.Services;
using LinesService.Resources;
using LinesService.UnitTests.Helpers;
using Moq;
using Npgsql;
using Xunit;

namespace LinesService.UnitTests.Infrastructure.Services;

public class PostgresqlOgHatServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IOgHatRepository> _mockOgHatRepository;
    private readonly PostgresqlOgHatService _ogHatService;

    public PostgresqlOgHatServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockOgHatRepository = new Mock<IOgHatRepository>(MockBehavior.Strict);
        _mockUnitOfWork.Setup(uow => uow.OgHatRepository).Returns(_mockOgHatRepository.Object);
        _ogHatService = new PostgresqlOgHatService(_mockUnitOfWork.Object);
    }

    [Fact]
    public void Constructor_WithNullUnitOfWork_ThrowsArgumentNullException()
    {
        // Act
        Action act = () => new PostgresqlOgHatService(null!);

        // Assert
        act.Should().Throw<ArgumentNullException>().WithParameterName("unitOfWork");
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_WithValidParameters_ReturnsSuccessResponse()
    {
        // Arrange
        var lines = TestDataGenerator.GenerateOgHatList(3);
        _mockOgHatRepository.Setup(r => r.GetAllAsync(1, 10, "Id", true, It.IsAny<Extent>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lines);

        // Act
        var result = await _ogHatService.GetAllAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeEquivalentTo(lines);
        result.Message.Should().Be(LinesResources.GetString("linesRetrieved"));
        result.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(200001)]
    public async Task GetAllAsync_WithInvalidPageSize_ReturnsValidationError(int pageSize)
    {
        // Act
        var result = await _ogHatService.GetAllAsync(1, pageSize, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidPageSize"));
    }

    [Fact]
    public async Task GetAllAsync_WithInvalidPageNumber_ReturnsValidationError()
    {
        // Act
        var result = await _ogHatService.GetAllAsync(0, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidPageNumber"));
    }

    [Fact]
    public async Task GetAllAsync_WithInvalidSortBy_ReturnsValidationError()
    {
        // Act
        var result = await _ogHatService.GetAllAsync(1, 10, "InvalidColumn", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidSortBy"));
    }

    [Fact]
    public async Task GetAllAsync_WithInvalidExtent_ReturnsValidationError()
    {
        // Arrange
        var invalidExtent = TestDataGenerator.GenerateExtent(minX: 1, maxX: 0, minY: -90, maxY: 90);

        // Act
        var result = await _ogHatService.GetAllAsync(1, 10, "Id", true, invalidExtent, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidExtent"));
    }

    [Fact]
    public async Task GetAllAsync_WhenNoLinesFound_ReturnsNotFound()
    {
        // Arrange
        _mockOgHatRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        // Act
        var result = await _ogHatService.GetAllAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(LinesResources.GetString("noLineFound"));
    }

    [Fact]
    public async Task GetAllAsync_WhenLinesIsNull_ReturnsNotFound()
    {
        // Arrange
        _mockOgHatRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((List<OgHat>)null!);

        // Act
        var result = await _ogHatService.GetAllAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(LinesResources.GetString("noLineFound"));
    }

    [Fact]
    public async Task GetAllAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var exceptionMessage = "DB connection failed";
        _mockOgHatRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _ogHatService.GetAllAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineRetrievalFailed", exceptionMessage));
    }

    [Fact]
    public async Task GetAllAsync_OnGenericException_ReturnsInternalServerError()
    {
        // Arrange
        var exceptionMessage = "Something went wrong";
        _mockOgHatRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _ogHatService.GetAllAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineRetrievalFailed", exceptionMessage));
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsSuccessResponse()
    {
        // Arrange
        var line = TestDataGenerator.GenerateOgHat(id: 1);
        _mockOgHatRepository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(line);

        // Act
        var result = await _ogHatService.GetByIdAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeEquivalentTo(line);
        result.Message.Should().Be(LinesResources.GetString("lineRetrieved"));
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ReturnsValidationError()
    {
        // Act
        var result = await _ogHatService.GetByIdAsync(0, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidId"));
    }

    [Fact]
    public async Task GetByIdAsync_WhenLineNotFound_ReturnsNotFound()
    {
        // Arrange
        _mockOgHatRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync((OgHat)null!);

        // Act
        var result = await _ogHatService.GetByIdAsync(99, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(LinesResources.GetString("lineNotFound", 99));
    }

    [Fact]
    public async Task GetByIdAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var exceptionMessage = "DB error";
        _mockOgHatRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _ogHatService.GetByIdAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineRetrievalFailed", exceptionMessage));
    }

    [Fact]
    public async Task GetByIdAsync_OnGenericException_ReturnsInternalServerError()
    {
        // Arrange
        var exceptionMessage = "Something went wrong";
        _mockOgHatRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _ogHatService.GetByIdAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineRetrievalFailed", exceptionMessage));
    }

    #endregion

    #region GetCountAsync Tests

    [Fact]
    public async Task GetCountAsync_WithValidParameters_ReturnsSuccessResponse()
    {
        // Arrange
        _mockOgHatRepository.Setup(r => r.GetCountAsync(It.IsAny<Extent>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(123);

        // Act
        var result = await _ogHatService.GetCountAsync(null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().Be(123);
        result.Message.Should().Be(LinesResources.GetString("lineCountRetrieved"));
    }

    [Fact]
    public async Task GetCountAsync_WithInvalidExtent_ReturnsValidationError()
    {
        // Arrange
        var invalidExtent = TestDataGenerator.GenerateExtent(minX: 1, maxX: 0, minY: -90, maxY: 90);

        // Act
        var result = await _ogHatService.GetCountAsync(invalidExtent, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidExtent"));
    }

    [Fact]
    public async Task GetCountAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var exceptionMessage = "DB error";
        _mockOgHatRepository.Setup(r => r.GetCountAsync(It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _ogHatService.GetCountAsync(null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineCountRetrievalFailed", exceptionMessage));
    }

    [Fact]
    public async Task GetCountAsync_OnGenericException_ReturnsInternalServerError()
    {
        // Arrange
        var exceptionMessage = "Something went wrong";
        _mockOgHatRepository.Setup(r => r.GetCountAsync(It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _ogHatService.GetCountAsync(null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineCountRetrievalFailed", exceptionMessage));
    }

    #endregion

    #region GetTipListAsync Tests

    [Fact]
    public async Task GetTipListAsync_WhenTipsExist_ReturnsSuccessResponse()
    {
        // Arrange
        var tipList = TestDataGenerator.GenerateTipList(3);
        _mockOgHatRepository.Setup(r => r.GetTipListAsync(It.IsAny<CancellationToken>())).ReturnsAsync(tipList);

        // Act
        var result = await _ogHatService.GetTipListAsync(CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeEquivalentTo(tipList);
        result.Message.Should().Be(LinesResources.GetString("tipListRetrieved"));
    }

    [Fact]
    public async Task GetTipListAsync_WhenNoTipsFound_ReturnsNotFound()
    {
        // Arrange
        _mockOgHatRepository.Setup(r => r.GetTipListAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);

        // Act
        var result = await _ogHatService.GetTipListAsync(CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(LinesResources.GetString("noTipFound"));
    }

    [Fact]
    public async Task GetTipListAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var exceptionMessage = "DB error";
        _mockOgHatRepository.Setup(r => r.GetTipListAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _ogHatService.GetTipListAsync(CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("tipListRetrievalFailed", exceptionMessage));
    }

    [Fact]
    public async Task GetTipListAsync_OnGenericException_ReturnsInternalServerError()
    {
        // Arrange
        var exceptionMessage = "Something went wrong";
        _mockOgHatRepository.Setup(r => r.GetTipListAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _ogHatService.GetTipListAsync(CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("tipListRetrievalFailed", exceptionMessage));
    }

    #endregion

    #region GetAllAsProtobufAsync Tests

    [Fact]
    public async Task GetAllAsProtobufAsync_WithValidParameters_ReturnsSuccessResponse()
    {
        // Arrange
        var lines = TestDataGenerator.GenerateOgHatList(1);
        _mockOgHatRepository.Setup(r => r.GetAllAsync(1, 10, "Id", true, It.IsAny<Extent>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lines);

        // Act
        var result = await _ogHatService.GetAllAsProtobufAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.StatusCode.Should().Be((int)HttpStatusCode.OK);
        result.Message.Should().Be(LinesResources.GetString("linesRetrieved"));
        result.Data.Should().HaveCount(1);
        result.Data.First().Id.Should().Be(1);
        result.Data.First().Adi.Should().Be("Test Line 1");
        result.Data.First().Wkb.Should().Be(Convert.ToBase64String(lines.First().Wkb));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WithInvalidPageSize_ReturnsBadRequest()
    {
        // Act
        var result = await _ogHatService.GetAllAsProtobufAsync(1, 0, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidPageSize"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WithInvalidPageNumber_ReturnsBadRequest()
    {
        // Act
        var result = await _ogHatService.GetAllAsProtobufAsync(0, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidPageNumber"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WithInvalidSortBy_ReturnsBadRequest()
    {
        // Act
        var result = await _ogHatService.GetAllAsProtobufAsync(1, 10, "InvalidColumn", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidSortBy"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WithInvalidExtent_ReturnsBadRequest()
    {
        // Arrange
        var invalidExtent = TestDataGenerator.GenerateExtent(minX: 1, maxX: 0, minY: -90, maxY: 90);

        // Act
        var result = await _ogHatService.GetAllAsProtobufAsync(1, 10, "Id", true, invalidExtent, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidExtent"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WhenNoLinesFound_ReturnsNotFound()
    {
        // Arrange
        _mockOgHatRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        // Act
        var result = await _ogHatService.GetAllAsProtobufAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        result.Message.Should().Be(LinesResources.GetString("noLineFound"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_WhenLinesIsNull_ReturnsNotFound()
    {
        // Arrange
        _mockOgHatRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((List<OgHat>)null!);

        // Act
        var result = await _ogHatService.GetAllAsProtobufAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        result.Message.Should().Be(LinesResources.GetString("noLineFound"));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_OnNpgsqlException_ReturnsInternalServerError()
    {
        // Arrange
        var exceptionMessage = "DB connection failed";
        _mockOgHatRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _ogHatService.GetAllAsProtobufAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineRetrievalFailed", exceptionMessage));
    }

    [Fact]
    public async Task GetAllAsProtobufAsync_OnGenericException_ReturnsInternalServerError()
    {
        // Arrange
        var exceptionMessage = "Something went wrong";
        _mockOgHatRepository.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<Extent>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _ogHatService.GetAllAsProtobufAsync(1, 10, "Id", true, null, null, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineRetrievalFailed", exceptionMessage));
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidEntity_ReturnsSuccessResponse()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateOgHat(id: 1);
        _mockOgHatRepository.Setup(r => r.AddAsync(entity, It.IsAny<CancellationToken>())).ReturnsAsync(entity);

        // Act
        var result = await _ogHatService.CreateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeEquivalentTo(entity);
        result.Message.Should().Be(LinesResources.GetString("lineCreated"));
    }

    [Fact]
    public async Task CreateAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateOgHat(id: 1);
        var exceptionMessage = "DB error";
        _mockOgHatRepository.Setup(r => r.AddAsync(entity, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _ogHatService.CreateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineCreationFailed", exceptionMessage));
    }

    [Fact]
    public async Task CreateAsync_OnGenericException_ReturnsUnhandledError()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateOgHat(id: 1);
        var exceptionMessage = "Generic error";
        _mockOgHatRepository.Setup(r => r.AddAsync(entity, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _ogHatService.CreateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineCreationFailed", exceptionMessage));
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidEntity_ReturnsSuccessResponse()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateOgHat(id: 1);
        _mockOgHatRepository.Setup(r => r.UpdateAsync(entity, It.IsAny<CancellationToken>())).ReturnsAsync(entity);

        // Act
        var result = await _ogHatService.UpdateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeEquivalentTo(entity);
        result.Message.Should().Be(LinesResources.GetString("lineUpdated"));
    }

    [Fact]
    public async Task UpdateAsync_WithInvalidId_ReturnsValidationError()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateOgHat(id: 0);

        // Act
        var result = await _ogHatService.UpdateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.Message.Should().Be(LinesResources.GetString("invalidId"));
    }

    [Fact]
    public async Task UpdateAsync_WhenEntityNotFound_ReturnsNotFound()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateOgHat(id: 99);
        _mockOgHatRepository.Setup(r => r.UpdateAsync(entity, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException());

        // Act
        var result = await _ogHatService.UpdateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(LinesResources.GetString("lineNotFound", 99));
    }

    [Fact]
    public async Task UpdateAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateOgHat(id: 1);
        var exceptionMessage = "DB error";
        _mockOgHatRepository.Setup(r => r.UpdateAsync(entity, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _ogHatService.UpdateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineUpdateFailed", exceptionMessage));
    }

    [Fact]
    public async Task UpdateAsync_OnGenericException_ReturnsUnhandledError()
    {
        // Arrange
        var entity = TestDataGenerator.GenerateOgHat(id: 1);
        var exceptionMessage = "Generic error";
        _mockOgHatRepository.Setup(r => r.UpdateAsync(entity, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _ogHatService.UpdateAsync(entity, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineUpdateFailed", exceptionMessage));
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_WithValidId_ReturnsSuccessResponse()
    {
        // Arrange
        _mockOgHatRepository.Setup(r => r.DeleteAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        // Act
        var result = await _ogHatService.DeleteAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeTrue();
        result.Message.Should().Be(LinesResources.GetString("lineDeleted"));
    }

    [Fact]
    public async Task DeleteAsync_WhenIdNotFound_ReturnsNotFound()
    {
        // Arrange
        _mockOgHatRepository.Setup(r => r.DeleteAsync(99, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        // Act
        var result = await _ogHatService.DeleteAsync(99, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        result.Message.Should().Be(LinesResources.GetString("lineNotFound", 99));
    }

    [Fact]
    public async Task DeleteAsync_OnNpgsqlException_ReturnsDatabaseError()
    {
        // Arrange
        var exceptionMessage = "DB error";
        _mockOgHatRepository.Setup(r => r.DeleteAsync(1, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NpgsqlException(exceptionMessage));

        // Act
        var result = await _ogHatService.DeleteAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineDeletionFailed", exceptionMessage));
    }

    [Fact]
    public async Task DeleteAsync_OnGenericException_ReturnsUnhandledError()
    {
        // Arrange
        var exceptionMessage = "Generic error";
        _mockOgHatRepository.Setup(r => r.DeleteAsync(1, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception(exceptionMessage));

        // Act
        var result = await _ogHatService.DeleteAsync(1, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        result.Message.Should().Be(LinesResources.GetString("lineDeletionFailed", exceptionMessage));
    }

    #endregion
}