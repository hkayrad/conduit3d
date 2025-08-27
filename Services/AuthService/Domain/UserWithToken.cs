using System;

namespace AuthService.Domain;

public class UserWithToken
{
    public User User { get; set; }
    public string Token { get; set; }
}
