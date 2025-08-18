using System;
using System.Resources;

namespace PolesService.Resources;

public static class PolesResources
{
    private static readonly ResourceManager _resourceManager = new("PolesService.Resources.PolesResources", typeof(PolesResources).Assembly);

    public static string GetString(string key, params object[]? args)
    {
        var format = _resourceManager.GetString(key) ?? key;
        return args == null ? format : string.Format(format, args);
    }
}
