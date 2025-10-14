using System;
using Conduit3D.Common.Infrastructure.Utilities;
using FluentAssertions;
using Xunit;

namespace Common.UnitTests.Infrastructure.Utilities;

public class ParseTsQueryTests
{
    [Theory]
    [InlineData(null, "")]
    [InlineData("", "")]
    [InlineData(" ", "")]
    [InlineData("   ", "")]
    public void ConvertToTsQuery_WithNullOrWhiteSpaceInput_ReturnsEmptyString(string? query, string expected)
    {
        // Act
        var result = ParseTsQuery.ConvertToTsQuery(query!);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("test", "test:*")]
    [InlineData("hello world", "hello:* & world:*")]
    [InlineData("  leading and trailing spaces  ", "leading:* & and:* & trailing:* & spaces:*")]
    [InlineData("multiple   spaces", "multiple:* & spaces:*")]
    public void ConvertToTsQuery_WithValidInput_ReturnsCorrectTsQuery(string query, string expected)
    {
        // Act
        var result = ParseTsQuery.ConvertToTsQuery(query);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("O'Malley", "O''Malley:*")]
    [InlineData("it's a test", "it''s:* & a:* & test:*")]
    [InlineData("'quotes'", "''quotes'':*")]
    public void ConvertToTsQuery_WithSingleQuotes_CorrectlyEscapesQuotes(string query, string expected)
    {
        // Act
        var result = ParseTsQuery.ConvertToTsQuery(query);

        // Assert
        result.Should().Be(expected);
    }
}
