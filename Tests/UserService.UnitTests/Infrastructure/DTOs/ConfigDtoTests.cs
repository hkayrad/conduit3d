using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using FluentAssertions;
using UserService.Infrastructure.DTOs;
using UserService.Resources;
using UserService.UnitTests.Helpers;
using Xunit;

namespace UserService.UnitTests.Infrastructure.DTOs;

public class ConfigDtoTests
{
    private static List<ValidationResult> ValidateModel(object model)
    {
        var validationContext = new ValidationContext(model, serviceProvider: null, items: null);
        var validationResults = new List<ValidationResult>();
        Validator.TryValidateObject(model, validationContext, validationResults, validateAllProperties: true);
        return validationResults;
    }

    [Fact]
    public void Validate_WithValidData_ShouldReturnNoValidationErrors()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateConfigDto();

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().BeEmpty();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrEmptyKey_ShouldReturnRequiredError(string? invalidKey)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateConfigDto(key: invalidKey!);

        // Act
        var results = ValidateModel(dto);

        // Assert
        var validationResult = results.Should().ContainSingle().Subject;
        validationResult.MemberNames.Should().Contain(nameof(ConfigDto.Key));
    }

    [Fact]
    public void Validate_WithKeyTooLong_ShouldReturnMaxLengthError()
    {
        // Arrange
        var longKey = new string('a', 256);
        var dto = TestDataGenerator.GenerateConfigDto(key: longKey);

        // Act
        var results = ValidateModel(dto);

        // Assert
        var validationResult = results.Should().ContainSingle().Subject;
        validationResult.MemberNames.Should().Contain(nameof(ConfigDto.Key));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrEmptyValue_ShouldReturnRequiredError(string? invalidValue)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateConfigDto(value: invalidValue!);

        // Act
        var results = ValidateModel(dto);

        // Assert
        var validationResult = results.Should().ContainSingle().Subject;
        validationResult.MemberNames.Should().Contain(nameof(ConfigDto.Value));
    }

    [Fact]
    public void Validate_WithValueTooLong_ShouldReturnMaxLengthError()
    {
        // Arrange
        var longValue = new string('a', 513);
        var dto = TestDataGenerator.GenerateConfigDto(value: longValue);

        // Act
        var results = ValidateModel(dto);

        // Assert
        var validationResult = results.Should().ContainSingle().Subject;
        validationResult.MemberNames.Should().Contain(nameof(ConfigDto.Value));
    }
}
