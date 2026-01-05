# ApiGateway

The ApiGateway serves as the single entry point for the Conduit3D platform, routing requests to appropriate microservices and handling cross-cutting concerns like SSL/TLS termination and path rewriting.

## Features

- **Reverse Proxy** - Routes traffic to backend microservices
- **SSL/TLS Termination** - Handles HTTPS connections
- **Path Rewriting** - API versioning and route normalization
- **CORS Management** - Centralized CORS policy enforcement

## Configuration

Built on **Caddy**, a modern, secure-by-default web server.

### Caddyfile Key Sections

- **Site Configuration**:
    - `https://{$BASE_URL}`: Main entry point.
    - `handle /api/v1/user/*`: Routes to UserService.
    - `handle /api/v1/*`: Routes to other business microservices (Buildings, Lines, Poles).
    - `handle /tiles/*`: Routes tile requests to the TileService.
    - `handle /geoserver/*`: Routes mapping requests to GeoServer.

## Docker Deployment

The gateway is containerized using the official Caddy image.

```bash
# Build the gateway image
docker build -t conduit3d-gateway .

# Run the gateway
docker run -p 80:80 -p 443:443 conduit3d-gateway
```

## Dependencies

- **Caddy** - Web server and proxy
- **Docker** - Container platform
