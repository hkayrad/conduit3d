# TileService

A vector and raster tile serving service for the Conduit3D platform, powered by **MapLibre Martin**. It serves map tiles for use in the frontend visualization.

## Features

- **Vector Tiles (MVT/PBF)** - Efficient vector data streaming
- **MBTiles Support** - Serves pre-generated tile sets
- **Web UI** - Built-in tile preview interface
- **High Performance** - Rust-based tile server with caching

## Configuration

Configured via `config.yml` to define data sources and server settings.

### Key Configuration

- **Data Sources**: Links to `.mbtiles` files in the `/tileData` directory
- **Caching**: Configurable memory cache (default 1024MB)
- **Compression**: Supports gzip and brotli encoding

## Docker Deployment

Uses the `maplibre/martin` image.

```bash
# Run the TileService
docker run -it -v $(pwd):/tileData -p 3000:3000 maplibre/martin --config /tileData/config.yml
```

## Usage

### Endpoints

- `GET /catalog` - List available tile sources
- `GET /{source}/{z}/{x}/{y}` - Get vector tile (MVT format)
- `GET /health` - Health check endpoint

### Web UI

When `web_ui: enable-for-all` is set in config, access the tile preview at the root URL.

## Dependencies

- **MapLibre Martin** - Rust-based vector tile server
- **Docker** - Container platform
