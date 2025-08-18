using System;
using System.Resources;

namespace BuildingsService.Resources;

public static class BuildingsResources
{
    private static readonly ResourceManager _resourceManager = new("BuildingsService.Resources.BuildingsResources", typeof(BuildingsResources).Assembly);

    public static string GetString(string key, params object[]? args)
    {
        var format = _resourceManager.GetString(key) ?? key;
        return args == null ? format : string.Format(format, args);
    }
}
