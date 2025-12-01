using System.ComponentModel.DataAnnotations;

namespace LinesService.DTOs;

public class OgHatDto
{
    [MaxLength(200)]
    public string Adi { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Kodu { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Cinsi { get; set; } = string.Empty;

    [MaxLength(40)]
    public string Kesit { get; set; } = string.Empty;

    [MaxLength(4)]
    public string Tipi { get; set; } = string.Empty;

    public required string Wkb { get; set; }
}
