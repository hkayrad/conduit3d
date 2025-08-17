# Conduit3D

Conduit3D is a modular .NET solution for managing geospatial infrastructure data, including authentication, buildings, lines, and poles. It uses ASP.NET Core, Entity Framework Core, PostgreSQL/PostGIS, and Caddy for API gateway and JWT authentication.

## Project Structure

- [Common](Common/Common.csproj): Shared domain models and utilities.
- [Services/AuthService](Services/AuthService/AuthService.csproj): User authentication and management API.
- [Services/BuildingsService](Services/BuildingsService/BuildingsService.csproj): Buildings data API.
- [Services/LinesService](Services/LinesService/LinesService.csproj): Lines data API.
- [Services/PolesService](Services/PolesService/PolesService.csproj): Poles data API.
- [ApiGateway](ApiGateway): Caddy-based API gateway with JWT authentication and static file serving.
- [docker-compose.yaml](docker-compose.yaml): Multi-service orchestration for databases, APIs, and gateway.

## Features

- **Authentication:** JWT-based, role-aware user management.
- **Geospatial APIs:** CRUD and query endpoints for buildings, lines, and poles.
- **API Gateway:** Caddy reverse proxy with JWT validation.
- **PostgreSQL/PostGIS:** Spatial queries and storage.
- **Versioned REST APIs:** Using Asp.Versioning.
- **Centralized Error Handling:** Consistent response models.

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/products/docker-desktop)

### Build & Run Locally

1. **Clone the repository:**
    ```sh
    git clone <repo-url>
    cd conduit3d
    ```

2. **Set environment variables:**
   - Copy `.env.example` to `.env` and fill in secrets (DB credentials, JWT secrets, etc).

3. **Start all services with Docker Compose:**
    ```sh
    docker-compose up --build
    ```

4. **Access APIs:**
   - API Gateway: [http://localhost](http://localhost)
   - AuthService: `/api/v1/auth`
   - BuildingsService: `/api/v1/buildings`
   - LinesService: `/api/v1/lines`
   - PolesService: `/api/v1/poles`

5. **Access Swagger Documentation:**
   - AuthService: `/docs/auth/swagger`
   - BuildingsService: `/docs/buildings/swagger`
   - PolesService: `/docs/poles/swagger`
   - LinesService: `/docs/lines/swagger`

### Development

- Each service can be run/debugged individually using Visual Studio or VS Code.
- API docs available via Swagger UI at `/swagger` for each service in development mode.

## Coding Conventions

See [CODING_CONVENTION.md](CODING_CONVENTION.md) for .NET style and architecture guidelines.

## Security

- Secrets are managed via environment variables.
- JWT authentication enforced at the gateway level, and authorization is checked at the service level.

## License

Specify your license here.

## Contributing

Pull requests and issues are welcome. Please follow the coding conventions and submit changes with clear commit messages.
