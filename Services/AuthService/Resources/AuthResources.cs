using System;
using System.Resources;

namespace AuthService.Resources;

/// <summary>
/// Resource strings for authentication-related messages.
/// </summary>
public static class AuthResources
{
    /// <summary>
    /// Resource strings for authentication-related messages.
    /// </summary>
    private static readonly ResourceManager _resourceManager = new("AuthService.Resources.AuthResources", typeof(AuthResources).Assembly);

    /// <summary>
    /// Retrieves a localized string for the specified key.
    /// </summary>
    /// <param name="key">The key for the resource string.</param>
    /// <param name="args">Optional arguments for formatting the string.</param>
    /// <returns>The localized string.</returns>
    public static string GetString(string key, params object[]? args)
    {
        var format = _resourceManager.GetString(key) ?? key;
        return args == null ? format : string.Format(format, args);
    }
}
