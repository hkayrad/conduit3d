# ApiGateway

ApiGateway, Conduit3D platformu için tek giriş noktası olarak hizmet verir, istekleri uygun mikro servislere yönlendirir ve SSL/TLS sonlandırma ve yol yeniden yazma gibi kesişen endişeleri yönetir.

## Özellikler

- **Ters Proxy** - Arka uç mikro servislerine trafiği yönlendirir
- **SSL/TLS Sonlandırma** - HTTPS bağlantılarını yönetir
- **Yol Yeniden Yazma** - API versiyonlama ve rota normalizasyonu
- **CORS Yönetimi** - Merkezi CORS politikası uygulaması

## Yapılandırma

Modern, varsayılan güvenli web sunucusu **Caddy** üzerine kurulmuştur.

### Caddyfile Temel Bölümleri

- **Site Yapılandırması**:
    - `https://{$BASE_URL}`: Ana giriş noktası.
    - `handle /api/v1/user/*`: UserService'e yönlendirir.
    - `handle /api/v1/*`: Diğer iş mikro servislerine (Buildings, Lines, Poles) yönlendirir.
    - `handle /tiles/*`: Karo isteklerini TileService'e yönlendirir.
    - `handle /geoserver/*`: Haritalama isteklerini GeoServer'a yönlendirir.

## Docker Dağıtımı

Gateway, resmi Caddy imajı kullanılarak konteynerleştirilmiştir.

```bash
# Gateway imajını oluşturun
docker build -t conduit3d-gateway .

# Gateway'i çalıştırın
docker run -p 80:80 -p 443:443 conduit3d-gateway
```

## Bağımlılıklar

- **Caddy** - Web sunucusu ve proxy
- **Docker** - Konteyner platformu
