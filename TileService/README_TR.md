# TileService

**MapLibre Martin** tarafından desteklenen, Conduit3D platformu için vektör ve raster karo sunum servisi. Ön yüz görselleştirmesinde kullanılmak üzere harita karolarını sunar.

## Özellikler

- **Vektör Karolar (MVT/PBF)** - Verimli vektör veri akışı
- **MBTiles Desteği** - Önceden oluşturulmuş karo setlerini sunar
- **Web Arayüzü** - Yerleşik karo önizleme arayüzü
- **Yüksek Performans** - Önbellekleme özellikli Rust tabanlı karo sunucusu

## Yapılandırma

Veri kaynakları ve sunucu ayarlarını tanımlamak için `config.yml` aracılığıyla yapılandırılır.

### Temel Yapılandırma

- **Veri Kaynakları**: `/tileData` dizinindeki `.mbtiles` dosyalarına bağlantılar
- **Önbellekleme**: Yapılandırılabilir bellek önbelleği (varsayılan 1024MB)
- **Sıkıştırma**: gzip ve brotli kodlaması desteği

## Docker Dağıtımı

`maplibre/martin` imajını kullanır.

```bash
# TileService'i çalıştırın
docker run -it -v $(pwd):/tileData -p 3000:3000 maplibre/martin --config /tileData/config.yml
```

## Kullanım

### Uç Noktalar

- `GET /catalog` - Mevcut karo kaynaklarını listele
- `GET /{kaynak}/{z}/{x}/{y}` - Vektör karo al (MVT formatı)
- `GET /health` - Sağlık kontrolü uç noktası

### Web Arayüzü

Yapılandırmada `web_ui: enable-for-all` ayarlandığında, karo önizlemesine kök URL'den erişin.

## Bağımlılıklar

- **MapLibre Martin** - Rust tabanlı vektör karo sunucusu
- **Docker** - Konteyner platformu
