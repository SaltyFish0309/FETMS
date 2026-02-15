import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProjectProvider, useProjectContext } from '../ProjectContext';
import { projectService } from '../../services/projectService';

// Mock the project service
vi.mock('../../services/projectService', () => ({
  projectService: {
    getAll: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Test component that uses the context
function TestComponent() {
  const { selectedProjectId, setSelectedProjectId, projects, loading } = useProjectContext();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="selectedProjectId">{selectedProjectId || 'None'}</div>
      <div data-testid="projectCount">{projects.length}</div>
      <button onClick={() => setSelectedProjectId('project2')}>Change Project</button>
    </div>
  );
}

describe('ProjectContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should load projects on mount', async () => {
    const mockProjects = [
      { _id: 'project1', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { _id: 'project2', name: 'Independent', code: 'IND', isActive: true, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
    ];
    vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);

    render(
      <ProjectProvider>
        <TestComponent />
      </ProjectProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    expect(screen.getByTestId('projectCount')).toHaveTextContent('2');
    expect(projectService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should auto-select first project if none selected in localStorage', async () => {
    const mockProjects = [
      { _id: 'project1', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ];
    vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);

    render(
      <ProjectProvider>
        <TestComponent />
      </ProjectProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('selectedProjectId')).toHaveTextContent('project1');
    });
  });

  it('should persist selection to localStorage when changed', async () => {
    const mockProjects = [
      { _id: 'project1', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { _id: 'project2', name: 'Independent', code: 'IND', isActive: true, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
    ];
    vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);

    render(
      <ProjectProvider>
        <TestComponent />
      </ProjectProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    const button = screen.getByText('Change Project');
    button.click();

    await waitFor(() => {
      expect(localStorageMock.getItem('selectedProjectId')).toBe('project2');
    });
  });

  it('should restore selection from localStorage on init', async () => {
    localStorageMock.setItem('selectedProjectId', 'project2');

    const mockProjects = [
      { _id: 'project1', name: 'TFETP', code: 'TFETP', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { _id: 'project2', name: 'Independent', code: 'IND', isActive: true, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
    ];
    vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);

    render(
      <ProjectProvider>
        <TestComponent />
      </ProjectProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('selectedProjectId')).toHaveTextContent('project2');
    });
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useProjectContext must be used within a ProjectProvider');

    consoleSpy.mockRestore();
  });
});
