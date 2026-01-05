# BuildingsService

A building data management microservice built with ASP.NET Core for the Conduit3D platform. This service provides geospatial building data retrieval and management capabilities with PostGIS integration.

## Features

- **Building Data Management** - Building information retrieval
- **Geospatial Support** - PostGIS integration for spatial data operations
- **Multiple Building Types** - Support for AdrBina, TrafoBina, and general buildings
- **PostgreSQL Integration** - Reliable data persistence with Entity Framework Core
- **API Versioning** - Support for multiple API versions
- **Swagger Documentation** - Interactive API documentation
- **Docker Support** - Containerized deployment ready

## API Endpoints

### AdrBina (Address Buildings)
- `GET /api/v1/adrBina` - Get paginated list of address buildings
- `GET /api/v1/adrBina/{id}` - Get specific address building by ID
- `GET /api/v1/adrBina/count` - Get address building statistics and counts

### TrafoBina (Transformer Buildings)
- `GET /api/v1/trafoBina` - Get paginated list of transformer buildings
- `GET /api/v1/trafoBina/{id}` - Get specific transformer building by ID
- `GET /api/v1/trafoBina/count` - Get transformer building statistics and counts

### General Buildings
- `GET /api/v1/buildings` - Get paginated list of general buildings
- `GET /api/v1/buildings/{id}` - Get specific general building by ID
- `GET /api/v1/buildings/count` - Get general building statistics and counts

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ASPNETCORE_ENVIRONMENT` | ASP.NET Core environment (Development/Production) | Yes |
| `POSTGRESQL_CONNECTION_STRING` | PostgreSQL database connection string with PostGIS | Yes |

### Example Connection String
```
Host=localhost;Database=buildings_db;Username=buildings_user;Password=your_password
```

## Architecture

```
BuildingsService/
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

## Dependencies

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

## Getting Started

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

   - AdrBina

   |id|geometry|kodu|site_adi|adi|bina_kat_sayisi|daire_sayisi|isyeri_sayisi|yukseklik|searchable_text|
   |-|-|-|-|-|-|-|-|-|-|
   |int PK|geometry|varchar(100)|varchar(100)|varchar(100)|double|double|double|double|tsvector|
   |NOT NULL|-|-|-|-|-|-|-|-|-|
   |AI|-|-|-|-|-|-|-|-|(function generated)|

   > Generate the tsvector column

   ```sql 
   CREATE OR REPLACE FUNCTION generate_searchable_text_adr_bina(
       id_val INT, 
       kodu_val TEXT,
       site_adi_val TEXT,
       adi_val TEXT, 
       bina_kat_sayisi_val FLOAT8,
       daire_sayisi_val FLOAT8,
       isyeri_sayisi_val FLOAT8,
       yukseklik_val FLOAT8
   )
   RETURNS tsvector
   AS $$
   SELECT to_tsvector('simple', 
       coalesce(cast(id_val as text), '') || ' ' ||
       coalesce(kodu_val, '') || ' ' ||
       coalesce(site_adi_val, '') || ' ' ||
       coalesce(adi_val, '') || ' ' ||
       coalesce(cast(bina_kat_sayisi_val as text), '') || ' ' ||
       coalesce(cast(daire_sayisi_val as text), '') || ' ' ||
       coalesce(cast(isyeri_sayisi_val as text), '') || ' ' ||
       coalesce(cast(yukseklik_val as text), '')
   );
   $$ LANGUAGE SQL IMMUTABLE;

   -- Add the generated column to the adr_bina table
   ALTER TABLE "ADR_BINA" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
       generate_searchable_text_adr_bina(id, kodu, site_adi, adi, bina_kat_sayisi, daire_sayisi, isyeri_sayisi, yukseklik)
   ) STORED;

   -- Create GIN index for fast text search
   CREATE INDEX idx_adr_bina_searchable_text ON "ADR_BINA" USING GIN  (searchable_text);
   ```

   - TrafoBina

   |id|geometry|adi|kodu|searchable_text|
   |-|-|-|-|-|
   |int PK|geometry|varchar(100)|varchar(100)|tsvector|
   |NOT NULL|-|-|-|-|
   |AI|-|-|-|(function generated)|

   > Generate the tsvector column

   ```sql 
   CREATE OR REPLACE FUNCTION generate_searchable_text_trafo_bina(
       id_val INT, 
       kodu_val TEXT,
       adi_val TEXT
   )
   RETURNS tsvector
   AS $$
   SELECT to_tsvector('simple', 
       coalesce(cast(id_val as text), '') || ' ' ||
       coalesce(kodu_val, '') || ' ' ||
       coalesce(adi_val, '')
   );
   $$ LANGUAGE SQL IMMUTABLE;

   -- Add the generated column to the trafo_bina table
   ALTER TABLE "SBK_TRAFOBINATIP" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
       generate_searchable_text_trafo_bina(id, kodu, adi)
   ) STORED;

   -- Create GIN index for fast text search
   CREATE INDEX idx_trafo_bina_searchable_text ON "SBK_TRAFOBINATIP" USING GIN(searchable_text);
   ```

   - AdrYol

   |id|geometry|genislik|serit_sayisi|yapisi|tipi|kodu|adi|searchable_text|
   |-|-|-|-|-|-|-|-|-|
   |int PK|geometry|double|double|varchar(30)|varchar(25)|varchar(20)|varchar(100)|tsvector|
   |NOT NULL|-|-|-|-|-|-|-|-|
   |AI|-|-|-|-|-|-|-|(function generated)|

   > Generate the tsvector column

   ```sql 
   CREATE OR REPLACE FUNCTION generate_searchable_text_adr_yol(
       id_val INT, 
       genislik_val FLOAT8,
       serit_sayisi_val FLOAT8,
       yapisi_val TEXT,
       tipi_val TEXT,
       kodu_val TEXT,
       adi_val TEXT
   )
   RETURNS tsvector
   AS $$
   SELECT to_tsvector('simple', 
       coalesce(cast(id_val as text), '') || ' ' ||
       coalesce(cast(genislik_val as text), '') || ' ' ||
       coalesce(cast(serit_sayisi_val as text), '') || ' ' ||
       coalesce(yapisi_val, '') || ' ' ||
       coalesce(tipi_val, '') || ' ' ||
       coalesce(kodu_val, '') || ' ' ||
       coalesce(adi_val, '')
   );
   $$ LANGUAGE SQL IMMUTABLE;

   -- Add the generated column to the trafo_bina table
   ALTER TABLE "ADR_YOL" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
       generate_searchable_text_adr_yol(id, genislik, serit_sayisi, yapisi, tipi, kodu, adi)
   ) STORED;

   -- Create GIN index for fast text search
   CREATE INDEX idx_adr_yol_searchable_text ON "ADR_YOL" USING GIN(searchable_text);
   ```

3. **Configure Environment**
   ```bash
   # Set environment variables or update appsettings.json
   export POSTGRESQL_CONNECTION_STRING="Host=localhost;Database=buildings_db;Username=postgres;Password=password"
   ```

4. **Run the Service**
   ```bash
   dotnet restore
   dotnet run
   ```

5. **Access API Documentation**
   - Navigate to `https://<domain>/api/docs/buildings/swagger` for interactive API docs

## Docker Deployment

### Build Image
```bash
docker build -t conduit3d-buildings:latest .
```

### Run Container
```bash
docker run -d \
  -p 8080:8080 \
  -e POSTGRESQL_CONNECTION_STRING="Host=db;Database=buildings_db;Username=user;Password=pass" \
  conduit3d-buildings:latest
```

## Geospatial Features

- **PostGIS Integration** - Advanced spatial data operations
- **Geometry Support** - Point, polygon, and complex geometry handling
- **Spatial Queries** - Location-based data retrieval

<!-- ## 🧪 Testing

```bash
# Run unit tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
``` -->

## Data Models

### AdrBina (Address Buildings)
Buildings with address information and spatial coordinates.

### TrafoBina (Transformer Buildings)
Buildings housing electrical transformers with technical specifications.

### General Buildings
Standard building entities with basic structural information.
> ! Will be removed !

## License

This project is part of the Conduit3D platform.