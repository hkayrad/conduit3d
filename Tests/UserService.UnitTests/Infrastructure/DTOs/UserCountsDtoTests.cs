using System;
using FluentAssertions;
using UserService.Infrastructure.DTOs;
using UserService.UnitTests.Helpers;
using Xunit;

namespace UserService.UnitTests.Infrastructure.DTOs;

public class UserCountsDtoTests
{
    [Fact]
    public void UserCountsDto_ShouldCorrectlyStoreValues()
    {
        // Arrange
        const int total = 15;
        const int active = 10;
        const int inactive = 5;

        // Act
        var dto = TestDataGenerator.GenerateUserCountsDto(total, active, inactive);

        // Assert
        dto.TotalUsers.Should().Be(total);
        dto.ActiveUsers.Should().Be(active);
        dto.InactiveUsers.Should().Be(inactive);
    }
}
