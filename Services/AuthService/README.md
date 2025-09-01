# AuthService

## Overview
Authentication and authorization service for the Conduit3D platform.

## Features
- User authentication (login/logout)
- JWT token management
- User editing functionality

## API Endpoints
- `POST /api/auth` - Create user
- `GET /api/auth` - Get users
- `POST /api/auth/{id}` - Get specified user
- `GET /api/auth/count` - Get user count
- `PUT /api/auth/{id}` - Update the user
- `DELETE /api/auth/{id}` - Delete the user
- `POST /api/auth/login` - Login

## Environment Variables
- `ASPNETCORE_ENVIRONMENT` - ASPNET environment type
- `POSTGRESQL_CONNECTION_STRING` - PosgreSQL database connection string
- `JWT_SECRET` - JWT Secret for signing
- `JWT_ISSUER` - JWT Issuer for signing
- `JWT_AUDIENCE` - JWT Audience for signing
- `JWT_EXPIRATION_TIME_HRS` - JWT Expiration for signing

## Dependencies
- Asp.Versioning.Http
- Asp.Versioning.Mvc.ApiExplorer
- Microsoft.AspNetCore.Authentication.JwtBearer
- Microsoft.AspNetCore.OpenApi
- Microsoft.EntityFrameworkCore
- Npgsql.EntityFrameworkCore.PostgreSQL
- Swashbuckle.AspNetCore.Swagger
- Swashbuckle.AspNetCore.SwaggerGen
- Swashbuckle.AspNetCore.SwaggerUI