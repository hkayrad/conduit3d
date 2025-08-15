using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using AuthService.Resources;
using Conduit3D.Common.Domain;

namespace AuthService.Infrastructure.DTOs;

public class UserDto : IValidatableObject
{
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string UserRole { get; set; }
    public required string Name { get; set; }

    public virtual IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Username))
            yield return new ValidationResult(AuthResources.GetString("usernameNull"), [nameof(Username)]);
        else
        {
            if (Username.Length > 100)
                yield return new ValidationResult(AuthResources.GetString("usernameTooLong"), [nameof(Username)]);
            if (Username.Length < 3)
                yield return new ValidationResult(AuthResources.GetString("usernameTooShort"), [nameof(Username)]);
            if (!Regex.IsMatch(Username, @"^[a-zA-Z0-9_]+$"))
                yield return new ValidationResult(AuthResources.GetString("usernameInvalid"), [nameof(Username)]);
        }

        if (string.IsNullOrWhiteSpace(Email))
            yield return new ValidationResult(AuthResources.GetString("emailNull"), [nameof(Email)]);
        else if (!Regex.IsMatch(Email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"))
            yield return new ValidationResult(AuthResources.GetString("emailInvalid"), [nameof(Email)]);

        if (string.IsNullOrWhiteSpace(UserRole))
            yield return new ValidationResult(AuthResources.GetString("userRoleNull"), [nameof(UserRole)]);
        else
        {
            var allowedRoles = Roles.AllowedRoles;
            if (!Array.Exists(allowedRoles, r => r.Equals(UserRole, StringComparison.OrdinalIgnoreCase)))
                yield return new ValidationResult(AuthResources.GetString("userRoleInvalid"), [nameof(UserRole)]);
        }

        if (string.IsNullOrWhiteSpace(Name))
            yield return new ValidationResult(AuthResources.GetString("nameNull"), [nameof(Name)]);
        else
        {
            if (Name.Length > 255)
                yield return new ValidationResult(AuthResources.GetString("nameTooLong"), [nameof(Name)]);
            if (Name.Length < 3)
                yield return new ValidationResult(AuthResources.GetString("nameTooShort"), [nameof(Name)]);
            if (!Regex.IsMatch(Name, @"^[a-zA-Z\s]+$"))
                yield return new ValidationResult(AuthResources.GetString("nameInvalid"), [nameof(Name)]);
        }
    }
}
