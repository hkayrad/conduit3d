# LinesService

Conduit3D platformu için ASP.NET Core ile geliştirilmiş elektrik hattı veri yönetimi mikro servisi. Bu servis, PostGIS entegrasyonu ile jeouzaysal elektrik hattı verisi erişimi ve yönetimi yetenekleri sağlar.

## Özellikler

- **Elektrik Hattı Veri Yönetimi** - Elektrik hattı bilgisi erişimi
- **Jeouzaysal Destek** - Uzamsal veri işlemleri için PostGIS entegrasyonu
- **Birden Fazla Hat Türü** - AgHat (alçak gerilim), OgHat (orta gerilim) ve Rekortman hatları desteği
- **PostgreSQL Entegrasyonu** - Entity Framework Core ile güvenilir veri kalıcılığı
- **API Versiyonlama** - Birden fazla API versiyonu desteği
- **Swagger Dokümantasyonu** - Etkileşimli API dokümantasyonu
- **Docker Desteği** - Konteynerleştirilmiş dağıtıma hazır

## API Uç Noktaları

### AgHat (Alçak Gerilim Hatları)
- `GET /api/v1/agHat` - Sayfalanmış alçak gerilim hattı listesi al
- `GET /api/v1/agHat/{id}` - ID ile belirli alçak gerilim hattını al
- `GET /api/v1/agHat/count` - Alçak gerilim hattı istatistikleri ve sayılarını al

### OgHat (Orta Gerilim Hatları)
- `GET /api/v1/ogHat` - Sayfalanmış orta gerilim hattı listesi al
- `GET /api/v1/ogHat/{id}` - ID ile belirli orta gerilim hattını al
- `GET /api/v1/ogHat/count` - Orta gerilim hattı istatistikleri ve sayılarını al

### Rekortman (Servis Hatları)
- `GET /api/v1/rekortman` - Sayfalanmış servis hattı listesi al
- `GET /api/v1/rekortman/{id}` - ID ile belirli servis hattını al
- `GET /api/v1/rekortman/count` - Servis hattı istatistikleri ve sayılarını al

## Yapılandırma

### Ortam Değişkenleri

| Değişken | Açıklama | Gerekli |
|----------|----------|---------|
| `ASPNETCORE_ENVIRONMENT` | ASP.NET Core ortamı (Development/Production) | Evet |
| `POSTGRESQL_CONNECTION_STRING` | PostGIS ile PostgreSQL veritabanı bağlantı dizesi | Evet |

### Örnek Bağlantı Dizesi
```
Host=localhost;Database=lines_db;Username=lines_user;Password=sifreniz
```

## Mimari

```
LinesService/
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
   export POSTGRESQL_CONNECTION_STRING="Host=localhost;Database=lines_db;Username=postgres;Password=sifre"
   ```

4. **Servisi Çalıştırın**
   ```bash
   dotnet restore
   dotnet run
   ```

5. **API Dokümantasyonuna Erişin**
   - Etkileşimli API dokümanları için `https://<alan-adi>/api/docs/lines/swagger` adresine gidin

## Docker Dağıtımı

### İmaj Oluşturma
```bash
docker build -t conduit3d-lines:latest .
```

### Konteyner Çalıştırma
```bash
docker run -d \
  -p 8080:8080 \
  -e POSTGRESQL_CONNECTION_STRING="Host=db;Database=lines_db;Username=user;Password=pass" \
  conduit3d-lines:latest
```

## Elektrik Hattı Türleri

### AgHat (Alçak Gerilim Hatları)
Tipik olarak 400V veya altında çalışan alçak gerilim elektrik dağıtım hatları.

### OgHat (Orta Gerilim Hatları)
Tipik olarak 1kV ile 35kV arasında çalışan orta gerilim elektrik dağıtım hatları.

### Rekortman (Servis Hatları)
Bireysel tüketicileri dağıtım şebekesine bağlayan servis bağlantı hatları.

## Jeouzaysal Özellikler

- **PostGIS Entegrasyonu** - Gelişmiş uzamsal veri işlemleri
- **Hat Geometrisi Desteği** - LineString ve MultiLineString yönetimi
- **Uzamsal Sorgular** - Konum tabanlı hat verisi erişimi
- **Koordinat Sistemi Desteği** - Birden fazla uzamsal referans sistemi

## Lisans

Bu proje Conduit3D platformunun bir parçasıdır.
