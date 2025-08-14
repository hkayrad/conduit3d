using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using AuthService.Resources;

namespace AuthService.Infrastructure.DTOs;

public class LoginUserDto : IValidatableObject
{
    [Required]
    [MaxLength(100)]
    public required string Username { get; set; }
    [Required]
    public required string Password { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Username))
            yield return new ValidationResult(AuthResources.GetString("usernameNull"), [nameof(Username)]);
        else
        {
            if (Username.Length > 100)
                yield return new ValidationResult(AuthResources.GetString("usernameTooLong"), [nameof(Username)]);

            if (Username.Length < 3)
                yield return new ValidationResult(AuthResources.GetString("usernameTooShort"), [nameof(Username)]);
        }

        if (string.IsNullOrWhiteSpace(Password))
            yield return new ValidationResult(AuthResources.GetString("passwordNull"), [nameof(Password)]);
        else if (!Regex.IsMatch(Password, @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"))
            yield return new ValidationResult(AuthResources.GetString("passwordInvalid"), [nameof(Password)]);
    }
}
