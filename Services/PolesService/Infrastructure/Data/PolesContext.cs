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
    public DbSet<AgDirek> AgHatlar { get; set; }

    /// <summary>
    /// DbSet for SBK_AYDDIREK entities
    /// </summary>
    public DbSet<AydDirek> AydHatlar { get; set; }

    /// <summary>
    /// DbSet for SBK_OGMUSDIREK entities
    /// </summary>
    public DbSet<OgMusDirek> OgMusHatlar { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AgDirek>(entity =>
        {

            entity.ToTable("SBK_AGDIREK");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Cinsi)
                .HasMaxLength(20)
                .HasColumnName("cinsi");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.BoyOzellik)
                .HasMaxLength(20)
                .HasColumnName("boy_ozellik");
            entity.Property(e => e.DirekNo)
                .HasMaxLength(20)
                .HasColumnName("direk_no");
            entity.Property(e => e.GeoJson)
                .HasComputedColumnSql("ST_AsGeoJSON(ST_Transform(geometry, 4326))")
                .HasColumnName("geojson");
        });

        modelBuilder.Entity<AydDirek>(entity =>
        {

            entity.ToTable("SBK_AYDDIREK");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Cinsi)
                .HasMaxLength(20)
                .HasColumnName("cinsi");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.BoyOzellik)
                .HasMaxLength(20)
                .HasColumnName("boy_ozellik");
            entity.Property(e => e.DirekNo)
                .HasMaxLength(20)
                .HasColumnName("direk_no");
            entity.Property(e => e.GeoJson)
                .HasComputedColumnSql("ST_AsGeoJSON(ST_Transform(geometry, 4326))")
                .HasColumnName("geojson");
        });

        modelBuilder.Entity<OgMusDirek>(entity =>
        {

            entity.ToTable("SBK_OGMUSDIREK");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Cinsi)
                .HasMaxLength(20)
                .HasColumnName("cinsi");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.BoyOzellik)
                .HasMaxLength(20)
                .HasColumnName("boy_ozellik");
            entity.Property(e => e.DirekNo)
                .HasMaxLength(20)
                .HasColumnName("direk_no");
            entity.Property(e => e.GeoJson)
                .HasComputedColumnSql("ST_AsGeoJSON(ST_Transform(geometry, 4326))")
                .HasColumnName("geojson");
        });
    }
}
