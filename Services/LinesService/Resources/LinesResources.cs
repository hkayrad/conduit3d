using System;
using System.Resources;

namespace LinesService.Resources;

public static class LinesResources
{
    private static readonly ResourceManager _resourceManager = new("LinesService.Resources.LinesResources", typeof(LinesResources).Assembly);

    public static string GetString(string key, params object[]? args)
    {
        var format = _resourceManager.GetString(key) ?? key;
        return args == null ? format : string.Format(format, args);
    }
}
