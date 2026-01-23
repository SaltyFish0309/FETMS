import { describe, it, expect, vi } from 'vitest';
import api from './api';
import { projectService } from './projectService';

vi.mock('./api');

describe('projectService', () => {
    it('getAll calls /projects', async () => {
        const mockProjects = [{ _id: '1', name: 'Test' }];
        vi.mocked(api.get).mockResolvedValue({ data: mockProjects });

        const result = await projectService.getAll();
        expect(api.get).toHaveBeenCalledWith('/projects');
        expect(result).toEqual(mockProjects);
    });

    it('create calls POST /projects', async () => {
        const newProject = { name: 'New Project' };
        vi.mocked(api.post).mockResolvedValue({ data: { ...newProject, _id: '2' } });

        const result = await projectService.create(newProject);
        expect(api.post).toHaveBeenCalledWith('/projects', newProject);
        expect(result).toEqual({ ...newProject, _id: '2' });
    });
});
