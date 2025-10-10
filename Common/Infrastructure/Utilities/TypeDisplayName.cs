using System;

namespace Conduit3D.Common.Infrastructure.Utilities;

public static class TypeDisplayName
{
    public static string Get(Type type)
    {
        if (type.IsGenericType)
        {
            var genericTypeName = type.GetGenericTypeDefinition().Name;
            var backtickIndex = genericTypeName.IndexOf('`');
            if (backtickIndex > 0)
            {
                genericTypeName = genericTypeName.Substring(0, backtickIndex);
            }

            var genericArgs = type.GetGenericArguments()
                .Select(arg => Get(arg))
                .ToArray();

            return $"{genericTypeName}Of{string.Join("And", genericArgs)}";
        }

        return type.Name;
    }
}
