using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Infrastructure.DTOs;

public class LoginUserDto
{
    [Required]
    [MaxLength(100)]
    public required string Username { get; set; }
    [Required]
    public required string Password { get; set; }
}
