# LinesService

## Overview
Lines retrieval service for Conduit3D platform

## Features
- AdrBina fetching
- TRafoBina fetching

## API Endpoints
- `GET /api/lines/agHat` - Get agHat
- `POST /api/lines/agHat/{id}` - Get specified agHat
- `GET /api/lines/agHat/count` - Get agHat count

- `GET /api/lines/ogHat` - Get ogHat
- `POST /api/lines/ogHat/{id}` - Get specified ogHat
- `GET /api/lines/ogHat/count` - Get ogHat count

- `GET /api/lines/rekortman` - Get rekortman
- `POST /api/lines/rekortman/{id}` - Get specified rekortman
- `GET /api/lines/rekortman/count` - Get rekortman count

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