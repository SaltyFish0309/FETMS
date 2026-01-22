import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchoolService } from '../schoolService.js';
import School from '../../models/School.js';

vi.mock('../../models/School.js', () => {
    return {
        default: {
            find: vi.fn(),
            findOne: vi.fn(),
            findOneAndUpdate: vi.fn(),
        }
    };
});

// Mock Teacher just in case getSchoolById needs it
vi.mock('../../models/Teacher.js', () => {
    return {
        default: {
            find: vi.fn(),
        }
    };
});

describe('SchoolService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllSchools', () => {
        it('should return all non-deleted schools', async () => {
            const mockSchools = [{ name: { chinese: 'Test School' } }];
            const sortMock = vi.fn().mockReturnValue(mockSchools);
            // @ts-ignore
            School.find.mockReturnValue({ sort: sortMock });

            const result = await SchoolService.getAllSchools();

            expect(School.find).toHaveBeenCalledWith({ isDeleted: false });
            expect(sortMock).toHaveBeenCalledWith({ 'name.chinese': 1 });
            expect(result).toEqual(mockSchools);
        });
    });

    describe('deleteSchool', () => {
        it('should soft delete school', async () => {
            const mockSchool = {
                _id: '123',
                isDeleted: false,
                save: vi.fn().mockResolvedValue(true)
            };
            // @ts-ignore
            School.findOne.mockResolvedValue(mockSchool);

            const result = await SchoolService.deleteSchool('123');

            expect(School.findOne).toHaveBeenCalledWith({ _id: '123', isDeleted: false });
            expect(mockSchool.isDeleted).toBe(true);
            expect(mockSchool.save).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should return false if school not found', async () => {
            // @ts-ignore
            School.findOne.mockResolvedValue(null);

            const result = await SchoolService.deleteSchool('123');

            expect(result).toBe(false);
        });
    });
});
