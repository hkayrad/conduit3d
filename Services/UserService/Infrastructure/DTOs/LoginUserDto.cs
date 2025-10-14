using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using UserService.Resources;

namespace UserService.Infrastructure.DTOs;

/// <summary>
/// Data transfer object for logging in a user.
/// </summary>
public class LoginUserDto : IValidatableObject
{
    /// <summary>
    /// The username of the user.
    /// </summary>
    public required string Username { get; set; }

    /// <summary>
    /// The password of the user.
    /// </summary>
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
            yield return new ValidationResult(UserResources.GetString("usernameNull"), [nameof(Username)]);
        else
        {
            // Username max length check
            if (Username.Length > 100)
                yield return new ValidationResult(UserResources.GetString("usernameTooLong"), [nameof(Username)]);

            // Username min length check
            if (Username.Length < 3)
                yield return new ValidationResult(UserResources.GetString("usernameTooShort"), [nameof(Username)]);

            // Username format check
            if (!Regex.IsMatch(Username, @"^[a-zA-Z0-9_]+$", RegexOptions.None, TimeSpan.FromMilliseconds(250)))
                yield return new ValidationResult(UserResources.GetString("usernameInvalid"), [nameof(Username)]);
        }

        // Password null check
        if (string.IsNullOrWhiteSpace(Password))
            yield return new ValidationResult(UserResources.GetString("passwordNull"), [nameof(Password)]);
    }
}
