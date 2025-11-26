using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BuildingsService.DTOs;

/// <summary>
/// Data Transfer Object for creating a new AdrBina.
/// </summary>
public class AdrBinaDto
{
    /// <summary>
    /// The code of the building.
    /// </summary>
    [MaxLength(100)]
    public string? Kodu { get; set; } = string.Empty;

    /// <summary>
    /// The name of the site where the building is located.
    /// </summary>
    [MaxLength(100)]
    public string SiteAdi { get; set; } = string.Empty;

    /// <summary>
    /// The name of the building.
    /// </summary>
    [MaxLength(100)]
    public string Adi { get; set; } = string.Empty;

    /// <summary>
    /// The number of floors in the building.
    /// </summary>
    public double BinaKatSayisi { get; set; }

    /// <summary>
    /// The number of apartments in the building.
    /// </summary>
    public double DaireSayisi { get; set; }

    /// <summary>
    /// The number of workplaces in the building.
    /// </summary>
    public double IsyeriSayisi { get; set; }

    /// <summary>
    /// The height of the building in meters.
    /// </summary>
    public double Yukseklik { get; set; }

    /// <summary>
    /// The Well-Known Binary (WKB) representation of the building.
    /// </summary>
    public required byte[] Wkb { get; set; }
}
