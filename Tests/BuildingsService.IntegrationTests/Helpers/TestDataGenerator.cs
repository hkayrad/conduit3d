using System;
using System.Collections.Generic;
using BuildingsService.Domain;
using Conduit3D.Common.Domain;

namespace BuildingsService.IntegrationTests.Helpers;

public class TestDataGenerator
{
    public static AdrBina GenerateAdrBina(
        int id = 1,
        string adi = "Test Building",
        string siteAdi = "Test Site",
        string kodu = "Test Kodu",
        int binaKatSayisi = 5,
        int daireSayisi = 10,
        int isyeriSayisi = 2,
        double yukseklik = 15.5,
        byte[]? wkb = null
    )
    {
        return new AdrBina
        {
            Id = id,
            Adi = adi,
            SiteAdi = siteAdi,
            Kodu = kodu,
            BinaKatSayisi = binaKatSayisi,
            DaireSayisi = daireSayisi,
            IsyeriSayisi = isyeriSayisi,
            Yukseklik = yukseklik,
            Wkb = wkb ?? [1, 2, 3, 4, 5]
        };
    }

    public static Building GenerateBuilding(
        int id = 1,
        string adi = "Test Building",
        string siteAdi = "Test Site",
        string kodu = "Test Kodu",
        int binaKatSayisi = 5,
        int daireSayisi = 10,
        int isyeriSayisi = 2,
        double yukseklik = 15.5,
        byte[]? wkb = null
    )
    {
        return new Building
        {
            Id = id,
            Adi = adi,
            SiteAdi = siteAdi,
            Kodu = kodu,
            BinaKatSayisi = binaKatSayisi,
            DaireSayisi = daireSayisi,
            IsyeriSayisi = isyeriSayisi,
            Yukseklik = yukseklik,
            Wkb = wkb ?? [1, 2, 3, 4, 5]
        };
    }

    public static AdrYol GenerateAdrYol(
        int id = 1,
        string adi = "Test Road",
        string kodu = "Test Kodu",
        string tipi = "Test Tipi",
        string yapisi = "Test Yapisi",
        double genislik = 10.0,
        double seritSayisi = 2.0,
        byte[]? wkb = null
    )
    {
        return new AdrYol
        {
            Id = id,
            Adi = adi,
            Kodu = kodu,
            Tipi = tipi,
            Yapisi = yapisi,
            Genislik = genislik,
            SeritSayisi = seritSayisi,
            Wkb = wkb ?? [1, 2, 3, 4, 5]
        };
    }

    public static TrafoBina GenerateTrafoBina(
        int id = 1,
        string adi = "Test Trafo",
        string kodu = "Test Kodu",
        byte[]? wkb = null
    )
    {
        return new TrafoBina
        {
            Id = id,
            Adi = adi,
            Kodu = kodu,
            Wkb = wkb ?? [1, 2, 3, 4, 5]
        };
    }

    public static List<AdrBina> GenerateAdrBinaList(int count)
    {
        var list = new List<AdrBina>();
        for (var i = 1; i <= count; i++)
        {
            list.Add(GenerateAdrBina(id: i, adi: $"Test Building {i}"));
        }
        return list;
    }

    public static List<Building> GenerateBuildingList(int count)
    {
        var list = new List<Building>();
        for (var i = 1; i <= count; i++)
        {
            list.Add(GenerateBuilding(id: i, adi: $"Test Building {i}"));
        }
        return list;
    }

    public static List<AdrYol> GenerateAdrYolList(int count)
    {
        var list = new List<AdrYol>();
        for (var i = 1; i <= count; i++)
        {
            list.Add(GenerateAdrYol(id: i, adi: $"Test Road {i}"));
        }
        return list;
    }

    public static List<TrafoBina> GenerateTrafoBinaList(int count)
    {
        var list = new List<TrafoBina>();
        for (var i = 1; i <= count; i++)
        {
            list.Add(GenerateTrafoBina(id: i, adi: $"Test Trafo {i}"));
        }
        return list;
    }

    public static Extent GenerateExtent(
        double minX = -180,
        double maxX = 180,
        double minY = -90,
        double maxY = 90)
    {
        return new Extent
        {
            MinX = minX,
            MaxX = maxX,
            MinY = minY,
            MaxY = maxY
        };
    }

    public static List<string> GenerateTipList(int count)
    {
        var list = new List<string>();
        for (var i = 1; i <= count; i++)
        {
            list.Add($"Tip {i}");
        }
        return list;
    }
}
