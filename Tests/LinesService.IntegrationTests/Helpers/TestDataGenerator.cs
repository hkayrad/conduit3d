using System;
using Conduit3D.Common.Domain;
using LinesService.Domain;

namespace LinesService.IntegrationTests.Helpers;

public class TestDataGenerator
{
    public static AgHat GenerateAgHat(
        int id = 1,
        string adi = "Test Line",
        string cinsi = "Test Cinsi",
        string kesit = "Test Kesit",
        string kodu = "Test Kodu",
        string tipi = "Test Tipi",
        byte[] wkb = null!
        )
    {
        return new AgHat
        {
            Id = id,
            Adi = adi,
            Cinsi = cinsi,
            Kesit = kesit,
            Kodu = kodu,
            Tipi = tipi,
            Wkb = wkb ?? [1, 2, 3, 4, 5],
        };
    }

    public static OgHat GenerateOgHat(
        int id = 1,
        string adi = "Test Line",
        string cinsi = "Test Cinsi",
        string kesit = "Test Kesit",
        string kodu = "Test Kodu",
        string tipi = "Test Tipi",
        byte[] wkb = null!
        )
    {
        return new OgHat
        {
            Id = id,
            Adi = adi,
            Cinsi = cinsi,
            Kesit = kesit,
            Kodu = kodu,
            Tipi = tipi,
            Wkb = wkb ?? [1, 2, 3, 4, 5],
        };
    }

    public static Rekortman GenerateRekortman(
        int id = 1,
        byte[] wkb = null!
        )
    {
        return new Rekortman
        {
            Id = id,
            Wkb = wkb ?? [1, 2, 3, 4, 5],
        };
    }

    public static List<AgHat> GenerateAgHatList(int count)
    {
        var list = new List<AgHat>();
        for (int i = 1; i <= count; i++)
        {
            list.Add(GenerateAgHat(id: i, adi: $"Test Line {i}"));
        }
        return list;
    }

    public static List<OgHat> GenerateOgHatList(int count)
    {
        var list = new List<OgHat>();
        for (int i = 1; i <= count; i++)
        {
            list.Add(GenerateOgHat(id: i, adi: $"Test Line {i}"));
        }
        return list;
    }

    public static List<Rekortman> GenerateRekortmanList(int count)
    {
        var list = new List<Rekortman>();
        for (int i = 1; i <= count; i++)
        {
            list.Add(GenerateRekortman(id: i));
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
