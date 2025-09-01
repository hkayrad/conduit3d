using System;

namespace Conduit3D.Common.Domain;

/// <summary>
/// Represents the different roles within the application.
/// </summary>
public static class Roles
{
    /// <summary>
    /// The administrator role, with full access to all resources.
    /// </summary>
    public const string Admin = "admin";

    /// <summary>
    /// The user role, with limited access to resources.
    /// </summary>
    public const string User = "user";

    /// <summary>
    /// The list of all allowed roles within the application.
    /// </summary>
    public static readonly string[] AllowedRoles = [Admin, User];
}
