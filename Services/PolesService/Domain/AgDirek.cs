using System;
using System.ComponentModel.DataAnnotations;

namespace PolesService.Domain;

public class AgDirek
{
    [Required]
    public required int Id { get; set; }
    [Required]
    public required string Cinsi { get; set; }
    [Required]
    public required string Tipi { get; set; }
    [Required]
    public required string BoyOzellik { get; set; }
    [Required]
    public required string DirekNo { get; set; }
    [Required]
    public required string GeoJson { get; set; }
}
