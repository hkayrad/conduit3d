using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using NpgsqlTypes;

namespace LinesService.Domain;

/// <summary>
/// Represents a medium voltage transmission line in the system.
/// </summary>
public class OgHat
{
    /// <summary>
    /// The unique identifier for the transmission line.
    /// </summary>
    [Key]
    [Column("id")]
    public required int Id { get; set; }

    /// <summary>
    /// The name of the transmission line.
    /// </summary>
    [Column("adi")]
    [MaxLength(200)]
    public string Adi { get; set; } = string.Empty;

    /// <summary>
    /// The code of the transmission line.
    /// </summary>
    [Column("kodu")]
    [MaxLength(50)]
    public string Kodu { get; set; } = string.Empty;

    /// <summary>
    /// The type of the transmission line.
    /// </summary>
    [Column("cinsi")]
    [MaxLength(20)]
    public string Cinsi { get; set; } = string.Empty;

    /// <summary>
    /// The cross-section of the transmission line.
    /// </summary>
    [Column("kesit")]
    [MaxLength(40)]
    public string Kesit { get; set; } = string.Empty;

    /// <summary>
    /// The type of the transmission line.
    /// </summary>
    [Column("tipi")]
    [MaxLength(4)]
    public string Tipi { get; set; } = string.Empty;

    /// <summary>
    /// The Well-Known Binary (WKB) representation of the transmission line.
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
