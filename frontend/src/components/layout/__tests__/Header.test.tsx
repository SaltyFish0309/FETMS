import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Header } from '../Header';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { projectService } from '@/services/projectService';

// Mock the project service
vi.mock('@/services/projectService', () => ({
  projectService: {
    getAll: vi.fn(),
  },
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockProjects = [
      { _id: 'project1', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ];
    vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);
  });

  it('renders with default title "Dashboard"', async () => {
    render(
      <ProjectProvider>
        <Header />
      </ProjectProvider>
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Dashboard');
    });
  });

  it('renders with custom title', async () => {
    render(
      <ProjectProvider>
        <Header title="Teachers" />
      </ProjectProvider>
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Teachers');
    });
  });

  it('renders search input', async () => {
    render(
      <ProjectProvider>
        <Header />
      </ProjectProvider>
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('renders notification bell', async () => {
    render(
      <ProjectProvider>
        <Header />
      </ProjectProvider>
    );
    await waitFor(() => {
      // Bell icon should be present
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
