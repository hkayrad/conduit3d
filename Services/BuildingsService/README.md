# BuildingsService

## Overview
Building retrieval service for Conduit3D platform

## Features
- AdrBina fetching
- TRafoBina fetching

## API Endpoints
- `GET /api/buildings/adrBina` - Get adrBina
- `POST /api/buildings/adrBina/{id}` - Get specified adrBina
- `GET /api/buildings/adrBina/count` - Get adrBina count

- `GET /api/buildings/trafoBina` - Get trafoBina
- `POST /api/buildings/trafoBina/{id}` - Get specified trafoBina
- `GET /api/buildings/trafoBina/count` - Get trafoBina count

- `GET /api/buildings/buildings` - Get other buildings
- `POST /api/buildings/buildings/{id}` - Get specified other buildings
- `GET /api/buildings/buildings/count` - Get other buildings count

## Environment Variables
- `ASPNETCORE_ENVIRONMENT` - ASPNET environment type
- `POSTGRESQL_CONNECTION_STRING` - PosgreSQL database connection string

## Dependencies
- Asp.Versioning.Http
- Asp.Versioning.Mvc.ApiExplorer
- Microsoft.AspNetCore.OpenApi
- Microsoft.EntityFrameworkCore
- Npgsql.EntityFrameworkCore.PostgreSQL
- Swashbuckle.AspNetCore.Swagger
- Swashbuckle.AspNetCore.SwaggerGen
- Swashbuckle.AspNetCore.SwaggerUI
- Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite