using System.ComponentModel.DataAnnotations;

namespace BuildingsService.DTOs;

public class TrafoBinaDto
{
    [MaxLength(100)]
    public string Adi { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Kodu { get; set; } = string.Empty;

    public required string Wkb { get; set; }
}
