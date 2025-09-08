using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using NpgsqlTypes;

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

    /// <summary>
    /// TsVector column for full-text search.
    /// </summary>
    [Column("searchable_text")]
    [JsonIgnore]
    public NpgsqlTsVector SearchableText { get; set; } = null!;
}
