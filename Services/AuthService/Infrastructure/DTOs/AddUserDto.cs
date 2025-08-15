using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using AuthService.Resources;

namespace AuthService.Infrastructure.DTOs;

public class AddUserDto : UserDto, IValidatableObject
{
    [Required]
    public required string Password { get; set; }

    public override IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        foreach (var result in base.Validate(validationContext))
        {
            yield return result;
        }

        if (string.IsNullOrWhiteSpace(Password))
            yield return new ValidationResult(AuthResources.GetString("passwordNull"), [nameof(Password)]);
        else if (!Regex.IsMatch(Password, @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"))
            yield return new ValidationResult(AuthResources.GetString("passwordInvalid"), [nameof(Password)]);
    }
}
