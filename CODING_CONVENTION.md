# .NET Coding Rules Convention

## 1. Naming Conventions
- **Classes & Interfaces:** PascalCase (e.g., `UserRepository`, `IUserService`)
- **Methods:** PascalCase (e.g., `GetUserById`)
- **Variables & Fields:** camelCase (e.g., `userId`)
- **Constants:** PascalCase (e.g., `MaxRetryCount`)
- **Namespaces:** PascalCase, hierarchical (e.g., `Conduit3d.Services.AuthService`)
- **Properties:** PascalCase (e.g., `UserName`)
- **Private Fields:** `_camelCase` with underscore prefix (e.g., `_userRepository`)

## 2. File & Folder Structure
- Organize by feature or layer (e.g., `Controllers`, `Services`, `Repositories`, `Models`)
- One class/interface per file
- File name matches class/interface name

## 3. Formatting
- Indentation: 4 spaces, no tabs
- Braces: Allman style (braces on new line)
- Max line length: 120 characters
- Use regions sparingly, only for large files

## 4. Comments & Documentation
- Inline comments for complex logic
- Avoid redundant comments

## 5. Error Handling
- Use exceptions for error cases, not return codes
- Catch only specific exceptions
- Log errors with context

## 6. Dependency Injection
- Use constructor injection for dependencies
- Register services in `Program.cs`

## 7. Async/Await
- Use async methods for I/O operations
- Suffix async methods with `Async` (e.g., `GetUserAsync`)

<!-- ## 8. Unit Testing
- Place tests in a separate project (e.g., `AuthService.Tests`)
- Use xUnit or NUnit
- Name test methods as `MethodName_State_ExpectedBehavior` -->

## 8. API Design
- Use RESTful conventions for controllers
- Validate input models
- Return appropriate HTTP status codes

## 9. Security
- Never store secrets in code
- Use environment variables or secret managers
