# PolesService

## Overview
Poles retrieval service for Conduit3D platform

## Features
- AdrBina fetching
- TRafoBina fetching

## API Endpoints
- `GET /api/lines/agDirek` - Get agDirek
- `POST /api/lines/agDirek/{id}` - Get specified agDirek
- `GET /api/lines/agDirek/count` - Get agDirek count

- `GET /api/lines/ogMusDirek` - Get ogMusDirek
- `POST /api/lines/ogMusDirek/{id}` - Get specified ogMusDirek
- `GET /api/lines/ogMusDirek/count` - Get ogMusDirek count

- `GET /api/lines/aydDirek` - Get aydDirek
- `POST /api/lines/aydDirek/{id}` - Get specified aydDirek
- `GET /api/lines/aydDirek/count` - Get aydDirek count

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