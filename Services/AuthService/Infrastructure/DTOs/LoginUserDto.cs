using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using AuthService.Resources;

namespace AuthService.Infrastructure.DTOs;

/// <summary>
/// Data transfer object for logging in a user.
/// </summary>
public class LoginUserDto : IValidatableObject
{
    /// <summary>
    /// The username of the user.
    /// </summary>
    [Required]
    [MaxLength(100)]
    public required string Username { get; set; }

    /// <summary>
    /// The password of the user.
    /// </summary>
    [Required]
    public required string Password { get; set; }

    /// <summary>
    /// Validates the properties of the user DTO.
    /// </summary>
    /// <param name="validationContext">Validation context for the user DTO.</param>
    /// <returns>A collection of validation results.</returns>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Username null check
        if (string.IsNullOrWhiteSpace(Username))
            yield return new ValidationResult(AuthResources.GetString("usernameNull"), [nameof(Username)]);
        else
        {
            // Username max length check
            if (Username.Length > 100)
                yield return new ValidationResult(AuthResources.GetString("usernameTooLong"), [nameof(Username)]);

            // Username min length check
            if (Username.Length < 3)
                yield return new ValidationResult(AuthResources.GetString("usernameTooShort"), [nameof(Username)]);

            // Username format check
            if (!Regex.IsMatch(Username, @"^[a-zA-Z0-9_]+$"))
                yield return new ValidationResult(AuthResources.GetString("usernameInvalid"), [nameof(Username)]);
        }

        // Password null check
        if (string.IsNullOrWhiteSpace(Password))
            yield return new ValidationResult(AuthResources.GetString("passwordNull"), [nameof(Password)]);
    }
}
