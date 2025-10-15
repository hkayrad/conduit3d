using System;
using BuildingsService.Domain;
using Microsoft.EntityFrameworkCore;

namespace BuildingsService.Infrastructure.Data;

/// <summary>
/// Database context for managing building-related data.
/// </summary>
/// <param name="options">DbContext options.</param>
public class BuildingsContext(DbContextOptions options) : DbContext(options)
{
    /// <summary>
    /// DbSet for buildings entities
    /// </summary>
    public DbSet<Building> Buildings { get; set; }

    /// <summary>
    /// DbSet for ADR_BINA entities
    /// </summary>
    public DbSet<AdrBina> AdrBuildings { get; set; }

    /// <summary>
    /// DbSet for SBK_TRAFOBINATIP entities
    /// </summary>
    public DbSet<TrafoBina> TrafoBuildings { get; set; }

    /// <summary>
    /// DbSet for ADR_YOL entities
    /// </summary>
    public DbSet<AdrYol> AdrYol { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Building>(entity =>
        {

            entity.ToTable("buildings");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Adi)
                .HasMaxLength(100)
                .HasColumnName("adi");
            entity.Property(e => e.Kodu)
                .HasMaxLength(100)
                .HasColumnName("kodu");
            entity.Property(e => e.SiteAdi)
                .HasMaxLength(100)
                .HasColumnName("site_adi");
            entity.Property(e => e.BinaKatSayisi)
                .HasColumnName("bina_kat_sayisi");
            entity.Property(e => e.DaireSayisi)
                .HasColumnName("daire_sayisi");
            entity.Property(e => e.IsyeriSayisi)
                .HasColumnName("isyeri_sayisi");
            entity.Property(e => e.Yukseklik)
                .HasColumnName("yukseklik");
            entity.Property(e => e.Wkb)
                .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                .HasColumnName("wkb");
            if (Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
            {
                entity.HasGeneratedTsVectorColumn(
                    e => e.SearchableText,
                    "simple",
                    e => new
                    {
                        e.Id,
                        e.Kodu,
                        e.SiteAdi,
                        e.Adi,
                        e.BinaKatSayisi,
                        e.DaireSayisi,
                        e.IsyeriSayisi,
                        e.Yukseklik
                    }
                );
            }
            else
            {
                entity.Ignore(e => e.SearchableText);
            }
        });

        modelBuilder.Entity<AdrBina>(entity =>
        {
            entity.ToTable("ADR_BINA");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Adi)
                .HasMaxLength(100)
                .HasColumnName("adi");
            entity.Property(e => e.Kodu)
                .HasMaxLength(100)
                .HasColumnName("kodu");
            entity.Property(e => e.SiteAdi)
                .HasMaxLength(100)
                .HasColumnName("site_adi");
            entity.Property(e => e.BinaKatSayisi)
                .HasColumnName("bina_kat_sayisi");
            entity.Property(e => e.DaireSayisi)
                .HasColumnName("daire_sayisi");
            entity.Property(e => e.IsyeriSayisi)
                .HasColumnName("isyeri_sayisi");
            entity.Property(e => e.Yukseklik)
                .HasColumnName("yukseklik");
            entity.Property(e => e.Wkb)
                .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                .HasColumnName("wkb");
            if (Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
            {
                entity.HasGeneratedTsVectorColumn(
                    e => e.SearchableText,
                    "simple",
                    e => new
                    {
                        e.Id,
                        e.Kodu,
                        e.SiteAdi,
                        e.Adi,
                        e.BinaKatSayisi,
                        e.DaireSayisi,
                        e.IsyeriSayisi,
                        e.Yukseklik
                    }
                );
            }
            else
            {
                entity.Ignore(e => e.SearchableText);
            }
        });

        modelBuilder.Entity<TrafoBina>(entity =>
        {
            entity.ToTable("SBK_TRAFOBINATIP");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Adi)
                .HasMaxLength(100)
                .HasColumnName("adi");
            entity.Property(e => e.Kodu)
                .HasMaxLength(20)
                .HasColumnName("kodu");
            entity.Property(e => e.Wkb)
                .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                .HasColumnName("wkb");
            if (Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
            {
                entity.HasGeneratedTsVectorColumn(
                    e => e.SearchableText,
                    "simple",
                    e => new
                    {
                        e.Id,
                        e.Adi,
                        e.Kodu
                    }
                );
            }
            else
            {
                entity.Ignore(e => e.SearchableText);
            }
        });

        modelBuilder.Entity<AdrYol>(entity =>
        {
            entity.ToTable("ADR_YOL");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Genislik)
                .HasColumnName("genislik");
            entity.Property(e => e.SeritSayisi)
                .HasColumnName("serit_sayisi");
            entity.Property(e => e.Yapisi)
                .HasMaxLength(30)
                .HasColumnName("yapisi");
            entity.Property(e => e.Tipi)
                .HasMaxLength(25)
                .HasColumnName("tipi");
            entity.Property(e => e.Kodu)
                .HasMaxLength(20)
                .HasColumnName("kodu");
            entity.Property(e => e.Adi)
                .HasMaxLength(100)
                .HasColumnName("adi");
            entity.Property(e => e.Wkb)
                .HasComputedColumnSql("ST_AsBinary(ST_Transform(geometry, 4326))")
                .HasColumnName("wkb");
            if (Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
            {
                entity.HasGeneratedTsVectorColumn(
                    e => e.SearchableText,
                    "simple",
                    e => new
                    {
                        e.Id,
                        e.Genislik,
                        e.SeritSayisi,
                        e.Yapisi,
                        e.Tipi,
                        e.Kodu,
                        e.Adi
                    }
                );
            }
            else
            {
                entity.Ignore(e => e.SearchableText);
            }
        });

    }
}
