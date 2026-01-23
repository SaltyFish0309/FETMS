import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherService } from '../teacherService.js';
import Teacher from '../../models/Teacher.js';

// Mock the Teacher model
vi.mock('../../models/Teacher.js', () => {
    return {
        default: {
            find: vi.fn(),
            findOne: vi.fn(),
            findById: vi.fn(), // We used findOne in service now, but just in case
            create: vi.fn(),
            findByIdAndUpdate: vi.fn(),
            findOneAndUpdate: vi.fn(),
            findByIdAndDelete: vi.fn(),
        }
    };
});

describe('TeacherService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllTeachers', () => {
        it('should return all non-deleted teachers', async () => {
            const mockTeachers = [{ name: 'John' }, { name: 'Jane' }];
            const sortMock = vi.fn().mockReturnValue(mockTeachers);
            const populateMock = vi.fn().mockReturnValue({ sort: sortMock });
            // @ts-ignore
            Teacher.find.mockReturnValue({ populate: populateMock });

            const result = await TeacherService.getAllTeachers();

            expect(Teacher.find).toHaveBeenCalledWith({ isDeleted: false });
            expect(populateMock).toHaveBeenCalledWith('school');
            expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
            expect(result).toEqual(mockTeachers);
        });
    });

    describe('getTeacherById', () => {
        it('should return teacher if found and not deleted', async () => {
            const mockTeacher = { name: 'John' };
            // @ts-ignore
            Teacher.findOne.mockResolvedValue(mockTeacher);

            const result = await TeacherService.getTeacherById('123');

            expect(Teacher.findOne).toHaveBeenCalledWith({ _id: '123', isDeleted: false });
            expect(result).toEqual(mockTeacher);
        });

        it('should return null if teacher not found', async () => {
            // @ts-ignore
            Teacher.findOne.mockResolvedValue(null);

            const result = await TeacherService.getTeacherById('123');

            expect(result).toBeNull();
        });
    });

    describe('deleteTeacher (Soft Delete)', () => {
        it('should soft delete teacher', async () => {
            const mockTeacher = {
                _id: '123',
                isDeleted: false,
                save: vi.fn().mockResolvedValue(true)
            };
            // @ts-ignore
            Teacher.findOne.mockResolvedValue(mockTeacher);

            const result = await TeacherService.deleteTeacher('123');

            expect(Teacher.findOne).toHaveBeenCalledWith({ _id: '123', isDeleted: false });
            expect(mockTeacher.isDeleted).toBe(true);
            expect(mockTeacher.save).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should return false if teacher not found', async () => {
            // @ts-ignore
            Teacher.findOne.mockResolvedValue(null);

            const result = await TeacherService.deleteTeacher('123');

            expect(result).toBe(false);
        });
    });
});
