using System;
using FluentAssertions;
using UserService.Infrastructure.DTOs;
using UserService.UnitTests.Helpers;
using Xunit;

namespace UserService.UnitTests.Infrastructure.DTOs;

public class UserWithTokenDtoTests
{
    [Fact]
    public void UserWithTokenDto_ShouldCorrectlyStoreValues()
    {
        // Arrange
        var testUser = TestDataGenerator.GenerateTestUser();
        const string testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

        // Act
        var dto = TestDataGenerator.GenerateUserWithTokenDto(testUser, testToken);

        // Assert
        dto.User.Should().BeEquivalentTo(testUser);
        dto.Token.Should().Be(testToken);
    }
}
