# External Integrations

**Analysis Date:** 2026-01-27

## APIs & External Services

**None detected** - The application does not integrate with third-party APIs (Stripe, Auth0, etc.). All functionality is self-contained.

## Data Storage

**Databases:**
- MongoDB (local or remote)
  - Connection: `MONGO_URI` environment variable (default: `mongodb://127.0.0.1:27017/fetms`)
  - Client: Mongoose 9.0.0 ODM
  - Models: `backend/src/models/` directory
    - Teacher - Teacher profiles with nested sections (personalInfo, passportDetails, workPermitDetails, contractDetails, etc.)
    - School - School information with bilingual names
    - Stage - Pipeline stages for Kanban board
    - Project - Project/batch management for teachers
    - AlertRule - Alert configuration rules

**File Storage:**
- Local filesystem
  - Upload directory: `uploads/` at project root (served via Express static middleware at `/uploads` route)
  - Multer configuration: `backend/src/middleware/upload.ts`
  - File types: avatars, core documents (passport, ARC, contract, work permit), ad-hoc documents, box archives
  - Max file size: Configured via Multer settings in upload middleware

**Caching:**
- None detected - Application uses direct database queries

## Authentication & Identity

**Auth Provider:**
- None implemented
- Current state: Application has no authentication/authorization layer
- Access control: Not enforced (all endpoints accessible without credentials)

## Monitoring & Observability

**Error Tracking:**
- None detected - No integration with Sentry, LogRocket, etc.

**Logging:**
- Console-based logging
  - Backend: Uses `console.error()` and `console.log()` in controllers and services
  - Example: MongoDB connection logs in `backend/src/index.ts` line 45-46
  - Frontend: Standard browser console logging

## CI/CD & Deployment

**Hosting:**
- Not configured
- Current deployment: Requires manual setup and hosting

**CI Pipeline:**
- None detected - No GitHub Actions, CircleCI, or similar configured

## Environment Configuration

**Required env vars:**
- `MONGO_URI` - MongoDB connection string (defaults to local instance)
- `PORT` - Express server port (defaults to 5000)
- `NODE_ENV` - Environment mode (development/production, currently set to development)

**Secrets location:**
- `.env` file in `backend/` directory
- Should NOT be committed to version control (not in .gitignore currently - potential security risk)

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

## Data Import/Export

**Import:**
- CSV bulk import via `backend/src/routes/importRoutes.ts`
- CSV parsing: csv-parser 3.2.0
- Service: `backend/src/services/schoolService.ts` contains import logic
- Use case: Bulk teacher or school data import

**Export:**
- Archive download for document boxes (ZIP format)
- Seniority export via `backend/src/export_seniority.ts` script
- Service: `frontend/src/services/exportService.ts` handles frontend export operations
- Format: Archiver 7.0.1 for ZIP creation

## Form Data & Multipart Handling

**Upload Handling:**
- Multer middleware: `backend/src/middleware/upload.ts`
- Routes:
  - `POST /api/teachers/:id/avatar` - Avatar upload
  - `POST /api/teachers/:id/documents/:type` - Core document upload (passport, ARC, contract, work permit)
  - `POST /api/teachers/:id/documents/adhoc` - Ad-hoc document upload

**FormData Construction:**
- form-data 4.0.5 (used in root package.json for backend-to-API communication)
- Frontend uses browser native FormData API for multipart uploads

## HTTP Client Configuration

**Frontend API Communication:**
- Axios 1.13.2 instance in `frontend/src/services/api.ts`
- Base URL: `http://localhost:5000/api`
- Default headers: `Content-Type: application/json`
- All frontend services (`teacherService.ts`, `schoolService.ts`, `stageService.ts`, `projectService.ts`, `statsService.ts`, `alertService.ts`, `exportService.ts`) use this Axios instance

## CORS Configuration

**Backend CORS:**
- cors 2.8.5 middleware enabled in `backend/src/index.ts` line 20
- Configuration: `app.use(cors())` (allows all origins in development)

## API Routes Structure

**Teachers:**
- `GET /api/teachers` - List teachers (supports `projectId` query param)
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/:id` - Get teacher detail
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Soft delete teacher
- `POST /api/teachers/:id/avatar` - Upload avatar
- `DELETE /api/teachers/:id/avatar` - Delete avatar
- `POST /api/teachers/:id/documents/:type` - Upload core document
- `DELETE /api/teachers/:id/documents/:type` - Delete core document
- `POST /api/teachers/:id/documents/adhoc` - Upload ad-hoc document
- `PUT /api/teachers/:id/documents/adhoc/:docId` - Update ad-hoc document
- `DELETE /api/teachers/:id/documents/adhoc/:docId` - Delete ad-hoc document
- `PUT /api/teachers/:id/documents/adhoc/reorder` - Reorder ad-hoc documents
- `POST /api/teachers/:id/boxes` - Create document box
- `PUT /api/teachers/:id/boxes/:boxId` - Update document box
- `DELETE /api/teachers/:id/boxes/:boxId` - Delete document box
- `PUT /api/teachers/:id/boxes/reorder` - Reorder document boxes
- `GET /api/teachers/:id/boxes/:boxId/download` - Download box as ZIP
- `PUT /api/teachers/pipeline/reorder` - Reorder teachers in pipeline

**Schools:**
- `GET /api/schools` - List schools
- `POST /api/schools` - Create school
- `PUT /api/schools/:id` - Update school
- `DELETE /api/schools/:id` - Delete school

**Pipeline/Stages:**
- `GET /api/stages` - List Kanban stages
- `POST /api/stages` - Create stage
- `DELETE /api/stages/:id` - Delete stage
- `PUT /api/stages/reorder` - Reorder stages

**Projects:**
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Statistics:**
- `GET /api/stats` - Analytics dashboard data

**Alerts:**
- `GET /api/alerts` - List alert rules
- `POST /api/alerts` - Create alert rule
- `PUT /api/alerts/:id` - Update alert rule
- `DELETE /api/alerts/:id` - Delete alert rule

**Imports:**
- `POST /api/teachers/import` - Bulk CSV import

---

*Integration audit: 2026-01-27*
