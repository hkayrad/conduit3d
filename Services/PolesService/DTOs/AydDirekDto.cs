using System.ComponentModel.DataAnnotations;

namespace PolesService.DTOs;

public class AydDirekDto
{
    [MaxLength(50)]
    public string Kodu { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Adi { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Cinsi { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Tipi { get; set; } = string.Empty;

    [MaxLength(20)]
    public string DirekNo { get; set; } = string.Empty;

    [MaxLength(20)]
    public string BoyOzellik { get; set; } = string.Empty;

    public double DirekBoyId { get; set; }

    public required string Wkb { get; set; }
}
