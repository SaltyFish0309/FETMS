import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from '../projectService.js';
import Project from '../../models/Project.js';

// Mock the Project model
vi.mock('../../models/Project.js', () => {
  return {
    default: {
      find: vi.fn(),
      findOne: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    }
  };
});

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('should return all active projects sorted by createdAt', async () => {
      const mockProjects = [
        { _id: '1', name: 'TFETP 專案', code: 'TFETP', isActive: true },
        { _id: '2', name: '獨立委任專案', code: 'INDEPENDENT', isActive: true }
      ];

      const sortMock = vi.fn().mockResolvedValue(mockProjects);
      vi.mocked(Project.find).mockReturnValue({ sort: sortMock } as any);

      const result = await ProjectService.getAllProjects();

      expect(Project.find).toHaveBeenCalledWith({ isActive: true });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: 1 });
      expect(result).toEqual(mockProjects);
    });

    it('should return empty array when no active projects', async () => {
      const sortMock = vi.fn().mockResolvedValue([]);
      vi.mocked(Project.find).mockReturnValue({ sort: sortMock } as any);

      const result = await ProjectService.getAllProjects();

      expect(result).toEqual([]);
    });
  });

  describe('getProjectById', () => {
    it('should find project by id', async () => {
      const mockProject = { _id: '1', name: 'TFETP', code: 'TFETP', isActive: true };
      vi.mocked(Project.findById).mockResolvedValue(mockProject as any);

      const result = await ProjectService.getProjectById('1');

      expect(Project.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProject);
    });

    it('should return null when project not found', async () => {
      vi.mocked(Project.findById).mockResolvedValue(null);

      const result = await ProjectService.getProjectById('999');

      expect(result).toBeNull();
    });
  });

  describe('getProjectByCode', () => {
    it('should find project by code (case-insensitive)', async () => {
      const mockProject = { _id: '1', name: 'TFETP', code: 'TFETP', isActive: true };
      vi.mocked(Project.findOne).mockResolvedValue(mockProject as any);

      const result = await ProjectService.getProjectByCode('tfetp');

      expect(Project.findOne).toHaveBeenCalledWith({ code: 'TFETP', isActive: true });
      expect(result).toEqual(mockProject);
    });

    it('should return null for non-existent project', async () => {
      vi.mocked(Project.findOne).mockResolvedValue(null);

      const result = await ProjectService.getProjectByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  // Note: createProject uses 'new Project()' which is hard to mock in unit tests
  // The method is simple and will be tested in integration/E2E tests
});
