using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using NpgsqlTypes;

namespace BuildingsService.Domain;

public class AdrYol
{
    /// <summary>
    /// The unique identifier for the road.
    /// </summary>
    [Key]
    [Column("id")]
    public required int Id { get; set; }

    /// <summary>
    /// The width of the road.
    /// </summary>
    [Column("genislik")]
    public double Genislik { get; set; }

    /// <summary>
    /// The number of lanes on the road.
    /// </summary>  
    [Column("serit_sayisi")]
    public double SeritSayisi { get; set; }

    /// <summary>
    /// The type of the road surface.
    /// </summary>
    [Column("yapisi")]
    [MaxLength(30)]
    public string Yapisi { get; set; } = string.Empty;

    /// <summary>
    /// The type of the road.
    /// </summary>
    [Column("tipi")]
    [MaxLength(25)]
    public string Tipi { get; set; } = string.Empty;

    /// <summary>
    /// The code of the road.
    /// </summary>
    [Column("kodu")]
    [MaxLength(20)]
    public string Kodu { get; set; } = string.Empty;

    /// <summary>
    /// The name of the road.
    /// </summary>
    [Column("adi")]
    [MaxLength(100)]
    public string Adi { get; set; } = string.Empty;

    /// <summary>
    /// The Well-Known Binary (WKB) representation of the building.
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
