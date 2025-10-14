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

public class AddUserDtoTests
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
        var dto = TestDataGenerator.GenerateAddUserDto();

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().BeEmpty();
    }

    #region Password Validation

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrWhitespacePassword_ShouldReturnPasswordNullError(string invalidPassword)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateAddUserDto(password: invalidPassword);

        // Act
        var results = ValidateModel(dto);

        // Assert
        var validationResult = results.Should().ContainSingle().Subject;
        validationResult.ErrorMessage.Should().Be(UserResources.GetString("passwordNull"));
        validationResult.MemberNames.Should().Contain(nameof(AddUserDto.Password));
    }   

    [Theory]
    [InlineData("short")]       // Too short
    [InlineData("nouppercase1")] // No uppercase letter
    [InlineData("NOLOWERCASE1")] // No lowercase letter
    [InlineData("NoNumber")]    // No number
    public void Validate_WithInvalidPasswordFormat_ShouldReturnPasswordInvalidError(string invalidPassword)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateAddUserDto(password: invalidPassword);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(AddUserDto.Password)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("passwordInvalid"));
    }

    #endregion

    #region Base DTO (UserDto) Validation

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrWhitespaceUsername_ShouldReturnUsernameNullError(string invalidUsername)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateAddUserDto(username: invalidUsername);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(AddUserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameNull"));
    }

    [Fact]
    public void Validate_WithUsernameTooShort_ShouldReturnUsernameTooShortError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateAddUserDto(username: "ab");

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(AddUserDto.Username)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("usernameTooShort"));
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("invalid@email")]
    [InlineData("@invalid.com")]
    public void Validate_WithInvalidEmailFormat_ShouldReturnEmailInvalidError(string invalidEmail)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateAddUserDto(email: invalidEmail);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(AddUserDto.Email)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("emailInvalid"));
    }

    [Fact]
    public void Validate_WithInvalidUserRole_ShouldReturnUserRoleInvalidError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateAddUserDto(userRole: "InvalidRole");

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(AddUserDto.UserRole)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("userRoleInvalid"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    public void Validate_WithNullOrWhitespaceName_ShouldReturnNameNullError(string invalidName)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateAddUserDto(name: invalidName);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(AddUserDto.Name)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("nameNull"));
    }

    [Fact]
    public void Validate_WithNameTooShort_ShouldReturnNameTooShortError()
    {
        // Arrange
        var dto = TestDataGenerator.GenerateAddUserDto(name: "ab");

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(AddUserDto.Name)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("nameTooShort"));
    }

    [Theory]
    [InlineData("Invalid@Name")]
    [InlineData("Name123")]
    public void Validate_WithInvalidNameFormat_ShouldReturnNameInvalidError(string invalidName)
    {
        // Arrange
        var dto = TestDataGenerator.GenerateAddUserDto(name: invalidName);

        // Act
        var results = ValidateModel(dto);

        // Assert
        results.Should().ContainSingle(r => r.MemberNames.Contains(nameof(AddUserDto.Name)))
            .Which.ErrorMessage.Should().Be(UserResources.GetString("nameInvalid"));
    }

    #endregion
}
