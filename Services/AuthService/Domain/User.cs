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
    [MaxLength(1)]
    public required string UserType { get; set; }
    [MaxLength(255)]
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
}
