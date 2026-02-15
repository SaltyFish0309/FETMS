import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportService } from '../exportService';
import type { Teacher } from '../teacherService';

// Factory function for mock Teacher data (testing-patterns skill)
const getMockTeacher = (overrides?: Partial<Teacher>): Teacher => ({
    _id: 'teacher-123',
    firstName: 'John',
    middleName: 'M',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    pipelineStage: 'stage-1',
    pipelineOrder: 0,
    documents: {
        passport: { status: 'pending' },
        arc: { status: 'pending' },
        contract: { status: 'pending' },
        workPermit: { status: 'pending' },
    },
    documentBoxes: [],
    otherDocuments: [],
    personalInfo: {
        nationality: { english: 'American' },
        gender: 'Male',
        hiringStatus: 'Newly Hired',
    },
    education: {
        degree: "Bachelor's",
    },
    contractDetails: {
        salary: 50000,
    },
    ...overrides,
});

describe('exportService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateCSV', () => {
        it('should generate CSV string with headers and data rows', () => {
            const teachers = [getMockTeacher()];
            const columns = [
                { key: 'firstName', label: 'First Name' },
                { key: 'lastName', label: 'Last Name' },
                { key: 'email', label: 'Email' },
            ];

            const result = exportService.generateCSV(teachers as unknown as Record<string, unknown>[], columns);

            expect(result).toContain('First Name,Last Name,Email');
            expect(result).toContain('John,Doe,john.doe@example.com');
        });

        it('should handle empty data array', () => {
            const columns = [
                { key: 'firstName', label: 'First Name' },
            ];

            const result = exportService.generateCSV([], columns);

            expect(result).toBe('First Name\n');
        });

        it('should escape commas in values', () => {
            const teachers = [getMockTeacher({ lastName: 'Doe, Jr.' })];
            const columns = [{ key: 'lastName', label: 'Last Name' }];

            const result = exportService.generateCSV(teachers as unknown as Record<string, unknown>[], columns);

            expect(result).toContain('"Doe, Jr."');
        });

        it('should handle nested properties', () => {
            const teachers = [getMockTeacher()];
            const columns = [
                { key: 'personalInfo.nationality.english', label: 'Nationality' },
            ];

            const result = exportService.generateCSV(teachers as unknown as Record<string, unknown>[], columns);

            expect(result).toContain('Nationality');
            expect(result).toContain('American');
        });

        it('should handle undefined nested properties gracefully', () => {
            const teachers = [getMockTeacher({ personalInfo: undefined })];
            const columns = [
                { key: 'personalInfo.nationality.english', label: 'Nationality' },
            ];

            const result = exportService.generateCSV(teachers as unknown as Record<string, unknown>[], columns);

            expect(result).toContain('Nationality');
            expect(result).toContain('\n'); // Empty value
        });
    });

    describe('getTeacherExportColumns', () => {
        it('should return predefined columns for teacher export', () => {
            const columns = exportService.getTeacherExportColumns();

            expect(columns).toBeInstanceOf(Array);
            expect(columns.length).toBeGreaterThan(0);
            expect(columns[0]).toHaveProperty('key');
            expect(columns[0]).toHaveProperty('label');
        });
    });

    describe('downloadCSV', () => {
        it('should create and trigger download of CSV file', () => {
            const mockCreateElement = vi.spyOn(document, 'createElement');
            const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as HTMLAnchorElement);
            const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as HTMLAnchorElement);
            const mockClick = vi.fn();

            mockCreateElement.mockReturnValue({
                href: '',
                download: '',
                click: mockClick,
                style: {},
            } as unknown as HTMLAnchorElement);

            exportService.downloadCSV('test,data', 'test-file');

            expect(mockCreateElement).toHaveBeenCalledWith('a');
            expect(mockClick).toHaveBeenCalled();
            expect(mockAppendChild).toHaveBeenCalled();
            expect(mockRemoveChild).toHaveBeenCalled();
        });
    });
});
