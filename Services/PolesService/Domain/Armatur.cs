using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PolesService.Domain;

/// <summary>
/// Represents a low voltage pole in the system.
/// </summary>
public class Armatur
{
    /// <summary>
    /// The unique identifier for the low voltage pole.
    /// </summary>
    [Key]
    [Column("id")]
    public required int Id { get; set; }

    [Column("bagli_tablo_id")]
    public required int BagliTabloId { get; set; }

    [Column("bagli_tablo_kayit_id")]
    public required int BagliTabloKayitId { get; set; }

    /// <summary>
    /// The Well-Known Binary (WKB) representation of the low voltage pole's geometry.
    /// </summary>
    [Column("wkb")]
    public required byte[] Wkb { get; set; }
}
