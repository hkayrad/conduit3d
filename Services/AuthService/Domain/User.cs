using System;
using Microsoft.AspNetCore.Identity;

namespace AuthService.Domain;

public class User
{
    public required int Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required char UserType { get; set; }
}
