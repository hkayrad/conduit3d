using System;
using Asp.Versioning;
using Asp.Versioning.ApiExplorer;

namespace Conduit3D.Common.Helpers;

public static class VersioningConfiguration
{
    public static void AddVersioning(ApiVersioningOptions options)
    {
        options.DefaultApiVersion = new ApiVersion(1, 0);
        options.AssumeDefaultVersionWhenUnspecified = true;
        options.ReportApiVersions = true;
        options.ApiVersionReader = ApiVersionReader.Combine(
            new UrlSegmentApiVersionReader(),
            new HeaderApiVersionReader("x-api-version")
        );
    }

    public static void AddExplorer(ApiExplorerOptions options)
    {
        options.GroupNameFormat = "'v'VVV";
        options.SubstituteApiVersionInUrl = true;
    }
}
