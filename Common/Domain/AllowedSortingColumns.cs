using System;

namespace Conduit3D.Common.Domain;

public class AllowedSortingColumns
{
    public static readonly string[] AdrBinaColumns = [
        "Id",
        "Kodu",
        "SiteAdi",
        "Adi",
        "BinaKatSayisi",
        "DaireSayisi",
        "IsyeriSayisi",
        "Yukseklik"
    ];

    public static readonly string[] TrafoBinaColumns = [
        "Id",
        "Kodu",
        "Adi"
    ];

    public static readonly string[] PoleColumns = [
        "Id",
        "Kodu",
        "Adi",
        "Cinsi",
        "Tipi",
        "DirekNo",
        "BoyOzellik",
        "DirekBoyId"
    ];

    public static readonly string[] LineColumns = [
        "Id",
        "Kodu",
        "Adi",
        "Cinsi",
        "Kesit",
        "Tipi"
    ];

    public static readonly string[] RekortmanColumns = [
        "Id",
        "Kodu",
        "Adi",
        "Kesit",
        "Tipi"
    ];
}
