import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatsService } from '../statsService.js';
import Teacher from '../../models/Teacher.js';
import School from '../../models/School.js';
import Stage from '../../models/Stage.js';
import AlertRule from '../../models/AlertRule.js';
import mongoose from 'mongoose';

// Mock the models
vi.mock('../../models/Teacher.js', () => ({
  default: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  }
}));

vi.mock('../../models/School.js', () => ({
  default: {
    countDocuments: vi.fn(),
  }
}));

vi.mock('../../models/Stage.js', () => ({
  default: {
    find: vi.fn(),
  }
}));

vi.mock('../../models/AlertRule.js', () => ({
  default: {
    find: vi.fn(),
  }
}));

describe('StatsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats with projectId filtering', () => {
    it('should filter teachers by projectId when provided', async () => {
      const projectId = '507f1f77bcf86cd799439011';
      const mockStages = [{ _id: 'stage1', title: 'Stage 1', order: 1 }];
      const mockRules: any[] = [];
      const mockTeachers = [
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          project: projectId,
          pipelineStage: 'stage1',
          personalInfo: { gender: 'Male' }
        }
      ];

      vi.mocked(AlertRule.find).mockResolvedValue(mockRules as any);
      vi.mocked(Stage.find).mockReturnValue({ sort: vi.fn().mockResolvedValue(mockStages) } as any);
      vi.mocked(School.countDocuments).mockResolvedValue(5);

      const selectMock = vi.fn().mockResolvedValue(mockTeachers);
      const findMock = vi.fn().mockReturnValue({ select: selectMock });
      vi.mocked(Teacher.find).mockImplementation(findMock as any);

      const result = await StatsService.getDashboardStats({ projectId });

      // Verify Teacher.find was called with projectId in query
      expect(findMock).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: false,
          project: new mongoose.Types.ObjectId(projectId)
        })
      );

      expect(result).toHaveProperty('kpi');
      expect(result).toHaveProperty('charts');
    });

    it('should return all teachers when projectId is not provided (backward compatible)', async () => {
      const mockStages = [{ _id: 'stage1', title: 'Stage 1', order: 1 }];
      const mockRules: any[] = [];
      const mockTeachers: any[] = [];

      vi.mocked(AlertRule.find).mockResolvedValue(mockRules as any);
      vi.mocked(Stage.find).mockReturnValue({ sort: vi.fn().mockResolvedValue(mockStages) } as any);
      vi.mocked(School.countDocuments).mockResolvedValue(5);

      const selectMock = vi.fn().mockResolvedValue(mockTeachers);
      const findMock = vi.fn().mockReturnValue({ select: selectMock });
      vi.mocked(Teacher.find).mockImplementation(findMock as any);

      const result = await StatsService.getDashboardStats({});

      // Verify Teacher.find was NOT called with projectId
      expect(findMock).toHaveBeenCalledWith(
        expect.not.objectContaining({
          project: expect.anything()
        })
      );

      expect(result).toHaveProperty('kpi');
    });
  });
});
