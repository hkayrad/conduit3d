using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using AuthService.Resources;

namespace AuthService.Infrastructure.DTOs;

public class UpdateUserDto : IValidatableObject
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? UserRole { get; set; }
    public string? Name { get; set; }
    public required string Password { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Password))
            yield return new ValidationResult(AuthResources.GetString("passwordNull"), [nameof(Password)]);
        else if (!Regex.IsMatch(Password, @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"))
            yield return new ValidationResult(AuthResources.GetString("passwordInvalid"), [nameof(Password)]);
    }
}
