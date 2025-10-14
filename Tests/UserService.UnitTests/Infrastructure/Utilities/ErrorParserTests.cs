using System;
using UserService.Infrastructure.Utilities;
using FluentAssertions;
using Xunit;

namespace UserService.UnitTests.Infrastructure.Utilities;

public class ErrorParserTests
{
    [Theory]
    [InlineData("Npgsql.PostgresException: 23505: duplicate key value violates unique constraint \"ix_users_username\"", "A record with the same username already exists.")]
    [InlineData("Npgsql.PostgresException: 23505: duplicate key value violates unique constraint \"ix_users_email\"", "A record with the same email already exists.")]
    [InlineData("Npgsql.PostgresException: 23505: duplicate key value violates unique constraint \"ix_users_another_unique_field\"", "A record with the same unique field already exists.")]
    [InlineData("23503: insert or update on table \"table\" violates foreign key constraint \"fk_constraint\"", "The operation violates a foreign key constraint.")]
    [InlineData("23502: null value in column \"required_field\" violates not-null constraint", "A required field is missing.")]
    public void ParseDatabaseError_WithSpecificKnownErrors_ShouldReturnFriendlyMessage(string exceptionMessage, string expected)
    {
        // Arrange
        var exception = new Exception(exceptionMessage);

        // Act
        var result = ErrorParser.ParseDatabaseError(exception);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void ParseDatabaseError_WithUnknownError_ShouldReturnOriginalMessage()
    {
        // Arrange
        var exceptionMessage = "An unexpected database error occurred.";
        var exception = new Exception(exceptionMessage);

        // Act
        var result = ErrorParser.ParseDatabaseError(exception);

        // Assert
        result.Should().Be(exceptionMessage);
    }
}
