using System;
using System.ComponentModel.DataAnnotations;

namespace PolesService.Domain;

/// <summary>
/// Represents a low voltage pole in the system.
/// </summary>
public class AgDirek
{
    /// <summary>
    /// The unique identifier for the low voltage pole.
    /// </summary>
    [Required]
    public required int Id { get; set; }

    /// <summary>
    /// The type of the low voltage pole.
    /// </summary>
    [Required]
    public required string Cinsi { get; set; }

    /// <summary>
    /// The type of the low voltage pole.
    /// </summary>
    [Required]
    public required string Tipi { get; set; }

    /// <summary>
    /// The height characteristics of the low voltage pole.
    /// </summary>
    [Required]
    public required string BoyOzellik { get; set; }

    /// <summary>
    /// The unique identifier for the low voltage pole.
    /// </summary>
    [Required]
    public required string DirekNo { get; set; }

    /// <summary>
    /// The geographical representation of the low voltage pole.
    /// </summary>
    [Required]
    public required string GeoJson { get; set; }
}
