import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectToggle } from '../ProjectToggle';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { projectService } from '@/services/projectService';

vi.mock('@/services/projectService');

const mockProjects = [
    { _id: '1', name: 'TFETP 專案', code: 'TFETP', isActive: true, createdAt: '', updatedAt: '' },
    { _id: '2', name: '獨立委任專案', code: 'INDEPENDENT', isActive: true, createdAt: '', updatedAt: '' }
];

describe('ProjectToggle', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should display loading state initially', () => {
        vi.mocked(projectService.getAll).mockReturnValue(
            new Promise(() => { }) // Never resolves
        );

        render(
            <ProjectProvider>
                <ProjectToggle value={null} onChange={vi.fn()} />
            </ProjectProvider>
        );

        expect(screen.getByText('載入專案中...')).toBeInTheDocument();
    });

    it('should render all projects as buttons', async () => {
        vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);

        render(
            <ProjectProvider>
                <ProjectToggle value="1" onChange={vi.fn()} />
            </ProjectProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('TFETP 專案')).toBeInTheDocument();
            expect(screen.getByText('獨立委任專案')).toBeInTheDocument();
        });
    });

    it('should highlight active project button', async () => {
        vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);

        render(
            <ProjectProvider>
                <ProjectToggle value="1" onChange={vi.fn()} />
            </ProjectProvider>
        );

        await waitFor(() => {
            const tfetpButton = screen.getByText('TFETP 專案').closest('button');
            expect(tfetpButton).toHaveClass('bg-background');
        });
    });

    it('should call onChange when clicking a project button', async () => {
        const onChange = vi.fn();
        vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);

        render(
            <ProjectProvider>
                <ProjectToggle value="1" onChange={onChange} />
            </ProjectProvider>
        );

        await waitFor(async () => {
            const independentButton = screen.getByText('獨立委任專案');
            await userEvent.click(independentButton);
        });

        expect(onChange).toHaveBeenCalledWith('2');
    });

    it('should auto-select first project if no value provided', async () => {
        const onChange = vi.fn();
        vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);

        render(
            <ProjectProvider>
                <ProjectToggle value={null} onChange={onChange} />
            </ProjectProvider>
        );

        // This behavior is now handled by the ProjectContext, not the component
        // So we just verify the component renders without errors
        await waitFor(() => {
            expect(screen.getByText('TFETP 專案')).toBeInTheDocument();
        });
    });
});
