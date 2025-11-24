[![Backend Test](https://github.com/hkayrad/conduit3d/actions/workflows/backend-test.yml/badge.svg?branch=master)](https://github.com/hkayrad/conduit3d/actions/workflows/backend-test.yml)
[![Frontend Test](https://github.com/hkayrad/conduit3d/actions/workflows/frontend-test.yml/badge.svg?branch=master)](https://github.com/hkayrad/conduit3d/actions/workflows/frontend-test.yml)

# Conduit3D Platform

A microservices-based platform for managing geospatial electrical infrastructure data. Built with modern .NET technologies, React, and PostgreSQL/PostGIS for scalable 3D visualization and data management.

## 🚀 Overview

Conduit3D is a modular platform designed for electrical utility companies to manage and visualize their infrastructure assets including buildings, electrical poles, power lines, and related geospatial data through an interactive 3D interface.

## 🏗️ Architecture

### Microservices

- **[AuthService](Services/AuthService/)** - User authentication and authorization with JWT
- **[BuildingsService](Services/BuildingsService/)** - Building data management with PostGIS
- **[LinesService](Services/LinesService/)** - Electrical line infrastructure management
- **[PolesService](Services/PolesService/)** - Electrical pole infrastructure management

### Frontend

- **[Client](Client/)** - React TypeScript application with 3D geospatial visualization

### Infrastructure

- **[ApiGateway](ApiGateway/)** - Caddy-based reverse proxy with JWT validation
- **[Common](Common/)** - Shared domain models and utilities
- **[TileService](TileService/)** - Map tile serving for geospatial visualization

## 🔧 Tech Stack

### Backend Services

- **ASP.NET Core 8.0** - Web API framework
- **Entity Framework Core** - ORM with PostgreSQL provider
- **PostgreSQL/PostGIS** - Spatial database for geospatial data
- **JWT Authentication** - Secure token-based authentication
- **Swagger/OpenAPI** - API documentation

### Frontend [(Dependency List)](Client/package.json)

- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Redux Toolkit** - State management
- **Deck.gl** - Interactive geospatial visualization

### Infrastructure

- **Docker & Docker Compose** - Containerization and orchestration
- **Caddy** - Modern web server and reverse proxy
- **PostGIS** - Spatial database extensions

## 🚦 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [.NET 8 SDK](https://dotnet.microsoft.com/download) (for local development)
- [Node.js 18+](https://nodejs.org/) (for frontend development)

### Quick Start with Docker

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd conduit3d
   ```

2. **Set up environment variables**

   ```bash
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env with your database passwords and JWT secrets
   ```

3. **Start all services**

   ```bash
   # Build and start all services
   docker compose up --build -d
   ```

4. **Access the application**
   - **Main Application**: https://\<domain>
   - **API Gateway**: https://\<domain>/api
   - **API Documentation**:
     - Auth: https://\<domain>/api/docs/auth/swagger
     - Buildings: https://\<domain>/api/docs/buildings/swagger
     - Lines: https://\<domain>/api/docs/lines/swagger
     - Poles: https://\<domain>/api/docs/poles/swagger

## 📋 API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /login` - User authentication
- `GET /` - List users (paginated)
- `GET /count` - Get user count
- `GET /{id}` - Get user details
- `POST /` - Create user
- `PUT /{id}` - Update user
- `DELETE /{id}` - Delete user

### Buildings

> Address Buildings (`/api/v1/adrBina`) <br/>
> Transformer Buildings (`/api/v1/trafoBina`) <br/>
> General Buildings (`/api/v1/buildings`)

- `GET /` - List buildings (paginated)
- `GET /{id}` - Get building details
- `GET /count` - Get building count

### Lines

> Low Voltage Lines (`/api/v1/agHat`) <br/>
> Medium Voltage Lines (`/api/v1/ogHat`) <br/>
> Service Lines (`/api/v1/rekortman`)

- `GET /` - List lines (paginated)
- `GET /{id}` - Get line details
- `GET /count` - Get line count
- `GET /types` - Get line types

### Poles

> Low Voltage Poles (`/api/v1/agDirek`) <br/>
> Medium Voltage Poles (`/api/v1/ogMusDirek`) <br/>
> Lighting Poles (`/api/v1/aydDirek`)

- `GET /` - List poles (paginated)
- `GET /{id}` - Get pole details
- `GET /count` - Get pole count
- `GET /types` - Get pole types

## 🔧 Development

### Local Development Setup

1. **Backend Services**

   ```bash
   # Start databases only
   docker compose up auth_database buildings_database lines_database poles_database -d

   # Run services locally
   cd Services/AuthService
   dotnet run
   ```

2. **Frontend Development**

   ```bash
   cd Client
   npm install
   npm run dev
   ```

3. **API Gateway**
   ```bash
   cd ApiGateway
   docker build -t caddy_gateway .
   docker run -p 80:80 -p 443:443 caddy_gateway
   ```

### Environment Variables

| Variable                  | Description                  |
| ------------------------- | ---------------------------- |
| `JWT_ISSUER`              | JWT Issuer for signing       |
| `JWT_AUDIENCE`            | JWT Audience for signing     |
| `JWT_SIGNING_ALGORITHM`   | Algorithm                    |
| `JWT_SECRET`              | JWT Secret for signing       |
| `JWT_SECRET_BASE64`       | JWT Secret in BASE64         |
| `JWT_EXPIRATION_TIME_HRS` | JWT Expiration Time in hours |
| `AUTH_DB_NAME`            | Auth database name           |
| `AUTH_DB_USER`            | Auth database user           |
| `AUTH_DB_PASS`            | Auth database password       |
| `BUILDINGS_DB_NAME`       | Buildings database name      |
| `BUILDINGS_DB_USER`       | Buildings database user      |
| `BUILDINGS_DB_PASS`       | Buildings database password  |
| `LINES_DB_NAME`           | Lines database name          |
| `LINES_DB_USER`           | Lines database user          |
| `LINES_DB_PASS`           | Lines database password      |
| `POLES_DB_NAME`           | Poles database name          |
| `POLES_DB_USER`           | Poles database user          |
| `POLES_DB_PASS`           | Poles database password      |
| `VITE_API_URL`            | API url to use in client     |
| `VITE_TILE_SERVER_URL`    | Tile server to use in client |

## 🗺️ Key Features

### 3D Geospatial Visualization

- Interactive 3D maps for electrical infrastructure
- Real-time data visualization
- Spatial query capabilities

### User Management

- Role-based access control
- JWT-based authentication
- Admin panel for user administration

### Infrastructure Management

- CRUD operations for all asset types
- Geospatial data with PostGIS integration
- RESTful APIs with OpenAPI documentation

### Scalable Architecture

- Microservices-based design
- Docker containerization
- API Gateway

## 🐳 Docker Services

```yaml
# Database Services
- auth_database (PostgreSQL)
- buildings_database (PostGIS)
- lines_database (PostGIS)
- poles_database (PostGIS)

# Application Services
- auth_service
- buildings_service
- lines_service
- poles_service
- client
- tile_server
- api_gateway
```

## 🧪 Testing

```bash
chmod +X ./analyze.sh
./analyze.sh

# Select what you want to test.
```

<!-- ## 📊 Monitoring & Health Checks

- Health endpoints available at `/health` for each service
- Centralized logging through Docker
- Performance metrics and monitoring capabilities -->

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the [coding conventions](CODING_CONVENTION.md)
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🔒 Security

- JWT-based authentication at gateway level
- Role-based authorization in services
- Environment-based secret management
- HTTPS enforcement through Caddy
- Input validation

## 📄 License

This project is proprietary software. All rights reserved.
