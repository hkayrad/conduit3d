# Conduit3D Common Library

A shared class library for the Conduit3D platform containing domain models, infrastructure configurations, and utility helpers used across all microservices.

## Project Structure

```
Common/
├── Domain/             # Shared domain entities and models
├── Infrastructure/     # Cross-cutting infrastructure concerns
└── Helpers/           # Utility classes and extensions
```

## Key Components

### Domain
- **Response\<T\>** - Standard API response wrapper design pattern
- **Extent** - Geospatial extent definitions
- **Roles** - System-wide role constants (`Admin`, `User`) used for authorization policies

### Infrastructure
- **SwaggerConfiguration** - Centralized OpenAPI/Swagger setup filters and security definitions
- **DbContextConfiguration** - Shared EF Core configuration logic
- **VersioningConfiguration** - API versioning setup
- **BehaviourConfiguration** - MVC options and behavior settings

## Usage

Reference this project in any microservice to ensure consistency in:
- API Response formats
- Authentication/Authorization constants
- Database configuration patterns
- API Documentation standards

## Dependencies

- **Microsoft.EntityFrameworkCore**
- **swashbuckle.AspNetCore**
- **Asp.Versioning.Mvc**
