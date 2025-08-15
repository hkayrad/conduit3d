using System;

namespace AuthService.Domain;

public static class Roles
{
    public const string Admin = "admin";
    public const string User = "user";
    public static readonly string[] AllowedRoles = [Admin, User];
}
