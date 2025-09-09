# LinesService

An electrical line data management microservice built with ASP.NET Core for the Conduit3D platform. This service provides geospatial electrical line data retrieval and management capabilities with PostGIS integration.

## 🚀 Features

- **Electrical Line Data Management** - Electrical line information retrieval
- **Geospatial Support** - PostGIS integration for spatial data operations
- **Multiple Line Types** - Support for AgHat (low voltage), OgHat (medium voltage), and Rekortman lines
- **PostgreSQL Integration** - Reliable data persistence with Entity Framework Core
- **API Versioning** - Support for multiple API versions
- **Swagger Documentation** - Interactive API documentation
- **Docker Support** - Containerized deployment ready

## 📋 API Endpoints

### AgHat (Low Voltage Lines)
- `GET /api/lines/agHat` - Get paginated list of low voltage lines
- `GET /api/lines/agHat/{id}` - Get specific low voltage line by ID
- `GET /api/lines/agHat/count` - Get low voltage line statistics and counts

### OgHat (Medium Voltage Lines)
- `GET /api/lines/ogHat` - Get paginated list of medium voltage lines
- `GET /api/lines/ogHat/{id}` - Get specific medium voltage line by ID
- `GET /api/lines/ogHat/count` - Get medium voltage line statistics and counts

### Rekortman (Service Lines)
- `GET /api/lines/rekortman` - Get paginated list of service lines
- `GET /api/lines/rekortman/{id}` - Get specific service line by ID
- `GET /api/lines/rekortman/count` - Get service line statistics and counts

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ASPNETCORE_ENVIRONMENT` | ASP.NET Core environment (Development/Production) | Yes |
| `POSTGRESQL_CONNECTION_STRING` | PostgreSQL database connection string with PostGIS | Yes |

### Example Connection String
```
Host=localhost;Database=lines_db;Username=lines_user;Password=your_password
```

## 🏗️ Architecture

```
LinesService/
├── Controllers/          # API controllers
│   ├── AgHatController.cs
│   ├── OgHatController.cs
│   └── RekortmanController.cs
├── Domain/              # Domain entities
│   ├── AgHat.cs
│   ├── OgHat.cs
│   └── Rekortman.cs
├── Infrastructure/      # Data access layer
│   ├── Data/           # Database context
│   ├── Repositories/   # Repository pattern implementation
│   └── Services/       # Business logic services
├── Properties/         # Launch settings
└── Resources/          # Localization resources
```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t conduit3d-lines:latest .
```

### Run Container
```bash
docker run -d \
  -p 8080:8080 \
  -e POSTGRESQL_CONNECTION_STRING="Host=db;Database=lines_db;Username=user;Password=pass" \
  conduit3d-lines:latest
```

## 🔗 Dependencies

### Core Dependencies
- **ASP.NET Core 8.0** - Web framework
- **Entity Framework Core** - ORM for database operations
- **Npgsql.EntityFrameworkCore.PostgreSQL** - PostgreSQL provider
- **Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite** - PostGIS spatial data support

### API & Documentation
- **Asp.Versioning.Http** - API versioning support
- **Asp.Versioning.Mvc.ApiExplorer** - API explorer for versioning
- **Swashbuckle.AspNetCore** - Swagger/OpenAPI documentation

### Geospatial Support
- **NetTopologySuite** - Spatial data types and operations
- **NetTopologySuite.IO.PostGis** - PostGIS integration

### Additional Tools
- **Common** - Shared utilities and models

## 🚦 Getting Started

1. **Prerequisites**
   - .NET 8.0 SDK
   - PostgreSQL database with PostGIS extension
   - Docker (optional)

2. **Setup Database**
   > Create PostgreSQL database with PostGIS extension
   ```sql
   CREATE DATABASE <db_name>;
   \c <db_name>;
   CREATE EXTENSION postgis;
   ```

   - AgHat

   |id|geometry|kodu|adi|cinsi|kesit|tipi|searchable_text|
   |-|-|-|-|-|-|-|-|
   |int PK|geometry|varchar(150)|varchar(50)|varchar(20)|varchar(40)|varchar(20)|tsvector|
   |NOT NULL|-|-|-|-|-|-|-|
   |AI|-|-|-|-|-|-|(function generated)|

   - OgHat

   |id|geometry|adi|kodu|cinsi|kesit|tipi|searchable_text|
   |-|-|-|-|-|-|-|-|
   |int PK|geometry|varchar(200)|varchar(50)|varchar(20)|varchar(40)|varchar(4)|tsvector|
   |NOT NULL|-|-|-|-|-|-|-|
   |AI|-|-|-|-|-|-|(function generated)|

   - Rekortman

   |id|geometry|adi|kodu|kesit|tipi|searchable_text|
   |-|-|-|-|-|-|-|
   |int PK|geometry|varchar(50)|varchar(50)|varchar(40)|varchar(20)|tsvector|
   |NOT NULL|-|-|-|-|-|-|
   |AI|-|-|-|-|-|(function generated)|

3. **Configure Environment**
   ```bash
   # Set environment variables or update appsettings.json
   export POSTGRESQL_CONNECTION_STRING="Host=localhost;Database=lines_db;Username=postgres;Password=password"
   ```

4. **Run the Service**
   ```bash
   dotnet restore
   dotnet run
   ```

5. **Access API Documentation**
   - Navigate to `https://<domain>/api/docs/lines/swagger` for interactive API docs

## ⚡ Electrical Line Types

### AgHat (Low Voltage Lines)
Low voltage electrical distribution lines typically operating at 400V or below.

### OgHat (Medium Voltage Lines)
Medium voltage electrical distribution lines typically operating between 1kV and 35kV.

### Rekortman (Service Lines)
Service connection lines connecting individual consumers to the distribution network.

## 🗺️ Geospatial Features

- **PostGIS Integration** - Advanced spatial data operations
- **Line Geometry Support** - LineString and MultiLineString handling
- **Spatial Queries** - Location-based line data retrieval
- **Coordinate System Support** - Multiple spatial reference systems

<!-- ## 🧪 Testing

```bash
# Run unit tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

## 📊 Monitoring

The service includes built-in health checks and logging:
- Health endpoint: `/health`
- Metrics endpoint: `/metrics`
- Structured logging for electrical network operations -->

## 📄 License

This project is part of the Conduit3D platform.