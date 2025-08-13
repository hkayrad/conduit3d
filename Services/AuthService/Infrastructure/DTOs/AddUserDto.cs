using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Infrastructure.DTOs;

public class AddUserDto : UserDto
{
    [Required]
    public required string Password { get; set; }
}
