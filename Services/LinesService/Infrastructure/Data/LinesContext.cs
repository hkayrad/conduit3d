using System;
using LinesService.Domain;
using Microsoft.EntityFrameworkCore;

namespace LinesService.Infrastructure.Data;

/// <summary>
/// Database context for managing line-related data.
/// </summary>
/// <param name="options">DbContext options.</param>
public class LinesContext(DbContextOptions options) : DbContext(options)
{
    /// <summary>
    /// DbSet for SBK_AGHAT entities
    /// </summary>
    public DbSet<AgHat> AgHatlar { get; set; }

    /// <summary>
    /// DbSet for SBK_OGHAT entities
    /// </summary>
    public DbSet<OgHat> OgHatlar { get; set; }

    /// <summary>
    /// DbSet for SBK_REKORTMAN entities
    /// </summary>
    public DbSet<Rekortman> Rekortmanlar { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AgHat>(entity =>
        {

            entity.ToTable("SBK_AGHAT");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Kodu)
                .HasMaxLength(150)
                .HasColumnName("kodu");
            entity.Property(e => e.Adi)
                .HasMaxLength(50)
                .HasColumnName("adi");
            entity.Property(e => e.Cinsi)
                .HasMaxLength(20)
                .HasColumnName("cinsi");
            entity.Property(e => e.Kesit)
                .HasMaxLength(40)
                .HasColumnName("kesit");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.Wkb)
                .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                .HasColumnName("wkb");
            entity.HasGeneratedTsVectorColumn(
                e => e.SearchableText,
                "simple",
                e => new
                {
                    e.Id,
                    e.Kodu,
                    e.Adi,
                    e.Cinsi,
                    e.Kesit,
                    e.Tipi
                }
            );
        });

        modelBuilder.Entity<OgHat>(entity =>
        {

            entity.ToTable("SBK_OGHAT");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Adi)
                .HasMaxLength(200)
                .HasColumnName("adi");
            entity.Property(e => e.Kodu)
                .HasMaxLength(50)
                .HasColumnName("kodu");
            entity.Property(e => e.Cinsi)
                .HasMaxLength(20)
                .HasColumnName("cinsi");
            entity.Property(e => e.Kesit)
                .HasMaxLength(40)
                .HasColumnName("kesit");
            entity.Property(e => e.Tipi)
                .HasMaxLength(4)
                .HasColumnName("tipi");
            entity.Property(e => e.Wkb)
                .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                .HasColumnName("wkb");
            entity.HasGeneratedTsVectorColumn(
                e => e.SearchableText,
                "simple",
                e => new
                {
                    e.Id,
                    e.Kodu,
                    e.Adi,
                    e.Cinsi,
                    e.Kesit,
                    e.Tipi
                }
            );
        });

        modelBuilder.Entity<Rekortman>(entity =>
        {

            entity.ToTable("SBK_rEKORTMAN");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Adi)
                .HasMaxLength(50)
                .HasColumnName("adi");
            entity.Property(e => e.Kodu)
                .HasMaxLength(50)
                .HasColumnName("kodu");
            entity.Property(e => e.Kesit)
                .HasMaxLength(40)
                .HasColumnName("kesit");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.Wkb)
                .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                .HasColumnName("wkb");
            entity.HasGeneratedTsVectorColumn(
                e => e.SearchableText,
                "simple",
                e => new
                {
                    e.Id,
                    e.Kodu,
                    e.Adi,
                    e.Tipi,
                    e.Kesit
                }
            );
        });
    }
}
