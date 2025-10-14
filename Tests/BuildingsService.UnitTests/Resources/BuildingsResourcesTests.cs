using System;
using FluentAssertions;
using BuildingsService.Resources;
using Xunit;

namespace BuildingsService.UnitTests.Resources;

public class BuildingsResourcesTests
{
    [Fact]
    public void GetString_WithNonExistentKeyAndNoArgs_ShouldReturnKey()
    {
        // Arrange
        var key = "ThisKeyShouldNotExistInResources";

        // Act
        var result = BuildingsResources.GetString(key);

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
        var result = BuildingsResources.GetString(key, args);

        // Assert
        result.Should().Be(key);
    }

    [Fact]
    public void GetString_WithNullKey_ShouldReturnNull()
    {
        // Act
        var result = BuildingsResources.GetString(null!);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void GetString_WithEmptyKey_ShouldReturnEmptyString()
    {
        // Act & Assert
        BuildingsResources.GetString(string.Empty).Should().Be(string.Empty);
    }

    [Fact]
    public void GetString_WithFormattableKeyAndArgs_ShouldReturnFormattedString()
    {
        // Arrange
        // This key simulates a resource string with format placeholders.
        // Since the key doesn't exist in resources, it will be used as the format string itself.
        var key = "Building '{0}' with ID {1} was not found.";
        var args = new object[] { "testBuilding", 123 };
        var expected = "Building 'testBuilding' with ID 123 was not found.";

        // Act
        var result = BuildingsResources.GetString(key, args);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void GetString_WithFormattableKeyAndNoArgs_ShouldReturnKey()
    {
        // Arrange
        var key = "Building '{0}' with ID {1} was not found.";

        // Act
        var result = BuildingsResources.GetString(key);

        // Assert
        result.Should().Be(key);
    }
}
