# Conduit3D

## Project Overview
Conduit3D is a microservices-based platform for managing and visualizing geospatial electrical infrastructure data. It enables utility companies to manage assets like buildings, electrical poles, and power lines through an interactive 3D interface.

### Architecture
The system is built on a microservices architecture:
*   **Backend Services:** ASP.NET Core 8.0 Web APIs (`AuthService`, `BuildingsService`, `LinesService`, `PolesService`) using PostgreSQL/PostGIS for spatial data.
*   **Frontend:** React 19 application with TypeScript, Vite, Redux Toolkit, and Deck.gl for 3D geospatial visualization.
*   **Infrastructure:** Docker & Docker Compose for orchestration, Caddy as an API Gateway/Reverse Proxy.
*   **Shared:** A `Common` library holds shared domain models and utilities.

## Tech Stack
*   **Languages:** C# (.NET 8), TypeScript
*   **Frameworks:** ASP.NET Core, React 19, Entity Framework Core
*   **Data:** PostgreSQL, PostGIS
*   **Build Tools:** .NET SDK, Vite
*   **Containerization:** Docker, Docker Compose

## Key Directories
*   `Services/` - Contains backend microservices source code.
*   `Client/` - The React frontend application source code.
*   `Common/` - Shared .NET class libraries (Domain, Helpers, Infrastructure).
*   `ApiGateway/` - Caddy configuration and Dockerfile for the gateway.
*   `Tests/` - Integration and unit tests for the services.
*   `TileService/` - Configuration for serving map tiles.

## Development Workflow

### Prerequisites
*   Docker & Docker Compose
*   .NET 8 SDK (for local backend dev)
*   Node.js 18+ (for local frontend dev)

### Building and Running
**Using Docker (Recommended for full stack):**
```bash
# Copy example env file
cp .env.example .env
# Build and start all services
docker compose up --build -d
```

**Local Frontend Development:**
```bash
cd Client
npm install
npm run dev
```

**Local Backend Development:**
```bash
cd Services/[ServiceName]
dotnet run
```

**Testing:**
```bash
chmod +X ./analyze.sh
./analyze.sh
# Follow the interactive menu to run specific tests
```

## Coding Conventions
**General:**
*   Follow the guidelines in `CODING_CONVENTION.md`.
*   Use Conventional Commits for commit messages.

**Backend (.NET):**
*   **Naming:** PascalCase for classes/methods, camelCase for variables/fields.
*   **Structure:** One class per file. Controllers end in `Controller`, Services in `Service`.
*   **Pattern:** Use Repository and Unit of Work patterns. Return `Response<T>` objects.

**Frontend (React/TS):**
*   **Naming:** PascalCase for components, camelCase for hooks/functions.
*   **Structure:** Component-based folders with `ComponentName.tsx` and `style/componentName.scss`.
*   **State:** Redux Toolkit for global state, React hooks for local state.
*   **Styling:** SCSS with BEM-like naming is preferred (though not strictly BEM).
