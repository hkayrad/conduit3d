using System;
using Microsoft.EntityFrameworkCore;

namespace Conduit3D.Common.Helpers;

public static class DbContextConfiguration
{
    public static void Configure(DbContextOptionsBuilder options, bool useNetTopology = true)
    {
        // Get PostgreSQL connection string
        string? postgresqlConnectionString = Environment.GetEnvironmentVariable("POSTGRESQL_CONNECTION_STRING");

        // Validate the connection string
        if (string.IsNullOrEmpty(postgresqlConnectionString))
            throw new InvalidOperationException("POSTGRESQL_CONNECTION_STRING environment variable is not set.");

        options.UseNpgsql(postgresqlConnectionString,
        o =>
        {
            if (useNetTopology)
            {
                o.UseNetTopologySuite();
            }
        });
    }
}
