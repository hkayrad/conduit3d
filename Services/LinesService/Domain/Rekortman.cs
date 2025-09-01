using System;
using System.ComponentModel.DataAnnotations;

namespace LinesService.Domain;

/// <summary>
/// Represents a end user connection line in the system.
/// </summary>
public class Rekortman
{
    /// <summary>
    /// The unique identifier for the connection line.
    /// </summary>
    [Required]
    public required int Id { get; set; }

    /// <summary>
    /// The type of the connection line.
    /// </summary>
    [Required]
    public required string Tipi { get; set; }

    /// <summary>
    /// The cross-section of the connection line.
    /// </summary>
    [Required]
    public required string Kesit { get; set; }

    /// <summary>
    /// The geographical representation of the connection line.
    /// </summary>
    [Required]
    public required string GeoJson { get; set; }
}
