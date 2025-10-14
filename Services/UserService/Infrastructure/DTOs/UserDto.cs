using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using UserService.Resources;
using Conduit3D.Common.Domain;

namespace UserService.Infrastructure.DTOs;

/// <summary>
/// Data transfer object for a user.
/// </summary>
public class UserDto : IValidatableObject
{
    /// <summary>
    /// The username of the user.
    /// </summary>
    public required string Username { get; set; }

    /// <summary>
    /// The email of the user.
    /// </summary>
    public required string Email { get; set; }

    /// <summary>
    /// The role of the user.
    /// </summary>
    public required string UserRole { get; set; }

    /// <summary>
    /// The name of the user.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Indicates whether the user is active.
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Validates the properties of the user DTO.
    /// </summary>
    /// <param name="validationContext">Validation context for the user DTO.</param>
    /// <returns>A collection of validation results.</returns>
    public virtual IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
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

        // Email null check
        if (string.IsNullOrWhiteSpace(Email))
            yield return new ValidationResult(UserResources.GetString("emailNull"), [nameof(Email)]);
        // Email format check
        else if (!Regex.IsMatch(Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.None, TimeSpan.FromMilliseconds(250)))
            yield return new ValidationResult(UserResources.GetString("emailInvalid"), [nameof(Email)]);

        // UserRole null check
        if (string.IsNullOrWhiteSpace(UserRole))
            yield return new ValidationResult(UserResources.GetString("userRoleNull"), [nameof(UserRole)]);
        else
        {
            // UserRole validity check
            var allowedRoles = Roles.AllowedRoles;
            if (!Array.Exists(allowedRoles, r => r.Equals(UserRole, StringComparison.OrdinalIgnoreCase)))
                yield return new ValidationResult(UserResources.GetString("userRoleInvalid"), [nameof(UserRole)]);
        }

        // Name null check
        if (string.IsNullOrWhiteSpace(Name))
            yield return new ValidationResult(UserResources.GetString("nameNull"), [nameof(Name)]);
        else
        {
            // Name max length check
            if (Name.Length > 255)
                yield return new ValidationResult(UserResources.GetString("nameTooLong"), [nameof(Name)]);

            // Name min length check
            if (Name.Length < 3)
                yield return new ValidationResult(UserResources.GetString("nameTooShort"), [nameof(Name)]);

            // Name format check
            if (!Regex.IsMatch(Name, @"^[a-zA-Z\s]+$", RegexOptions.None, TimeSpan.FromMilliseconds(250)))
                yield return new ValidationResult(UserResources.GetString("nameInvalid"), [nameof(Name)]);
        }
    }
}
