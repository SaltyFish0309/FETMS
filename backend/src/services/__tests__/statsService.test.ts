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

    it('returns KPI counts for selected project only', async () => {
      const projectAId = '507f1f77bcf86cd799439011';
      const projectBId = '507f1f77bcf86cd799439012';
      const employedStageId = 'stage-employed';
      const recruitingStageId = 'stage-recruiting';

      const mockStages = [
        { _id: employedStageId, title: 'Employed', order: 1 },
        { _id: recruitingStageId, title: 'Recruiting', order: 2 }
      ];
      const mockRules: any[] = [];

      // Project A: 3 teachers (2 recruiting, 1 employed)
      const projectATeachers = [
        { _id: '1', firstName: 'A1', lastName: 'Teacher', project: projectAId, pipelineStage: recruitingStageId, school: 'school1' },
        { _id: '2', firstName: 'A2', lastName: 'Teacher', project: projectAId, pipelineStage: recruitingStageId, school: 'school1' },
        { _id: '3', firstName: 'A3', lastName: 'Teacher', project: projectAId, pipelineStage: employedStageId, school: 'school2' }
      ];

      // Project B: 5 teachers (all employed)
      const projectBTeachers = [
        { _id: '4', firstName: 'B1', lastName: 'Teacher', project: projectBId, pipelineStage: employedStageId, school: 'school3' },
        { _id: '5', firstName: 'B2', lastName: 'Teacher', project: projectBId, pipelineStage: employedStageId, school: 'school3' },
        { _id: '6', firstName: 'B3', lastName: 'Teacher', project: projectBId, pipelineStage: employedStageId, school: 'school4' },
        { _id: '7', firstName: 'B4', lastName: 'Teacher', project: projectBId, pipelineStage: employedStageId, school: 'school4' },
        { _id: '8', firstName: 'B5', lastName: 'Teacher', project: projectBId, pipelineStage: employedStageId, school: 'school5' }
      ];

      const allTeachers = [...projectATeachers, ...projectBTeachers];

      vi.mocked(AlertRule.find).mockResolvedValue(mockRules as any);
      vi.mocked(Stage.find).mockReturnValue({ sort: vi.fn().mockResolvedValue(mockStages) } as any);
      vi.mocked(School.countDocuments).mockResolvedValue(10);

      // Mock Teacher.find to return different data based on query
      const selectMock = vi.fn();
      const findMock = vi.fn().mockImplementation((query: any) => {
        // First call: allTeachers (no filter)
        // Second call: filteredTeachers (with projectId filter)
        if (query.project) {
          // Return only project A teachers
          selectMock.mockResolvedValue(projectATeachers);
        } else {
          // Return all teachers
          selectMock.mockResolvedValue(allTeachers);
        }
        return { select: selectMock };
      });
      vi.mocked(Teacher.find).mockImplementation(findMock as any);

      const result = await StatsService.getDashboardStats({ projectId: projectAId });

      // KPIs should reflect ONLY project A teachers (3 total, 2 schools, 2 in recruitment)
      expect(result.kpi.totalTeachers).toBe(3); // Should be 3, not 8
      expect(result.kpi.activeSchools).toBe(2); // Should be 2 unique schools, not 5
      expect(result.kpi.inRecruitment).toBe(2); // Should be 2 recruiting, not 2
      expect(result.kpi.actionsNeeded).toBe(0); // No expiry alerts
    });
  });

  describe('teaching license expiry alerts', () => {
    it('categorizes teaching license alerts into teachingLicense bucket', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);

      const mockStages = [{ _id: 'stage1', title: 'Stage 1', order: 1 }];
      const mockRules = [
        {
          _id: 'rule1',
          name: 'License expiring in 30 days',
          documentType: 'teachingLicense',
          conditionType: 'DAYS_REMAINING',
          value: 30,
          isActive: true
        }
      ];
      const mockTeachers = [
        {
          _id: 't1',
          firstName: 'Jane',
          lastName: 'Smith',
          profilePicture: undefined,
          pipelineStage: 'stage1',
          teachingLicense: { expiryDate: futureDate }
        }
      ];

      vi.mocked(AlertRule.find).mockResolvedValue(mockRules as any);
      vi.mocked(Stage.find).mockReturnValue({ sort: vi.fn().mockResolvedValue(mockStages) } as any);

      const selectMock = vi.fn().mockResolvedValue(mockTeachers);
      vi.mocked(Teacher.find).mockReturnValue({ select: selectMock } as any);

      const result = await StatsService.getDashboardStats({});

      expect(result.expiry.teachingLicense).toHaveLength(1);
      expect(result.expiry.teachingLicense[0]).toMatchObject({
        firstName: 'Jane',
        lastName: 'Smith',
        ruleName: 'License expiring in 30 days',
        documentType: 'teachingLicense'
      });
      expect(result.expiry.arc).toHaveLength(0);
      expect(result.expiry.workPermit).toHaveLength(0);
      expect(result.expiry.passport).toHaveLength(0);
    });

    it('does not trigger alert when teaching license is not expiring soon', async () => {
      const farFutureDate = new Date();
      farFutureDate.setDate(farFutureDate.getDate() + 90);

      const mockStages = [{ _id: 'stage1', title: 'Stage 1', order: 1 }];
      const mockRules = [
        {
          _id: 'rule1',
          name: 'License expiring in 30 days',
          documentType: 'teachingLicense',
          conditionType: 'DAYS_REMAINING',
          value: 30,
          isActive: true
        }
      ];
      const mockTeachers = [
        {
          _id: 't1',
          firstName: 'Jane',
          lastName: 'Smith',
          pipelineStage: 'stage1',
          teachingLicense: { expiryDate: farFutureDate }
        }
      ];

      vi.mocked(AlertRule.find).mockResolvedValue(mockRules as any);
      vi.mocked(Stage.find).mockReturnValue({ sort: vi.fn().mockResolvedValue(mockStages) } as any);

      const selectMock = vi.fn().mockResolvedValue(mockTeachers);
      vi.mocked(Teacher.find).mockReturnValue({ select: selectMock } as any);

      const result = await StatsService.getDashboardStats({});

      expect(result.expiry.teachingLicense).toHaveLength(0);
    });
  });
});
