import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { ProjectController } from '../projectController.js';
import { ProjectService } from '../../services/projectService.js';

// Mock the ProjectService
vi.mock('../../services/projectService.js', () => ({
  ProjectService: {
    getProjectById: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  }
}));

describe('ProjectController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };
  });

  describe('getProjectById', () => {
    it('should return project when found', async () => {
      const mockProject = { _id: '1', name: 'TFETP', code: 'TFETP', isActive: true };
      vi.mocked(ProjectService.getProjectById).mockResolvedValue(mockProject as any);

      mockRequest = { params: { id: '1' } };

      await ProjectController.getProjectById(mockRequest as Request, mockResponse as Response);

      expect(ProjectService.getProjectById).toHaveBeenCalledWith('1');
      expect(jsonMock).toHaveBeenCalledWith(mockProject);
    });

    it('should return 404 when project not found', async () => {
      vi.mocked(ProjectService.getProjectById).mockResolvedValue(null);

      mockRequest = { params: { id: '999' } };

      await ProjectController.getProjectById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Not found' });
    });
  });

  describe('updateProject', () => {
    it('should update project and return 200', async () => {
      const mockProject = { _id: '1', name: 'Updated', code: 'TFETP', isActive: true };
      vi.mocked(ProjectService.updateProject).mockResolvedValue(mockProject as any);

      mockRequest = {
        params: { id: '1' },
        body: { name: 'Updated' }
      };

      await ProjectController.updateProject(mockRequest as Request, mockResponse as Response);

      expect(ProjectService.updateProject).toHaveBeenCalledWith('1', { name: 'Updated' });
      expect(jsonMock).toHaveBeenCalledWith(mockProject);
    });

    it('should return 404 when project not found', async () => {
      vi.mocked(ProjectService.updateProject).mockResolvedValue(null);

      mockRequest = {
        params: { id: '999' },
        body: { name: 'Updated' }
      };

      await ProjectController.updateProject(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Not found' });
    });
  });

  describe('deleteProject', () => {
    it('should soft delete project and return 200', async () => {
      vi.mocked(ProjectService.deleteProject).mockResolvedValue(true);

      mockRequest = { params: { id: '1' } };

      await ProjectController.deleteProject(mockRequest as Request, mockResponse as Response);

      expect(ProjectService.deleteProject).toHaveBeenCalledWith('1');
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Project deleted successfully' });
    });

    it('should return 404 when project not found', async () => {
      vi.mocked(ProjectService.deleteProject).mockResolvedValue(false);

      mockRequest = { params: { id: '999' } };

      await ProjectController.deleteProject(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Not found' });
    });
  });
});
