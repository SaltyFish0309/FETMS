import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from '../projectService';
import api from '../api';

vi.mock('../api');

describe('projectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('should fetch project by id', async () => {
      const mockProject = {
        _id: '1',
        name: 'TFETP',
        code: 'TFETP',
        description: 'Test project',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockProject } as any);

      const result = await projectService.getById('1');

      expect(api.get).toHaveBeenCalledWith('/projects/1');
      expect(result).toEqual(mockProject);
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      const mockProject = {
        _id: '1',
        name: 'Updated Name',
        code: 'TFETP',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };

      vi.mocked(api.put).mockResolvedValue({ data: mockProject } as any);

      const result = await projectService.update('1', { name: 'Updated Name' });

      expect(api.put).toHaveBeenCalledWith('/projects/1', { name: 'Updated Name' });
      expect(result).toEqual(mockProject);
    });
  });

  describe('delete', () => {
    it('should delete project', async () => {
      vi.mocked(api.delete).mockResolvedValue({} as any);

      await projectService.delete('1');

      expect(api.delete).toHaveBeenCalledWith('/projects/1');
    });
  });
});
