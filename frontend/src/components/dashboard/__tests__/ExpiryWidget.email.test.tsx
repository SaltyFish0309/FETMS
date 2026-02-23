import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ExpiryWidget } from '../ExpiryWidget';
import type { DashboardStats, ExpiryAlert } from '@/services/statsService';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const makeAlert = (overrides: Partial<ExpiryAlert> = {}): ExpiryAlert => ({
    teacherId: 't1',
    firstName: 'John',
    lastName: 'Doe',
    expiryDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    ruleName: 'Test Rule',
    ...overrides,
});

const emptyExpiry: DashboardStats['expiry'] = {
    arc: [],
    workPermit: [],
    passport: [],
    teachingLicense: [],
    other: [],
};

const renderWidget = (data: DashboardStats['expiry'] = emptyExpiry) =>
    render(
        <BrowserRouter>
            <ExpiryWidget data={data} />
        </BrowserRouter>
    );

describe('ExpiryWidget email integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows email button (📧) for each expiry alert item', () => {
        const data: DashboardStats['expiry'] = {
            ...emptyExpiry,
            arc: [makeAlert({ firstName: 'Alice', lastName: 'Smith', teacherId: 'tid1' })],
        };
        renderWidget(data);

        // The email button should be present in the arc tab (default)
        expect(screen.getByRole('button', { name: /email/i })).toBeInTheDocument();
    });

    it('navigates to /email with teacher info when email button clicked', async () => {
        const user = userEvent.setup();
        const data: DashboardStats['expiry'] = {
            ...emptyExpiry,
            arc: [makeAlert({ firstName: 'Alice', lastName: 'Smith', teacherId: 'tid1' })],
        };
        renderWidget(data);

        await user.click(screen.getByRole('button', { name: /email/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/email', expect.objectContaining({
                state: expect.objectContaining({
                    recipients: expect.arrayContaining([
                        expect.objectContaining({ teacherId: 'tid1' }),
                    ]),
                }),
            }));
        });
    });
});
