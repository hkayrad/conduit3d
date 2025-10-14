using System;
using System.Collections.Generic;
using Conduit3D.Common.Infrastructure.Utilities;
using FluentAssertions;
using Xunit;

namespace Common.UnitTests.Infrastructure.Utilities;

public class TypeDisplayNameTests
{
    private class TestClass
    {
    }

    [Theory]
    [InlineData(typeof(string), "String")]
    [InlineData(typeof(int), "Int32")]
    [InlineData(typeof(double), "Double")]
    [InlineData(typeof(TestClass), "TestClass")]
    public void Get_WithNonGenericType_ReturnsTypeName(Type type, string expectedName)
    {
        // Act
        var result = TypeDisplayName.Get(type);

        // Assert
        result.Should().Be(expectedName);
    }

    [Fact]
    public void Get_WithSingleGenericArgument_ReturnsCorrectlyFormattedName()
    {
        // Arrange
        var type = typeof(List<string>);
        const string expectedName = "ListOfString";

        // Act
        var result = TypeDisplayName.Get(type);

        // Assert
        result.Should().Be(expectedName);
    }

    [Fact]
    public void Get_WithMultipleGenericArguments_ReturnsCorrectlyFormattedName()
    {
        // Arrange
        var type = typeof(Dictionary<int, string>);
        const string expectedName = "DictionaryOfInt32AndString";

        // Act
        var result = TypeDisplayName.Get(type);

        // Assert
        result.Should().Be(expectedName);
    }

    [Fact]
    public void Get_WithNullType_ThrowsArgumentNullException()
    {
        // Act
        Action act = () => TypeDisplayName.Get(null!);

        // Assert
        act.Should().Throw<NullReferenceException>();
    }

    [Fact]
    public void Get_WithNestedGenericType_ReturnsCorrectlyFormattedName()
    {
        // Arrange
        var type = typeof(List<Dictionary<string, TestClass>>);
        const string expectedName = "ListOfDictionaryOfStringAndTestClass";

        // Act
        var result = TypeDisplayName.Get(type);

        // Assert
        result.Should().Be(expectedName);
    }
}
