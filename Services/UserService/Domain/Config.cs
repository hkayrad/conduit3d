using System;
using System.ComponentModel.DataAnnotations;

namespace UserService.Domain;

public class Config
{
    [Key]
    [MaxLength(255)]
    public required string Key { get; set; }

    [MaxLength(512)]
    public required string Value { get; set; }
}