# BuildingsService

Conduit3D platformu için ASP.NET Core ile geliştirilmiş bina veri yönetimi mikro servisi. Bu servis, PostGIS entegrasyonu ile jeouzaysal bina verisi erişimi ve yönetimi yetenekleri sağlar.

## Özellikler

- **Bina Veri Yönetimi** - Bina bilgisi erişimi
- **Jeouzaysal Destek** - Uzamsal veri işlemleri için PostGIS entegrasyonu
- **Birden Fazla Bina Türü** - AdrBina, TrafoBina ve genel binalar desteği
- **PostgreSQL Entegrasyonu** - Entity Framework Core ile güvenilir veri kalıcılığı
- **API Versiyonlama** - Birden fazla API versiyonu desteği
- **Swagger Dokümantasyonu** - Etkileşimli API dokümantasyonu
- **Docker Desteği** - Konteynerleştirilmiş dağıtıma hazır

## API Uç Noktaları

### AdrBina (Adres Binaları)
- `GET /api/v1/adrBina` - Sayfalanmış adres binası listesi al
- `GET /api/v1/adrBina/{id}` - ID ile belirli adres binasını al
- `GET /api/v1/adrBina/count` - Adres binası istatistikleri ve sayılarını al

### TrafoBina (Trafo Binaları)
- `GET /api/v1/trafoBina` - Sayfalanmış trafo binası listesi al
- `GET /api/v1/trafoBina/{id}` - ID ile belirli trafo binasını al
- `GET /api/v1/trafoBina/count` - Trafo binası istatistikleri ve sayılarını al

### Genel Binalar
- `GET /api/v1/buildings` - Sayfalanmış genel bina listesi al
- `GET /api/v1/buildings/{id}` - ID ile belirli genel binayı al
- `GET /api/v1/buildings/count` - Genel bina istatistikleri ve sayılarını al

## Yapılandırma

### Ortam Değişkenleri

| Değişken | Açıklama | Gerekli |
|----------|----------|---------|
| `ASPNETCORE_ENVIRONMENT` | ASP.NET Core ortamı (Development/Production) | Evet |
| `POSTGRESQL_CONNECTION_STRING` | PostGIS ile PostgreSQL veritabanı bağlantı dizesi | Evet |

### Örnek Bağlantı Dizesi
```
Host=localhost;Database=buildings_db;Username=buildings_user;Password=sifreniz
```

## Mimari

```
BuildingsService/
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
   export POSTGRESQL_CONNECTION_STRING="Host=localhost;Database=buildings_db;Username=postgres;Password=sifre"
   ```

4. **Servisi Çalıştırın**
   ```bash
   dotnet restore
   dotnet run
   ```

5. **API Dokümantasyonuna Erişin**
   - Etkileşimli API dokümanları için `https://<alan-adi>/api/docs/buildings/swagger` adresine gidin

## Docker Dağıtımı

### İmaj Oluşturma
```bash
docker build -t conduit3d-buildings:latest .
```

### Konteyner Çalıştırma
```bash
docker run -d \
  -p 8080:8080 \
  -e POSTGRESQL_CONNECTION_STRING="Host=db;Database=buildings_db;Username=user;Password=pass" \
  conduit3d-buildings:latest
```

## Jeouzaysal Özellikler

- **PostGIS Entegrasyonu** - Gelişmiş uzamsal veri işlemleri
- **Geometri Desteği** - Nokta, çokgen ve karmaşık geometri yönetimi
- **Uzamsal Sorgular** - Konum tabanlı veri erişimi

## Veri Modelleri

### AdrBina (Adres Binaları)
Adres bilgisi ve uzamsal koordinatlara sahip binalar.

### TrafoBina (Trafo Binaları)
Teknik özelliklere sahip elektrik trafolarını barındıran binalar.

### Genel Binalar
Temel yapısal bilgilere sahip standart bina varlıkları.
> ! Kaldırılacak !

## Lisans

Bu proje Conduit3D platformunun bir parçasıdır.
