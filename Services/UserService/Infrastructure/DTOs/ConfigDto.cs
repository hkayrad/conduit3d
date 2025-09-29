using System;
using System.ComponentModel.DataAnnotations;

namespace UserService.Infrastructure.DTOs;

public class ConfigDto
{
    [MaxLength(255)]
    public required string Key { get; set; }

    [MaxLength(255)]
    public required string Value { get; set; }
}
