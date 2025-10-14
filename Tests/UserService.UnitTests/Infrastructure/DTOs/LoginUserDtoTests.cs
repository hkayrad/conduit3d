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

public class LoginUserDtoTests
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
        var dto = TestDataGenerator.GenerateLoginUserDto();

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().BeEmpty();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrWhitespaceUsername_ShouldReturnUsernameNullError(string? invalidUsername)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateLoginUserDto(username: invalidUsername!);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(LoginUserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameNull"));
    }

    [Fact]
    public void Validate_WithUsernameTooLong_ShouldReturnUsernameTooLongError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateLoginUserDto(username: new string('a', 101));

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(LoginUserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameTooLong"));
    }

    [Fact]
    public void Validate_WithUsernameTooShort_ShouldReturnUsernameTooShortError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateLoginUserDto(username: "ab");

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(LoginUserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameTooShort"));
    }

    [Theory]
    [InlineData("invalid-user")]
    [InlineData("invalid user")]
    [InlineData("invalid!")]
    public void Validate_WithInvalidUsernameFormat_ShouldReturnUsernameInvalidError(string invalidUsername)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateLoginUserDto(username: invalidUsername);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(LoginUserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameInvalid"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrWhitespacePassword_ShouldReturnPasswordNullError(string? invalidPassword)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateLoginUserDto(password: invalidPassword!);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(LoginUserDto.Password)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("passwordNull"));
    }
}
