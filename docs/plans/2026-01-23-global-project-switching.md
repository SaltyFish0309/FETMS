# Global Project Switching Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
>
> **For Gemini (Handoff):** This plan is designed for sequential handoff. Each iteration has a checkpoint with verification steps. Start from the checkpoint that matches the current project state.

---

## 🚀 Quick Start Guide (For New Conversation)

### Step 1: Start Fresh Conversation

Open a new Claude Code conversation to free up context. Use this command:

```
I want to implement the plan located at:
docs/plans/2026-01-23-global-project-switching.md

Please use the superpowers:executing-plans skill to execute this plan task-by-task with strict TDD workflow.
```

### Step 2: Verify Prerequisites

Before starting, ensure:

- [ ] Git working directory is clean
- [ ] Backend runs without errors (`npm run server --prefix backend`)
- [ ] Frontend runs without errors (`npm run dev --prefix frontend`)
- [ ] All existing tests pass:
  - `npm test --prefix backend`
  - `npm test --prefix frontend`
- [ ] You're on a feature branch (not master):
  ```bash
  git checkout -b feature/global-project-switching
  ```

### Step 3: Execute with CI Gates

The executing-plans agent will:
1. Execute tasks in sequence (TDD: RED → GREEN → REFACTOR → COMMIT)
2. Stop at each checkpoint for CI verification
3. Wait for GitHub Actions to pass before continuing
4. Report coverage and test results at each stage

### Step 4: Checkpoint Protocol

At each checkpoint (1-5), the agent will:
1. ✅ Run local tests
2. ✅ Verify TypeScript compilation
3. ✅ Push to GitHub
4. ⏸️ **PAUSE** and ask you to verify GitHub Actions CI
5. ✅ Only continue after all CI jobs are GREEN

### Step 5: Handoff to Another Agent (Optional)

If you need to switch agents (e.g., Claude → Gemini via antigravity):

1. Check current checkpoint number (search for "AGENT HANDOFF CHECKPOINT")
2. Verify all items in the checkpoint checklist are ✅
3. Ensure GitHub Actions CI is GREEN
4. In new agent, provide:
   ```
   Continue executing plan:
   docs/plans/2026-01-23-global-project-switching.md

   Start from: Checkpoint [N]
   Current branch: feature/global-project-switching

   Use superpowers:executing-plans skill.
   ```

---

## 📋 Plan Overview

**Goal:** Implement global project switching with CRUD functionality across Teachers, Dashboard, and Schools pages

**Architecture:**
- Backend: Add Project CRUD endpoints + projectId filtering in Teacher/Stats APIs
- Frontend: React Context API for global state + localStorage persistence
- Mixed filtering strategy: Backend for Teachers/Dashboard, frontend for Schools

**Tech Stack:**
- Backend: Express, Mongoose, Vitest
- Frontend: React 19, TypeScript, Vite, Context API
- Testing: TDD with Vitest + @testing-library/react

---

## API Contracts (TypeScript Interfaces)

### Backend Interfaces

```typescript
// backend/src/models/Project.ts (EXISTING)
interface IProject extends Document {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// backend/src/services/projectService.ts (TO BE ADDED)
interface ProjectUpdateData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// backend/src/services/teacherService.ts (TO BE MODIFIED)
interface TeacherQueryOptions {
  projectId?: string;
  isDeleted?: boolean;
}

// backend/src/services/statsService.ts (TO BE MODIFIED)
interface StatsFilter {
  projectId?: string;  // NEW
  gender?: string;
  nationality?: string;
  ageRange?: string;
  school?: string;
}
```

### Frontend Interfaces

```typescript
// frontend/src/contexts/ProjectContext.tsx (TO BE CREATED)
interface ProjectContextValue {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string) => void;
  projects: Project[];
  loading: boolean;
  refreshProjects: () => Promise<void>;
}

// frontend/src/services/projectService.ts (TO BE EXTENDED)
interface Project {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### API Endpoints

```
# Existing
GET    /api/projects          -> Project[]
POST   /api/projects          -> Project

# To be added in Iteration 1
GET    /api/projects/:id      -> Project
PUT    /api/projects/:id      -> Project
DELETE /api/projects/:id      -> void (soft delete)

# To be modified in Iteration 1
GET    /api/teachers?projectId=xxx        -> Teacher[]
GET    /api/stats/dashboard?projectId=xxx -> DashboardStats
```

---

## Iteration 1: Backend API Foundation

**Goal:** Complete Project CRUD + add projectId filtering to Teachers/Stats APIs

### Task 1.1: Project Update Service Method

#### Step 1: Write failing test for updateProject

**File:** `backend/src/services/__tests__/projectService.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ProjectService } from '../projectService';
import Project from '../../models/Project';

describe('ProjectService.updateProject', () => {
  let mongoServer: MongoMemoryServer;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await Project.deleteMany({});
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should update project name and description', async () => {
    // Arrange
    const created = await ProjectService.createProject({
      name: 'TFETP',
      code: 'TFETP',
      description: 'Original'
    });

    // Act
    const updated = await ProjectService.updateProject(created._id.toString(), {
      name: 'TFETP Updated',
      description: 'New description'
    });

    // Assert
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe('TFETP Updated');
    expect(updated!.description).toBe('New description');
    expect(updated!.code).toBe('TFETP'); // unchanged
  });

  it('should not allow updating code field', async () => {
    const created = await ProjectService.createProject({
      name: 'TFETP',
      code: 'TFETP'
    });

    const updated = await ProjectService.updateProject(created._id.toString(), {
      code: 'CHANGED' // attempt to change code
    } as any);

    expect(updated!.code).toBe('TFETP'); // should remain unchanged
  });

  it('should return null for non-existent project', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const result = await ProjectService.updateProject(fakeId, { name: 'Test' });
    expect(result).toBeNull();
  });
});
```

#### Step 2: Run test to verify it fails

```bash
cd backend
npx vitest run src/services/__tests__/projectService.test.ts
```

**Expected output:**
```
FAIL  src/services/__tests__/projectService.test.ts
  ProjectService.updateProject
    ✕ should update project name and description
    ✕ should not allow updating code field
    ✕ should return null for non-existent project

Error: ProjectService.updateProject is not a function
```

#### Step 3: Implement updateProject method

**File:** `backend/src/services/projectService.ts`

Add after `createProject`:

```typescript
static async updateProject(
  id: string,
  data: Partial<IProject>
): Promise<IProject | null> {
  // Remove code from update data (immutable)
  const { code, ...updateData } = data;

  return await Project.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
}
```

#### Step 4: Run test to verify it passes

```bash
npx vitest run src/services/__tests__/projectService.test.ts
```

**Expected output:**
```
PASS  src/services/__tests__/projectService.test.ts
  ProjectService.updateProject
    ✓ should update project name and description
    ✓ should not allow updating code field
    ✓ should return null for non-existent project
```

#### Step 5: Commit

```bash
git add backend/src/services/projectService.ts backend/src/services/__tests__/projectService.test.ts
git commit -m "[TEST] Add ProjectService.updateProject with tests

- Add updateProject method to ProjectService
- Prevent code field updates (immutable)
- Return null for non-existent projects
- All tests passing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.2: Project Delete Service Method (Soft Delete)

#### Step 1: Write failing test for deleteProject

**File:** `backend/src/services/__tests__/projectService.test.ts`

Add new test suite:

```typescript
describe('ProjectService.deleteProject', () => {
  it('should soft delete project by setting isActive to false', async () => {
    // Arrange
    const created = await ProjectService.createProject({
      name: 'TFETP',
      code: 'TFETP'
    });

    // Act
    const result = await ProjectService.deleteProject(created._id.toString());

    // Assert
    expect(result).toBe(true);

    // Verify soft delete (still in DB but isActive=false)
    const found = await Project.findById(created._id);
    expect(found).not.toBeNull();
    expect(found!.isActive).toBe(false);
  });

  it('should not appear in getAllProjects after soft delete', async () => {
    const created = await ProjectService.createProject({
      name: 'TFETP',
      code: 'TFETP'
    });

    await ProjectService.deleteProject(created._id.toString());

    const allProjects = await ProjectService.getAllProjects();
    expect(allProjects).toHaveLength(0);
  });

  it('should return false for non-existent project', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const result = await ProjectService.deleteProject(fakeId);
    expect(result).toBe(false);
  });
});
```

#### Step 2: Run test to verify it fails

```bash
npx vitest run src/services/__tests__/projectService.test.ts -t deleteProject
```

**Expected:** `ProjectService.deleteProject is not a function`

#### Step 3: Implement deleteProject method

**File:** `backend/src/services/projectService.ts`

Add after `updateProject`:

```typescript
static async deleteProject(id: string): Promise<boolean> {
  const result = await Project.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  return result !== null;
}
```

#### Step 4: Run test to verify it passes

```bash
npx vitest run src/services/__tests__/projectService.test.ts -t deleteProject
```

**Expected:** All tests pass

#### Step 5: Commit

```bash
git add backend/src/services/projectService.ts backend/src/services/__tests__/projectService.test.ts
git commit -m "[TEST] Add ProjectService.deleteProject with soft delete

- Implement soft delete (isActive=false)
- Verify deleted projects excluded from getAllProjects
- All tests passing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.3: Project Controller Endpoints (PUT, DELETE, GET by ID)

#### Step 1: Write failing integration test

**File:** `backend/src/controllers/__tests__/projectController.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import projectRoutes from '../../routes/projects';
import Project from '../../models/Project';

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

describe('Project Controller', () => {
  let mongoServer: MongoMemoryServer;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await Project.deleteMany({});
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('GET /api/projects/:id', () => {
    it('should return project by id', async () => {
      const created = await Project.create({
        name: 'TFETP',
        code: 'TFETP',
        description: 'Test project'
      });

      const response = await request(app)
        .get(`/api/projects/${created._id}`)
        .expect(200);

      expect(response.body.name).toBe('TFETP');
      expect(response.body.code).toBe('TFETP');
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/projects/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update project', async () => {
      const created = await Project.create({
        name: 'TFETP',
        code: 'TFETP'
      });

      const response = await request(app)
        .put(`/api/projects/${created._id}`)
        .send({ name: 'Updated TFETP', description: 'New desc' })
        .expect(200);

      expect(response.body.name).toBe('Updated TFETP');
      expect(response.body.description).toBe('New desc');
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/api/projects/${fakeId}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should soft delete project', async () => {
      const created = await Project.create({
        name: 'TFETP',
        code: 'TFETP'
      });

      await request(app)
        .delete(`/api/projects/${created._id}`)
        .expect(200);

      const found = await Project.findById(created._id);
      expect(found!.isActive).toBe(false);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/projects/${fakeId}`)
        .expect(404);
    });
  });
});
```

#### Step 2: Run test to verify it fails

```bash
npx vitest run src/controllers/__tests__/projectController.test.ts
```

**Expected:** 404 errors (routes not implemented)

#### Step 3: Implement controller methods

**File:** `backend/src/controllers/projectController.ts`

Add these methods:

```typescript
static async getProjectById(req: Request, res: Response) {
  try {
    const project = await ProjectService.getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project', error });
  }
}

static async updateProject(req: Request, res: Response) {
  try {
    const updated = await ProjectService.updateProject(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project', error });
  }
}

static async deleteProject(req: Request, res: Response) {
  try {
    const result = await ProjectService.deleteProject(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project', error });
  }
}
```

#### Step 4: Register routes

**File:** `backend/src/routes/projects.ts`

Add these routes:

```typescript
router.get('/:id', ProjectController.getProjectById);
router.put('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);
```

#### Step 5: Run test to verify it passes

```bash
npx vitest run src/controllers/__tests__/projectController.test.ts
```

**Expected:** All tests pass

#### Step 6: Commit

```bash
git add backend/src/controllers/projectController.ts backend/src/routes/projects.ts backend/src/controllers/__tests__/projectController.test.ts
git commit -m "[API] Add Project CRUD endpoints (GET/:id, PUT, DELETE)

- GET /api/projects/:id - fetch by ID
- PUT /api/projects/:id - update project
- DELETE /api/projects/:id - soft delete
- Integration tests passing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.4: Teacher API - Add projectId Filtering

#### Step 1: Write failing test for projectId filtering

**File:** `backend/src/services/__tests__/teacherService.test.ts`

Add new test:

```typescript
import Teacher from '../../models/Teacher';
import Project from '../../models/Project';

describe('TeacherService.getAllTeachers with projectId', () => {
  it('should filter teachers by projectId', async () => {
    // Arrange: Create two projects
    const project1 = await Project.create({ name: 'TFETP', code: 'TFETP' });
    const project2 = await Project.create({ name: 'DEMO', code: 'DEMO' });

    // Create teachers in different projects
    await Teacher.create({
      personalInfo: { firstName: 'John', lastName: 'Doe' },
      project: project1._id
    });
    await Teacher.create({
      personalInfo: { firstName: 'Jane', lastName: 'Smith' },
      project: project1._id
    });
    await Teacher.create({
      personalInfo: { firstName: 'Bob', lastName: 'Wilson' },
      project: project2._id
    });

    // Act
    const project1Teachers = await TeacherService.getAllTeachers(project1._id.toString());

    // Assert
    expect(project1Teachers).toHaveLength(2);
    expect(project1Teachers[0].personalInfo.firstName).toBe('John');
    expect(project1Teachers[1].personalInfo.firstName).toBe('Jane');
  });

  it('should return all teachers when projectId not provided', async () => {
    const project = await Project.create({ name: 'TFETP', code: 'TFETP' });

    await Teacher.create({
      personalInfo: { firstName: 'John', lastName: 'Doe' },
      project: project._id
    });
    await Teacher.create({
      personalInfo: { firstName: 'Jane', lastName: 'Smith' },
      project: project._id
    });

    const allTeachers = await TeacherService.getAllTeachers();
    expect(allTeachers).toHaveLength(2);
  });
});
```

#### Step 2: Run test to verify it fails

```bash
npx vitest run src/services/__tests__/teacherService.test.ts -t "projectId"
```

**Expected:** Method signature mismatch error

#### Step 3: Modify TeacherService.getAllTeachers

**File:** `backend/src/services/teacherService.ts`

Modify the method:

```typescript
static async getAllTeachers(projectId?: string): Promise<ITeacher[]> {
  const query: any = { isDeleted: false };

  if (projectId) {
    query.project = projectId;
  }

  return await Teacher.find(query)
    .populate('school')
    .populate('project')
    .sort({ createdAt: -1 });
}
```

#### Step 4: Modify Controller to accept query param

**File:** `backend/src/controllers/teacherController.ts`

Modify getAllTeachers:

```typescript
static async getAllTeachers(req: Request, res: Response) {
  try {
    const projectId = req.query.projectId as string | undefined;
    const teachers = await TeacherService.getAllTeachers(projectId);
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teachers', error });
  }
}
```

#### Step 5: Run test to verify it passes

```bash
npx vitest run src/services/__tests__/teacherService.test.ts -t "projectId"
```

**Expected:** All tests pass

#### Step 6: Add integration test for controller

**File:** `backend/src/controllers/__tests__/teacherController.test.ts`

Add test:

```typescript
describe('GET /api/teachers?projectId', () => {
  it('should filter teachers by projectId', async () => {
    const project1 = await Project.create({ name: 'TFETP', code: 'TFETP' });
    const project2 = await Project.create({ name: 'DEMO', code: 'DEMO' });

    await Teacher.create({
      personalInfo: { firstName: 'John', lastName: 'Doe' },
      project: project1._id
    });
    await Teacher.create({
      personalInfo: { firstName: 'Bob', lastName: 'Wilson' },
      project: project2._id
    });

    const response = await request(app)
      .get(`/api/teachers?projectId=${project1._id}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].personalInfo.firstName).toBe('John');
  });
});
```

#### Step 7: Run integration test

```bash
npx vitest run src/controllers/__tests__/teacherController.test.ts -t "projectId"
```

**Expected:** Test passes

#### Step 8: Commit

```bash
git add backend/src/services/teacherService.ts backend/src/controllers/teacherController.ts backend/src/services/__tests__/teacherService.test.ts backend/src/controllers/__tests__/teacherController.test.ts
git commit -m "[API] Add projectId filtering to Teacher API

- TeacherService.getAllTeachers accepts optional projectId
- GET /api/teachers?projectId=xxx filters by project
- Backward compatible (no projectId = all teachers)
- Unit and integration tests passing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.5: Stats API - Add projectId Filtering

#### Step 1: Write failing test for stats filtering

**File:** `backend/src/services/__tests__/statsService.test.ts`

Add test:

```typescript
describe('StatsService with projectId filtering', () => {
  it('should filter dashboard stats by projectId', async () => {
    // Arrange: Create projects and stages
    const project1 = await Project.create({ name: 'TFETP', code: 'TFETP' });
    const project2 = await Project.create({ name: 'DEMO', code: 'DEMO' });
    const stage = await Stage.create({ title: 'New Applicant', order: 1 });

    // Create teachers in different projects
    await Teacher.create({
      personalInfo: { firstName: 'John', lastName: 'Doe', gender: 'Male' },
      project: project1._id,
      pipelineStage: stage._id
    });
    await Teacher.create({
      personalInfo: { firstName: 'Jane', lastName: 'Smith', gender: 'Female' },
      project: project1._id,
      pipelineStage: stage._id
    });
    await Teacher.create({
      personalInfo: { firstName: 'Bob', lastName: 'Wilson', gender: 'Male' },
      project: project2._id,
      pipelineStage: stage._id
    });

    // Act
    const stats = await StatsService.getDashboardStats({
      projectId: project1._id.toString()
    });

    // Assert
    expect(stats.totalCandidates).toBe(2); // Only project1 teachers
    expect(stats.genderDistribution.Male).toBe(1);
    expect(stats.genderDistribution.Female).toBe(1);
  });

  it('should return all stats when projectId not provided', async () => {
    const project = await Project.create({ name: 'TFETP', code: 'TFETP' });
    const stage = await Stage.create({ title: 'New Applicant', order: 1 });

    await Teacher.create({
      personalInfo: { firstName: 'John', lastName: 'Doe' },
      project: project._id,
      pipelineStage: stage._id
    });
    await Teacher.create({
      personalInfo: { firstName: 'Jane', lastName: 'Smith' },
      project: project._id,
      pipelineStage: stage._id
    });

    const stats = await StatsService.getDashboardStats({});
    expect(stats.totalCandidates).toBe(2);
  });
});
```

#### Step 2: Run test to verify it fails

```bash
npx vitest run src/services/__tests__/statsService.test.ts -t "projectId"
```

**Expected:** Stats not filtered, totalCandidates incorrect

#### Step 3: Modify StatsFilter interface

**File:** `backend/src/services/statsService.ts`

Update interface:

```typescript
interface StatsFilter {
  projectId?: string;  // NEW
  gender?: string;
  nationality?: string;
  ageRange?: string;
  school?: string;
}
```

#### Step 4: Modify buildMatchQuery to handle projectId

**File:** `backend/src/services/statsService.ts`

Update method:

```typescript
private static buildMatchQuery(filters: StatsFilter) {
  const query: any = { isDeleted: false };

  if (filters.projectId) {
    query.project = new mongoose.Types.ObjectId(filters.projectId);
  }

  if (filters.gender) {
    query['personalInfo.gender'] = filters.gender;
  }

  // ... rest of existing filters

  return query;
}
```

#### Step 5: Run test to verify it passes

```bash
npx vitest run src/services/__tests__/statsService.test.ts -t "projectId"
```

**Expected:** All tests pass

#### Step 6: Update controller to accept projectId query param

**File:** `backend/src/controllers/statsController.ts`

Modify getDashboardStats:

```typescript
static async getDashboardStats(req: Request, res: Response) {
  try {
    const filters: StatsFilter = {
      projectId: req.query.projectId as string | undefined,
      gender: req.query.gender as string | undefined,
      nationality: req.query.nationality as string | undefined,
      ageRange: req.query.ageRange as string | undefined,
      school: req.query.school as string | undefined,
    };

    const stats = await StatsService.getDashboardStats(filters);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error });
  }
}
```

#### Step 7: Commit

```bash
git add backend/src/services/statsService.ts backend/src/controllers/statsController.ts backend/src/services/__tests__/statsService.test.ts
git commit -m "[API] Add projectId filtering to Stats API

- StatsFilter interface includes projectId
- GET /api/stats/dashboard?projectId=xxx filters by project
- buildMatchQuery handles projectId in aggregation pipeline
- Tests verify correct filtering
- Backward compatible

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.6: Run full backend test suite

#### Step 1: Run all backend tests

```bash
cd backend
npm test
```

**Expected output:**
```
Test Files  5 passed (5)
     Tests  25+ passed (25+)
```

#### Step 2: Check TypeScript compilation

```bash
npx tsc --noEmit
```

**Expected:** No errors

#### Step 3: Verify backend starts without errors

```bash
npm run server
```

**Expected:** Server starts on port 5000

---

## 🔄 AGENT HANDOFF CHECKPOINT 1

**Iteration 1 Complete: Backend API Foundation**

### Verification Checklist

Before continuing to Iteration 2, verify:

- [ ] `ProjectService.updateProject` exists and tests pass
- [ ] `ProjectService.deleteProject` exists (soft delete with isActive=false)
- [ ] `GET /api/projects/:id` returns 200 for valid ID, 404 for invalid
- [ ] `PUT /api/projects/:id` updates project
- [ ] `DELETE /api/projects/:id` soft deletes project
- [ ] `GET /api/teachers?projectId=xxx` filters by project
- [ ] `GET /api/stats/dashboard?projectId=xxx` filters stats by project
- [ ] All backend tests pass (`npm test` in backend/)
- [ ] TypeScript compiles without errors
- [ ] Backend server starts successfully

### ✅ CI Test Verification (REQUIRED)

Run the following commands to ensure all automated tests pass:

```bash
# 1. Backend Tests
cd backend
npm test

# Expected: All tests pass
# Expected coverage: > 80%

# 2. TypeScript Check
npx tsc --noEmit

# Expected: No errors

# 3. Commit and Push
git push origin HEAD

# 4. Verify GitHub Actions CI
# Go to: https://github.com/[your-repo]/actions
# Expected: All jobs GREEN (lint, typecheck, test-backend)
```

**STOP if any CI job fails.** Fix issues before proceeding to Iteration 2.

### CI Test Targets for Iteration 1

| Test Type | Command | Expected Result |
|-----------|---------|-----------------|
| Unit Tests | `npm test --prefix backend` | All pass, coverage > 80% |
| Type Check | `npx tsc --noEmit` (backend) | No errors |
| Integration | GitHub Actions `test-backend` job | GREEN ✅ |

### Files Modified

```
backend/src/services/projectService.ts         - Added updateProject, deleteProject
backend/src/controllers/projectController.ts   - Added GET/:id, PUT/:id, DELETE/:id
backend/src/routes/projects.ts                 - Registered new routes
backend/src/services/teacherService.ts         - Added projectId parameter
backend/src/controllers/teacherController.ts   - Parse projectId from query
backend/src/services/statsService.ts           - Added projectId to StatsFilter
backend/src/controllers/statsController.ts     - Parse projectId from query
backend/src/services/__tests__/projectService.test.ts
backend/src/controllers/__tests__/projectController.test.ts
backend/src/services/__tests__/teacherService.test.ts
backend/src/services/__tests__/statsService.test.ts
```

### API Contracts Ready

These endpoints are now available for frontend integration:

```
GET    /api/projects           -> Project[]
GET    /api/projects/:id       -> Project
POST   /api/projects           -> Project
PUT    /api/projects/:id       -> Project
DELETE /api/projects/:id       -> void

GET    /api/teachers?projectId=xxx        -> Teacher[]
GET    /api/stats/dashboard?projectId=xxx -> DashboardStats
```

### For Gemini (Next Agent)

If you are taking over from this checkpoint:

1. **Start here:** Iteration 2 - Frontend Global State
2. **Verify backend first:** Run the checklist above
3. **Key context:**
   - Project CRUD is complete on backend
   - Teachers and Stats APIs accept optional `projectId` query param
   - Soft delete means `isActive=false` (not removed from DB)
4. **Next goal:** Build React Context for global project switching

---

## Iteration 2: Frontend Global State

**Goal:** Create ProjectContext with localStorage persistence

### Task 2.1: Create ProjectContext with Tests

#### Step 1: Write failing test for ProjectContext

**File:** `frontend/src/contexts/__tests__/ProjectContext.test.tsx` (NEW)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ProjectProvider, useProjectContext } from '../ProjectContext';
import * as projectService from '@/services/projectService';

vi.mock('@/services/projectService');

describe('ProjectContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should load projects on mount', async () => {
    const mockProjects = [
      { _id: '1', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '', updatedAt: '' },
      { _id: '2', name: 'DEMO', code: 'DEMO', isActive: true, createdAt: '', updatedAt: '' }
    ];

    vi.mocked(projectService.projectService.getAll).mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjectContext(), {
      wrapper: ProjectProvider
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toEqual(mockProjects);
  });

  it('should auto-select first project if none selected', async () => {
    const mockProjects = [
      { _id: '1', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '', updatedAt: '' }
    ];

    vi.mocked(projectService.projectService.getAll).mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjectContext(), {
      wrapper: ProjectProvider
    });

    await waitFor(() => {
      expect(result.current.selectedProjectId).toBe('1');
    });
  });

  it('should persist selectedProjectId to localStorage', async () => {
    const mockProjects = [
      { _id: '1', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '', updatedAt: '' }
    ];

    vi.mocked(projectService.projectService.getAll).mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjectContext(), {
      wrapper: ProjectProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSelectedProjectId('2');
    });

    expect(localStorage.getItem('selectedProjectId')).toBe('2');
  });

  it('should restore selectedProjectId from localStorage', async () => {
    localStorage.setItem('selectedProjectId', '42');

    const mockProjects = [
      { _id: '42', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '', updatedAt: '' }
    ];

    vi.mocked(projectService.projectService.getAll).mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjectContext(), {
      wrapper: ProjectProvider
    });

    expect(result.current.selectedProjectId).toBe('42');
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useProjectContext());
    }).toThrow('useProjectContext must be used within ProjectProvider');
  });
});
```

#### Step 2: Run test to verify it fails

```bash
cd frontend
npx vitest run src/contexts/__tests__/ProjectContext.test.tsx
```

**Expected:** File not found errors

#### Step 3: Create ProjectContext implementation

**File:** `frontend/src/contexts/ProjectContext.tsx` (NEW)

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectService, Project } from '@/services/projectService';

interface ProjectContextValue {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string) => void;
  projects: Project[];
  loading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(() => {
    return localStorage.getItem('selectedProjectId') || null;
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);

      // Auto-select first project if none selected
      if (!selectedProjectId && data.length > 0) {
        setSelectedProjectIdState(data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
    }
  }, [selectedProjectId]);

  const setSelectedProjectId = (id: string) => {
    setSelectedProjectIdState(id);
  };

  return (
    <ProjectContext.Provider
      value={{
        selectedProjectId,
        setSelectedProjectId,
        projects,
        loading,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
}
```

#### Step 4: Run test to verify it passes

```bash
npx vitest run src/contexts/__tests__/ProjectContext.test.tsx
```

**Expected:** All tests pass

#### Step 5: Commit

```bash
git add frontend/src/contexts/ProjectContext.tsx frontend/src/contexts/__tests__/ProjectContext.test.tsx
git commit -m "[FEAT] Add ProjectContext with localStorage persistence

- Create ProjectContext with selectedProjectId state
- Auto-select first project on mount
- Persist selection to localStorage
- Restore from localStorage on init
- All tests passing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.2: Wrap App with ProjectProvider

#### Step 1: Modify App.tsx

**File:** `frontend/src/App.tsx`

Update imports and structure:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from '@/contexts/ProjectContext';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Teachers from '@/pages/Teachers';
import Schools from '@/pages/Schools';
// ... other imports

function App() {
  return (
    <Router>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="schools" element={<Schools />} />
            {/* ... other routes */}
          </Route>
        </Routes>
      </ProjectProvider>
    </Router>
  );
}

export default App;
```

#### Step 2: Verify app compiles

```bash
npm run dev
```

**Expected:** App starts without errors, can access http://localhost:5173

#### Step 3: Commit

```bash
git add frontend/src/App.tsx
git commit -m "[CONFIG] Wrap App with ProjectProvider

- Enable global project state across all routes
- ProjectContext available to all components

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.3: Update Frontend projectService with CRUD methods

#### Step 1: Write failing test for projectService

**File:** `frontend/src/services/__tests__/projectService.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { projectService } from '../projectService';
import api from '../api';

vi.mock('../api');

describe('projectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('should fetch project by id', async () => {
      const mockProject = { _id: '1', name: 'TFETP', code: 'TFETP', isActive: true };
      vi.mocked(api.get).mockResolvedValue({ data: mockProject });

      const result = await projectService.getById('1');

      expect(api.get).toHaveBeenCalledWith('/projects/1');
      expect(result).toEqual(mockProject);
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      const mockUpdated = { _id: '1', name: 'Updated', code: 'TFETP', isActive: true };
      vi.mocked(api.put).mockResolvedValue({ data: mockUpdated });

      const result = await projectService.update('1', { name: 'Updated' });

      expect(api.put).toHaveBeenCalledWith('/projects/1', { name: 'Updated' });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('delete', () => {
    it('should delete project', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: null });

      await projectService.delete('1');

      expect(api.delete).toHaveBeenCalledWith('/projects/1');
    });
  });
});
```

#### Step 2: Run test to verify it fails

```bash
npx vitest run src/services/__tests__/projectService.test.ts
```

**Expected:** Methods not defined errors

#### Step 3: Implement CRUD methods

**File:** `frontend/src/services/projectService.ts`

Add methods:

```typescript
export const projectService = {
  async getAll(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  async getById(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async create(data: Partial<Project>): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }
};
```

#### Step 4: Run test to verify it passes

```bash
npx vitest run src/services/__tests__/projectService.test.ts
```

**Expected:** All tests pass

#### Step 5: Commit

```bash
git add frontend/src/services/projectService.ts frontend/src/services/__tests__/projectService.test.ts
git commit -m "[API] Add Project CRUD methods to frontend service

- Add getById, update, delete methods
- All methods tested with mocked api
- Ready for ProjectSettings UI

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.4: Update ProjectToggle to use Context

#### Step 1: Read current ProjectToggle implementation

**File:** `frontend/src/components/teachers/list/ProjectToggle.tsx`

Verify current structure (should have local state for projects).

#### Step 2: Refactor to use Context

**File:** `frontend/src/components/teachers/list/ProjectToggle.tsx`

Replace local state with Context:

```typescript
import { useProjectContext } from '@/contexts/ProjectContext';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectToggleProps {
  value: string | null;
  onChange: (projectId: string) => void;
}

export function ProjectToggle({ value, onChange }: ProjectToggleProps) {
  const { projects, loading } = useProjectContext();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Label>Project:</Label>
        <div className="w-48 h-10 bg-slate-100 animate-pulse rounded-md" />
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="project-select">Project:</Label>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger id="project-select" className="w-48">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project._id} value={project._id}>
              {project.name} ({project.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

#### Step 3: Test in browser

```bash
npm run dev
```

Navigate to Teachers page, verify ProjectToggle still works.

#### Step 4: Commit

```bash
git add frontend/src/components/teachers/list/ProjectToggle.tsx
git commit -m "[REFACTOR] Update ProjectToggle to use Context

- Remove local projects state
- Use ProjectContext.projects
- Single source of truth for projects list
- No duplicate API calls

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🔄 AGENT HANDOFF CHECKPOINT 2

**Iteration 2 Complete: Frontend Global State**

### Verification Checklist

Before continuing to Iteration 3, verify:

- [ ] `ProjectContext.tsx` exists with all required methods
- [ ] Context tests pass (`npm test` in frontend/)
- [ ] `App.tsx` wrapped with `<ProjectProvider>`
- [ ] `projectService` has getById, update, delete methods
- [ ] `ProjectToggle` uses `useProjectContext()` instead of local state
- [ ] Frontend compiles without errors (`npm run build`)
- [ ] App runs in dev mode (`npm run dev`)
- [ ] Can view Teachers page and see ProjectToggle

### ✅ CI Test Verification (REQUIRED)

Run the following commands to ensure all automated tests pass:

```bash
# 1. Frontend Tests
cd frontend
npm test

# Expected: All tests pass
# Expected coverage: > 70%

# 2. TypeScript Check
npx tsc -b --noEmit

# Expected: No errors

# 3. ESLint
npm run lint

# Expected: No warnings or errors

# 4. Build Verification
npm run build

# Expected: Build succeeds, dist/ folder created

# 5. Commit and Push
git push origin HEAD

# 6. Verify GitHub Actions CI
# Expected: All jobs GREEN (lint, typecheck, test-frontend, build)
```

**STOP if any CI job fails.** Fix issues before proceeding to Iteration 3.

### CI Test Targets for Iteration 2

| Test Type | Command | Expected Result |
|-----------|---------|-----------------|
| Unit Tests | `npm test --prefix frontend` | All pass, coverage > 70% |
| Type Check | `npx tsc -b --noEmit` (frontend) | No errors |
| Lint | `npm run lint --prefix frontend` | No warnings |
| Build | `npm run build --prefix frontend` | Success, no errors |
| Integration | GitHub Actions all jobs | GREEN ✅ |

### Files Modified

```
frontend/src/contexts/ProjectContext.tsx                     - NEW
frontend/src/contexts/__tests__/ProjectContext.test.tsx     - NEW
frontend/src/App.tsx                                         - Wrapped with ProjectProvider
frontend/src/services/projectService.ts                      - Added CRUD methods
frontend/src/services/__tests__/projectService.test.ts      - NEW
frontend/src/components/teachers/list/ProjectToggle.tsx     - Use Context
```

### Context API Available

All components can now access:

```typescript
const {
  selectedProjectId,      // string | null
  setSelectedProjectId,   // (id: string) => void
  projects,               // Project[]
  loading,                // boolean
  refreshProjects         // () => Promise<void>
} = useProjectContext();
```

### For Gemini (Next Agent)

If you are taking over from this checkpoint:

1. **Start here:** Iteration 3 - Page Integration
2. **Verify frontend first:** Run the checklist above
3. **Key context:**
   - ProjectContext provides global state
   - localStorage persistence is automatic
   - First project auto-selected on mount
   - ProjectToggle already refactored to use Context
4. **Next goal:** Integrate project switching into Teachers, Dashboard, Schools pages

---

## Iteration 3: Page Integration

**Goal:** Enable project switching in Teachers, Dashboard, and Schools pages

### Task 3.1: Teachers Page - Migrate to Context + Backend Filtering

#### Step 1: Read current Teachers.tsx

**File:** `frontend/src/pages/Teachers.tsx`

Identify:
- Local state for `selectedProjectId`
- Frontend filtering logic (`projectFilteredTeachers`)
- `loadTeachers` function

#### Step 2: Update teacherService to support projectId

**File:** `frontend/src/services/teacherService.ts`

Modify `getAll` method:

```typescript
export const teacherService = {
  async getAll(projectId?: string): Promise<Teacher[]> {
    const params = projectId ? { projectId } : {};
    const response = await api.get<Teacher[]>('/teachers', { params });
    return response.data;
  },

  // ... other methods
};
```

#### Step 3: Refactor Teachers.tsx to use Context

**File:** `frontend/src/pages/Teachers.tsx`

Changes:

```typescript
import { useProjectContext } from '@/contexts/ProjectContext';

export default function Teachers() {
  const { selectedProjectId, setSelectedProjectId } = useProjectContext();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Remove local selectedProjectId state
  // Remove projectFilteredTeachers useMemo

  const loadTeachers = useCallback(async () => {
    if (!selectedProjectId) return;

    try {
      setLoading(true);
      // Backend filtering - pass projectId to API
      const data = await teacherService.getAll(selectedProjectId);
      setTeachers(data);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  // ProjectToggle now uses Context values
  return (
    <div className="space-y-6">
      <ProjectToggle
        value={selectedProjectId}
        onChange={setSelectedProjectId}
      />

      {/* Use teachers directly, not projectFilteredTeachers */}
      <TeacherTable data={teachers} loading={loading} />
    </div>
  );
}
```

#### Step 4: Test in browser

```bash
npm run dev
```

Verify:
- Teachers page loads
- Switching projects updates the list
- Reloading page preserves selection

#### Step 5: Commit

```bash
git add frontend/src/pages/Teachers.tsx frontend/src/services/teacherService.ts
git commit -m "[FEAT] Migrate Teachers page to Context + backend filtering

- Remove local project state
- Use useProjectContext for selectedProjectId
- teacherService.getAll accepts projectId param
- Backend filtering (no frontend filter needed)
- Project selection persists across reloads

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.2: Dashboard Page - Add ProjectToggle + API Filtering

#### Step 1: Read current Dashboard.tsx

**File:** `frontend/src/pages/Dashboard.tsx`

Identify:
- Existing filters state
- `loadStats` function
- KPI cards and charts

#### Step 2: Update statsService to support projectId

**File:** `frontend/src/services/statsService.ts`

Modify `getDashboardStats`:

```typescript
export interface StatsFilter {
  projectId?: string;  // NEW
  gender?: string;
  nationality?: string;
  ageRange?: string;
  school?: string;
}

export const statsService = {
  async getDashboardStats(filters: StatsFilter = {}): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/stats/dashboard', {
      params: filters
    });
    return response.data;
  }
};
```

#### Step 3: Integrate ProjectToggle in Dashboard

**File:** `frontend/src/pages/Dashboard.tsx`

Add imports and Context:

```typescript
import { useProjectContext } from '@/contexts/ProjectContext';
import { ProjectToggle } from '@/components/teachers/list/ProjectToggle';

export default function Dashboard() {
  const { selectedProjectId, setSelectedProjectId } = useProjectContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState<StatsFilter>({});
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!selectedProjectId) return;

    try {
      setLoading(true);
      const data = await statsService.getDashboardStats({
        projectId: selectedProjectId,  // NEW
        ...filters
      });
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, filters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-500">Overview of teachers, schools, and pipeline</p>
      </div>

      {/* Add ProjectToggle */}
      <ProjectToggle
        value={selectedProjectId}
        onChange={setSelectedProjectId}
      />

      {/* Existing KPIs, charts, etc. */}
      {loading ? <LoadingSkeleton /> : <DashboardContent stats={stats} />}
    </div>
  );
}
```

#### Step 4: Test in browser

```bash
npm run dev
```

Navigate to Dashboard:
- Verify ProjectToggle appears
- Switch projects → KPIs update
- Charts update
- Recent candidates filtered by project

#### Step 5: Commit

```bash
git add frontend/src/pages/Dashboard.tsx frontend/src/services/statsService.ts
git commit -m "[FEAT] Add project filtering to Dashboard

- Add ProjectToggle to Dashboard header
- Pass projectId to statsService.getDashboardStats
- KPIs, charts, candidates all filtered by project
- Project selection synced across pages

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.3: Schools Page - Add ProjectToggle + Frontend Filtering

#### Step 1: Read current Schools.tsx

**File:** `frontend/src/pages/Schools.tsx`

Identify:
- Schools loading logic
- DataTable usage

#### Step 2: Integrate ProjectToggle + Teacher-based filtering

**File:** `frontend/src/pages/Schools.tsx`

Add Context and filtering logic:

```typescript
import { useProjectContext } from '@/contexts/ProjectContext';
import { ProjectToggle } from '@/components/teachers/list/ProjectToggle';
import { teacherService, Teacher } from '@/services/teacherService';

export default function Schools() {
  const { selectedProjectId, setSelectedProjectId } = useProjectContext();
  const [schools, setSchools] = useState<School[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!selectedProjectId) return;

    try {
      setLoading(true);

      // Load schools (all)
      const schoolsData = await schoolService.getAll();
      setSchools(schoolsData);

      // Load teachers for current project
      const teachersData = await teacherService.getAll(selectedProjectId);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Frontend filtering: show schools that have teachers in current project
  const filteredSchools = useMemo(() => {
    if (!selectedProjectId || teachers.length === 0) {
      return schools;
    }

    const schoolIdsInProject = new Set(
      teachers
        .map((t) => t.school)
        .filter(Boolean)
        .map((s) => (typeof s === 'string' ? s : s._id))
    );

    return schools.filter((s) => schoolIdsInProject.has(s._id));
  }, [schools, teachers, selectedProjectId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schools</h1>
          <p className="text-slate-500">Manage partner schools</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          Add School
        </Button>
      </div>

      {/* Add ProjectToggle */}
      <ProjectToggle
        value={selectedProjectId}
        onChange={setSelectedProjectId}
      />

      {/* Use filteredSchools */}
      <DataTable
        data={filteredSchools}
        columns={schoolColumns}
        loading={loading}
      />
    </div>
  );
}
```

#### Step 3: Test in browser

```bash
npm run dev
```

Navigate to Schools:
- Verify ProjectToggle appears
- Switch projects → schools list updates
- Only shows schools with teachers in current project

#### Step 4: Commit

```bash
git add frontend/src/pages/Schools.tsx
git commit -m "[FEAT] Add project filtering to Schools page

- Add ProjectToggle to Schools header
- Load teachers for current project
- Frontend filtering: show schools with teachers in project
- School model unchanged (no project FK)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.4: Integration Testing - Cross-Page Consistency

#### Step 1: Manual integration test

Open app in browser:

1. Navigate to Teachers page
2. Select "TFETP" project → note teacher count
3. Navigate to Dashboard
4. Verify same project selected (TFETP)
5. Verify KPIs match teacher count
6. Navigate to Schools
7. Verify same project selected
8. Navigate back to Teachers
9. Verify selection persisted
10. Reload page (F5)
11. Verify project selection restored from localStorage

#### Step 2: Document test results

Create a test log:

```bash
echo "# Integration Test Results - $(date)" > docs/integration-test-log.md
echo "" >> docs/integration-test-log.md
echo "## Cross-Page Project Switching" >> docs/integration-test-log.md
echo "- [ ] Project selection synced across pages" >> docs/integration-test-log.md
echo "- [ ] localStorage persistence works" >> docs/integration-test-log.md
echo "- [ ] Teachers page filters by project" >> docs/integration-test-log.md
echo "- [ ] Dashboard stats filter by project" >> docs/integration-test-log.md
echo "- [ ] Schools page shows relevant schools" >> docs/integration-test-log.md
```

Check each item manually, update with `[x]`.

#### Step 3: Commit test log

```bash
git add docs/integration-test-log.md
git commit -m "[TEST] Add integration test log for project switching

- Document cross-page consistency test
- Verify localStorage persistence
- Manual verification of all three pages

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🔄 AGENT HANDOFF CHECKPOINT 3

**Iteration 3 Complete: Page Integration**

### Verification Checklist

Before continuing to Iteration 4, verify:

- [ ] Teachers page uses `useProjectContext`
- [ ] Teachers page calls `teacherService.getAll(projectId)`
- [ ] Dashboard has ProjectToggle
- [ ] Dashboard passes `projectId` to `statsService.getDashboardStats`
- [ ] Schools has ProjectToggle
- [ ] Schools filters by teachers in current project
- [ ] Switching projects on any page updates all pages
- [ ] Reloading page preserves project selection
- [ ] Frontend tests pass
- [ ] No console errors in browser

### ✅ CI Test Verification (REQUIRED)

Run the following commands to ensure all automated tests pass:

```bash
# 1. Full Test Suite (Backend + Frontend)
npm run test --prefix backend
npm run test --prefix frontend

# Expected: All tests pass

# 2. Type Check (Both)
cd backend && npx tsc --noEmit
cd ../frontend && npx tsc -b --noEmit

# Expected: No errors

# 3. Manual Integration Test
npm run dev

# Test in browser:
# - Navigate to Teachers → select project → verify list filters
# - Navigate to Dashboard → verify same project selected → verify KPIs match
# - Navigate to Schools → verify same project selected → verify schools filter
# - Reload page (F5) → verify project selection persists

# 4. Commit and Push
git push origin HEAD

# 5. Verify GitHub Actions CI
# Expected: All jobs GREEN
```

**STOP if any CI job fails.** Fix issues before proceeding to Iteration 4.

### CI Test Targets for Iteration 3

| Test Type | Command | Expected Result |
|-----------|---------|-----------------|
| Backend Tests | `npm test --prefix backend` | All pass |
| Frontend Tests | `npm test --prefix frontend` | All pass |
| Type Check | Both backend and frontend | No errors |
| Manual QA | Browser testing | All pages respond to project switch |
| Integration | GitHub Actions all jobs | GREEN ✅ |

### Files Modified

```
frontend/src/pages/Teachers.tsx           - Use Context, backend filtering
frontend/src/pages/Dashboard.tsx          - Add ProjectToggle, pass projectId
frontend/src/pages/Schools.tsx            - Add ProjectToggle, frontend filtering
frontend/src/services/teacherService.ts   - Support projectId param
frontend/src/services/statsService.ts     - Support projectId in filters
docs/integration-test-log.md              - NEW
```

### User-Facing Features Ready

Users can now:
- Switch projects on Teachers/Dashboard/Schools pages
- See data filtered by selected project
- Navigate between pages with selection persisted
- Reload browser and retain selection

### For Gemini (Next Agent)

If you are taking over from this checkpoint:

1. **Start here:** Iteration 4 - Project CRUD UI
2. **Verify pages first:** Run the checklist above, test in browser
3. **Key context:**
   - All three main pages now respond to project switching
   - Backend filtering for Teachers/Dashboard
   - Frontend filtering for Schools
   - Context handles all state management
4. **Next goal:** Build UI for creating, editing, and archiving projects

---

## Iteration 4: Project CRUD UI

**Goal:** Create ProjectSettings page with full CRUD operations

### Task 4.1: Create ProjectSettings Page

#### Step 1: Write test for ProjectSettings

**File:** `frontend/src/pages/__tests__/ProjectSettings.test.tsx` (NEW)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProjectSettings from '../ProjectSettings';
import * as projectService from '@/services/projectService';
import { ProjectProvider } from '@/contexts/ProjectContext';

vi.mock('@/services/projectService');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ProjectProvider>{children}</ProjectProvider>
  </BrowserRouter>
);

describe('ProjectSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display list of projects', async () => {
    const mockProjects = [
      { _id: '1', name: 'TFETP', code: 'TFETP', description: 'Main project', isActive: true },
      { _id: '2', name: 'DEMO', code: 'DEMO', description: 'Demo', isActive: true }
    ];

    vi.mocked(projectService.projectService.getAll).mockResolvedValue(mockProjects);

    render(<ProjectSettings />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('TFETP')).toBeInTheDocument();
      expect(screen.getByText('DEMO')).toBeInTheDocument();
    });
  });

  it('should show create dialog when clicking Create Project button', async () => {
    vi.mocked(projectService.projectService.getAll).mockResolvedValue([]);

    render(<ProjectSettings />, { wrapper });

    const createButton = screen.getByRole('button', { name: /create project/i });
    await userEvent.click(createButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
  });

  it('should create new project', async () => {
    const mockCreated = { _id: '3', name: 'New Project', code: 'NEW', isActive: true };

    vi.mocked(projectService.projectService.getAll).mockResolvedValue([]);
    vi.mocked(projectService.projectService.create).mockResolvedValue(mockCreated);

    render(<ProjectSettings />, { wrapper });

    const createButton = screen.getByRole('button', { name: /create project/i });
    await userEvent.click(createButton);

    const nameInput = screen.getByLabelText(/project name/i);
    const codeInput = screen.getByLabelText(/project code/i);

    await userEvent.type(nameInput, 'New Project');
    await userEvent.type(codeInput, 'NEW');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(projectService.projectService.create).toHaveBeenCalledWith({
        name: 'New Project',
        code: 'NEW',
        description: ''
      });
    });
  });
});
```

#### Step 2: Run test to verify it fails

```bash
npx vitest run src/pages/__tests__/ProjectSettings.test.tsx
```

**Expected:** File not found errors

#### Step 3: Create ProjectSettings component

**File:** `frontend/src/pages/ProjectSettings.tsx` (NEW)

```typescript
import { useState, useEffect } from 'react';
import { useProjectContext } from '@/contexts/ProjectContext';
import { projectService, Project } from '@/services/projectService';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Archive } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { CreateProjectDialog } from '@/components/settings/CreateProjectDialog';
import { EditProjectDialog } from '@/components/settings/EditProjectDialog';
import { ConfirmDeleteDialog } from '@/components/settings/ConfirmDeleteDialog';

export default function ProjectSettings() {
  const { refreshProjects } = useProjectContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (data: Partial<Project>) => {
    await projectService.create(data);
    await loadProjects();
    await refreshProjects();
    setCreateDialogOpen(false);
  };

  const handleUpdate = async (id: string, data: Partial<Project>) => {
    await projectService.update(id, data);
    await loadProjects();
    await refreshProjects();
    setEditingProject(null);
  };

  const handleDelete = async (id: string) => {
    await projectService.delete(id);
    await loadProjects();
    await refreshProjects();
    setDeletingProject(null);
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Archived'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingProject(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingProject(row.original)}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-slate-500">Create and manage projects</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      <DataTable columns={columns} data={projects} loading={loading} />

      <CreateProjectDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreate}
      />

      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onUpdate={handleUpdate}
        />
      )}

      {deletingProject && (
        <ConfirmDeleteDialog
          project={deletingProject}
          onClose={() => setDeletingProject(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
```

#### Step 4: Create dialog components (simplified for test passing)

**File:** `frontend/src/components/settings/CreateProjectDialog.tsx` (NEW)

```typescript
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Project } from '@/services/projectService';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: Partial<Project>) => Promise<void>;
}

export function CreateProjectDialog({ open, onClose, onCreate }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate({ name, code, description });
      setName('');
      setCode('');
      setDescription('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="code">Project Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Files:** Create similar dialogs for Edit and ConfirmDelete (implementations follow same pattern).

#### Step 5: Add route for ProjectSettings

**File:** `frontend/src/App.tsx`

Add route:

```typescript
import ProjectSettings from '@/pages/ProjectSettings';

// In Routes:
<Route path="settings/projects" element={<ProjectSettings />} />
```

#### Step 6: Run test to verify it passes

```bash
npx vitest run src/pages/__tests__/ProjectSettings.test.tsx
```

**Expected:** Tests pass

#### Step 7: Test in browser

```bash
npm run dev
```

Navigate to `/settings/projects`:
- Verify project list displays
- Click "Create Project" → dialog opens
- Create a project → appears in list
- Click Edit → can modify project
- Click Archive → soft deletes project

#### Step 8: Commit

```bash
git add frontend/src/pages/ProjectSettings.tsx frontend/src/components/settings/ frontend/src/pages/__tests__/ProjectSettings.test.tsx frontend/src/App.tsx
git commit -m "[FEAT] Add ProjectSettings page with CRUD UI

- Create ProjectSettings page with DataTable
- Create/Edit/Delete dialogs
- Integration with projectService
- Refresh ProjectContext after mutations
- Tests passing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🔄 AGENT HANDOFF CHECKPOINT 4

**Iteration 4 Complete: Project CRUD UI**

### Verification Checklist

Before continuing to Iteration 5, verify:

- [ ] ProjectSettings page exists at `/settings/projects`
- [ ] Can create new project via dialog
- [ ] Can edit existing project
- [ ] Can archive project (soft delete)
- [ ] Active/Archived badge displays correctly
- [ ] After CRUD operations, ProjectContext refreshes
- [ ] ProjectToggle reflects new/edited projects immediately
- [ ] Tests pass for ProjectSettings
- [ ] Frontend compiles and runs

### ✅ CI Test Verification (REQUIRED)

Run the following commands to ensure all automated tests pass:

```bash
# 1. Frontend Tests (including new ProjectSettings tests)
cd frontend
npm test

# Expected: All tests pass, including ProjectSettings tests

# 2. Type Check
npx tsc -b --noEmit

# Expected: No errors

# 3. Build
npm run build

# Expected: Success, bundle size acceptable

# 4. Manual CRUD Test
npm run dev

# Test in browser:
# - Navigate to /settings/projects
# - Create new project → verify appears in list
# - Edit project → verify updates immediately
# - Archive project → verify badge changes to "Archived"
# - Navigate to Teachers → verify ProjectToggle updated
# - Switch to new project → verify Teachers list filters

# 5. Commit and Push
git push origin HEAD

# 6. Verify GitHub Actions CI
# Expected: All jobs GREEN
```

**STOP if any CI job fails.** Fix issues before proceeding to Iteration 5.

### CI Test Targets for Iteration 4

| Test Type | Command | Expected Result |
|-----------|---------|-----------------|
| Frontend Tests | `npm test --prefix frontend` | All pass (including ProjectSettings) |
| Type Check | `npx tsc -b --noEmit` (frontend) | No errors |
| Build | `npm run build --prefix frontend` | Success |
| Manual CRUD | Browser testing | All CRUD operations work |
| Integration | GitHub Actions all jobs | GREEN ✅ |

### Files Modified

```
frontend/src/pages/ProjectSettings.tsx                        - NEW
frontend/src/pages/__tests__/ProjectSettings.test.tsx       - NEW
frontend/src/components/settings/CreateProjectDialog.tsx     - NEW
frontend/src/components/settings/EditProjectDialog.tsx       - NEW
frontend/src/components/settings/ConfirmDeleteDialog.tsx     - NEW
frontend/src/App.tsx                                          - Add route
```

### User-Facing Features Ready

Admins can now:
- View all projects (active and archived)
- Create new projects with name/code/description
- Edit existing projects
- Archive projects (soft delete)
- See immediate updates in ProjectToggle across all pages

### For Gemini (Next Agent)

If you are taking over from this checkpoint:

1. **Start here:** Iteration 5 - Testing & Verification
2. **Verify CRUD UI first:** Test in browser, run checklist above
3. **Key context:**
   - Full project lifecycle now manageable via UI
   - Soft delete pattern maintained (isActive=false)
   - ProjectContext.refreshProjects() ensures global sync
4. **Next goal:** Comprehensive testing and production readiness

---

## Iteration 5: Testing & Verification

**Goal:** Ensure production readiness through comprehensive testing

### Task 5.1: Backend Integration Tests

#### Step 1: Run full backend test suite

```bash
cd backend
npm test
```

**Expected:** All tests pass

#### Step 2: Add end-to-end integration test

**File:** `backend/src/__tests__/integration.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import projectRoutes from '../routes/projects';
import teacherRoutes from '../routes/teachers';
import statsRoutes from '../routes/stats';

describe('Integration: Project Switching Flow', () => {
  let mongoServer: MongoMemoryServer;
  let app: express.Application;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    app = express();
    app.use(express.json());
    app.use('/api/projects', projectRoutes);
    app.use('/api/teachers', teacherRoutes);
    app.use('/api/stats', statsRoutes);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should handle full project lifecycle with filtering', async () => {
    // Create two projects
    const tfetp = await request(app)
      .post('/api/projects')
      .send({ name: 'TFETP', code: 'TFETP', description: 'Main' })
      .expect(201);

    const demo = await request(app)
      .post('/api/projects')
      .send({ name: 'DEMO', code: 'DEMO', description: 'Demo' })
      .expect(201);

    // Create teachers in different projects
    await request(app)
      .post('/api/teachers')
      .send({
        personalInfo: { firstName: 'John', lastName: 'Doe' },
        project: tfetp.body._id
      })
      .expect(201);

    await request(app)
      .post('/api/teachers')
      .send({
        personalInfo: { firstName: 'Jane', lastName: 'Smith' },
        project: demo.body._id
      })
      .expect(201);

    // Filter teachers by project
    const tfetpTeachers = await request(app)
      .get(`/api/teachers?projectId=${tfetp.body._id}`)
      .expect(200);

    expect(tfetpTeachers.body).toHaveLength(1);
    expect(tfetpTeachers.body[0].personalInfo.firstName).toBe('John');

    // Update project
    await request(app)
      .put(`/api/projects/${tfetp.body._id}`)
      .send({ name: 'TFETP Updated' })
      .expect(200);

    // Archive project
    await request(app)
      .delete(`/api/projects/${demo.body._id}`)
      .expect(200);

    // Verify archived project not in active list
    const activeProjects = await request(app)
      .get('/api/projects')
      .expect(200);

    expect(activeProjects.body).toHaveLength(1);
    expect(activeProjects.body[0].name).toBe('TFETP Updated');
  });
});
```

#### Step 3: Run integration test

```bash
npx vitest run src/__tests__/integration.test.ts
```

**Expected:** Test passes

#### Step 4: Commit

```bash
git add backend/src/__tests__/integration.test.ts
git commit -m "[TEST] Add end-to-end integration test for project switching

- Full lifecycle: create projects → create teachers → filter → archive
- Verifies API contracts work together
- Tests cross-entity filtering

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5.2: Frontend Component Tests

#### Step 1: Run full frontend test suite

```bash
cd frontend
npm test
```

**Expected:** All tests pass

#### Step 2: Add integration test for page navigation

**File:** `frontend/src/__tests__/navigation.test.tsx` (NEW)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import * as projectService from '@/services/projectService';
import * as teacherService from '@/services/teacherService';
import * as statsService from '@/services/statsService';

vi.mock('@/services/projectService');
vi.mock('@/services/teacherService');
vi.mock('@/services/statsService');

describe('Navigation: Project Selection Persistence', () => {
  it('should persist project selection across page navigation', async () => {
    const mockProjects = [
      { _id: '1', name: 'TFETP', code: 'TFETP', isActive: true },
      { _id: '2', name: 'DEMO', code: 'DEMO', isActive: true }
    ];

    vi.mocked(projectService.projectService.getAll).mockResolvedValue(mockProjects);
    vi.mocked(teacherService.teacherService.getAll).mockResolvedValue([]);
    vi.mocked(statsService.statsService.getDashboardStats).mockResolvedValue({
      totalCandidates: 0,
      genderDistribution: {},
      nationalityDistribution: {},
      stageDistribution: {}
    });

    render(<App />, { wrapper: BrowserRouter });

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText(/TFETP/)).toBeInTheDocument();
    });

    // Select DEMO project on Dashboard
    const projectSelect = screen.getByRole('combobox');
    await userEvent.click(projectSelect);
    await userEvent.click(screen.getByText('DEMO (DEMO)'));

    // Navigate to Teachers page
    const teachersLink = screen.getByRole('link', { name: /teachers/i });
    await userEvent.click(teachersLink);

    // Verify DEMO still selected
    await waitFor(() => {
      expect(screen.getByText('DEMO (DEMO)')).toBeInTheDocument();
    });

    // Navigate to Schools page
    const schoolsLink = screen.getByRole('link', { name: /schools/i });
    await userEvent.click(schoolsLink);

    // Verify DEMO still selected
    await waitFor(() => {
      expect(screen.getByText('DEMO (DEMO)')).toBeInTheDocument();
    });
  });
});
```

#### Step 3: Run navigation test

```bash
npx vitest run src/__tests__/navigation.test.tsx
```

**Expected:** Test passes

#### Step 4: Commit

```bash
git add frontend/src/__tests__/navigation.test.tsx
git commit -m "[TEST] Add navigation test for project persistence

- Verify project selection persists across page navigation
- Test Dashboard → Teachers → Schools flow
- Ensures Context state maintained

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5.3: Manual QA Checklist

#### Step 1: Create QA checklist document

**File:** `docs/qa-checklist.md` (NEW)

```markdown
# QA Checklist - Global Project Switching

## Backend API

- [ ] GET /api/projects returns all active projects
- [ ] POST /api/projects creates new project with unique code
- [ ] GET /api/projects/:id returns project by ID
- [ ] PUT /api/projects/:id updates project (code immutable)
- [ ] DELETE /api/projects/:id soft deletes (isActive=false)
- [ ] GET /api/teachers?projectId=xxx filters teachers
- [ ] GET /api/stats/dashboard?projectId=xxx filters stats
- [ ] Duplicate project code returns error

## Frontend - Teachers Page

- [ ] ProjectToggle displays on page
- [ ] Selecting project filters teacher list
- [ ] Teacher count updates correctly
- [ ] Page refresh preserves selection

## Frontend - Dashboard Page

- [ ] ProjectToggle displays on page
- [ ] Selecting project updates KPIs
- [ ] Charts reflect correct data
- [ ] Recent candidates filtered by project

## Frontend - Schools Page

- [ ] ProjectToggle displays on page
- [ ] Selecting project filters schools
- [ ] Only shows schools with teachers in project

## Frontend - ProjectSettings

- [ ] Can create new project
- [ ] Can edit project name/description
- [ ] Cannot edit project code
- [ ] Can archive project
- [ ] Archived projects show "Archived" badge
- [ ] After create/edit, ProjectToggle updates immediately

## Cross-Page Behavior

- [ ] Selecting project on Teachers updates Dashboard selection
- [ ] Selecting project on Dashboard updates Schools selection
- [ ] Navigation preserves project selection
- [ ] Browser refresh preserves project selection (localStorage)
- [ ] Opening new tab/window restores selection

## Error Handling

- [ ] Invalid project ID returns 404
- [ ] Duplicate project code shows error message
- [ ] Network errors show user-friendly message
- [ ] Loading states display correctly

## Performance

- [ ] ProjectToggle loads projects only once (no duplicate API calls)
- [ ] Switching projects is instant (< 100ms)
- [ ] Large teacher lists (100+) filter smoothly
```

#### Step 2: Execute manual QA

Go through each item in the checklist, testing in the browser.

#### Step 3: Update checklist with results

Replace `[ ]` with `[x]` for passing items. Add notes for any issues.

#### Step 4: Commit QA results

```bash
git add docs/qa-checklist.md
git commit -m "[TEST] Complete manual QA checklist

- All functional tests passing
- Cross-page behavior verified
- Performance acceptable
- Error handling working correctly

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5.4: Production Build Verification

#### Step 1: Build frontend for production

```bash
cd frontend
npm run build
```

**Expected:** Build completes with no errors

#### Step 2: Check bundle size

```bash
npx vite-bundle-visualizer
```

**Expected:** No unexpectedly large dependencies, ProjectContext adds < 5KB

#### Step 3: Run TypeScript strict check

```bash
npx tsc --noEmit --strict
```

**Expected:** No errors

#### Step 4: Run ESLint

```bash
npm run lint
```

**Expected:** No errors or warnings

#### Step 5: Document build results

Create build report:

```bash
echo "# Production Build Report - $(date)" > docs/build-report.md
echo "" >> docs/build-report.md
echo "## Bundle Size" >> docs/build-report.md
echo "- Total: [check from vite build output]" >> docs/build-report.md
echo "- ProjectContext overhead: < 5KB" >> docs/build-report.md
echo "" >> docs/build-report.md
echo "## Compilation" >> docs/build-report.md
echo "- TypeScript: PASS" >> docs/build-report.md
echo "- ESLint: PASS" >> docs/build-report.md
```

#### Step 6: Commit

```bash
git add docs/build-report.md
git commit -m "[BUILD] Verify production build readiness

- Frontend builds successfully
- Bundle size acceptable
- TypeScript strict mode passes
- ESLint clean

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🔄 AGENT HANDOFF CHECKPOINT 5 (FINAL)

**Iteration 5 Complete: Testing & Verification**

### ✅ Final Verification Checklist

- [ ] All backend tests pass (`cd backend && npm test`)
- [ ] All frontend tests pass (`cd frontend && npm test`)
- [ ] Integration tests pass (backend and frontend)
- [ ] Manual QA checklist completed (docs/qa-checklist.md)
- [ ] Production build succeeds (`npm run build`)
- [ ] TypeScript compiles with --strict
- [ ] ESLint passes with no warnings
- [ ] Bundle size acceptable (< 5KB overhead)
- [ ] No console errors in dev or production mode
- [ ] localStorage persistence works
- [ ] Cross-page project switching works
- [ ] All CRUD operations functional

### ✅ CI Test Verification (FINAL)

This is the final checkpoint before declaring the feature production-ready. Run the comprehensive test suite:

```bash
# 1. Full Backend Test Suite
cd backend
npm test -- run --coverage

# Expected: All tests pass
# Expected coverage: > 80%
# Expected: No console errors

# 2. Full Frontend Test Suite
cd ../frontend
npm test -- run --coverage

# Expected: All tests pass
# Expected coverage: > 70%
# Expected: No console errors

# 3. TypeScript Strict Mode Check
cd ../backend
npx tsc --noEmit --strict

cd ../frontend
npx tsc -b --noEmit --strict

# Expected: No errors

# 4. ESLint (No Warnings)
cd ../frontend
npm run lint

# Expected: No warnings, no errors

# 5. Production Build
npm run build

# Expected: Build succeeds
# Expected: No build warnings
# Expected: Bundle size < original + 5KB

# 6. Manual QA Checklist
# Execute all items in docs/qa-checklist.md
# Mark each with [x] when verified

# 7. Integration Test (End-to-End)
npm run dev

# Test complete user flow:
# 1. Create new project "TEST_PROJECT"
# 2. Add teacher to TEST_PROJECT
# 3. Navigate to Teachers → verify appears
# 4. Navigate to Dashboard → verify in KPIs
# 5. Navigate to Schools → verify filters
# 6. Edit TEST_PROJECT name → verify updates everywhere
# 7. Archive TEST_PROJECT → verify removed from ProjectToggle
# 8. Reload page → verify last active project selected

# 8. Commit and Push
git push origin HEAD

# 9. Verify GitHub Actions CI (FINAL)
# Expected: ALL jobs GREEN
# - lint ✅
# - typecheck ✅
# - test-frontend ✅
# - test-backend ✅
# - build ✅

# 10. Review Coverage Reports
# Go to: GitHub Actions → Latest run → Artifacts
# Download: frontend-coverage-html, backend-coverage-html
# Verify: No critical paths uncovered
```

**Production Readiness Gate:**

All of the following MUST be ✅ before merging to master:

- [ ] GitHub Actions CI: All jobs GREEN
- [ ] Backend coverage: > 80%
- [ ] Frontend coverage: > 70%
- [ ] TypeScript: No errors (strict mode)
- [ ] ESLint: No warnings
- [ ] Production build: Success
- [ ] Manual QA: All items checked
- [ ] Integration test: Complete user flow works
- [ ] Performance: Project switching < 100ms
- [ ] No console errors or warnings in browser

### CI Test Targets for Iteration 5 (Final)

| Test Type | Command | Expected Result |
|-----------|---------|-----------------|
| Backend Tests | `npm test --prefix backend -- run --coverage` | All pass, coverage > 80% |
| Frontend Tests | `npm test --prefix frontend -- run --coverage` | All pass, coverage > 70% |
| Type Check (Strict) | `npx tsc --noEmit --strict` (both) | No errors |
| Lint | `npm run lint --prefix frontend` | No warnings |
| Build | `npm run build --prefix frontend` | Success, bundle size OK |
| Manual QA | docs/qa-checklist.md | All items ✅ |
| Integration Test | Full user flow in browser | All features work |
| GitHub Actions | All CI jobs | GREEN ✅ |

### Files Modified in Iteration 5

```
backend/src/__tests__/integration.test.ts        - NEW
frontend/src/__tests__/navigation.test.tsx       - NEW
docs/qa-checklist.md                              - NEW
docs/build-report.md                              - NEW
```

### Project Completion Summary

**What We Built:**

1. **Backend Foundation** (Iteration 1)
   - Project CRUD endpoints (GET, POST, PUT, DELETE)
   - projectId filtering in Teachers API
   - projectId filtering in Stats API
   - Comprehensive unit tests

2. **Frontend Global State** (Iteration 2)
   - ProjectContext with React Context API
   - localStorage persistence
   - Auto-select first project
   - Project CRUD service methods

3. **Page Integration** (Iteration 3)
   - Teachers page: Context + backend filtering
   - Dashboard page: ProjectToggle + API filtering
   - Schools page: ProjectToggle + frontend filtering
   - Cross-page consistency

4. **Project CRUD UI** (Iteration 4)
   - ProjectSettings page with DataTable
   - Create/Edit/Archive dialogs
   - Real-time Context refresh
   - Active/Archived status badges

5. **Testing & Verification** (Iteration 5)
   - Backend integration tests
   - Frontend navigation tests
   - Manual QA checklist
   - Production build verification

**Architecture Decisions Implemented:**

- ✅ React Context API for global state (no external dependencies)
- ✅ Mixed filtering strategy (backend for Teachers/Dashboard, frontend for Schools)
- ✅ Soft delete pattern (isActive=false)
- ✅ localStorage persistence
- ✅ Backward compatible APIs (optional projectId param)

**Key Metrics:**

- Backend tests: 25+ passing
- Frontend tests: 15+ passing
- Integration tests: 2 passing
- Pages integrated: 3 (Teachers, Dashboard, Schools)
- New endpoints: 6 (3 Project CRUD + 2 filtered APIs + 1 settings page)
- Bundle size overhead: < 5KB

### For Next Agent (Production Deployment)

If you need to deploy this to production:

1. **Environment Setup:**
   - Ensure MONGO_URI points to production database
   - Verify all teachers have `project` field (run migration if needed)
   - Set NODE_ENV=production

2. **Deployment Steps:**
   - Run `npm run build --prefix frontend`
   - Deploy backend to production server
   - Serve frontend build from `/dist`
   - Verify `/api/projects` endpoint accessible

3. **Post-Deployment Verification:**
   - Test project switching on all pages
   - Verify localStorage persistence
   - Check performance with production data
   - Monitor for errors in production logs

4. **Rollback Plan:**
   - If issues occur, remove `projectId` query params from API calls
   - Frontend will fall back to showing all data
   - No data loss (soft deletes preserved)

---

## Summary

This plan provides **bite-sized, testable tasks** following strict TDD principles. Each task includes:

✅ Failing test first
✅ Verification steps
✅ Minimal implementation
✅ Green test confirmation
✅ Commit with clear message

**Agent Handoff Checkpoints** ensure seamless transition between agents (Claude ↔ Gemini) at natural boundaries.

**Estimated Time:** 8-9 days (8.5 original + 0.5 for detailed planning)

**Testing Coverage:** Backend 80%+, Frontend 70%+

**Production Ready:** Yes, with comprehensive QA and build verification
