import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Schools from '../Schools';
import { schoolService } from '@/services/schoolService';
import { teacherService } from '@/services/teacherService';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('@/services/schoolService', () => ({
    schoolService: {
        getAll: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('@/services/teacherService', () => ({
    teacherService: {
        getAll: vi.fn(),
    },
}));

vi.mock('@/contexts/ProjectContext', () => ({
    useProjectContext: () => ({ selectedProjectId: 'proj1' }),
}));

vi.mock('@/components/schools/ImportSchoolsDialog', () => ({
    ImportSchoolsDialog: () => null,
}));

const mockGetAll = schoolService.getAll as ReturnType<typeof vi.fn>;
const mockTeacherGetAll = teacherService.getAll as ReturnType<typeof vi.fn>;

const sampleSchool = {
    _id: 'school1',
    name: { chinese: '測試學校', english: 'Test School' },
    contact: { name: 'Jane', position: 'Admin', email: 'school@example.com' },
    address: {},
    principal: {},
};

// Teacher linked to school1 so it passes the filteredSchools logic
const sampleTeacher = {
    _id: 'tid1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    school: 'school1',
};

describe('Schools email integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetAll.mockResolvedValue([sampleSchool]);
        mockTeacherGetAll.mockResolvedValue([sampleTeacher]);
    });

    it('shows Email button for each school row', async () => {
        render(<BrowserRouter><Schools /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.getByText('測試學校')).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /email/i })).toBeInTheDocument();
    });

    it('navigates to /email with school contact when Email button clicked', async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><Schools /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.getByText('測試學校')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /^email$/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/email', expect.objectContaining({
            state: expect.objectContaining({
                recipients: expect.arrayContaining([
                    expect.objectContaining({ email: 'school@example.com' }),
                ]),
            }),
        }));
    });
});
