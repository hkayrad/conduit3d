using System;
using Microsoft.EntityFrameworkCore;
using PolesService.Domain;

namespace PolesService.Infrastructure.Data;

/// <summary>
/// Database context for managing pole-related data.
/// </summary>
/// <param name="options">DbContext options.</param>
public class PolesContext(DbContextOptions options) : DbContext(options)
{
    /// <summary>
    /// DbSet for SBK_AGDIREK entities
    /// </summary>
    public required DbSet<AgDirek> AgHatlar { get; set; }

    /// <summary>
    /// DbSet for SBK_AYDDIREK entities
    /// </summary>
    public required DbSet<AydDirek> AydHatlar { get; set; }

    /// <summary>
    /// DbSet for SBK_OGMUSDIREK entities
    /// </summary>
    public required DbSet<OgMusDirek> OgMusHatlar { get; set; }

    public required DbSet<Armatur> Armaturler { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AgDirek>(entity =>
        {

            entity.ToTable("SBK_AGDIREK");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Kodu)
                .HasMaxLength(50)
                .HasColumnName("kodu");
            entity.Property(e => e.Adi)
                .HasMaxLength(50)
                .HasColumnName("adi");
            entity.Property(e => e.Cinsi)
                .HasMaxLength(20)
                .HasColumnName("cinsi");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.DirekNo)
                .HasMaxLength(40)
                .HasColumnName("direk_no");
            entity.Property(e => e.BoyOzellik)
                .HasMaxLength(20)
                .HasColumnName("boy_ozellik");
            entity.Property(e => e.DirekBoyId)
                .HasColumnName("direk_boy_id");
            entity.Property(e => e.Wkb)
                .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                .HasColumnName("wkb");

            if (Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
            {
                entity.HasGeneratedTsVectorColumn(
                    p => p.SearchableText,
                    "simple",
                    p => new
                    {
                        p.Id,
                        p.Kodu,
                        p.Adi,
                        p.Cinsi,
                        p.Tipi,
                        p.DirekNo,
                        p.BoyOzellik,
                        p.DirekBoyId
                    }

                );
            }
            else
            {
                entity.Ignore(e => e.SearchableText);
            }
        });

        modelBuilder.Entity<AydDirek>(entity =>
        {

            entity.ToTable("SBK_AYDDIREK");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Kodu)
                .HasMaxLength(50)
                .HasColumnName("kodu");
            entity.Property(e => e.Adi)
                .HasMaxLength(50)
                .HasColumnName("adi");
            entity.Property(e => e.Cinsi)
                .HasMaxLength(20)
                .HasColumnName("cinsi");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.DirekNo)
                .HasMaxLength(40)
                .HasColumnName("direk_no");
            entity.Property(e => e.BoyOzellik)
                .HasMaxLength(20)
                .HasColumnName("boy_ozellik");
            entity.Property(e => e.DirekBoyId)
                .HasColumnName("direk_boy_id");
            entity.Property(e => e.Wkb)
                 .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                 .HasColumnName("wkb");

            if (Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
            {
                entity.HasGeneratedTsVectorColumn(
                    p => p.SearchableText,
                    "simple",
                    p => new
                    {
                        p.Id,
                        p.Kodu,
                        p.Adi,
                        p.Cinsi,
                        p.Tipi,
                        p.DirekNo,
                        p.BoyOzellik,
                        p.DirekBoyId
                    }
                );
            }
            else
            {
                entity.Ignore(e => e.SearchableText);
            }
        });

        modelBuilder.Entity<OgMusDirek>(entity =>
        {

            entity.ToTable("SBK_OGMUSDIREK");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Kodu)
                .HasMaxLength(50)
                .HasColumnName("kodu");
            entity.Property(e => e.Adi)
                .HasMaxLength(50)
                .HasColumnName("adi");
            entity.Property(e => e.Cinsi)
                .HasMaxLength(20)
                .HasColumnName("cinsi");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.DirekNo)
                .HasMaxLength(20)
                .HasColumnName("direk_no");
            entity.Property(e => e.BoyOzellik)
                .HasMaxLength(20)
                .HasColumnName("boy_ozellik");
            entity.Property(e => e.DirekBoyId)
                .HasColumnName("direk_boy_id");
            entity.Property(e => e.Wkb)
                .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                .HasColumnName("wkb");
            if (Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
            {
                entity.HasGeneratedTsVectorColumn(
                    p => p.SearchableText,
                    "simple",
                    p => new
                    {
                        p.Id,
                        p.Kodu,
                        p.Adi,
                        p.Cinsi,
                        p.Tipi,
                        p.DirekNo,
                        p.BoyOzellik,
                        p.DirekBoyId
                    }
                );
            }
            else
            {
                entity.Ignore(e => e.SearchableText);
            }
        });

        modelBuilder.Entity<Armatur>(
            entity =>
            {
                entity.Property(e => e.Id)
                    .ValueGeneratedOnAdd()
                    .HasColumnName("id");
                entity.Property(e => e.BagliTabloId)
                    .HasColumnName("bagli_tablo_id");
                entity.Property(e => e.BagliTabloKayitId)
                    .HasColumnName("bagli_tablo_kayit_id");
                entity.Property(e => e.Wkb)
                    .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                    .HasColumnName("wkb");
            }
        );
    }
}
