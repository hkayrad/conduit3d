using System;
using AuthService.Domain;

namespace AuthService.Infrastructure.DTOs;

/// <summary>
/// Represents a user with an authentication token.
/// </summary>
public class UserWithTokenDto
{
    /// <summary>
    /// The user information.
    /// </summary>
    public required User User { get; set; }

    /// <summary>
    /// The authentication token for the user.
    /// </summary>
    public required string Token { get; set; }
}
