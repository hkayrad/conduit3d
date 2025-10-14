using System;
using FluentAssertions;
using PolesService.Resources;
using Xunit;

namespace PolesService.UnitTests.Resources;

public class PolesResourcesTests
{
    [Fact]
    public void GetString_WithNonExistentKeyAndNoArgs_ShouldReturnKey()
    {
        // Arrange
        var key = "ThisKeyShouldNotExistInResources";

        // Act
        var result = PolesResources.GetString(key);

        // Assert
        result.Should().Be(key);
    }

    [Fact]
    public void GetString_WithNonExistentKeyAndArgs_ShouldReturnKey()
    {
        // Arrange
        var key = "ThisKeyShouldNotExistInResources";
        var args = new object[] { "arg1", 123 };

        // Act
        var result = PolesResources.GetString(key, args);

        // Assert
        result.Should().Be(key);
    }

    [Fact]
    public void GetString_WithNullKey_ShouldReturnNull()
    {
        // Act
        var result = PolesResources.GetString(null!);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void GetString_WithEmptyKey_ShouldReturnEmptyString()
    {
        // Act & Assert
        PolesResources.GetString(string.Empty).Should().Be(string.Empty);
    }

    [Fact]
    public void GetString_WithFormattableKeyAndArgs_ShouldReturnFormattedString()
    {
        // Arrange
        // This key simulates a resource string with format placeholders.
        // Since the key doesn't exist in resources, it will be used as the format string itself.
        var key = "Pole '{0}' with ID {1} was not found.";
        var args = new object[] { "testPole", 123 };
        var expected = "Pole 'testPole' with ID 123 was not found.";

        // Act
        var result = PolesResources.GetString(key, args);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void GetString_WithFormattableKeyAndNoArgs_ShouldReturnKey()
    {
        // Arrange
        var key = "Pole '{0}' with ID {1} was not found.";

        // Act
        var result = PolesResources.GetString(key);

        // Assert
        result.Should().Be(key);
    }
}
