using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using NpgsqlTypes;

namespace UserService.Domain;

/// <summary>
/// Represents a user in the system.
/// </summary>
public class User
{
    /// <summary>
    /// The unique identifier for the user.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// The username of the user.
    /// </summary>
    [MaxLength(100)]
    public required string Username { get; set; }

    /// <summary>
    /// The email address of the user.
    /// </summary>
    [MaxLength(255)]
    public required string Email { get; set; }

    /// <summary>
    /// The role assigned to the user.
    /// </summary>
    [MaxLength(10)]
    public required string UserRole { get; set; }

    /// <summary>
    /// The full name of the user.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// The date and time when the user was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Indicates whether the user is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// TsVector column for full-text search.
    /// </summary>
    [Column("searchable_text")]
    [JsonIgnore]
    public NpgsqlTsVector SearchableText { get; set; } = null!;
}
