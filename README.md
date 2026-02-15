# FETMS - Foreign English Teachers Management System

A comprehensive MERN stack application for managing the complete lifecycle of Foreign English Teachers, from recruitment through placement and renewal.

## Features

- **Recruitment Pipeline**: Kanban-style board for managing candidate stages
- **Teacher Management**: Comprehensive teacher profiles with documents and tracking
- **School Management**: Manage schools and teacher placements
- **Document Vault**: Secure document storage and management
- **Analytics Dashboard**: Real-time insights and statistics
- **Multi-Project Support**: Manage multiple projects with filtered views
- **Internationalization**: Multi-language support (i18n)

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS + Shadcn/UI components
- Recharts for data visualization
- dnd-kit for drag-and-drop functionality
- i18next for internationalization

### Backend
- Node.js with Express 5
- TypeScript
- Mongoose 9 (MongoDB ODM)
- Multer for file uploads

### Database
- MongoDB with soft delete pattern

### Testing
- Vitest for both frontend and backend
- @testing-library/react for component testing
- Supertest for API testing

## Quick Start

### Prerequisites

- Node.js (latest LTS version)
- MongoDB 7.0+
- npm (no yarn/pnpm)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tfetp-management-v4
   ```

2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Configure backend environment:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

4. Start MongoDB:
   ```bash
   # Linux
   systemctl start mongod

   # macOS
   brew services start mongodb-community
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Development

### Available Scripts

```bash
# Start full stack development
npm run dev

# Run backend tests
npm run test --prefix backend

# Run frontend tests
npm run test --prefix frontend

# Lint frontend code
npm run lint --prefix frontend

# Build for production
npm run build --prefix frontend
npm run build --prefix backend
```

For complete scripts reference, see [docs/SCRIPTS.md](docs/SCRIPTS.md).

### Development Workflow

This project follows Test-Driven Development (TDD):

1. Write failing test
2. Implement minimal code to pass
3. Refactor while keeping tests green

See [docs/CONTRIB.md](docs/CONTRIB.md) for detailed contributing guidelines.

## Architecture

### Backend: Service-Layer Pattern

```
Controller → Service → Model → MongoDB
```

- **Controllers**: Handle HTTP requests, validation, and responses
- **Services**: Contain all business logic (unit-testable)
- **Models**: Mongoose schemas with soft delete support

### Frontend: Component Hierarchy

- **UI Components**: Shadcn/Radix primitives (`components/ui/`)
- **Feature Components**: Business logic components (`components/{feature}/`)
- **Pages**: Route-level components (`pages/`)
- **Services**: API communication layer

## Project Structure

```
tfetp-management-v4/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   └── scripts/         # Migration scripts
│   └── .env                 # Environment configuration
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Route components
│   │   ├── services/        # API client
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
│   └── public/              # Static assets
└── docs/
    ├── CONTRIB.md           # Contributing guide
    ├── RUNBOOK.md           # Operations guide
    ├── SCRIPTS.md           # Scripts reference
    └── HEALTH_REPORT.md     # Codebase health analysis
```

## API Documentation

See [CLAUDE.md](CLAUDE.md#api-routes) for complete API documentation.

### Main Endpoints

- `GET/POST /api/teachers` - Teacher CRUD operations
- `GET/POST /api/schools` - School management
- `GET /api/stages` - Kanban pipeline stages
- `GET /api/stats` - Analytics and statistics
- `GET/POST/PUT/DELETE /api/projects` - Project management

## Testing

```bash
# Run all tests
npm run test --prefix backend
npm run test --prefix frontend

# Run specific test file
npx vitest run path/to/test.ts

# Watch mode
npx vitest path/to/test.ts

# Coverage report
npx vitest run --coverage
```

## Code Standards

- **Package Manager**: npm only (no yarn/pnpm)
- **Soft Deletes**: Use `isDeleted: true`, never hard delete
- **File Size**: Maximum 200 lines per file
- **Type Safety**: `noImplicitAny` enforced
- **Commit Format**: `[TYPE] Description` (e.g., `[FEAT]`, `[FIX]`, `[TEST]`)

See [docs/CONTRIB.md](docs/CONTRIB.md) for complete standards.

## Deployment

See [docs/RUNBOOK.md](docs/RUNBOOK.md) for detailed deployment procedures, monitoring, and troubleshooting.

### Quick Production Build

```bash
# Build backend
npm run build --prefix backend

# Build frontend
npm run build --prefix frontend

# Preview frontend build
npm run preview --prefix frontend
```

## Environment Variables

### Backend

Create `backend/.env` with:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/fetms
PORT=5000
NODE_ENV=development
```

See `backend/.env.example` for details.

### Frontend

API base URL is configured in `frontend/src/services/api.ts`.

## Documentation

- **[CONTRIB.md](docs/CONTRIB.md)** - Development workflow and contributing guidelines
- **[RUNBOOK.md](docs/RUNBOOK.md)** - Operations, deployment, and troubleshooting
- **[SCRIPTS.md](docs/SCRIPTS.md)** - Complete npm scripts reference
- **[HEALTH_REPORT.md](docs/HEALTH_REPORT.md)** - Codebase health analysis
- **[CLAUDE.md](CLAUDE.md)** - Project overview and AI assistant guidance

## License

[Add your license here]

## Support

For issues and feature requests, please use the project's issue tracker.

---

**Current Version:** 1.0.0 (Backend), 0.0.0 (Frontend)

Built with ❤️ using the MERN stack
