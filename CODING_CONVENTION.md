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
- One class/interface per file
- File name matches class/interface name

## 3. Formatting
- Indentation: 4 spaces, no tabs
- Braces: Allman style (braces on new line)
- Max line length: 120 characters
- Use regions sparingly, only for large files
- Use collection expressions where applicable

## 4. Comments & Documentation
- Inline comments for complex logic
- Avoid redundant comments

## 5. Error Handling
- Return exceptions to the user as Response<T>.Failure
- Log errors with context

## 6. Dependency Injection
- Use constructor injection for dependencies
- Register services in `Program.cs`

## 7. Async/Await
- Use async methods for I/O operations
- Suffix async methods with `Async` (e.g., `GetUserAsync`)

## 8. API Design
- Use RESTful conventions for controllers
- Validate input models
- Return appropriate HTTP status codes

## 9. Security
- Never store secrets in code
- Use environment variables or secret managers
