using System.ComponentModel.DataAnnotations;

namespace BuildingsService.DTOs;

public class AdrYolDto
{
    public double Genislik { get; set; }
    public double SeritSayisi { get; set; }
    
    [MaxLength(30)]
    public string Yapisi { get; set; } = string.Empty;

    [MaxLength(25)]
    public string Tipi { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Kodu { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Adi { get; set; } = string.Empty;

    public required string Wkb { get; set; }
}
