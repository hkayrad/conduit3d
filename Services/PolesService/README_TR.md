# PolesService

Conduit3D platformu için ASP.NET Core ile geliştirilmiş kapsamlı elektrik direği veri yönetimi mikro servisi. Bu servis, PostGIS entegrasyonu ile jeouzaysal elektrik direği verisi erişimi ve yönetimi yetenekleri sağlar.

## Özellikler

- **Elektrik Direği Veri Yönetimi** - Kapsamlı elektrik direği bilgisi erişimi
- **Jeouzaysal Destek** - Uzamsal veri işlemleri için PostGIS entegrasyonu
- **Birden Fazla Direk Türü** - AgDirek (alçak gerilim), OgMusDirek (orta gerilim) ve AydDirek (aydınlatma) direkleri desteği
- **PostgreSQL Entegrasyonu** - Entity Framework Core ile güvenilir veri kalıcılığı
- **API Versiyonlama** - Birden fazla API versiyonu desteği
- **Swagger Dokümantasyonu** - Etkileşimli API dokümantasyonu
- **Docker Desteği** - Konteynerleştirilmiş dağıtıma hazır

## API Uç Noktaları

### AgDirek (Alçak Gerilim Direkleri)
- `GET /api/v1/agDirek` - Sayfalanmış alçak gerilim direği listesi al
- `GET /api/v1/agDirek/{id}` - ID ile belirli alçak gerilim direğini al
- `GET /api/v1/agDirek/count` - Alçak gerilim direği istatistikleri ve sayılarını al

### OgMusDirek (Orta Gerilim Direkleri)
- `GET /api/v1/ogMusDirek` - Sayfalanmış orta gerilim direği listesi al
- `GET /api/v1/ogMusDirek/{id}` - ID ile belirli orta gerilim direğini al
- `GET /api/v1/ogMusDirek/count` - Orta gerilim direği istatistikleri ve sayılarını al

### AydDirek (Aydınlatma Direkleri)
- `GET /api/v1/aydDirek` - Sayfalanmış aydınlatma direği listesi al
- `GET /api/v1/aydDirek/{id}` - ID ile belirli aydınlatma direğini al
- `GET /api/v1/aydDirek/count` - Aydınlatma direği istatistikleri ve sayılarını al

## Yapılandırma

### Ortam Değişkenleri

| Değişken | Açıklama | Gerekli |
|----------|----------|---------|
| `ASPNETCORE_ENVIRONMENT` | ASP.NET Core ortamı (Development/Production) | Evet |
| `POSTGRESQL_CONNECTION_STRING` | PostGIS ile PostgreSQL veritabanı bağlantı dizesi | Evet |

### Örnek Bağlantı Dizesi
```
Host=localhost;Database=poles_db;Username=poles_user;Password=sifreniz
```

## Mimari

```
PolesService/
├── Controllers/        # API denetleyicileri
├── Domain/             # Domain varlıkları
├── Infrastructure/     # Veri erişim katmanı
│   ├── Data/           # Veritabanı bağlamı
│   ├── Repositories/   # Repository pattern uygulaması
│   ├── Services/       # İş mantığı servisleri
│   ├── Utilities/      # Yardımcı araçlar
│   └── UnitOfWork.cs   # Unit Of Work
├── Properties/         # Başlatma ayarları
└── Resources/          # Yerelleştirme kaynakları
```

## Bağımlılıklar

### Temel Bağımlılıklar
- **ASP.NET Core 8.0** - Web çatısı
- **Entity Framework Core** - Veritabanı işlemleri için ORM
- **Npgsql.EntityFrameworkCore.PostgreSQL** - PostgreSQL sağlayıcısı
- **Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite** - PostGIS uzamsal veri desteği

### API & Dokümantasyon
- **Asp.Versioning.Http** - API versiyonlama desteği
- **Asp.Versioning.Mvc.ApiExplorer** - Versiyonlama için API explorer
- **Swashbuckle.AspNetCore** - Swagger/OpenAPI dokümantasyonu

### Jeouzaysal Destek
- **NetTopologySuite** - Uzamsal veri türleri ve işlemleri
- **NetTopologySuite.IO.PostGis** - PostGIS entegrasyonu

### Ek Araçlar
- **Common** - Paylaşılan yardımcı araçlar ve modeller

## Başlarken

1. **Ön Koşullar**
   - .NET 8.0 SDK
   - PostGIS eklentili PostgreSQL veritabanı
   - Docker (opsiyonel)

2. **Veritabanı Kurulumu**
   > PostGIS eklentili PostgreSQL veritabanı oluşturun
   ```sql
   CREATE DATABASE <vt_adi>;
   \c <vt_adi>;
   CREATE EXTENSION postgis;
   ```

3. **Ortamı Yapılandırın**
   ```bash
   # Ortam değişkenlerini ayarlayın veya appsettings.json'u güncelleyin
   export POSTGRESQL_CONNECTION_STRING="Host=localhost;Database=poles_db;Username=postgres;Password=sifre"
   ```

4. **Servisi Çalıştırın**
   ```bash
   dotnet restore
   dotnet run
   ```

5. **API Dokümantasyonuna Erişin**
   - Etkileşimli API dokümanları için `https://<alan-adi>/api/docs/poles/swagger` adresine gidin

## Docker Dağıtımı

### İmaj Oluşturma
```bash
docker build -t conduit3d-poles:latest .
```

### Konteyner Çalıştırma
```bash
docker run -d \
  -p 8080:8080 \
  -e POSTGRESQL_CONNECTION_STRING="Host=db;Database=poles_db;Username=user;Password=pass" \
  conduit3d-poles:latest
```

## Elektrik Direği Türleri

### AgDirek (Alçak Gerilim Direkleri)
400V veya altında çalışan hatları destekleyen alçak gerilim elektrik dağıtım direkleri.

### OgMusDirek (Orta Gerilim Direkleri)
1kV ile 35kV arasında çalışan hatları destekleyen orta gerilim elektrik dağıtım direkleri.

### AydDirek (Aydınlatma Direkleri)
Halk aydınlatma sistemlerini destekleyen sokak aydınlatma direkleri ve altyapısı.

## Jeouzaysal Özellikler

- **PostGIS Entegrasyonu** - Gelişmiş uzamsal veri işlemleri
- **Nokta Geometrisi Desteği** - Hassas direk konum yönetimi
- **Uzamsal Sorgular** - Konum tabanlı direk verisi erişimi
- **Koordinat Sistemi Desteği** - Birden fazla uzamsal referans sistemi

## Lisans

Bu proje Conduit3D platformunun bir parçasıdır.
