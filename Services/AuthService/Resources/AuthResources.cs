using System;
using System.Resources;

namespace AuthService.Resources;

public static class AuthResources
{
    private static readonly ResourceManager _resourceManager = new("AuthService.Resources.AuthResources", typeof(AuthResources).Assembly);

    public static string GetString(string key, params object[]? args)
    {
        var format = _resourceManager.GetString(key) ?? key;
        return args == null ? format : string.Format(format, args);
    }
}
