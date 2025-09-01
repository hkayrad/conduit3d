using System;
using System.ComponentModel.DataAnnotations;

namespace LinesService.Domain;

/// <summary>
/// Represents a low voltage transmission line in the system.
/// </summary>
public class AgHat
{
    /// <summary>
    /// The unique identifier for the transmission line.
    /// </summary>
    [Required]
    public required int Id { get; set; }

    /// <summary>
    /// The type of the transmission line.
    /// </summary>
    [Required]
    public required string Cinsi { get; set; }

    /// <summary>
    /// The type of the transmission line.
    /// </summary>
    [Required]
    public required string Tipi { get; set; }

    /// <summary>
    /// The cross-section of the transmission line.
    /// </summary>
    [Required]
    public required string Kesit { get; set; }

    /// <summary>
    /// The geographical representation of the transmission line.
    /// </summary>
    [Required]
    public required string GeoJson { get; set; }
}
