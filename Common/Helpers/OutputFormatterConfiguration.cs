using System;
using Conduit3D.Common.Infrastructure.Formatters;
using Microsoft.AspNetCore.Mvc;

namespace Conduit3D.Common.Helpers;

public static class OutputFormatterConfiguration
{
    public static void AddOutputFormatters(MvcOptions options)
    {
        options.OutputFormatters.Add(new ProtobufOutputFormatter());
    }
}
