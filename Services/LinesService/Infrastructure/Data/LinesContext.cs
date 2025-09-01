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
            entity.Property(e => e.Cinsi)
                .HasMaxLength(20)
                .HasColumnName("cinsi");
            entity.Property(e => e.Kesit)
                .HasMaxLength(40)
                .HasColumnName("kesit");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.GeoJson)
                .HasComputedColumnSql("ST_AsGeoJSON(ST_Transform(geometry, 4326))")
                .HasColumnName("geojson");
        });

        modelBuilder.Entity<OgHat>(entity =>
        {

            entity.ToTable("SBK_OGHAT");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Cinsi)
                .HasMaxLength(20)
                .HasColumnName("cinsi");
            entity.Property(e => e.Kesit)
                .HasMaxLength(40)
                .HasColumnName("kesit");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.GeoJson)
                .HasComputedColumnSql("ST_AsGeoJSON(ST_Transform(geometry, 4326))")
                .HasColumnName("geojson");
        });

        modelBuilder.Entity<Rekortman>(entity =>
        {

            entity.ToTable("SBK_rEKORTMAN");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Kesit)
                .HasMaxLength(40)
                .HasColumnName("kesit");
            entity.Property(e => e.Tipi)
                .HasMaxLength(20)
                .HasColumnName("tipi");
            entity.Property(e => e.GeoJson)
                .HasComputedColumnSql("ST_AsGeoJSON(ST_Transform(geometry, 4326))")
                .HasColumnName("geojson");
        });
    }
}
