using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using UserService.Resources;
using Conduit3D.Common.Domain;

namespace UserService.Infrastructure.DTOs;

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
    public string? Password { get; set; }


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
                yield return new ValidationResult(UserResources.GetString("usernameTooLong"), [nameof(Username)]);

            // Username min length check
            if (Username.Length < 3)
                yield return new ValidationResult(UserResources.GetString("usernameTooShort"), [nameof(Username)]);

            // Username format check
            if (!Regex.IsMatch(Username, @"^[a-zA-Z0-9_]+$", RegexOptions.NonBacktracking, TimeSpan.FromMilliseconds(250)))
                yield return new ValidationResult(UserResources.GetString("usernameInvalid"), [nameof(Username)]);
        }

        // Email null check
        if (!string.IsNullOrWhiteSpace(Email) && !Regex.IsMatch(Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.NonBacktracking, TimeSpan.FromMilliseconds(250)))
            yield return new ValidationResult(UserResources.GetString("emailInvalid"), [nameof(Email)]);

        // UserRole null check
        if (!string.IsNullOrWhiteSpace(UserRole))
        {
            // UserRole validity check
            var allowedRoles = Roles.AllowedRoles;
            if (!Array.Exists(allowedRoles, r => r.Equals(UserRole, StringComparison.OrdinalIgnoreCase)))
                yield return new ValidationResult(UserResources.GetString("userRoleInvalid"), [nameof(UserRole)]);
        }

        // Name null check
        if (!string.IsNullOrWhiteSpace(Name))
        {
            // Name max length check
            if (Name.Length > 255)
                yield return new ValidationResult(UserResources.GetString("nameTooLong"), [nameof(Name)]);

            // Name min length check
            if (Name.Length < 3)
                yield return new ValidationResult(UserResources.GetString("nameTooShort"), [nameof(Name)]);

            // Name format check
            if (!Regex.IsMatch(Name, @"^[a-zA-Z\s]+$", RegexOptions.NonBacktracking, TimeSpan.FromMilliseconds(250)))
                yield return new ValidationResult(UserResources.GetString("nameInvalid"), [nameof(Name)]);
        }

        // Password null check
        if (string.IsNullOrWhiteSpace(Password))
            yield return new ValidationResult(UserResources.GetString("passwordNull"), [nameof(Password)]);
        else
        {
            // Password complexity check
            if (!Regex.IsMatch(Password, @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$", RegexOptions.NonBacktracking, TimeSpan.FromMilliseconds(250)))
                yield return new ValidationResult(UserResources.GetString("passwordInvalid"), [nameof(Password)]);
        }
    }
}
