using System;
using System.Linq;
using FluentAssertions;
using Microsoft.IdentityModel.JsonWebTokens;
using UserService.Domain;
using UserService.Infrastructure.Utilities;
using UserService.UnitTests.Helpers;
using Xunit;

namespace UserService.UnitTests.Infrastructure.Utilities;

public class TokenProviderTests : IDisposable
{
    private const string TestIssuer = "test-issuer";
    private const string TestAudience = "test-audience";
    private const string TestSecret = "a-very-secure-secret-key-for-testing-that-is-long-enough";
    private const string TestExpirationHrs = "1";

    public TokenProviderTests()
    {
        // Set environment variables before each test
        Environment.SetEnvironmentVariable("JWT_ISSUER", TestIssuer);
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", TestAudience);
        Environment.SetEnvironmentVariable("JWT_SECRET", TestSecret);
        Environment.SetEnvironmentVariable("JWT_EXPIRATION_TIME_HRS", TestExpirationHrs);
    }

    public void Dispose()
    {
        // Clean up environment variables after each test
        Environment.SetEnvironmentVariable("JWT_ISSUER", null);
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", null);
        Environment.SetEnvironmentVariable("JWT_SECRET", null);
        Environment.SetEnvironmentVariable("JWT_EXPIRATION_TIME_HRS", null);
        GC.SuppressFinalize(this);
    }

    [Fact]
    public void GenerateToken_WithValidEnvironmentVariables_ShouldCreateValidToken()
    {
        // Arrange
        var user = TestDataGenerator.GenerateTestUser();

        // Act
        var token = TokenProvider.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();

        var handler = new JsonWebTokenHandler();
        var jsonToken = handler.ReadJsonWebToken(token);

        jsonToken.Issuer.Should().Be(TestIssuer);
        jsonToken.Audiences.Should().Contain(TestAudience);
        jsonToken.Subject.Should().Be(user.Username);
        jsonToken.Claims.Should().ContainSingle(c => c.Type == JwtRegisteredClaimNames.Email).Which.Value.Should().Be(user.Email);
        jsonToken.Claims.Should().ContainSingle(c => c.Type == "user_role").Which.Value.Should().Be(user.UserRole);
    }

    [Theory]
    [InlineData("JWT_ISSUER", "JWT_ISSUER environment variable is not set.")]
    [InlineData("JWT_AUDIENCE", "JWT_AUDIENCE environment variable is not set.")]
    [InlineData("JWT_SECRET", "JWT_SECRET environment variable is not set.")]
    [InlineData("JWT_EXPIRATION_TIME_HRS", "JWT_EXPIRATION_TIME_HRS environment variable is not set.")]
    public void GenerateToken_WhenEnvironmentVariableIsMissing_ShouldThrowInvalidOperationException(string variableToUnset, string expectedMessage)
    {
        // Arrange
        Environment.SetEnvironmentVariable(variableToUnset, null);
        var user = TestDataGenerator.GenerateTestUser();

        // Act & Assert
        Action act = () => TokenProvider.GenerateToken(user);
        act.Should().Throw<InvalidOperationException>()
            .WithMessage(expectedMessage);
    }

    [Fact]
    public void GenerateToken_WhenExpirationIsInvalid_ShouldThrowInvalidOperationException()
    {
        // Arrange
        Environment.SetEnvironmentVariable("JWT_EXPIRATION_TIME_HRS", "not-a-number");
        var user = TestDataGenerator.GenerateTestUser();

        // Act & Assert
        Action act = () => TokenProvider.GenerateToken(user);
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("JWT_EXPIRATION_TIME_HRS environment variable is not set.");
    }
}
