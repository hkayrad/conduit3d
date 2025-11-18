# Conduit3D Coding Convention

## 1. Project Structure

### Backend Services (.NET)

```
Services/
├── [ServiceName]Service/
│   ├── Controllers/        # API controllers
│   ├── Domain/             # Domain entities
│   ├── Infrastructure/     # Data access layer
│   │   ├── Data/           # Database contexts
│   │   ├── DTOs/           # Data transfer objects
│   │   ├── Repositories/   # Repository pattern
│   │   ├── Services/       # Business logic services
│   │   └── Utilities/      # Helper utilities
│   ├── Properties/         # Launch settings
│   ├── Resources/          # Localization resources
│   ├── Program.cs          # Application entry point
│   ├── Dockerfile          # Container configuration
│   └── README.md           # Service documentation
```

### Frontend (TypeScript/React)

```
Client/
├── src/
│   ├── app/                # Main application components
│   │   ├── layout/         # Layout components (admin, auth, list, map)
│   │   └── shared/         # Reusable UI components
│   ├── lib/                # Utilities and configurations
│   │   ├── api/            # API client services
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── global.scss         # Global styling
├── public/                 # Static assets
└── index.html              # Main HTML template
```

## 2. Naming Conventions

### Backend (.NET)

- **Classes & Interfaces:** PascalCase (e.g., `UserRepository`, `IUserService`)
- **Methods:** PascalCase (e.g., `GetUserByIdAsync`)
- **Variables & Fields:** camelCase (e.g., `userId`)
- **Constants:** PascalCase (e.g., `MaxRetryCount`)
- **Namespaces:** PascalCase, hierarchical (e.g., `Conduit3D.Services.AuthService`)
- **Properties:** PascalCase (e.g., `UserName`)
- **Private Fields:** `_camelCase` with underscore prefix (e.g., `_userRepository`)

### Frontend (TypeScript/React)

- **Components:** PascalCase (e.g., `UserList`, `AuthModal`)
- **Files:** PascalCase for components, camelCase for utilities
- **Variables & Functions:** camelCase (e.g., `handleSubmit`, `userData`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types & Interfaces:** PascalCase (e.g., `User`, `ApiResponse`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth`, `useMapInteraction`)

## 3. File & Folder Structure

### Backend (.NET)

- One class/interface per file
- File name matches class/interface name
- Controllers end with `Controller` (e.g., `AuthController.cs`)
- Services end with `Service` (e.g., `PostgresqlUserService.cs`)
- Repositories end with `Repository` (e.g., `UserRepository.cs`)
- DTOs end with `Dto` (e.g., `AddUserDto.cs`)

### Frontend (TypeScript/React)

- One component per file in its own folder with styles
- Component files: `ComponentName.tsx`
- Style files: `componentName.scss` in `style/` subfolder
- Hook files: `useHookName.ts`
- Utility files: descriptive camelCase names

## 4. Formatting

### Backend (.NET)

- Indentation: 2 tabs, no spaces
- Braces: Allman style (braces on new line)
- Max line length: 120 characters
- Use collection expressions where applicable

### Frontend (TypeScript/React)

- Indentation: 4 spaces (configured in `tsconfig.json`)
- Braces: Egyptian style (opening brace same line)
- Max line length: 100 characters
- Use semicolons consistently
- Follow ESLint configuration

## 5. Comments & Documentation

### Backend (.NET)

- XML documentation for public APIs
- Inline comments for complex business logic
- Avoid redundant comments

### Frontend (TypeScript/React)

- JSDoc for complex functions and custom hooks
- Inline comments for business logic
- Component prop documentation with TypeScript types

## 6. Error Handling

### Backend (.NET)

- Return exceptions as `Response<T>.Failure()`
- Log errors with structured logging
- Use try-catch for async operations

### Frontend (TypeScript/React)

- Use try-catch in async functions (hooks, API calls)
- Set error states for user feedback
- Log errors to console with context

## 7. Dependency Injection & State Management

### Backend (.NET)

- Use constructor injection for dependencies
- Register services in `Program.cs`
- Follow Repository and Unit of Work patterns

### Frontend (TypeScript/React)

- Use Redux Toolkit for global state
- Use React hooks for local state
- Custom hooks for reusable logic

## 8. Async/Await

### Backend (.NET)

- Use async methods for I/O operations
- Suffix async methods with `Async` (e.g., `GetUserByIdAsync`)
- Configure cancellation tokens where appropriate

### Frontend (TypeScript/React)

- Use async/await in API calls
- Handle loading states in UI
- Use React Query or similar for data fetching

## 9. API Design

### Backend (.NET)

- Use RESTful conventions
- Validate input with DTOs
- Return structured `Response<T>` objects
- Use appropriate HTTP status codes

### Frontend (TypeScript/React)

- Use centralized API client (`lib/api/`)
- Type API responses with TypeScript interfaces
- Handle API errors gracefully

## 10. Styling & UI

### Frontend (TypeScript/React)

- Use SCSS for styling
<!-- - Follow BEM naming convention for CSS classes -->
- Component-scoped styles in component folders
- Global styles in `global.scss`

## 11. Security

### Backend (.NET)

- Never store secrets in code
- Use environment variables
- Validate all inputs
- Use JWT for authentication

### Frontend (TypeScript/React)

- Store sensitive data securely
- Validate user inputs
- Use HTTPS in production
<!-- - Sanitize data before display -->

## 12. Docker & Deployment

### Services Structure

- Each service has its own `Dockerfile`
- Use multi-stage builds for optimization
- Environment-specific configurations

### Development

- Use `docker-compose.yml` for local development
- Separate databases for each service
<!-- - Health checks for all services -->

<!-- ## 13. Testing

### Backend (.NET)
- Unit tests for business logic
- Integration tests for repositories
- Use test-specific configurations

### Frontend (TypeScript/React)
- Component tests with React Testing Library
- Hook tests for custom hooks
- E2E tests for critical user flows -->

## 13. Version Control

### Commit Messages

- Use conventional commits format
- Examples:
  - `feat(auth): add user registration endpoint`
  - `fix: resolve map rendering issue`
  - `docs: update installation instructions`

<!-- ### Branch Naming
- `feature/feature-name`
- `bugfix/bug-description`
- `hotfix/critical-fix` -->

## 14. Environment Configuration

### Backend (.NET)

- Use `appsettings.json` for configuration
- Environment-specific overrides
- Sensitive data in environment variables

### Frontend (TypeScript/React)

- Use `.env` files for environment variables
- Prefix with `VITE_` for client-side access
- Different configs for development/production

This convention ensures consistency across the entire Conduit3D platform while respecting the specific patterns and technologies used in each part of the system.
