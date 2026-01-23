# Global Project Switching Implementation Plan

> **For Execution:** Use `superpowers:executing-plans` to run this plan task-by-task.
>
> **For Handoff:** Each iteration ends with a CI checkpoint. Verify all tests pass before continuing.

**Goal:** Global project switching with CRUD across Teachers, Dashboard, and Schools pages

**Architecture:**
- Backend: Project CRUD + projectId filtering (Teachers/Stats APIs)
- Frontend: React Context API + localStorage persistence
- Mixed filtering: Backend (Teachers/Dashboard), Frontend (Schools)

**Testing:** All tests must pass locally at each checkpoint before proceeding.

**Error Handling:** If the same error occurs 5 times during development, STOP and report the issue with possible causes for human investigation.

---

## API Contracts

### Backend Endpoints (To Be Added)

```typescript
GET    /api/projects/:id       → Project
PUT    /api/projects/:id       → Project
DELETE /api/projects/:id       → void (soft delete: isActive=false)

// Modified endpoints
GET    /api/teachers?projectId=xxx        → Teacher[]
GET    /api/stats/dashboard?projectId=xxx → DashboardStats
```

### Frontend Context API

```typescript
interface ProjectContextValue {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string) => void;
  projects: Project[];
  loading: boolean;
  refreshProjects: () => Promise<void>;
}
```

---

## Iteration 1: Backend API Foundation

**Goal:** Complete Project CRUD + add projectId filtering to Teachers/Stats APIs

### Task 1.1: Project Update/Delete Service Methods

**TDD Steps:**

1. **Write failing tests** in `backend/src/services/__tests__/projectService.test.ts`:
   - `updateProject` should update name/description (code immutable)
   - `deleteProject` should soft delete (isActive=false)
   - Return null for non-existent IDs

2. **Run tests** → Expected: FAIL (methods don't exist)

3. **Implement** in `backend/src/services/projectService.ts`:
   ```typescript
   static async updateProject(id: string, data: Partial<IProject>) {
     const { code, ...updateData } = data;  // code immutable
     return await Project.findByIdAndUpdate(id, updateData, { new: true });
   }

   static async deleteProject(id: string): Promise<boolean> {
     const result = await Project.findByIdAndUpdate(id, { isActive: false });
     return result !== null;
   }
   ```

4. **Run tests** → Expected: PASS ✅

5. **Commit:**
   ```bash
   git add backend/src/services/projectService.ts backend/src/services/__tests__/
   git commit -m "[TEST] Add ProjectService update/delete with tests"
   ```

---

### Task 1.2: Project Controller Endpoints

**TDD Steps:**

1. **Write integration tests** in `backend/src/controllers/__tests__/projectController.test.ts`:
   - GET /api/projects/:id → 200 (found) / 404 (not found)
   - PUT /api/projects/:id → 200 (updated)
   - DELETE /api/projects/:id → 200 (soft deleted)

2. **Run tests** → Expected: 404 errors (routes don't exist)

3. **Implement controller** in `backend/src/controllers/projectController.ts`:
   ```typescript
   static async getProjectById(req, res) {
     const project = await ProjectService.getProjectById(req.params.id);
     if (!project) return res.status(404).json({ message: 'Not found' });
     res.json(project);
   }
   // Similar for updateProject, deleteProject
   ```

4. **Add routes** in `backend/src/routes/projects.ts`:
   ```typescript
   router.get('/:id', ProjectController.getProjectById);
   router.put('/:id', ProjectController.updateProject);
   router.delete('/:id', ProjectController.deleteProject);
   ```

5. **Run tests** → Expected: PASS ✅

6. **Commit:** `[API] Add Project CRUD endpoints`

---

### Task 1.3: Teacher API projectId Filtering

**TDD Steps:**

1. **Write service test** in `backend/src/services/__tests__/teacherService.test.ts`:
   - `getAllTeachers(projectId)` filters by project
   - `getAllTeachers()` returns all (backward compatible)

2. **Modify service** in `backend/src/services/teacherService.ts`:
   ```typescript
   static async getAllTeachers(projectId?: string) {
     const query: any = { isDeleted: false };
     if (projectId) query.project = projectId;
     return await Teacher.find(query).populate('school').populate('project');
   }
   ```

3. **Update controller** to parse query param:
   ```typescript
   const projectId = req.query.projectId as string | undefined;
   const teachers = await TeacherService.getAllTeachers(projectId);
   ```

4. **Run tests** → Expected: PASS ✅

5. **Commit:** `[API] Add projectId filtering to Teacher API`

---

### Task 1.4: Stats API projectId Filtering

**TDD Steps:**

1. **Write test** in `backend/src/services/__tests__/statsService.test.ts`:
   - `getDashboardStats({ projectId })` filters by project
   - Verify totalCandidates, genderDistribution filtered correctly

2. **Modify service** to add projectId to StatsFilter interface and buildMatchQuery:
   ```typescript
   interface StatsFilter {
     projectId?: string;
     // ... existing filters
   }

   private static buildMatchQuery(filters: StatsFilter) {
     const query: any = { isDeleted: false };
     if (filters.projectId) {
       query.project = new mongoose.Types.ObjectId(filters.projectId);
     }
     // ... rest
   }
   ```

3. **Update controller** to parse projectId from query

4. **Run tests** → Expected: PASS ✅

5. **Commit:** `[API] Add projectId filtering to Stats API`

---

### 🔄 CHECKPOINT 1: Backend Local Verification

**Stop here and verify:**

```bash
# 1. All backend tests pass
cd backend
npm test -- run

# Expected: All tests PASS ✅

# 2. TypeScript check
npx tsc --noEmit

# Expected: No errors

# 3. Commit changes
git add .
git commit -m "[CHECKPOINT 1] Backend CRUD + Filtering complete"
```

**All tests must PASS** before proceeding to Iteration 2.

**If same error occurs 5 times:** STOP and report issue to user for investigation.

**Files Modified:**
- `backend/src/services/projectService.ts`
- `backend/src/controllers/projectController.ts`
- `backend/src/routes/projects.ts`
- `backend/src/services/teacherService.ts`
- `backend/src/services/statsService.ts`
- All corresponding test files

---

## Iteration 2: Frontend Global State

**Goal:** Create ProjectContext with localStorage persistence

### Task 2.1: ProjectContext with Tests

**TDD Steps:**

1. **Write tests** in `frontend/src/contexts/__tests__/ProjectContext.test.tsx`:
   - Loads projects on mount
   - Auto-selects first project if none selected
   - Persists to localStorage on change
   - Restores from localStorage on init
   - Throws error when used outside provider

2. **Run tests** → Expected: FAIL

3. **Implement** in `frontend/src/contexts/ProjectContext.tsx`:
   ```typescript
   export function ProjectProvider({ children }) {
     const [selectedProjectId, setSelectedProjectIdState] = useState(() =>
       localStorage.getItem('selectedProjectId') || null
     );
     const [projects, setProjects] = useState<Project[]>([]);
     const [loading, setLoading] = useState(true);

     // Load projects on mount, auto-select first
     useEffect(() => { /* fetch and auto-select */ }, []);

     // Persist to localStorage
     useEffect(() => {
       if (selectedProjectId) localStorage.setItem('selectedProjectId', selectedProjectId);
     }, [selectedProjectId]);

     // ... context provider
   }
   ```

4. **Run tests** → Expected: PASS ✅

5. **Commit:** `[FEAT] Add ProjectContext with localStorage persistence`

---

### Task 2.2: Wrap App with ProjectProvider

1. **Update** `frontend/src/App.tsx`:
   ```typescript
   import { ProjectProvider } from '@/contexts/ProjectContext';

   function App() {
     return (
       <Router>
         <ProjectProvider>
           <Routes>{/* existing routes */}</Routes>
         </ProjectProvider>
       </Router>
     );
   }
   ```

2. **Verify app compiles:** `npm run dev`

3. **Commit:** `[CONFIG] Wrap App with ProjectProvider`

---

### Task 2.3: Extend projectService with CRUD

**TDD Steps:**

1. **Write tests** in `frontend/src/services/__tests__/projectService.test.ts`:
   - `getById(id)` fetches project
   - `update(id, data)` updates project
   - `delete(id)` soft deletes project

2. **Implement** in `frontend/src/services/projectService.ts`:
   ```typescript
   export const projectService = {
     async getAll(): Promise<Project[]> { /* existing */ },
     async getById(id: string): Promise<Project> {
       const response = await api.get<Project>(`/projects/${id}`);
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

3. **Run tests** → Expected: PASS ✅

4. **Commit:** `[API] Add Project CRUD methods to frontend service`

---

### Task 2.4: Refactor ProjectToggle to Use Context

1. **Update** `frontend/src/components/teachers/list/ProjectToggle.tsx`:
   ```typescript
   import { useProjectContext } from '@/contexts/ProjectContext';

   export function ProjectToggle({ value, onChange }) {
     const { projects, loading } = useProjectContext();
     // Remove local projects state, use Context
     // ... rest of component
   }
   ```

2. **Test in browser:** Navigate to Teachers page, verify toggle works

3. **Commit:** `[REFACTOR] Update ProjectToggle to use Context`

---

### 🔄 CHECKPOINT 2: Frontend State Local Verification

```bash
cd frontend
npm test -- run
npx tsc -b --noEmit
npm run lint
git add .
git commit -m "[CHECKPOINT 2] Frontend global state complete"
```

**Expected:** All tests PASS ✅, TypeScript OK, Lint OK

**If same error occurs 5 times:** STOP and report to user.

---

## Iteration 3: Page Integration

**Goal:** Enable project switching in Teachers, Dashboard, Schools

### Task 3.1: Teachers Page - Context + Backend Filtering

1. **Update teacherService** to accept projectId:
   ```typescript
   async getAll(projectId?: string): Promise<Teacher[]> {
     const params = projectId ? { projectId } : {};
     return (await api.get<Teacher[]>('/teachers', { params })).data;
   }
   ```

2. **Refactor** `frontend/src/pages/Teachers.tsx`:
   ```typescript
   import { useProjectContext } from '@/contexts/ProjectContext';

   export default function Teachers() {
     const { selectedProjectId, setSelectedProjectId } = useProjectContext();

     const loadTeachers = useCallback(async () => {
       if (!selectedProjectId) return;
       const data = await teacherService.getAll(selectedProjectId);  // Backend filtering
       setTeachers(data);
     }, [selectedProjectId]);

     // Remove local project state, remove frontend filtering
   }
   ```

3. **Test in browser:** Switch projects → list updates

4. **Commit:** `[FEAT] Migrate Teachers page to Context + backend filtering`

---

### Task 3.2: Dashboard Page - Add ProjectToggle + API Filtering

1. **Update statsService:**
   ```typescript
   interface StatsFilter {
     projectId?: string;
     // ... existing
   }
   ```

2. **Add ProjectToggle** to Dashboard:
   ```typescript
   const { selectedProjectId, setSelectedProjectId } = useProjectContext();

   const loadStats = useCallback(async () => {
     const stats = await statsService.getDashboardStats({
       projectId: selectedProjectId,
       ...filters
     });
   }, [selectedProjectId, filters]);
   ```

3. **Commit:** `[FEAT] Add project filtering to Dashboard`

---

### Task 3.3: Schools Page - Frontend Filtering

1. **Add ProjectToggle** and filter by teachers:
   ```typescript
   const { selectedProjectId } = useProjectContext();
   const [teachers, setTeachers] = useState<Teacher[]>([]);

   const loadData = async () => {
     const schoolsData = await schoolService.getAll();
     const teachersData = await teacherService.getAll(selectedProjectId);
     setSchools(schoolsData);
     setTeachers(teachersData);
   };

   const filteredSchools = useMemo(() => {
     const schoolIdsInProject = new Set(teachers.map(t => t.school?._id || t.school));
     return schools.filter(s => schoolIdsInProject.has(s._id));
   }, [schools, teachers, selectedProjectId]);
   ```

2. **Commit:** `[FEAT] Add project filtering to Schools page`

---

### 🔄 CHECKPOINT 3: Integration Local Verification

```bash
# Full frontend + backend tests
cd backend && npm test -- run
cd ../frontend && npm test -- run
npm run build
git add .
git commit -m "[CHECKPOINT 3] Page integration complete"
```

**Expected:** All tests PASS ✅, Build succeeds

**Manual test:** Navigate Teachers → Dashboard → Schools, verify project selection persists.

**If same error occurs 5 times:** STOP and report to user.

---

## Iteration 4: Project CRUD UI

**Goal:** ProjectSettings page with Create/Edit/Archive

### Task 4.1: Create ProjectSettings Page

1. **Write component test** in `frontend/src/pages/__tests__/ProjectSettings.test.tsx`:
   - Displays project list
   - Opens create dialog
   - Creates new project
   - Opens edit dialog
   - Archives project

2. **Implement** `frontend/src/pages/ProjectSettings.tsx`:
   - DataTable with columns: name, code, description, status, actions
   - Create/Edit/Delete dialogs
   - Call `refreshProjects()` after mutations

3. **Create dialog components:**
   - `CreateProjectDialog.tsx` - form with name/code/description
   - `EditProjectDialog.tsx` - pre-filled form (code readonly)
   - `ConfirmDeleteDialog.tsx` - confirmation modal

4. **Add route** in `App.tsx`:
   ```typescript
   <Route path="settings/projects" element={<ProjectSettings />} />
   ```

5. **Test in browser:** Create/Edit/Archive projects

6. **Commit:** `[FEAT] Add ProjectSettings page with CRUD UI`

---

### 🔄 CHECKPOINT 4: CRUD UI Local Verification

```bash
cd frontend
npm test -- run
npm run build
git add .
git commit -m "[CHECKPOINT 4] Project CRUD UI complete"
```

**Expected:** All tests PASS ✅, Build succeeds

**Manual test:** Create project → edit → archive → verify ProjectToggle updates immediately.

**If same error occurs 5 times:** STOP and report to user.

---

## Iteration 5: Final Testing & Production Readiness

**Goal:** Comprehensive testing and production verification

### Task 5.1: Backend Integration Test

1. **Write E2E test** in `backend/src/__tests__/integration.test.ts`:
   - Create 2 projects → create teachers in each → filter by project
   - Update project → archive project → verify getAllProjects excludes archived

2. **Run:** `npm test -- run --coverage`

3. **Commit:** `[TEST] Add end-to-end integration test`

---

### Task 5.2: Frontend Navigation Test

1. **Write test** in `frontend/src/__tests__/navigation.test.tsx`:
   - Select project on Dashboard → navigate to Teachers → verify selection persists

2. **Run:** `npm test`

3. **Commit:** `[TEST] Add navigation test for project persistence`

---

### Task 5.3: Manual QA

1. **Execute QA checklist** (create `docs/qa-checklist.md`):
   - [ ] All API endpoints work (Postman/curl)
   - [ ] Teachers/Dashboard/Schools filter correctly
   - [ ] ProjectSettings CRUD works
   - [ ] localStorage persistence works
   - [ ] Page refresh restores selection
   - [ ] No console errors
   - [ ] Switching projects < 100ms

2. **Document results** in checklist

3. **Commit:** `[TEST] Complete manual QA checklist`

---

### Task 5.4: Production Build

```bash
cd frontend
npm run build
npx vite-bundle-visualizer

# Verify bundle size < original + 5KB
# Verify no build warnings
```

**Commit:** `[BUILD] Verify production build readiness`

---

### 🔄 CHECKPOINT 5 (FINAL): Production Readiness Gate

**ALL of the following MUST be ✅:**

```bash
# 1. Full test suites
cd backend && npm test -- run
cd ../frontend && npm test -- run

# 2. Type checking (strict mode)
cd backend && npx tsc --noEmit --strict
cd ../frontend && npx tsc -b --noEmit --strict

# 3. Lint
cd frontend && npm run lint

# 4. Build
npm run build

# 5. Commit
git add .
git commit -m "[CHECKPOINT 5] Production ready - All tests passing"
```

**Production Ready Criteria:**

- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] TypeScript strict mode: No errors
- [ ] ESLint: No warnings
- [ ] Production build: Success
- [ ] Manual QA: docs/qa-checklist.md all items ✅
- [ ] Performance: Project switching < 100ms
- [ ] No console errors in browser
- [ ] localStorage persistence works
- [ ] Cross-page project selection synced

**When ALL criteria met:** Ready for merge! 🚀

**If same error occurs 5 times:** STOP and report to user.

---

## Summary

**5 Iterations, 5 Local Test Checkpoints:**

| Iteration | Goal | Duration | Test Gate |
|-----------|------|----------|-----------|
| 1 | Backend CRUD + Filtering | 2 days | Backend tests pass ✅ |
| 2 | Frontend Context | 1 day | Frontend tests pass ✅ |
| 3 | Page Integration | 3 days | All tests pass ✅ |
| 4 | Project CRUD UI | 2 days | CRUD flows work ✅ |
| 5 | Final Testing | 1 day | **All tests pass** ✅ |

**Total:** 9 days, 25+ tests, production-ready code

**TDD Protocol:** Every task follows RED → GREEN → REFACTOR → COMMIT

**Agent Handoff:** Can switch between Claude/Gemini at any checkpoint

**Error Handling:** If same error occurs 5 times, STOP and report to user

**Testing:** All tests run locally, no GitHub Actions required
