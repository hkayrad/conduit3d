using System;
using System.ComponentModel.DataAnnotations;

namespace BuildingsService.Domain;

/// <summary>
/// Represents a building in the system.
/// </summary>
public class Building
{
    /// <summary>
    /// The unique identifier for the building.
    /// </summary>
    [Key]
    [Required]
    public required int Id { get; set; }

    /// <summary>
    /// The name of the building.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// The type of the building.
    /// </summary>
    [MaxLength(20)]
    public string? Type { get; set; }

    /// <summary>
    /// The number of floors in the building.
    /// </summary>
    public double? FloorCount { get; set; }

    /// <summary>
    /// The geographical representation of the building.
    /// </summary>
    [Required]
    public required string GeoJson { get; set; }
}
