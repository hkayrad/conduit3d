using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using AuthService.Resources;
using Conduit3D.Common.Domain;

namespace AuthService.Infrastructure.DTOs;

/// <summary>
/// Data transfer object for updating a user.
/// </summary>
public class UpdateUserDto : IValidatableObject
{
    /// <summary>
    /// The username of the user.
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// The email of the user.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// The role of the user.
    /// </summary>
    public string? UserRole { get; set; }

    /// <summary>
    /// The name of the user.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// The password of the user.
    /// </summary>
    public required string Password { get; set; }


    /// <summary>
    /// Indicates whether the user is active.
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Validates the properties of the user DTO.
    /// </summary>
    /// <param name="validationContext">Validation context for the user DTO.</param>
    /// <returns>A collection of validation results.</returns>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Username null check
        if (!string.IsNullOrWhiteSpace(Username))
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

        // Email null check
        if (!string.IsNullOrWhiteSpace(Email))
        {
            // Email format check
            if (!Regex.IsMatch(Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                yield return new ValidationResult(AuthResources.GetString("emailInvalid"), [nameof(Email)]);
        }

        // UserRole null check
        if (!string.IsNullOrWhiteSpace(UserRole))
        {
            // UserRole validity check
            var allowedRoles = Roles.AllowedRoles;
            if (!Array.Exists(allowedRoles, r => r.Equals(UserRole, StringComparison.OrdinalIgnoreCase)))
                yield return new ValidationResult(AuthResources.GetString("userRoleInvalid"), [nameof(UserRole)]);
        }

        // Name null check
        if (!string.IsNullOrWhiteSpace(Name))
        {
            // Name max length check
            if (Name.Length > 255)
                yield return new ValidationResult(AuthResources.GetString("nameTooLong"), [nameof(Name)]);

            // Name min length check
            if (Name.Length < 3)
                yield return new ValidationResult(AuthResources.GetString("nameTooShort"), [nameof(Name)]);

            // Name format check
            if (!Regex.IsMatch(Name, @"^[a-zA-Z\s]+$"))
                yield return new ValidationResult(AuthResources.GetString("nameInvalid"), [nameof(Name)]);
        }

        // Password null check
        if (!string.IsNullOrWhiteSpace(Password))
        {
            // Password complexity check
            if (!Regex.IsMatch(Password, @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"))
                yield return new ValidationResult(AuthResources.GetString("passwordInvalid"), [nameof(Password)]);
        }
    }
}
