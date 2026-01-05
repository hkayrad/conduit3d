# Conduit3D Client

A React-based web application built with TypeScript and Vite for the Conduit3D platform. This client provides an interactive 3D geospatial interface for electrical infrastructure management and visualization.

## Features

- **3D Geospatial Visualization** - Interactive 3D maps for electrical infrastructure
- **CRUD Data Integration** - Connection to microservices for buildings, poles, and lines
- **Desktop Design** - A desktop-oriented layout optimized for large screens, providing an efficient workspace for professional users.
- **User Authentication** - Secure login and role-based access control
- **Admin Panel** - User management and system administration
- **Performance Optimized** - Fast builds with Vite and Hot Module Replacement (HMR)
- **Type Safety** - Full TypeScript support for enhanced development experience

## Tech Stack

### Core Technologies
- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool with instant HMR
- **React Router** - Client-side routing for SPA navigation

### UI & Styling
- **SCSS** - Custom styling with SCSS modules
- **Component Library** - Reusable UI components

### State Management
- **Redux Toolkit** - Predictable state container
- **React Hooks** - Local component state management

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript Config** - Strict type checking
- **Vite DevTools** - Development optimization

## Project Structure

```
Client/
├── public/               # Static assets
├── src/  
│   ├── app/              # Main application components
│   │   ├── layout/       # Layout components
│   │   └── shared/       # Shared components
│   ├── lib/              # Utilities and configurations
│   │   ├── api/          # API client and services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   ├── constants.ts  # Constants
│   │   ├── enums.ts      # Enums
│   │   ├── instance.ts   # Axios Instance
│   │   ├── store.ts      # Redux Store
│   │   └── types.d.ts    # Types
│   ├── global.scss       # Global style definitions
│   ├── main.tsx          # Main Application
│   └── notFound.tsx      # 404 Page
├── index.html            # Main HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Getting Started

### Prerequisites
- **Node.js** (v20 or higher)
- **npm** package manager

### Installation

1. **Clone the repository**
   ```bash
    git clone <repository-url>
    cd conduit3d/Client
   ```

2. **Install dependencies**
   ```bash
    npm install
   ```

3. **Configure environment**
   ```bash
   # Create environment file
    cp .env.example .env.local
   
   # Update API endpoints and configuration
    VITE_API_URL=http(s)://<domain>:<port>
    VITE_TILE_SERVER_URL=http(s)://<domain>:<port>
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Navigate to `http://localhost:<port>`

### Build for Production

```bash
# Build the application
npm run build

# Install the serving service
npm i -g serve

# Preview production build
serve -s dist
```

## Docker Deployment

### Build Image
```bash
docker build -t conduit3d-client:latest .
```

### Run Container
```bash
docker run -d \
  -p 3000:80 \
  -e VITE_API_BASE_URL="https://api.conduit3d.com" \
  conduit3d-client:latest
```

## Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |

### ESLint Configuration

The project uses a comprehensive ESLint setup with TypeScript support:

```typescript
// eslint.config.js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

## Key Features

### 3D Map Integration
- Interactive 3D geospatial visualization
- Support for electrical infrastructure layers
- Real-time data overlay

### User Management
- Secure authentication with JWT tokens
- Role-based access control
- Admin panel for user administration

### Data Visualization
- Building information display
- Electrical pole and line visualization
- Feature information panels with detailed data

## Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

## Performance

- **Fast Development** - Vite's instant HMR for rapid development
- **Optimized Builds** - Tree shaking and code splitting
- **Modern Bundling** - ES modules and dynamic imports
- **Asset Optimization** - Automatic image and asset optimization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run linting (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is part