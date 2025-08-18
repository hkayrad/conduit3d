using System;
using LinesService.Domain;
using Microsoft.EntityFrameworkCore;

namespace LinesService.Infrastructure.Data;

public class LinesContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<AgHat> AgHatlar { get; set; }
    public DbSet<OgHat> OgHatlar { get; set; }
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

    }
}
