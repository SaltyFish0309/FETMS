import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ProjectProvider, useProjectContext } from '@/contexts/ProjectContext';
import { act } from 'react';

// Mock services
vi.mock('@/services/projectService', () => ({
  projectService: {
    getAll: vi.fn().mockResolvedValue([
      { _id: '1', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '', updatedAt: '' },
      { _id: '2', name: 'Summer', code: 'SUMMER', isActive: true, createdAt: '', updatedAt: '' },
    ]),
  },
}));

vi.mock('@/services/teacherService', () => ({
  teacherService: {
    getAll: vi.fn().mockResolvedValue([]),
    getStages: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/services/statsService', () => ({
  statsService: {
    getDashboardStats: vi.fn().mockResolvedValue({
      kpi: { totalTeachers: 0, activeSchools: 0, inRecruitment: 0, actionsNeeded: 0 },
      expiry: { passport: [], workPermit: [], arc: [], contract: [] },
      charts: { pipeline: [], nationality: [], gender: [], hiringStatus: [], education: [], salary: [], seniority: [] },
      candidates: [],
    }),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Test component that displays project selection and can navigate
function TestDashboard() {
  const { selectedProjectId } = useProjectContext();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Dashboard</h1>
      <div data-testid="selected-project-dashboard">{selectedProjectId || 'none'}</div>
      <button onClick={() => navigate('/teachers')}>Go to Teachers</button>
    </div>
  );
}

function TestTeachers() {
  const { selectedProjectId } = useProjectContext();
  return (
    <div>
      <h1>Teachers</h1>
      <div data-testid="selected-project-teachers">{selectedProjectId || 'none'}</div>
    </div>
  );
}

describe('Navigation - Project Selection Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should persist project selection when navigating between pages', async () => {
    const { getByText, getByTestId } = render(
      <MemoryRouter initialEntries={['/']}>
        <ProjectProvider>
          <Routes>
            <Route path="/" element={<TestDashboard />} />
            <Route path="/teachers" element={<TestTeachers />} />
          </Routes>
        </ProjectProvider>
      </MemoryRouter>
    );

    // Wait for ProjectContext to load and auto-select first project
    await waitFor(() => {
      const dashboardSelection = getByTestId('selected-project-dashboard');
      expect(dashboardSelection.textContent).toBe('1');
    });

    // Navigate to Teachers page
    act(() => {
      getByText('Go to Teachers').click();
    });

    // Verify project selection persists on Teachers page
    await waitFor(() => {
      expect(screen.getByText('Teachers')).toBeInTheDocument();
      const teachersSelection = getByTestId('selected-project-teachers');
      expect(teachersSelection.textContent).toBe('1');
    });
  });

  it('should restore project selection from localStorage on mount', async () => {
    // Pre-set localStorage
    localStorage.setItem('selectedProjectId', '2');

    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/']}>
        <ProjectProvider>
          <Routes>
            <Route path="/" element={<TestDashboard />} />
          </Routes>
        </ProjectProvider>
      </MemoryRouter>
    );

    // Verify context reads from localStorage
    await waitFor(() => {
      const selection = getByTestId('selected-project-dashboard');
      expect(selection.textContent).toBe('2');
    });
  });

  it('should persist project selection across component remounts', async () => {
    const { rerender, getByTestId } = render(
      <MemoryRouter initialEntries={['/']}>
        <ProjectProvider>
          <Routes>
            <Route path="/" element={<TestDashboard />} />
          </Routes>
        </ProjectProvider>
      </MemoryRouter>
    );

    // Wait for auto-selection
    await waitFor(() => {
      const selection = getByTestId('selected-project-dashboard');
      expect(selection.textContent).toBe('1');
    });

    // Verify localStorage was updated
    expect(localStorage.getItem('selectedProjectId')).toBe('1');

    // Simulate remount by rerendering
    rerender(
      <MemoryRouter initialEntries={['/']}>
        <ProjectProvider>
          <Routes>
            <Route path="/" element={<TestDashboard />} />
          </Routes>
        </ProjectProvider>
      </MemoryRouter>
    );

    // Verify selection is still '1'
    await waitFor(() => {
      const selection = getByTestId('selected-project-dashboard');
      expect(selection.textContent).toBe('1');
    });
  });
});
