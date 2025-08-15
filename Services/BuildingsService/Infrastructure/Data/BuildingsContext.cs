using System;
using BuildingsService.Domain;
using Microsoft.EntityFrameworkCore;

namespace BuildingsService.Infrastructure.Data;

public class BuildingsContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<Building> Buildings { get; set; }
    public DbSet<AdrBuilding> AdrBuildings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Building>(entity =>
        {

            entity.ToTable("buildings");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Type)
                .HasMaxLength(20)
                .HasColumnName("type");
            entity.Property(e => e.FloorCount)
                .HasColumnName("floor_count");
            entity.Property(e => e.GeoJson)
                .HasComputedColumnSql("ST_AsGeoJSON(ST_Transform(geometry, 4326))")
                .HasColumnName("geojson");
        });

        modelBuilder.Entity<AdrBuilding>(entity =>
        {
            entity.ToTable("adr_bina");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("adi");
            entity.Property(e => e.Type)
                .HasMaxLength(20)
                .HasColumnName("type");
            entity.Property(e => e.FloorCount)
                .HasComputedColumnSql("COALESCE(NULLIF(bina_kat_sayisi, 0), 5)")
                .HasColumnName("bina_kat_sayisi");
            entity.Property(e => e.GeoJson)
                .HasComputedColumnSql("ST_AsGeoJSON(ST_Transform(geometry, 4326))")
                .HasColumnName("geojson");
        });

    }
}
