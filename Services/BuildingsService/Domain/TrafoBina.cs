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
    [Key]
    [Column("id")]
    public required int Id { get; set; }

    /// <summary>
    /// The name of the transformer station.
    /// </summary>
    [Column("adi")]
    [MaxLength(100)]
    public string Adi { get; set; } = string.Empty;

    /// <summary>
    /// The code of the transformer station.
    /// </summary>
    [Column("kodu")]
    [MaxLength(100)]
    public string Kodu { get; set; } = string.Empty;

    /// <summary>
    /// The geographical representation of the transformer station.
    /// </summary>
    [Column("geojson")]
    public required string GeoJson { get; set; }

    /// <summary>
    /// TsVector column for full-text search.
    /// </summary>
    [Column("searchable_text")]
    [JsonIgnore]
    public NpgsqlTsVector SearchableText { get; set; } = null!;
}
