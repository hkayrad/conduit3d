using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Infrastructure.DTOs;

public class UserDto
{
    [Required]
    [MaxLength(100)]
    public required string Username { get; set; }
    [Required]
    [MaxLength(255)]
    public required string Email { get; set; }
    [Required]
    [MaxLength(10)]
    public required string UserRole { get; set; }
    [Required]
    [MaxLength(255)]
    public required string Name { get; set; }
}
