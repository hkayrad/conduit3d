using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Infrastructure.DTOs;

public class UserDto
{
    [Required]
    public required int Id { get; set; }
    [Required]
    [MaxLength(100)]
    public required string Username { get; set; }
    [Required]
    [MaxLength(255)]
    public required string Email { get; set; }
    [Required]
    public required char UserType { get; set; }
}
