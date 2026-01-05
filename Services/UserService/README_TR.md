# UserService

Conduit3D platformu için ASP.NET Core ile geliştirilmiş kimlik doğrulama ve yetkilendirme mikro servisi. Bu servis, JWT tabanlı kimlik doğrulama ile kapsamlı kullanıcı yönetimi yetenekleri sağlar.

## Özellikler

- **Kullanıcı Kimlik Doğrulama** - JWT token'ları ile güvenli giriş
- **Kullanıcı Yönetimi** - Kullanıcı hesapları için tam CRUD işlemleri
- **Token Yönetimi** - JWT token oluşturma, doğrulama ve yenileme
- **Rol Tabanlı Yetkilendirme** - Farklı kullanıcı rolleri ve izinleri desteği
- **PostgreSQL Entegrasyonu** - Entity Framework Core ile güvenilir veri kalıcılığı
- **API Versiyonlama** - Birden fazla API versiyonu desteği
- **Swagger Dokümantasyonu** - Etkileşimli API dokümantasyonu
- **Docker Desteği** - Konteynerleştirilmiş dağıtıma hazır

## API Uç Noktaları

### Kimlik Doğrulama
- `POST /api/auth/login` - Kullanıcı kimlik doğrulama ve JWT token alma

### Kullanıcı Yönetimi
- `POST /api/auth` - Yeni kullanıcı oluştur
- `GET /api/auth` - Sayfalanmış kullanıcı listesi al
- `GET /api/auth/{id}` - ID ile kullanıcı al
- `PUT /api/auth/{id}` - Kullanıcı bilgilerini güncelle
- `DELETE /api/auth/{id}` - Kullanıcı hesabını sil

### İstatistikler
- `GET /api/auth/count` - Kullanıcı istatistikleri ve sayılarını al

## Yapılandırma

### Ortam Değişkenleri

| Değişken | Açıklama | Gerekli |
|----------|----------|---------|
| `ASPNETCORE_ENVIRONMENT` | ASP.NET Core ortamı (Development/Production) | Evet |
| `POSTGRESQL_CONNECTION_STRING` | PostgreSQL veritabanı bağlantı dizesi | Evet |
| `JWT_SECRET` | JWT token imzalama için gizli anahtar | Evet |
| `JWT_ISSUER` | JWT token düzenleyici tanımlayıcısı | Evet |
| `JWT_AUDIENCE` | JWT token hedef kitle tanımlayıcısı | Evet |
| `JWT_EXPIRATION_TIME_HRS` | Saat cinsinden JWT token geçerlilik süresi | Evet |

### Örnek Bağlantı Dizesi
```
Host=localhost;Database=auth_db;Username=auth_user;Password=sifreniz
```

## Mimari

```
UserService/
├── Controllers/        # API denetleyicileri
├── Domain/             # Domain varlıkları
├── Infrastructure/     # Veri erişim katmanı
│   ├── Data/           # Veritabanı bağlamı
│   ├── DTOs/           # Veri transfer nesneleri
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
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT kimlik doğrulama

### API & Dokümantasyon
- **Asp.Versioning.Http** - API versiyonlama desteği
- **Swashbuckle.AspNetCore** - Swagger/OpenAPI dokümantasyonu

### Ek Araçlar
- **Common** - Paylaşılan yardımcı araçlar ve modeller

## Başlarken

1. **Ön Koşullar**
   - .NET 8.0 SDK
   - PostgreSQL veritabanı
   - Docker (opsiyonel)

2. **Veritabanı Kurulumu**
    > PostgreSQL veritabanı oluşturun

3. **Ortamı Yapılandırın**
   ```bash
    # Ortam değişkenlerini ayarlayın veya appsettings.json'u güncelleyin
    export POSTGRESQL_CONNECTION_STRING="Host=localhost;Database=auth_db;Username=postgres;Password=sifre"
    export JWT_SECRET="super-gizli-anahtariniz"
    export JWT_ISSUER="duzenleyiciniz"
    export JWT_AUDIENCE="hedef-kitleniz"
    export JWT_EXPIRATION_TIME_HRS="gecerlilik-suresi"
   ```

4. **Servisi Çalıştırın**
   ```bash
    dotnet restore
    dotnet run
   ```

5. **API Dokümantasyonuna Erişin**
   - Etkileşimli API dokümanları için `https://<alan-adi>/api/docs/auth/swagger` adresine gidin

## Docker Dağıtımı

### İmaj Oluşturma
```bash
docker build -t conduit3d-auth:latest .
```

### Konteyner Çalıştırma
```bash
docker run -d \
  -p 8080:8080 \
  -e POSTGRESQL_CONNECTION_STRING="Host=db;Database=auth_db;Username=user;Password=pass" \
  -e JWT_SECRET="gizli-anahtariniz" \
  -e JWT_ISSUER="conduit3d" \
  -e JWT_AUDIENCE="conduit3d-users" \
  -e JWT_EXPIRATION_TIME_HRS="24" \
  conduit3d-auth:latest
```

## Güvenlik Özellikleri

- **JWT Token Kimlik Doğrulama** - Güvenli durumsuz kimlik doğrulama
- **Girdi Doğrulama** - İstek doğrulama
- **Hata Yönetimi** - Hassas bilgi içermeyen güvenli hata yanıtları

## Lisans

Bu proje Conduit3D platformunun bir parçasıdır.
