import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectSettings from '../ProjectSettings';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { projectService } from '@/services/projectService';

// Mock projectService
vi.mock('@/services/projectService', () => ({
  projectService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockProjects = [
  {
    _id: '1',
    name: 'TFETP 2024',
    code: 'TFETP',
    description: 'Main teaching program',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: '2',
    name: 'Summer Camp 2024',
    code: 'SUMMER',
    description: 'Summer intensive program',
    isActive: true,
    createdAt: '2024-06-01T00:00:00.000Z',
    updatedAt: '2024-06-01T00:00:00.000Z',
  },
];

const renderProjectSettings = () => {
  return render(
    <BrowserRouter>
      <ProjectProvider>
        <ProjectSettings />
      </ProjectProvider>
    </BrowserRouter>
  );
};

describe('ProjectSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);
  });

  it('displays project list in DataTable', async () => {
    renderProjectSettings();

    await waitFor(() => {
      expect(screen.getByText('TFETP 2024')).toBeInTheDocument();
      expect(screen.getByText('Summer Camp 2024')).toBeInTheDocument();
      expect(screen.getByText('TFETP')).toBeInTheDocument();
      expect(screen.getByText('SUMMER')).toBeInTheDocument();
    });
  });

  it('opens create dialog when Create Project button is clicked', async () => {
    renderProjectSettings();

    await waitFor(() => {
      expect(screen.getByText('TFETP 2024')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create project/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create project/i })).toBeInTheDocument();
    });
  });

  it('creates new project when form is submitted', async () => {
    const newProject = {
      _id: '3',
      name: 'Winter 2025',
      code: 'WINTER',
      description: 'Winter program',
      isActive: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    vi.mocked(projectService.create).mockResolvedValue(newProject);
    vi.mocked(projectService.getAll).mockResolvedValueOnce(mockProjects).mockResolvedValueOnce([...mockProjects, newProject]);

    renderProjectSettings();

    await waitFor(() => {
      expect(screen.getByText('TFETP 2024')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create project/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/project name/i), { target: { value: 'Winter 2025' } });
    fireEvent.change(screen.getByLabelText(/project code/i), { target: { value: 'WINTER' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Winter program' } });

    const submitButton = screen.getByRole('button', { name: /create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(projectService.create).toHaveBeenCalledWith({
        name: 'Winter 2025',
        code: 'WINTER',
        description: 'Winter program',
      });
    });
  });

  it('opens edit dialog when Edit button is clicked', async () => {
    renderProjectSettings();

    await waitFor(() => {
      expect(screen.getByText('TFETP 2024')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/edit project/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('TFETP 2024')).toBeInTheDocument();
    });
  });

  it('archives project when Archive button is clicked and confirmed', async () => {
    vi.mocked(projectService.delete).mockResolvedValue();
    vi.mocked(projectService.getAll)
      .mockResolvedValueOnce(mockProjects)
      .mockResolvedValueOnce([mockProjects[1]]);

    renderProjectSettings();

    await waitFor(() => {
      expect(screen.getByText('TFETP 2024')).toBeInTheDocument();
    });

    const archiveButtons = screen.getAllByRole('button', { name: /archive/i });
    fireEvent.click(archiveButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /archive$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(projectService.delete).toHaveBeenCalledWith('1');
    });
  });
});
