using System;
using System.ComponentModel.DataAnnotations;

namespace BuildingsService.Domain;

public class Building
{
    [Key]
    [Required]
    public required int Id { get; set; }
    public string? Name { get; set; }
    [MaxLength(20)]
    public string? Type { get; set; }
    public double? FloorCount { get; set; }
    [Required]
    public required string GeoJson { get; set; }
}
