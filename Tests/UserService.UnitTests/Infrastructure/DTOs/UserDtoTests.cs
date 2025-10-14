using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Conduit3D.Common.Domain;
using FluentAssertions;
using UserService.Infrastructure.DTOs;
using UserService.Resources;
using UserService.UnitTests.Helpers;
using Xunit;

namespace UserService.UnitTests.Infrastructure.DTOs;

public class UserDtoTests
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
        var dto = TestDataGenerator.GenerateUserDto();

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().BeEmpty();
    }

    #region Username Validation

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrWhitespaceUsername_ShouldReturnUsernameNullError(string? invalidUsername)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(username: invalidUsername!);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameNull"));
    }

    [Fact]
    public void Validate_WithUsernameTooLong_ShouldReturnUsernameTooLongError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(username: new string('a', 101));

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameTooLong"));
    }

    [Fact]
    public void Validate_WithUsernameTooShort_ShouldReturnUsernameTooShortError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(username: "ab");

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameTooShort"));
    }

    [Theory]
    [InlineData("invalid-user")]
    [InlineData("invalid user")]
    public void Validate_WithInvalidUsernameFormat_ShouldReturnUsernameInvalidError(string invalidUsername)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(username: invalidUsername);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameInvalid"));
    }

    #endregion

    #region Email Validation

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrWhitespaceEmail_ShouldReturnEmailNullError(string? invalidEmail)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(email: invalidEmail!);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.Email)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("emailNull"));
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("invalid@email")]
    [InlineData("@invalid.com")]
    public void Validate_WithInvalidEmailFormat_ShouldReturnEmailInvalidError(string invalidEmail)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(email: invalidEmail);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.Email)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("emailInvalid"));
    }

    #endregion

    #region UserRole Validation

    [Fact]
    public void Validate_WithInvalidUserRole_ShouldReturnUserRoleInvalidError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(userRole: "InvalidRole");

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.UserRole)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("userRoleInvalid"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrWhitespaceUserRole_ShouldReturnUserRoleNullError(string? invalidUserRole)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(userRole: invalidUserRole!);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.UserRole)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("userRoleNull"));
    }

    #endregion

    #region Name Validation

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrWhitespaceName_ShouldReturnNameNullError(string? invalidName)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(name: invalidName!);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.Name)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("nameNull"));
    }

    [Fact]
    public void Validate_WithNameTooLong_ShouldReturnNameTooLongError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(name: new string('a', 256));

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.Name)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("nameTooLong"));
    }

    [Fact]
    public void Validate_WithNameTooShort_ShouldReturnNameTooShortError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(name: "ab");

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.Name)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("nameTooShort"));
    }

    [Theory]
    [InlineData("Invalid@Name")]
    [InlineData("Name123")]
    public void Validate_WithInvalidNameFormat_ShouldReturnNameInvalidError(string invalidName)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUserDto(name: invalidName);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UserDto.Name)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("nameInvalid"));
    }

    #endregion
}
