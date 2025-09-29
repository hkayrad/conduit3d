using System;

namespace UserService.Infrastructure.DTOs;

public class UserCountsDto
{
    public required int TotalUsers { get; set; }
    public required int ActiveUsers { get; set; }
    public required int InactiveUsers { get; set; }
}
