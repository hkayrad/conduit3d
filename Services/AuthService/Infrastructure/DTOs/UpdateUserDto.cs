using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Infrastructure.DTOs;

public class UpdateUserDto : UserDto
{
    [Required]
    public required string Password { get; set; }
}
