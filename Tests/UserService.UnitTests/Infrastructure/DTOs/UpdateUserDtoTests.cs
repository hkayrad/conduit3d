using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.InteropServices;
using Conduit3D.Common.Domain;
using FluentAssertions;
using UserService.Infrastructure.DTOs;
using UserService.Resources;
using UserService.UnitTests.Helpers;
using Xunit;

namespace UserService.UnitTests.Infrastructure.DTOs;

public class UpdateUserDtoTests
{
    private static List<ValidationResult> ValidateModel(object model)
    {
        var validationContext = new ValidationContext(model, serviceProvider: null, items: null);
        var validationResults = new List<ValidationResult>();
        Validator.TryValidateObject(model, validationContext, validationResults, validateAllProperties: true);
        return validationResults;
    }

    [Fact]
    public void Validate_WithAllValidProperties_ShouldReturnNoValidationErrors()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUpdateUserDto();

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().BeEmpty();
    }

    [Fact]
    public void Validate_WithAllNullProperties_ShouldReturnNoValidationErrors()
    {
        // Arrange
        var dto = new UpdateUserDto();
        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().BeEmpty();
    }

    #region Property Validation Tests

    [Fact]
    public void Validate_WithUsernameTooLong_ShouldReturnUsernameTooLongError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUpdateUserDto(username: new string('a', 101));

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UpdateUserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameTooLong"));
    }

    [Fact]
    public void Validate_WithUsernameTooShort_ShouldReturnUsernameTooShortError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUpdateUserDto(username: "ab");

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UpdateUserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameTooShort"));
    }

    [Theory]
    [InlineData("invalid user")]
    [InlineData("invalid!")]
    public void Validate_WithInvalidUsernameFormat_ShouldReturnUsernameInvalidError(string invalidUsername)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUpdateUserDto(username: invalidUsername);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UpdateUserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameInvalid"));
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("invalid@email")]
    [InlineData("@invalid.com")]
    public void Validate_WithInvalidEmailFormat_ShouldReturnEmailInvalidError(string invalidEmail)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUpdateUserDto(email: invalidEmail);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UpdateUserDto.Email)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("emailInvalid"));
    }

    [Fact]
    public void Validate_WithInvalidUserRole_ShouldReturnUserRoleInvalidError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUpdateUserDto(userRole: "InvalidRole");

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UpdateUserDto.UserRole)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("userRoleInvalid"));
    }

    [Fact]
    public void Validate_WithNameTooLong_ShouldReturnNameTooLongError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUpdateUserDto(name: new string('a', 256));

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UpdateUserDto.Name)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("nameTooLong"));
    }

    [Fact]
    public void Validate_WithNameTooShort_ShouldReturnNameTooShortError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUpdateUserDto(name: "A");

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UpdateUserDto.Name)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("nameTooShort"));
    }

    [Theory]
    [InlineData("Invalid@Name")] // Invalid character '@'
    [InlineData("Name#With$Special%Chars")] // Special characters
    [InlineData("Name123")] // Numbers
    public void Validate_WithInvalidNameFormat_ShouldReturnNameInvalidError(string invalidName)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUpdateUserDto(name: invalidName);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UpdateUserDto.Name)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("nameInvalid"));
    }

    [Theory]
    [InlineData("short")]       // Too short
    [InlineData("nouppercase1")] // No uppercase letter
    [InlineData("NOLOWERCASE1")] // No lowercase letter
    [InlineData("NoNumber")]    // No number
    public void Validate_WithInvalidPasswordFormat_ShouldReturnPasswordInvalidError(string invalidPassword)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateUpdateUserDto(password: invalidPassword);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(UpdateUserDto.Password)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("passwordInvalid"));
    }

    #endregion
}
