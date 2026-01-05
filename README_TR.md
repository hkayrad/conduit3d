# Conduit3D Platformu

Jeouzaysal elektrik altyapı verilerini yönetmek için mikro servis tabanlı bir platform. Ölçeklenebilir 3D görselleştirme ve veri yönetimi için modern .NET teknolojileri, React ve PostgreSQL/PostGIS ile geliştirilmiştir.

## Genel Bakış

Conduit3D, elektrik dağıtım şirketlerinin binalar, elektrik direkleri, enerji hatları ve ilgili jeouzaysal veriler dahil olmak üzere altyapı varlıklarını etkileşimli bir 3D arayüz aracılığıyla yönetmek ve görselleştirmek için tasarlanmış modüler bir platformdur.

## Mimari

### Mikro Servisler

- **[UserService](Services/UserService/)** - JWT ile kullanıcı kimlik doğrulama ve yetkilendirme
- **[BuildingsService](Services/BuildingsService/)** - PostGIS ile bina veri yönetimi
- **[LinesService](Services/LinesService/)** - Elektrik hattı altyapı yönetimi
- **[PolesService](Services/PolesService/)** - Elektrik direği altyapı yönetimi

### Ön Yüz

- **[Client](Client/)** - 3D jeouzaysal görselleştirme içeren React TypeScript uygulaması

### Altyapı

- **[ApiGateway](ApiGateway/)** - JWT doğrulaması ile Caddy tabanlı ters proxy
- **[Common](Common/)** - Paylaşılan domain modelleri ve yardımcı araçlar
- **[TileService](TileService/)** - Jeouzaysal görselleştirme için harita karo sunumu

## Teknoloji Yığını

### Arka Uç Servisleri

- **ASP.NET Core 8.0** - Web API çatısı
- **Entity Framework Core** - PostgreSQL sağlayıcısı ile ORM
- **PostgreSQL 17 / PostGIS** - Jeouzaysal veri için uzamsal veritabanı
- **NetTopologySuite** - Geometri işlemleri için .NET uzamsal kütüphanesi
- **Protobuf (protobuf-net)** - Verimli veri aktarımı için ikili serileştirme
- **JWT Kimlik Doğrulama** - Güvenli token tabanlı kimlik doğrulama
- **Swagger/OpenAPI** - API dokümantasyonu
- **xUnit, Moq, FluentAssertions** - Test çatıları
- **Testcontainers** - Docker tabanlı entegrasyon testi

### Ön Yüz [(Bağımlılık Listesi)](Client/package.json)

- **React 19** - Modern kullanıcı arayüzü çatısı
- **TypeScript** - Tip güvenli geliştirme
- **Vite** - Hızlı derleme aracı ve geliştirme sunucusu
- **Redux Toolkit** - Durum yönetimi
- **OpenLayers** - Etkileşimli harita görselleştirme
- **Deck.gl** - 3D jeouzaysal görselleştirme
- **Vitest** - Birim ve bileşen testi
- **GeoTIFF.js** - İstemci taraflı GeoTIFF işleme

### Altyapı

- **Docker & Docker Compose** - Konteynerleştirme ve orkestrasyon
- **Caddy** - Modern web sunucusu ve ters proxy
- **PostGIS** - Uzamsal veritabanı eklentileri

## Başlarken

### Ön Koşullar

- [Docker](https://www.docker.com/products/docker-desktop)
- [.NET 8 SDK](https://dotnet.microsoft.com/download) (yerel geliştirme için)
- [Node.js 18+](https://nodejs.org/) (ön yüz geliştirme için)

### Docker ile Hızlı Başlangıç

1. **Depoyu klonlayın**

   ```bash
   git clone <depo-url>
   cd conduit3d
   ```

2. **Ortam değişkenlerini ayarlayın**

   ```bash
   # Ortam değişkenlerini kopyalayın ve yapılandırın
   cp .env.example .env
   # .env dosyasını veritabanı şifreleri ve JWT sırları ile düzenleyin
   ```

3. **Tüm servisleri başlatın**

   ```bash
   # Tüm servisleri derleyin ve başlatın
   docker compose up --build -d
   ```

4. **Uygulamaya erişin**
   - **Ana Uygulama**: https://\<alan-adı\>
   - **API Gateway**: https://\<alan-adı\>/api
   - **API Dokümantasyonu**:
     - Auth: https://\<alan-adı\>/api/docs/auth/swagger
     - Buildings: https://\<alan-adı\>/api/docs/buildings/swagger
     - Lines: https://\<alan-adı\>/api/docs/lines/swagger
     - Poles: https://\<alan-adı\>/api/docs/poles/swagger

## API Uç Noktaları

### Kimlik Doğrulama (`/api/v1/user`)

- `POST /login` - Kullanıcı kimlik doğrulama
- `GET /` - Kullanıcıları listele (sayfalanmış)
- `GET /count` - Kullanıcı sayısını al
- `GET /{id}` - Kullanıcı detaylarını al
- `POST /` - Kullanıcı oluştur
- `PUT /{id}` - Kullanıcı güncelle
- `DELETE /{id}` - Kullanıcı sil

### Binalar

> Adres Binaları (`/api/v1/adrBina`) <br/>
> Adres Yolları (`/api/v1/adrYol`) <br/>
> Trafo Binaları (`/api/v1/trafoBina`)

- `GET /` - Binaları listele (sayfalanmış)
- `GET /{id}` - Bina detaylarını al
- `GET /count` - Kapsam içindeki bina sayısını al
- `GET /types` - Farklı bina türlerini al (uygunsa)
- `GET /pbf` - Binaları protobuf olarak al
- `POST /` - Yeni bina oluştur
- `PUT /{id}` - Bina güncelle
- `DELETE /{id}` - Bina sil

### Hatlar

> Alçak Gerilim Hatları (`/api/v1/agHat`) <br/>
> Orta Gerilim Hatları (`/api/v1/ogHat`) <br/>
> Rekortman Hatları (`/api/v1/rekortman`)

- `GET /` - Hatları listele (sayfalanmış)
- `GET /{id}` - Hat detaylarını al
- `GET /count` - Kapsam içindeki hat sayısını al
- `GET /types` - Farklı hat türlerini al
- `GET /pbf` - Hatları protobuf olarak al
- `POST /` - Yeni hat oluştur
- `PUT /{id}` - Hat güncelle
- `DELETE /{id}` - Hat sil

### Direkler

> Alçak Gerilim Direkleri (`/api/v1/agDirek`) <br/>
> Orta Gerilim Müşteri Direkleri (`/api/v1/ogMusDirek`) <br/>
> Aydınlatma Direkleri (`/api/v1/aydDirek`) <br/>
> Armatürler (`/api/v1/armatur`)

- `GET /` - Direkleri listele (sayfalanmış)
- `GET /{id}` - Direk detaylarını al
- `GET /count` - Kapsam içindeki direk sayısını al
- `GET /types` - Farklı direk türlerini al (armatürler için mevcut değil)
- `GET /pbf` - Direkleri protobuf olarak al
- `POST /` - Yeni direk oluştur
- `PUT /{id}` - Direk güncelle
- `DELETE /{id}` - Direk sil

## Geliştirme

### Yerel Geliştirme Kurulumu

1. **Arka Uç Servisleri**

   ```bash
   # Sadece veritabanlarını başlatın
   docker compose up user_database buildings_database lines_database poles_database -d

   # Servisleri yerel olarak çalıştırın
   cd Services/UserService
   dotnet run
   ```

2. **Ön Yüz Geliştirme**

   ```bash
   cd Client
   npm install
   npm run dev
   ```

3. **API Gateway**
   ```bash
   cd ApiGateway
   docker build -t caddy_gateway .
   docker run -p 80:80 -p 443:443 caddy_gateway
   ```

### Ortam Değişkenleri

| Değişken                  | Açıklama                          |
| ------------------------- | --------------------------------- |
| `JWT_ISSUER`              | İmzalama için JWT düzenleyicisi   |
| `JWT_AUDIENCE`            | İmzalama için JWT hedef kitlesi   |
| `JWT_SIGNING_ALGORITHM`   | Algoritma                         |
| `JWT_SECRET`              | İmzalama için JWT sırrı           |
| `JWT_SECRET_BASE64`       | BASE64 formatında JWT sırrı       |
| `JWT_EXPIRATION_TIME_HRS` | Saat cinsinden JWT geçerlilik süresi |
| `USER_DB_NAME`            | Kullanıcı veritabanı adı          |
| `USER_DB_USER`            | Kullanıcı veritabanı kullanıcısı  |
| `USER_DB_PASS`            | Kullanıcı veritabanı şifresi      |
| `BUILDINGS_DB_NAME`       | Bina veritabanı adı               |
| `BUILDINGS_DB_USER`       | Bina veritabanı kullanıcısı       |
| `BUILDINGS_DB_PASS`       | Bina veritabanı şifresi           |
| `LINES_DB_NAME`           | Hat veritabanı adı                |
| `LINES_DB_USER`           | Hat veritabanı kullanıcısı        |
| `LINES_DB_PASS`           | Hat veritabanı şifresi            |
| `POLES_DB_NAME`           | Direk veritabanı adı              |
| `POLES_DB_USER`           | Direk veritabanı kullanıcısı      |
| `POLES_DB_PASS`           | Direk veritabanı şifresi          |
| `VITE_API_URL`            | İstemcide kullanılacak API URL'i  |
| `VITE_TILE_SERVER_URL`    | İstemcide kullanılacak karo sunucusu |

## Temel Özellikler

### 3D Jeouzaysal Görselleştirme

- Elektrik altyapısı için etkileşimli 3D haritalar
- Gerçek zamanlı veri görselleştirme
- Uzamsal sorgu yetenekleri

### Kullanıcı Yönetimi

- Rol tabanlı erişim kontrolü
- JWT tabanlı kimlik doğrulama
- Kullanıcı yönetimi için yönetici paneli

### Altyapı Yönetimi

- Tüm varlık türleri için CRUD işlemleri
- PostGIS entegrasyonu ile jeouzaysal veri
- OpenAPI dokümantasyonu ile RESTful API'ler

### Ölçeklenebilir Mimari

- Mikro servis tabanlı tasarım
- Docker konteynerleştirme
- API Gateway

## Docker Servisleri

```yaml
# Veritabanı Servisleri
- user_database (PostgreSQL)
- buildings_database (PostGIS)
- lines_database (PostGIS)
- poles_database (PostGIS)

# Uygulama Servisleri
- user_service
- buildings_service
- lines_service
- poles_service
- client
- tile_server
- geoserver
- api_gateway
```

## Test

Proje, hem birim hem de entegrasyon testleri ile kapsamlı test kapsamı içerir.

### Testleri Çalıştırma

```bash
# Etkileşimli test için analiz betiğini kullanın
chmod +x ./analyze.sh
./analyze.sh
# Servis ve test türünü (birim/entegrasyon) seçin

# Veya testleri doğrudan çalıştırın
dotnet test Tests/BuildingsService.UnitTests/
dotnet test Tests/BuildingsService.IntegrationTests/
dotnet test Tests/LinesService.UnitTests/
dotnet test Tests/LinesService.IntegrationTests/
dotnet test Tests/PolesService.UnitTests/
dotnet test Tests/PolesService.IntegrationTests/
dotnet test Tests/UserService.UnitTests/
dotnet test Tests/UserService.IntegrationTests/

# Ön yüz testleri
cd Client
npm run test           # Tüm testleri çalıştır
```

### Test Kapsamı

- **Birim Testleri**: Servis katmanı iş mantığı
- **Entegrasyon Testleri**: PostgreSQL/PostGIS ile denetleyici ve depo entegrasyonu
- **Ön Yüz Testleri**: Vitest ile bileşen ve birim testleri

Test sonuçları otomatik olarak `Coverage/` dizininde oluşturulur.

## Katkıda Bulunma

1. Depoyu çatallayın
2. Özellik dalı oluşturun (`git checkout -b feature/harika-ozellik`)
3. [Kodlama kurallarını](CODING_CONVENTION.md) takip edin
4. Yeni işlevsellik için testler ekleyin
5. Değişikliklerinizi işleyin (`git commit -m 'Harika özellik ekle'`)
6. Dala gönderin (`git push origin feature/harika-ozellik`)
7. Pull Request açın

## Güvenlik

- Gateway seviyesinde JWT tabanlı kimlik doğrulama
- Servislerde rol tabanlı yetkilendirme
- Ortam tabanlı sır yönetimi
- Caddy aracılığıyla HTTPS zorlama
- Girdi doğrulama

## Lisans

Bu proje özel yazılımdır. Tüm hakları saklıdır.
