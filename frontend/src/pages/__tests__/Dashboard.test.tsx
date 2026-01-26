import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { ProjectProvider } from '@/contexts/ProjectContext';

// Mock the statsService
vi.mock('@/services/statsService', () => ({
  statsService: {
    getDashboardStats: vi.fn().mockResolvedValue({
      kpi: {
        totalTeachers: 100,
        activeSchools: 20,
        inRecruitment: 15,
        actionsNeeded: 5,
      },
      expiry: {
        passport: [],
        workPermit: [],
        arc: [],
        contract: [],
      },
      charts: {
        pipeline: [],
        nationality: [],
        gender: [],
        hiringStatus: [],
        education: [],
        salary: [],
        seniority: [],
      },
      candidates: [],
    }),
  },
}));

// Mock projectService
vi.mock('@/services/projectService', () => ({
  projectService: {
    getAll: vi.fn().mockResolvedValue([
      { _id: '1', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '', updatedAt: '' },
    ]),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <ProjectProvider>
        <Dashboard />
      </ProjectProvider>
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CandidateList scroll constraint', () => {
    it('has xl:relative class on CandidateList grid cell for absolute positioning context', async () => {
      const { container } = renderDashboard();

      await waitFor(() => {
        // Find the CandidateList wrapper - it's the xl:col-span-1 div that should have xl:relative
        const candidateListWrapper = container.querySelector('.xl\\:col-span-1.xl\\:relative');
        expect(candidateListWrapper).toBeInTheDocument();
      });
    });

    it('has absolute positioning wrapper inside CandidateList grid cell', async () => {
      const { container } = renderDashboard();

      await waitFor(() => {
        // Find the absolute positioning wrapper
        const absoluteWrapper = container.querySelector('.xl\\:col-span-1 .xl\\:absolute.xl\\:inset-0');
        expect(absoluteWrapper).toBeInTheDocument();
      });
    });
  });
});
