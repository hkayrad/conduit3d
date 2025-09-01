using System;
using System.ComponentModel.DataAnnotations;

namespace BuildingsService.Domain;

/// <summary>
/// Represents a transformer station in the system.
/// </summary>
public class TrafoBina
{
    /// <summary>
    /// The unique identifier for the transformer station.
    /// </summary>
    [Required]
    public required int Id { get; set; }

    /// <summary>
    /// The name of the transformer station.
    /// </summary>
    [Required]
    public required string Name { get; set; }

    /// <summary>
    /// The code of the transformer station.
    /// </summary>
    [Required]
    public required string Kodu { get; set; }

    /// <summary>
    /// The geographical representation of the transformer station.
    /// </summary>
    [Required]
    public required string GeoJson { get; set; }
}
