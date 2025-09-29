using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using NpgsqlTypes;

namespace LinesService.Domain;

/// <summary>
/// Represents a end user connection line in the system.
/// </summary>
public class Rekortman
{
    /// <summary>
    /// The unique identifier for the connection line.
    /// </summary>
    [Key]
    [Column("id")]
    public required int Id { get; set; }

    /// <summary>
    /// The name of the connection line.
    /// </summary>
    [Column("adi")]
    [MaxLength(50)]
    public string Adi { get; set; } = string.Empty;

    /// <summary>
    /// The code of the connection line.
    /// </summary>
    [Column("kodu")]
    [MaxLength(50)]
    public string Kodu { get; set; } = string.Empty;

    /// <summary>
    /// The type of the connection line.
    /// </summary>
    [Column("kesit")]
    [MaxLength(40)]
    public string Kesit { get; set; } = string.Empty;

    /// <summary>
    /// The type of the connection line.
    /// </summary>
    [Column("tipi")]
    [MaxLength(20)]
    public string Tipi { get; set; } = string.Empty;

    // /// <summary>
    // /// The geographical representation of the connection line.
    // /// </summary>
    // [Required]
    // public required string GeoJson { get; set; }

    /// <summary>
    /// The Well-Known Binary (WKB) representation of the connection line.
    /// </summary>
    [Column("wkb")]
    public required byte[] Wkb { get; set; }

    /// <summary>
    /// TsVector column for full-text search.
    /// </summary>
    [Column("searchable_text")]
    [JsonIgnore]
    public NpgsqlTsVector SearchableText { get; set; } = null!;
}
