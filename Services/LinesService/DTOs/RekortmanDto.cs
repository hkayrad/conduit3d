using System.ComponentModel.DataAnnotations;

namespace LinesService.DTOs;

public class RekortmanDto
{
    [MaxLength(50)]
    public string Adi { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Kodu { get; set; } = string.Empty;

    [MaxLength(40)]
    public string Kesit { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Tipi { get; set; } = string.Empty;

    public required string Wkb { get; set; }
}
