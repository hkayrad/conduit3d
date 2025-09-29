# PolesService

A comprehensive electrical pole data management microservice built with ASP.NET Core for the Conduit3D platform. This service provides geospatial electrical pole data retrieval and management capabilities with PostGIS integration.

## 🚀 Features

- **Electrical Pole Data Management** - Comprehensive electrical pole information retrieval
- **Geospatial Support** - PostGIS integration for spatial data operations
- **Multiple Pole Types** - Support for AgDirek (low voltage), OgMusDirek (medium voltage), and AydDirek (lighting) poles
- **PostgreSQL Integration** - Reliable data persistence with Entity Framework Core
- **API Versioning** - Support for multiple API versions
- **Swagger Documentation** - Interactive API documentation
- **Docker Support** - Containerized deployment ready

## 📋 API Endpoints

### AgDirek (Low Voltage Poles)
- `GET /api/poles/agDirek` - Get paginated list of low voltage poles
- `GET /api/poles/agDirek/{id}` - Get specific low voltage pole by ID
- `GET /api/poles/agDirek/count` - Get low voltage pole statistics and counts

### OgMusDirek (Medium Voltage Poles)
- `GET /api/poles/ogMusDirek` - Get paginated list of medium voltage poles
- `GET /api/poles/ogMusDirek/{id}` - Get specific medium voltage pole by ID
- `GET /api/poles/ogMusDirek/count` - Get medium voltage pole statistics and counts

### AydDirek (Lighting Poles)
- `GET /api/poles/aydDirek` - Get paginated list of lighting poles
- `GET /api/poles/aydDirek/{id}` - Get specific lighting pole by ID
- `GET /api/poles/aydDirek/count` - Get lighting pole statistics and counts

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ASPNETCORE_ENVIRONMENT` | ASP.NET Core environment (Development/Production) | Yes |
| `POSTGRESQL_CONNECTION_STRING` | PostgreSQL database connection string with PostGIS | Yes |

### Example Connection String
```
Host=localhost;Database=poles_db;Username=poles_user;Password=your_password
```

## 🏗️ Architecture

```
PolesService/
├── Controllers/        # API controllers
├── Domain/             # Domain entities
├── Infrastructure/     # Data access layer
│   ├── Data/           # Database context
│   ├── Repositories/   # Repository pattern implementation
│   ├── Services/       # Business logic services
│   ├── Utilities/      # Helper utilities
│   └── UnitOfWork.cs   # Unit Of Work
├── Properties/         # Launch settings
└── Resources/          # Localization resources
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

   - AgDirek

   |id|geometry|kodu|adi|cinsi|tipi|direk_no|boy_ozellik|direk_boy_id|searchable_text|
   |-|-|-|-|-|-|-|-|-|-|
   |int PK|geometry|varchar(50)|varchar(50)|varchar(20)|varchar(50)|varchar(40)|varchar(20)|double|tsvector|
   |NOT NULL|-|-|-|-|-|-|-|-|-|
   |AI|-|-|-|-|-|-|-|-|(function generated)|

   > Generate the tsvector column

   ```sql 
   CREATE OR REPLACE FUNCTION generate_searchable_text_ag_direk(
       id_val INT, 
       kodu_val TEXT,
       adi_val TEXT, 
       cinsi_val TEXT,
       tipi_val TEXT,
       direk_no_val TEXT,
       boy_ozellik_val TEXT,
       direk_boy_id_val FLOAT8
   )
   RETURNS tsvector
   AS $$
   SELECT to_tsvector('simple', 
       coalesce(cast(id_val as text), '') || ' ' ||
       coalesce(kodu_val, '') || ' ' ||
       coalesce(adi_val, '') || ' ' ||
   	coalesce(cinsi_val, '') || ' ' ||
   	coalesce(tipi_val, '') || ' ' ||
   	coalesce(direk_no_val, '') || ' ' ||
   	coalesce(boy_ozellik_val, '') || ' ' ||
   	coalesce(cast(direk_boy_id_val as text), '')
   );
   $$ LANGUAGE SQL IMMUTABLE;

   -- Add the generated column to the adr_bina table
   ALTER TABLE "SBK_AGDIREK" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
       generate_searchable_text_ag_direk(id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik,  direk_boy_id)
   ) STORED;

   -- Create GIN index for fast text search
   create INDEX idx_agdirek_searchable_text ON "SBK_AGDIREK" USING GIN(searchable_text);
   ```

   - OgMusDirek

   |id|geometry|kodu|adi|cinsi|tipi|direk_no|boy_ozellik|direk_boy_id|searchable_text|
   |-|-|-|-|-|-|-|-|-|-|
   |int PK|geometry|varchar(50)|varchar(50)|varchar(20)|varchar(50)|varchar(40)|varchar(20)|double|tsvector|
   |NOT NULL|-|-|-|-|-|-|-|-|-|
   |AI|-|-|-|-|-|-|-|-|(function generated)|
   
   > Generate the tsvector column

   ```sql 
   CREATE OR REPLACE FUNCTION generate_searchable_text_og_mus_direk(
       id_val INT, 
       kodu_val TEXT,
       adi_val TEXT, 
       cinsi_val TEXT,
       tipi_val TEXT,
       direk_no_val TEXT,
       boy_ozellik_val TEXT,
       direk_boy_id_val FLOAT8
   )
   RETURNS tsvector
   AS $$
   SELECT to_tsvector('simple', 
       coalesce(cast(id_val as text), '') || ' ' ||
       coalesce(kodu_val, '') || ' ' ||
       coalesce(adi_val, '') || ' ' ||
   	coalesce(cinsi_val, '') || ' ' ||
   	coalesce(tipi_val, '') || ' ' ||
   	coalesce(direk_no_val, '') || ' ' ||
   	coalesce(boy_ozellik_val, '') || ' ' ||
   	coalesce(cast(direk_boy_id_val as text), '')
   );
   $$ LANGUAGE SQL IMMUTABLE;

   -- Add the generated column to the adr_bina table
   ALTER TABLE "SBK_OGMUSDIREK" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
       generate_searchable_text_og_mus_direk(id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik,    direk_boy_id)
   ) STORED;

   -- Create GIN index for fast text search
   create INDEX idx_ogmusdirek_searchable_text ON "SBK_OGMUSDIREK" USING GIN(searchable_text);
   ```

   - AydDirek

   |id|geometry|kodu|adi|cinsi|tipi|direk_no|boy_ozellik|direk_boy_id|searchable_text|
   |-|-|-|-|-|-|-|-|-|-|
   |int PK|geometry|varchar(50)|varchar(50)|varchar(20)|varchar(50)|varchar(20)|varchar(20)|double|tsvector|
   |NOT NULL|-|-|-|-|-|-|-|-|-|
   |AI|-|-|-|-|-|-|-|-|(function generated)|

   > Generate the tsvector column

   ```sql
   CREATE OR REPLACE FUNCTION generate_searchable_text_ayd_direk(
       id_val INT, 
       kodu_val TEXT,
       adi_val TEXT, 
       cinsi_val TEXT,
       tipi_val TEXT,
       direk_no_val TEXT,
       boy_ozellik_val TEXT,
       direk_boy_id_val FLOAT8
   )
   RETURNS tsvector
   AS $$
   SELECT to_tsvector('simple', 
       coalesce(cast(id_val as text), '') || ' ' ||
       coalesce(kodu_val, '') || ' ' ||
       coalesce(adi_val, '') || ' ' ||
   	coalesce(cinsi_val, '') || ' ' ||
   	coalesce(tipi_val, '') || ' ' ||
   	coalesce(direk_no_val, '') || ' ' ||
   	coalesce(boy_ozellik_val, '') || ' ' ||
   	coalesce(cast(direk_boy_id_val as text), '')
   );
   $$ LANGUAGE SQL IMMUTABLE;
   
   -- Add the generated column to the adr_bina table
   ALTER TABLE "SBK_AYDDIREK" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
       generate_searchable_text_ayd_direk(id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik,    direk_boy_id)
   ) STORED;
   
   -- Create GIN index for fast text search
   create INDEX idx_ayddirek_searchable_text ON "SBK_AYDDIREK" USING GIN(searchable_text);
   ```

3. **Configure Environment**
   ```bash
   # Set environment variables or update appsettings.json
   export POSTGRESQL_CONNECTION_STRING="Host=localhost;Database=poles_db;Username=postgres;Password=password"
   ```

4. **Run the Service**
   ```bash
   dotnet restore
   dotnet run
   ```

5. **Access API Documentation**
   - Navigate to `https://<domain>/api/docs/poles/swagger` for interactive API docs

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t conduit3d-poles:latest .
```

### Run Container
```bash
docker run -d \
  -p 8080:8080 \
  -e POSTGRESQL_CONNECTION_STRING="Host=db;Database=poles_db;Username=user;Password=pass" \
  conduit3d-poles:latest
```

## ⚡ Electrical Pole Types

### AgDirek (Low Voltage Poles)
Low voltage electrical distribution poles supporting lines operating at 400V or below.

### OgMusDirek (Medium Voltage Poles)
Medium voltage electrical distribution poles supporting lines operating between 1kV and 35kV.

### AydDirek (Lighting Poles)
Street lighting poles and infrastructure supporting public illumination systems.

## 🗺️ Geospatial Features

- **PostGIS Integration** - Advanced spatial data operations
- **Point Geometry Support** - Precise pole location handling
- **Spatial Queries** - Location-based pole data retrieval
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
- Structured logging for electrical infrastructure operations -->

## 📄 License

This project is part of the