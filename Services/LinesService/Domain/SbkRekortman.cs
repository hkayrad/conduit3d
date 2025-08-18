using System;
using System.ComponentModel.DataAnnotations;

namespace LinesService.Domain;

public class SbkRekortman
{
    [Required]
    public required int Id { get; set; }
    [Required]
    public required string Tipi { get; set; }
    [Required]
    public required string Kesit { get; set; }
    [Required]
    public required string GeoJson { get; set; }
}
