using System;
using Conduit3D.Common.Infrastructure.Utilities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Conduit3D.Common.Helpers;

public static class SwaggerConfiguration
{
    public static void Configure(SwaggerGenOptions config, int majorVersion, string serviceName)
    {
        config.SwaggerDoc($"v{majorVersion}", new OpenApiInfo { Title = $"Conduit3D {serviceName} API", Version = $"v{majorVersion}" });

        // Use custom schema IDs to handle pbf and generic types collisions
        config.CustomSchemaIds(type =>
        {
            if (type.IsGenericType)
            {
                var genericTypeName = type.GetGenericTypeDefinition().Name;

                // Remove generic type suffixes like `1, `2, etc.
                var backtickIndex = genericTypeName.IndexOf('`');
                if (backtickIndex > 0)
                {
                    genericTypeName = genericTypeName.Substring(0, backtickIndex);
                }

                // Get all generic arguments and build their names recursively
                var genericArgs = type.GetGenericArguments()
                    .Select(arg => TypeDisplayName.Get(arg))
                    .ToArray();

                return $"{genericTypeName}Of{string.Join("And", genericArgs)}";
            }
            return type.Name;
        });

        // Configure JWT authentication
        config.AddSecurityDefinition("bearerAuth", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "JWT Authorization header using the Bearer scheme."
        });

        config.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "bearerAuth"
                }
            },
            Array.Empty<string>()
        }
    });
    }
}
