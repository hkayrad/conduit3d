using System;
using System.ComponentModel.DataAnnotations;

namespace UserService.Infrastructure.DTOs;

public class ConfigDto : IValidatableObject
{
    public required string Key { get; set; }

    public required string Value { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var validationResults = new List<ValidationResult>();

        // Key validation
        if (string.IsNullOrWhiteSpace(Key))
        {
            validationResults.Add(new ValidationResult("Key is required.", [nameof(Key)]));
        }
        else if (Key.Length > 255)
        {
            validationResults.Add(new ValidationResult("Key cannot exceed 255 characters.", [nameof(Key)]));
        }

        // Value validation
        if (string.IsNullOrWhiteSpace(Value))
        {
            validationResults.Add(new ValidationResult("Value is required.", [nameof(Value)]));
        }
        else if (Value.Length > 512)
        {
            validationResults.Add(new ValidationResult("Value cannot exceed 512 characters.", [nameof(Value)]));
        }

        return validationResults;
    }
}
