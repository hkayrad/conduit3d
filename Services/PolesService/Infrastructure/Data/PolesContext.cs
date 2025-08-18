using System;
using Microsoft.EntityFrameworkCore;
using PolesService.Domain;

namespace PolesService.Infrastructure.Data;

public class PolesContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<AgDirek> AgHatlar { get; set; }
    public DbSet<AydDirek> AydHatlar { get; set; }
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
    }
}
