using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using UserService.Resources;

namespace UserService.Infrastructure.DTOs;

/// <summary>
/// Data transfer object for adding a new user.
/// </summary>
public class AddUserDto : UserDto, IValidatableObject
{
    /// <summary>
    /// The password for the new user.
    /// </summary>
    public required string Password { get; set; }

    /// <summary>
    /// Validates the properties of the user DTO.
    /// </summary>
    /// <param name="validationContext">Validation context for the user DTO.</param>
    /// <returns>A collection of validation results.</returns>
    public override IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Call base class validation
        foreach (var result in base.Validate(validationContext))
        {
            yield return result;
        }

        // Password null check
        if (string.IsNullOrWhiteSpace(Password))
            yield return new ValidationResult(UserResources.GetString("passwordNull"), [nameof(Password)]);
        // Password complexity check
        else if (!Regex.IsMatch(Password, @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$", RegexOptions.None, TimeSpan.FromMilliseconds(250)))
            yield return new ValidationResult(UserResources.GetString("passwordInvalid"), [nameof(Password)]);
    }
}
