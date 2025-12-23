using System;
using Conduit3D.Common.Domain;
using PolesService.Domain;

namespace PolesService.UnitTests.Helpers;

public class TestDataGenerator
{
    public static AgDirek GenerateAgDirek(
        int id = 1,
        string adi = "Test Pole",
        byte[] wkb = null!)
    {
        return new AgDirek
        {
            Id = id,
            Adi = adi,
            Wkb = wkb ?? [1, 2, 3, 4, 5]
        };
    }

    public static AydDirek GenerateAydDirek(
        int id = 1,
        string adi = "Test Pole",
        byte[] wkb = null!)
    {
        return new AydDirek
        {
            Id = id,
            Adi = adi,
            Wkb = wkb ?? [1, 2, 3, 4, 5]
        };
    }

    public static OgMusDirek GenerateOgMusDirek(
        int id = 1,
        string adi = "Test Pole",
        byte[] wkb = null!)
    {
        return new OgMusDirek
        {
            Id = id,
            Adi = adi,
            Wkb = wkb ?? [1, 2, 3, 4, 5]
        };
    }

    public static Armatur GenerateArmatur(
        int id = 1,
        int bagliTabloId = 1,
        int bagliTabloKayitId = 1,
        byte[] wkb = null!)
    {
        return new Armatur
        {
            Id = id,
            BagliTabloId = bagliTabloId,
            BagliTabloKayitId = bagliTabloKayitId,
            Wkb = wkb ?? [1, 2, 3, 4, 5]
        };
    }

    public static List<AgDirek> GenerateAgDirekList(int count)
    {
        var list = new List<AgDirek>();
        for (int i = 1; i <= count; i++)
        {
            list.Add(GenerateAgDirek(id: i, adi: $"Test Pole {i}"));
        }
        return list;
    }

    public static List<AydDirek> GenerateAydDirekList(int count)
    {
        var list = new List<AydDirek>();
        for (int i = 1; i <= count; i++)
        {
            list.Add(GenerateAydDirek(id: i, adi: $"Test Pole {i}"));
        }
        return list;
    }

    public static List<OgMusDirek> GenerateOgMusDirekList(int count)
    {
        var list = new List<OgMusDirek>();
        for (int i = 1; i <= count; i++)
        {
            list.Add(GenerateOgMusDirek(id: i, adi: $"Test Pole {i}"));
        }
        return list;
    }

    public static List<Armatur> GenerateArmaturList(int count)
    {
        var list = new List<Armatur>();
        for (int i = 1; i <= count; i++)
        {
            list.Add(GenerateArmatur(id: i, bagliTabloId: i, bagliTabloKayitId: i));
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
        for (int i = 1; i <= count; i++)
        {
            list.Add($"Tip {i}");
        }
        return list;
    }
}
