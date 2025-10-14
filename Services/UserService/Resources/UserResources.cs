using System;
using System.Resources;

namespace UserService.Resources;

/// <summary>
/// Resource strings for authentication-related messages.
/// </summary>
public static class UserResources
{
    /// <summary>
    /// Resource strings for authentication-related messages.
    /// </summary>
    private static readonly ResourceManager _resourceManager = new("UserService.Resources.UserResources", typeof(UserResources).Assembly);

    /// <summary>
    /// Retrieves a localized string for the specified key.
    /// </summary>
    /// <param name="key">The key for the resource string.</param>
    /// <param name="args">Optional arguments for formatting the string.</param>
    /// <returns>The localized string.</returns>
    public static string GetString(string key, params object[]? args)
    {
        if (key is null)
        {
            return null!;
        }

        var format = _resourceManager.GetString(key) ?? key;
        return args == null || args.Length == 0 ? format : string.Format(format, args);
    }
}
