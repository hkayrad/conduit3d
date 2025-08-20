using System;
using System.ComponentModel.DataAnnotations;

namespace BuildingsService.Domain;

public class TrafoBina
{
    [Required]
    public required int Id { get; set; }
    [Required]
    public required string Name { get; set; }
    [Required]
    public required string Kodu { get; set; }
    [Required]
    public required string GeoJson { get; set; }
}
