# AuthService

An authentication and authorization microservice built with ASP.NET Core for the Conduit3D platform. This service provides comprehensive user management capabilities with JWT-based authentication.

## 🚀 Features

- **User Authentication** - Secure login with JWT tokens
- **User Management** - Full CRUD operations for user accounts
- **Token Management** - JWT token generation, validation, and refresh
- **Role-Based Authorization** - Support for different user roles and permissions
- **PostgreSQL Integration** - Reliable data persistence with Entity Framework Core
- **API Versioning** - Support for multiple API versions
- **Swagger Documentation** - Interactive API documentation
- **Docker Support** - Containerized deployment ready

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user and receive JWT token

### User Management
- `POST /api/auth` - Create a new user
- `GET /api/auth` - Get paginated list of users
- `GET /api/auth/{id}` - Get user by ID
- `PUT /api/auth/{id}` - Update user information
- `DELETE /api/auth/{id}` - Delete user account

### Statistics
- `GET /api/auth/count` - Get user statistics and counts

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ASPNETCORE_ENVIRONMENT` | ASP.NET Core environment (Development/Production) | Yes |
| `POSTGRESQL_CONNECTION_STRING` | PostgreSQL database connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `JWT_ISSUER` | JWT token issuer identifier | Yes |
| `JWT_AUDIENCE` | JWT token audience identifier | Yes |
| `JWT_EXPIRATION_TIME_HRS` | JWT token expiration time in hours | Yes |

### Example Connection String
```
Host=localhost;Database=auth_db;Username=auth_user;Password=your_password
```

## 🏗️ Architecture

```
AuthService/
├── Controllers/        # API controllers
├── Domain/             # Domain entities
├── Infrastructure/     # Data access layer
│   ├── Data/           # Database context
│   ├── DTOs/           # Data transfer objects
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
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT authentication

### API & Documentation
- **Asp.Versioning.Http** - API versioning support
- **Swashbuckle.AspNetCore** - Swagger/OpenAPI documentation

### Additional Tools
- **Common** - Shared utilities and models

## 🚦 Getting Started

1. **Prerequisites**
   - .NET 8.0 SDK
   - PostgreSQL database
   - Docker (optional)

2. **Setup Database**
    > Create PostgreSQL database

    |id|username|email|user_role|name|created_at|is_active|password_hash|searchable_text|
    | - | - | - | - | - | - | - | - | - |
    |int PK|varchar(100)|varchar(255)|varchar(10)|varchar(100)|timestamp with time zone|boolean|varchar(128)|tsvector|
    |NOT NULL|NOT NULL|NOT NULL|NOT NULL|NOT NULL|-|NOT NULL|NOT NULL|-|
    |AI|-|-|-|-|CURRENT_TIMESTAMP|true|-|(function generated)|

   > Generate the tsvector column

   ```sql
   -- Create a custom function to encapsulate the tsvector logic
   CREATE OR REPLACE FUNCTION generate_searchable_text(
       id_val INT, 
       is_active_val BOOLEAN, 
       username_val TEXT, 
       email_val TEXT, 
       created_at_val TIMESTAMP WITH TIME ZONE, 
       user_role_val TEXT, 
       name_val TEXT
   )
   RETURNS tsvector
   AS $$
   SELECT to_tsvector('simple', 
       coalesce(cast(id_val as text)) || ' ' ||
       coalesce((case when is_active_val then 'active' else 'inactive' end),  '') || ' ' ||
       coalesce(username_val, '') || ' ' || 
       regexp_replace(coalesce(email_val, ''), '[.@]', ' ', 'g') || ' ' || 
       regexp_replace(coalesce(cast(created_at_val as text), ''), '^(\d{4}-\d{2} -\d{2})\s+(\d{2}:\d{2}:\d{2})\.(\d{3})\s+([+-]\d{4})$', '\1 \2 \3 \4',   'g') || ' ' ||
       coalesce(user_role_val, '') || ' ' ||
       coalesce(name_val, '')
   );
   $$ LANGUAGE SQL IMMUTABLE;
   
   -- Use the custom function 
   ALTER TABLE users ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
       generate_searchable_text(id, is_active, username, email, created_at,   user_role, name)
   ) STORED;
   
   -- Create GIN index for fast text search
   CREATE INDEX idx_user_searchable_text ON "users"USING GIN(searchable_text);
   ```

3. **Configure Environment**
   ```bash
    # Set environment variables or update appsettings.json
    export POSTGRESQL_CONNECTION_STRING="Host=localhost;Database=auth_db;Username=postgres;Password=password"
    export JWT_SECRET="your-super-secret-key"
    export JWT_ISSUER="your-issuer"
    export JWT_AUDIENCE="your-audience"
    export JWT_EXPIRATION_TIME_HRS="your-expiration-time"
   ```

4. **Run the Service**
   ```bash
    dotnet restore
    dotnet run
   ```

5. **Access API Documentation**
   - Navigate to `https://<domain>/api/docs/auth/swagger` for interactive API docs

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t conduit3d-auth:latest .
```

### Run Container
```bash
docker run -d \
  -p 8080:8080 \
  -e POSTGRESQL_CONNECTION_STRING="Host=db;Database=auth_db;Username=user;Password=pass" \
  -e JWT_SECRET="your-secret-key" \
  -e JWT_ISSUER="conduit3d" \
  -e JWT_AUDIENCE="conduit3d-users" \
  -e JWT_EXPIRATION_TIME_HRS="24" \
  conduit3d-auth:latest
```

## 🔐 Security Features

- **JWT Token Authentication** - Secure stateless authentication
- **Input Validation** - Request validation
- **Error Handling** - Secure error responses without sensitive information

<!-- ## 🧪 Testing

```bash
# Run unit tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
``` -->

<!-- ## 📊 Monitoring

The service includes built-in health checks and logging:
- Health endpoint: `/health`
- Metrics endpoint: `/metrics`
- Structured logging with Serilog -->

## 📄 License

This project is part of the Conduit3D platform.