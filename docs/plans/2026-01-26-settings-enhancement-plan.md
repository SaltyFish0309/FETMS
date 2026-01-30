# FETMS Enhancement Plan v2

## Quick Reference
```
Priority: Bug Fix → Project Settings → Settings Migration → UX → Advanced
TDD: RED → verify fail → GREEN → verify pass → REFACTOR
CI: npm run test --prefix backend && npm run test --prefix frontend
```

---

## Phase 1: Dashboard Bug Fix (Critical)

### 1.1 Problem
KPI grid 不響應專案切換。`statsService.ts` 使用未過濾的 `allTeachers`。

### 1.2 Files
```
backend/src/services/statsService.ts
backend/src/services/__tests__/statsService.test.ts
```

### 1.3 TDD Steps

**RED - Write failing test:**
```typescript
// statsService.test.ts
describe('getDashboardStats with projectId filter', () => {
  it('returns KPI counts for selected project only', async () => {
    // Setup: 2 projects, teachers in each
    const result = await StatsService.getDashboardStats({ projectId: projectA._id });
    expect(result.kpi.totalTeachers).toBe(projectATeacherCount);
    expect(result.kpi.activeSchools).toBe(projectASchoolCount);
  });
});
```

**GREEN - Minimal fix:**
```typescript
// statsService.ts - Replace allTeachers with filteredTeachers for KPI
kpi: {
  totalTeachers: filteredTeachers.length,
  activeSchools: new Set(filteredTeachers.map(t => t.school?.toString())).size,
  inRecruitmentCount: filteredTeachers.filter(t => recruitmentStageIds.includes(t.pipelineStage)).length,
  actionsNeeded: calculateExpiryAlerts(filteredTeachers).length
}
```

### 1.4 Checkpoint 1
```bash
# Verify & CI
npm run test --prefix backend
# Manual: Switch projects, verify 4 KPIs update
```

**Handoff context:** Bug fix complete. KPIs now filter by projectId. All backend tests pass.

---

## Phase 2: Project Settings Enhancement

### 2.1 Features
- **Restore**: Un-archive projects
- **Hard Delete**: Permanent deletion (archived only, no associated teachers)

### 2.2 Files
```
Backend:
  backend/src/services/projectService.ts
  backend/src/controllers/projectController.ts
  backend/src/routes/projects.ts
  backend/src/services/__tests__/projectService.test.ts

Frontend:
  frontend/src/pages/ProjectSettings.tsx
  frontend/src/services/projectService.ts
  frontend/src/components/projects/RestoreProjectDialog.tsx (new)
  frontend/src/components/projects/HardDeleteDialog.tsx (new)
```

### 2.3 TDD - Backend

**RED - Restore:**
```typescript
it('restoreProject sets isActive to true', async () => {
  const archived = await createProject({ isActive: false });
  const restored = await projectService.restoreProject(archived._id);
  expect(restored.isActive).toBe(true);
});
```

**RED - Hard Delete:**
```typescript
it('hardDeleteProject removes project from database', async () => {
  const project = await createProject({ isActive: false });
  await projectService.hardDeleteProject(project._id);
  const found = await Project.findById(project._id);
  expect(found).toBeNull();
});

it('hardDeleteProject throws if project has teachers', async () => {
  const project = await createProject({ isActive: false });
  await createTeacher({ project: project._id });
  await expect(projectService.hardDeleteProject(project._id))
    .rejects.toThrow('Cannot delete project with associated teachers');
});
```

### 2.4 React Best Practices (Frontend)
```typescript
// ProjectSettings.tsx - Apply rerender-memo pattern
const ProjectRow = memo(({ project, onRestore, onDelete }) => (
  <TableRow>
    {/* ... */}
    {!project.isActive && (
      <>
        <Button onClick={() => onRestore(project._id)}>Restore</Button>
        <Button variant="destructive" onClick={() => onDelete(project)}>
          Delete Permanently
        </Button>
      </>
    )}
  </TableRow>
));

// Apply async-parallel for loading
const loadData = useCallback(async () => {
  const [projects, stats] = await Promise.all([
    projectService.getAll(true),
    projectService.getStats()
  ]);
  setProjects(projects);
  setStats(stats);
}, []);
```

### 2.5 Checkpoint 2
```bash
npm run test --prefix backend && npm run test --prefix frontend
npm run build --prefix frontend  # Type check
```

**Handoff context:** Project restore/delete complete. New endpoints: `PUT /projects/:id/restore`, `DELETE /projects/:id/permanent`.

---

## Phase 3: Settings Migration

### 3.1 Features
- Alert Rules → `/settings/alerts`
- Pipeline Stages → `/settings/stages`

### 3.2 Files
```
frontend/src/pages/Settings.tsx (modify)
frontend/src/pages/AlertSettings.tsx (new)
frontend/src/pages/StageSettings.tsx (new)
frontend/src/services/stageService.ts (new)
frontend/src/App.tsx (add routes)
```

### 3.3 TDD - AlertSettings
```typescript
// AlertSettings.test.tsx
it('renders alert rules list', async () => {
  render(<AlertSettings />);
  await waitFor(() => {
    expect(screen.getByText('Alert Rules')).toBeInTheDocument();
  });
});

it('adds new alert rule', async () => {
  render(<AlertSettings />);
  await userEvent.click(screen.getByText('Add Rule'));
  // Fill form...
  await userEvent.click(screen.getByText('Save'));
  expect(mockAlertService.create).toHaveBeenCalled();
});
```

### 3.4 TDD - StageSettings
```typescript
// StageSettings.test.tsx
it('renders pipeline stages in order', async () => {
  render(<StageSettings />);
  const stages = await screen.findAllByRole('listitem');
  expect(stages[0]).toHaveTextContent('Sourcing');
});

it('reorders stages via drag and drop', async () => {
  // Test dnd-kit reorder
});
```

### 3.5 React Best Practices
```typescript
// bundle-dynamic-imports for heavy drag-drop
const StageList = dynamic(() => import('./StageList'), {
  loading: () => <Skeleton className="h-64" />
});

// rerender-transitions for drag updates
const handleDragEnd = (event) => {
  startTransition(() => {
    setStages(reorder(stages, oldIndex, newIndex));
  });
};
```

### 3.6 Checkpoint 3
```bash
npm run test --prefix frontend
npm run lint --prefix frontend
# Manual: Navigate /settings, verify all cards, test each section
```

**Handoff context:** Settings hub complete with Alert Rules, Pipeline Stages. Routes added to App.tsx.

---

## Phase 4: User Experience

### 4.1 Features
- User Preferences (Theme, Default Project)
- Data Import Center

### 4.2 Files
```
frontend/src/pages/PreferencesSettings.tsx (new)
frontend/src/pages/ImportSettings.tsx (new)
frontend/src/contexts/ThemeContext.tsx (new)
frontend/src/components/ui/theme-toggle.tsx (new)
```

### 4.3 Theme Implementation
```typescript
// ThemeContext.tsx - Apply rerender-derived-state
const ThemeContext = createContext<ThemeContextValue>(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() =>
    localStorage.getItem('theme') ?? 'system'
  );

  // Derived value for actual applied theme
  const resolvedTheme = useMemo(() =>
    theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme
  , [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme, resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 4.4 Checkpoint 4
```bash
npm run test --prefix frontend
npm run build --prefix frontend
# Manual: Test theme switching, verify persistence
```

**Handoff context:** Theme system with localStorage persistence. Import center consolidates teacher/school imports.

---

## Phase 5: Report Export (New from Brainstorm)

### 5.1 Features
- Export teachers list to CSV/Excel
- Export dashboard stats to PDF

### 5.2 Files
```
frontend/src/services/exportService.ts (new)
frontend/src/components/teachers/ExportButton.tsx (new)
frontend/src/components/dashboard/ExportDashboard.tsx (new)
```

### 5.3 Implementation
```typescript
// exportService.ts - Client-side export (no backend needed)
export const exportService = {
  toCSV(data: Teacher[], columns: string[]): string {
    const header = columns.join(',');
    const rows = data.map(t => columns.map(col => getCellValue(t, col)).join(','));
    return [header, ...rows].join('\n');
  },

  downloadCSV(data: Teacher[], filename: string) {
    const csv = this.toCSV(data, getVisibleColumns());
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    // trigger download...
  }
};
```

### 5.4 Checkpoint 5 (Final)
```bash
# Full CI
npm run test --prefix backend && npm run test --prefix frontend
npm run build --prefix frontend
npm run lint --prefix frontend

# E2E Manual Test Checklist
# [ ] Dashboard KPIs respond to project switch
# [ ] Project restore/delete works
# [ ] Settings sections accessible
# [ ] Theme persists across refresh
# [ ] Export downloads correct file
```

---

## Functional Test Suite

Beyond TDD unit tests, add integration tests for core flows:

### Backend Integration Tests
```typescript
// backend/src/__tests__/integration/projectFlow.test.ts
describe('Project Lifecycle', () => {
  it('complete flow: create → archive → restore → hard delete', async () => {
    // 1. Create project
    const res1 = await request(app).post('/api/projects').send({ name: 'Test', code: 'TST' });
    expect(res1.status).toBe(201);

    // 2. Archive
    const res2 = await request(app).delete(`/api/projects/${res1.body._id}`);
    expect(res2.body.isActive).toBe(false);

    // 3. Restore
    const res3 = await request(app).put(`/api/projects/${res1.body._id}/restore`);
    expect(res3.body.isActive).toBe(true);

    // 4. Archive again then hard delete
    await request(app).delete(`/api/projects/${res1.body._id}`);
    const res4 = await request(app).delete(`/api/projects/${res1.body._id}/permanent`);
    expect(res4.status).toBe(200);
  });
});
```

### Frontend Integration Tests
```typescript
// frontend/src/__tests__/integration/settingsFlow.test.tsx
describe('Settings Navigation', () => {
  it('navigates through all settings sections', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Settings'));

    // Verify all cards visible
    expect(screen.getByText('Project Management')).toBeInTheDocument();
    expect(screen.getByText('Alert Rules')).toBeInTheDocument();
    expect(screen.getByText('Pipeline Stages')).toBeInTheDocument();

    // Navigate to each
    await userEvent.click(screen.getByText('Alert Rules'));
    expect(screen.getByText('Add Rule')).toBeInTheDocument();
  });
});
```

---

## CI Commands Reference

```bash
# Per-phase CI (run at each checkpoint)
npm run test --prefix backend
npm run test --prefix frontend
npm run build --prefix frontend
npm run lint --prefix frontend

# Full CI (before PR)
npm run test --prefix backend && \
npm run test --prefix frontend && \
npm run build --prefix frontend && \
npm run lint --prefix frontend
```

---

## Agent Handoff Protocol

Each checkpoint includes:
1. **CI verification** - All tests pass
2. **Context summary** - What was done, key decisions
3. **Next phase** - What to implement next
4. **Critical files** - Files modified/created

### Handoff Template
```
## Checkpoint N Complete

### Done
- [List of completed features]

### Files Changed
- [List of files]

### Tests Added
- [List of test files]

### Next Phase
- [Brief description of Phase N+1]

### CI Status
- Backend tests: PASS
- Frontend tests: PASS
- Build: PASS
- Lint: PASS
```

---

## Settings Page Final Structure

```
/settings
├── Project Management (/settings/projects)  # Phase 2
├── Alert Rules (/settings/alerts)           # Phase 3
├── Pipeline Stages (/settings/stages)       # Phase 3
├── User Preferences (/settings/preferences) # Phase 4
└── Data Import (/settings/import)           # Phase 4
```

---

## React Best Practices Checklist

Apply during implementation:

- [ ] `async-parallel` - Use Promise.all for independent fetches
- [ ] `bundle-dynamic-imports` - Lazy load heavy components (StageSettings drag-drop)
- [ ] `rerender-memo` - Memoize list items (ProjectRow, StageRow)
- [ ] `rerender-transitions` - Use startTransition for drag updates
- [ ] `rerender-lazy-state-init` - Function init for expensive state
- [ ] `client-swr-dedup` - Consider SWR for settings data if needed

---

## Future Considerations (Out of Scope)

From brainstorming, deferred for later:
- Multi-user/auth system
- Email notifications
- Data backup/restore
- Contract renewal tracking
- School collaboration status
