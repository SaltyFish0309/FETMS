# Technology Stack

**Analysis Date:** 2026-01-27

## Languages

**Primary:**
- TypeScript 5.9.3 - Used across both frontend and backend for type safety
- JavaScript/ES2022 - Runtime target for browser and Node.js environments

**Secondary:**
- CSS - Styling via Tailwind CSS

## Runtime

**Environment:**
- Node.js (latest compatible with tsx) - Backend server and CLI tooling

**Package Manager:**
- npm (versions managed via package.json and package-lock.json)
- Lockfile: Present (`package-lock.json` at root and in backend/frontend subdirectories)

## Frameworks

**Core Frontend:**
- React 19.2.0 - UI library with hooks and server component support
- React Router DOM 7.10.0 - Client-side routing

**Core Backend:**
- Express 5.2.1 - HTTP server framework
- Mongoose 9.0.0 - MongoDB ODM and schema validation

**Testing:**
- Vitest 4.0.16 - Frontend and backend unit testing (both configured with globals: true)
- @testing-library/react 16.3.1 - React component testing utilities
- @testing-library/user-event 14.6.1 - User interaction simulation
- Supertest 7.2.2 - HTTP assertion library for backend route testing

**Build/Dev:**
- Vite 7.2.4 - Frontend bundler with HMR (configured in `frontend/vite.config.ts`)
- tsx 4.21.0 - TypeScript execution for Node.js scripts (watch mode via `npm run server`)
- Nodemon 3.1.11 - Process restart monitoring (available as dev dependency)

**Styling:**
- Tailwind CSS 4.1.17 - Utility-first CSS framework
- PostCSS 8.5.6 - CSS processing
- Autoprefixer 10.4.22 - Browser prefix automation
- tailwind-merge 3.4.0 - Conflict resolution for Tailwind classes
- tailwindcss-animate 1.0.7 - Animation utilities

**UI Component Library:**
- Shadcn/UI (via @radix-ui packages) - Radix primitives foundation
- @radix-ui packages (14 individual packages) - Headless component primitives (Accordion, AlertDialog, Avatar, Checkbox, Dialog, DropdownMenu, Label, Popover, ScrollArea, Select, Slider, Slot, Switch, Tabs)
- class-variance-authority 0.7.1 - Type-safe component variant system
- lucide-react 0.555.0 - Icon library
- cmdk 1.1.1 - Command/search interface

**Data Visualization:**
- Recharts 3.5.1 - React charting library for dashboard analytics

**File Upload & Media:**
- Multer 2.0.2 - Backend multipart/form-data handling
- @types/multer 2.0.0 - Type definitions for Multer

**Drag & Drop:**
- @dnd-kit/core 6.3.1 - Headless drag-and-drop toolkit
- @dnd-kit/sortable 10.0.0 - Sortable extension for dnd-kit
- @dnd-kit/utilities 3.2.2 - Utility helpers

**Data Manipulation:**
- Date-fns 4.1.0 - Date formatting and calculation (used in both frontend and backend)
- csv-parser 3.2.0 - CSV parsing for bulk imports
- Archiver 7.0.1 - Archive creation for file downloads
- form-data 4.0.5 - FormData construction (root and backend)
- node-fetch 3.3.2 - HTTP client (root and backend)

**Image/Media Utilities:**
- react-easy-crop 5.5.6 - Image cropping for avatar upload
- react-circle-flags 0.0.25 - Country flag display
- country-data-list 1.5.5 - Country data reference
- libphonenumber-js 1.12.31 - Phone number formatting

**State & Context:**
- React Context API (built-in) - Application state management

**Theme Management:**
- next-themes 0.4.6 - Dark/light mode provider
- sonner 2.0.7 - Toast notification system

**HTTP Client:**
- Axios 1.13.2 - Promise-based HTTP client (frontend main API communication)

**Utilities:**
- clsx 2.1.1 - Conditional class name joining
- dotenv 17.2.3 - Environment variable loading (backend)
- cors 2.8.5 - CORS middleware for Express

**Linting & Code Quality:**
- ESLint 9.39.1 - JavaScript linting (configured in `frontend/eslint.config.js`)
- @eslint/js 9.39.1 - ESLint recommended configs
- typescript-eslint 8.46.4 - TypeScript support for ESLint
- eslint-plugin-react-hooks 7.0.1 - React hooks rules enforcement
- eslint-plugin-react-refresh 0.4.24 - React fast refresh validation

**Type Checking:**
- TypeScript compiler (tsc) - Type checking via `npm run build --prefix frontend`

**Development Utilities:**
- @react-grab/claude-code 0.0.98 - Claude AI code assistance integration
- react-grab 0.0.98 - Grab utilities

## Configuration

**Environment:**
Backend requires `.env` file:
```
MONGO_URI=mongodb://127.0.0.1:27017/fetms
PORT=5000
NODE_ENV=development
```

**TypeScript Configuration:**
- Backend: `backend/tsconfig.json` - Node target with strict mode
- Frontend: `frontend/tsconfig.json` - References app and node configs with path alias (`@/*` → `./src/*`)
- Frontend App: `frontend/tsconfig.app.json` - ES2022 target, bundler resolution, noUnusedLocals/Parameters enforced

**Build Configuration:**
- Backend: Uses `tsx watch` for development, ES modules only
- Frontend: Vite with React plugin, jsdom test environment, path alias resolution

## Platform Requirements

**Development:**
- Node.js runtime with ES modules support
- MongoDB 4.4+ (local or remote instance at MONGO_URI)
- npm for package management

**Production:**
- Node.js runtime
- MongoDB instance
- Environment variables configured (MONGO_URI, PORT, NODE_ENV)
- Compiled frontend assets served by backend via static middleware at `/uploads`

---

*Stack analysis: 2026-01-27*
