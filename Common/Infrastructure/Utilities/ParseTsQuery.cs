using System;

namespace Conduit3D.Common.Infrastructure.Utilities;

public static class ParseTsQuery
{
    public static string ConvertToTsQuery(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return string.Empty;

        // Split the query into terms based on whitespace
        var terms = query.Split([' '], StringSplitOptions.RemoveEmptyEntries);

        // Append ':*' to each term for prefix matching
        for (int i = 0; i < terms.Length; i++)
        {
            // Escape single quotes in terms to prevent SQL injection
            terms[i] = terms[i].Replace("'", "''") + ":*";
        }

        // Join the terms with ' & ' to form the final tsquery string
        return string.Join(" & ", terms);
    }
}
