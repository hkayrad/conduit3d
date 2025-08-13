using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain;

public class User
{
    public int Id { get; set; }
    [MaxLength(100)]
    public required string Username { get; set; }
    [MaxLength(255)]
    public required string Email { get; set; }
    [MaxLength(10)]
    public required string UserRole { get; set; }
    [MaxLength(255)]
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
}
