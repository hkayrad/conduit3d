using System;

namespace UserService.Infrastructure.Utilities;

public static class ErrorParser
{
    public static string ParseDatabaseError(Exception ex)
    {
        // Example parsing logic; customize based on actual exception structure
        if (ex.Message.Contains("duplicate key value"))
        {
            if (ex.Message.Contains("username"))
                return "A record with the same username already exists.";
            else if (ex.Message.Contains("email"))
                return "A record with the same email already exists.";
            else
                return "A record with the same unique field already exists.";
        }
        else if (ex.Message.Contains("violates foreign key constraint"))
            return "The operation violates a foreign key constraint.";
        else if (ex.Message.Contains("null value in column"))
            return "A required field is missing.";

        return ex.Message;
    }
}
