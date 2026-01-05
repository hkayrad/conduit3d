# Conduit3D İstemci

Conduit3D platformu için TypeScript ve Vite ile geliştirilmiş React tabanlı web uygulaması. Bu istemci, elektrik altyapısı yönetimi ve görselleştirme için etkileşimli bir 3D jeouzaysal arayüz sağlar.

## Özellikler

- **3D Jeouzaysal Görselleştirme** - Elektrik altyapısı için etkileşimli 3D haritalar
- **CRUD Veri Entegrasyonu** - Binalar, direkler ve hatlar için mikro servislerle bağlantı
- **Masaüstü Tasarım** - Profesyonel kullanıcılar için verimli bir çalışma alanı sağlayan, büyük ekranlar için optimize edilmiş masaüstü odaklı tasarım.
- **Kullanıcı Kimlik Doğrulama** - Güvenli giriş ve rol tabanlı erişim kontrolü
- **Yönetici Paneli** - Kullanıcı yönetimi ve sistem yönetimi
- **Performans Optimizasyonu** - Vite ve Hot Module Replacement (HMR) ile hızlı derlemeler
- **Tip Güvenliği** - Gelişmiş geliştirme deneyimi için tam TypeScript desteği

## Teknoloji Yığını

### Temel Teknolojiler
- **React 19** - Hook'lar ve eşzamanlı özelliklerle modern React
- **TypeScript** - Daha iyi geliştirme deneyimi için tip güvenli JavaScript
- **Vite** - Anlık HMR ile hızlı derleme aracı
- **React Router** - SPA navigasyonu için istemci taraflı yönlendirme

### UI & Stillendirme
- **SCSS** - SCSS modülleri ile özel stillendirme
- **Bileşen Kütüphanesi** - Yeniden kullanılabilir UI bileşenleri

### Durum Yönetimi
- **Redux Toolkit** - Tahmin edilebilir durum konteyneri
- **React Hooks** - Yerel bileşen durum yönetimi

### Geliştirme Araçları
- **ESLint** - Kod linting ve formatlama
- **TypeScript Config** - Katı tip kontrolü
- **Vite DevTools** - Geliştirme optimizasyonu

## Proje Yapısı

```
Client/
├── public/               # Statik varlıklar
├── src/  
│   ├── app/              # Ana uygulama bileşenleri
│   │   ├── layout/       # Düzen bileşenleri
│   │   └── shared/       # Paylaşılan bileşenler
│   ├── lib/              # Yardımcı araçlar ve yapılandırmalar
│   │   ├── api/          # API istemcisi ve servisleri
│   │   ├── hooks/        # Özel React hook'ları
│   │   ├── utils/        # Yardımcı fonksiyonlar
│   │   ├── constants.ts  # Sabitler
│   │   ├── enums.ts      # Enum'lar
│   │   ├── instance.ts   # Axios Örneği
│   │   ├── store.ts      # Redux Store
│   │   └── types.d.ts    # Tipler
│   ├── global.scss       # Global stil tanımlamaları
│   ├── main.tsx          # Ana Uygulama
│   └── notFound.tsx      # 404 Sayfası
├── index.html            # Ana HTML şablonu
├── package.json          # Bağımlılıklar ve betikler
├── tsconfig.json         # TypeScript yapılandırması
└── vite.config.ts        # Vite yapılandırması
```

## Başlarken

### Ön Koşullar
- **Node.js** (v20 veya üstü)
- **npm** paket yöneticisi

### Kurulum

1. **Depoyu klonlayın**
   ```bash
    git clone <depo-url>
    cd conduit3d/Client
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
    npm install
   ```

3. **Ortamı yapılandırın**
   ```bash
   # Ortam dosyası oluşturun
    cp .env.example .env.local
   
   # API uç noktalarını ve yapılandırmayı güncelleyin
    VITE_API_URL=http(s)://<alan-adi>:<port>
    VITE_TILE_SERVER_URL=http(s)://<alan-adi>:<port>
   ```

4. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

5. **Uygulamaya erişin**
   - `http://localhost:<port>` adresine gidin

### Üretim için Derleme

```bash
# Uygulamayı derleyin
npm run build

# Sunum servisini yükleyin
npm i -g serve

# Üretim derlemesini önizleyin
serve -s dist
```

## Docker Dağıtımı

### İmaj Oluşturma
```bash
docker build -t conduit3d-client:latest .
```

### Konteyner Çalıştırma
```bash
docker run -d \
  -p 3000:80 \
  -e VITE_API_BASE_URL="https://api.conduit3d.com" \
  conduit3d-client:latest
```

## Geliştirme

### Mevcut Betikler

| Betik | Açıklama |
|-------|----------|
| `npm run dev` | HMR ile geliştirme sunucusunu başlat |
| `npm run build` | Üretim için derle |
| `npm run preview` | Üretim derlemesini önizle |
| `npm run lint` | ESLint'i çalıştır |

## Temel Özellikler

### 3D Harita Entegrasyonu
- Etkileşimli 3D jeouzaysal görselleştirme
- Elektrik altyapı katmanları desteği
- Gerçek zamanlı veri katmanı

### Kullanıcı Yönetimi
- JWT token'ları ile güvenli kimlik doğrulama
- Rol tabanlı erişim kontrolü
- Kullanıcı yönetimi için yönetici paneli

### Veri Görselleştirme
- Bina bilgi gösterimi
- Elektrik direği ve hat görselleştirmesi
- Detaylı veri içeren özellik bilgi panelleri

## Test

```bash
# Birim testlerini çalıştır
npm run test

# Kapsam ile testleri çalıştır
npm run test:coverage
```

## Performans

- **Hızlı Geliştirme** - Hızlı geliştirme için Vite'ın anlık HMR'ı
- **Optimize Derlemeler** - Tree shaking ve kod bölme
- **Modern Paketleme** - ES modülleri ve dinamik içe aktarmalar
- **Varlık Optimizasyonu** - Otomatik imaj ve varlık optimizasyonu

## Katkıda Bulunma

1. Depoyu çatallayın
2. Özellik dalı oluşturun (`git checkout -b feature/harika-ozellik`)
3. Değişikliklerinizi yapın
4. Yeni işlevsellik için testler ekleyin
5. Linting çalıştırın (`npm run lint`)
6. Değişikliklerinizi işleyin (`git commit -m 'Harika özellik ekle'`)
7. Dala gönderin (`git push origin feature/harika-ozellik`)
8. Pull Request açın

## Lisans

Bu proje Conduit3D platformunun bir parçasıdır.
