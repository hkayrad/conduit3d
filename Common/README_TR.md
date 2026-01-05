# Conduit3D Ortak Kütüphane

Tüm mikro servislerde kullanılan domain modelleri, altyapı yapılandırmaları ve yardımcı araçları içeren Conduit3D platformu için paylaşılan sınıf kütüphanesi.

## Proje Yapısı

```
Common/
├── Domain/             # Paylaşılan domain varlıkları ve modeller
├── Infrastructure/     # Kesişen altyapı endişeleri
└── Helpers/           # Yardımcı sınıflar ve uzantılar
```

## Temel Bileşenler

### Domain
- **Response\<T\>** - Standart API yanıt sarmalayıcı tasarım deseni
- **Extent** - Jeouzaysal kapsam tanımlamaları
- **Roles** - Yetkilendirme politikaları için kullanılan sistem genelinde rol sabitleri (`Admin`, `User`)

### Infrastructure
- **SwaggerConfiguration** - Merkezi OpenAPI/Swagger kurulum filtreleri ve güvenlik tanımlamaları
- **DbContextConfiguration** - Paylaşılan EF Core yapılandırma mantığı
- **VersioningConfiguration** - API versiyonlama kurulumu
- **BehaviourConfiguration** - MVC seçenekleri ve davranış ayarları

## Kullanım

Aşağıdakilerde tutarlılık sağlamak için bu projeyi herhangi bir mikro serviste referans alın:
- API Yanıt formatları
- Kimlik Doğrulama/Yetkilendirme sabitleri
- Veritabanı yapılandırma desenleri
- API Dokümantasyon standartları

## Bağımlılıklar

- **Microsoft.EntityFrameworkCore**
- **Swashbuckle.AspNetCore**
- **Asp.Versioning.Mvc**
