using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using NpgsqlTypes;

namespace BuildingsService.Domain;

/// <summary>
/// Represents a building in the system.
/// </summary>
public class AdrBina
{
    /// <summary>
    /// The unique identifier for the building.
    /// </summary>
    [Key]
    [Column("id")]
    public required int Id { get; set; }

    /// <summary>
    /// The code of the building.
    /// </summary>
    [Column("kodu")]
    [MaxLength(100)]
    public string? Kodu { get; set; } = string.Empty;

    /// <summary>
    /// The name of the site where the building is located.
    /// </summary>
    [Column("site_adi")]
    [MaxLength(100)]
    public string SiteAdi { get; set; } = string.Empty;

    /// <summary>
    /// The name of the building.
    /// </summary>
    [Column("adi")]
    [MaxLength(100)]
    public string Adi { get; set; } = string.Empty;

    /// <summary>
    /// The number of floors in the building.
    /// </summary>
    [Column("bina_kat_sayisi")]
    public double BinaKatSayisi { get; set; }

    /// <summary>
    /// The number of apartments in the building.
    /// </summary>
    [Column("daire_sayisi")]
    public double DaireSayisi { get; set; }

    /// <summary>
    /// The number of workplaces in the building.
    /// </summary>
    [Column("isyeri_sayisi")]
    public double IsyeriSayisi { get; set; }

    /// <summary>
    /// The height of the building in meters.
    /// </summary>
    [Column("yukseklik")]
    public double Yukseklik { get; set; }

    // /// <summary>
    // /// The geographical representation of the building.
    // /// </summary>
    // [Column("geojson")]
    // public required string GeoJson { get; set; }

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
