using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using NpgsqlTypes;

namespace PolesService.Domain;

/// <summary>
/// Represents a medium voltage pole in the system.
/// </summary>
public class OgMusDirek
{
    /// <summary>
    /// The unique identifier for the medium voltage pole.
    /// </summary>
    [Key]
    [Column("id")]
    public required int Id { get; set; }

    /// <summary>
    /// The code of the medium voltage pole.
    /// </summary>
    [Column("kodu")]
    [MaxLength(50)]
    public string Kodu { get; set; } = string.Empty;

    /// <summary>
    /// The name of the medium voltage pole.
    /// </summary>
    [Column("adi")]
    [MaxLength(50)]
    public string Adi { get; set; } = string.Empty;

    /// <summary>
    /// The type of the medium voltage pole.
    /// </summary>
    [Column("cinsi")]
    [MaxLength(20)]
    public string Cinsi { get; set; } = string.Empty;

    /// <summary>
    /// The type of the medium voltage pole.
    /// </summary>
    [Column("tipi")]
    [MaxLength(50)]
    public string Tipi { get; set; } = string.Empty;

    /// <summary>
    /// The unique identifier for the medium voltage pole.
    /// </summary>
    [Column("direk_no")]
    [MaxLength(40)]
    public string DirekNo { get; set; } = string.Empty;

    /// <summary>
    /// The height characteristics of the medium voltage pole.
    /// </summary>
    [Column("boy_ozellik")]
    [MaxLength(20)]
    public string BoyOzellik { get; set; } = string.Empty;

    /// <summary>
    /// The height identifier for the medium voltage pole.
    /// </summary>
    [Column("direk_boy_id")]
    public double DirekBoyId { get; set; }

    /// <summary>
    /// The Well-Known Binary (WKB) representation of the medium voltage pole's geometry.
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
