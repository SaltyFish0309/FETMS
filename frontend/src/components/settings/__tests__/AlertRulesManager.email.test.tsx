import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertRulesManager } from '../AlertRulesManager';
import { toast } from 'sonner';
import api from '@/services/api';
import { emailService } from '@/services/emailService';

vi.mock('@/services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
    },
}));

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('@/services/emailService', () => ({
    emailService: {
        getTemplates: vi.fn(),
    },
}));

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPatch = api.patch as ReturnType<typeof vi.fn>;
const mockGetTemplates = emailService.getTemplates as ReturnType<typeof vi.fn>;

const sampleRules = [
    {
        _id: 'rule1',
        name: 'ARC Expiring',
        documentType: 'arcDetails',
        conditionType: 'DAYS_REMAINING',
        value: 90,
        isActive: true,
        emailEnabled: false,
        emailTemplateId: null,
    },
];

const sampleTemplates = [
    {
        _id: 'tmpl1',
        name: 'Expiry Reminder',
        subject: 'Expiry',
        body: 'Body',
        variables: [],
        isDefault: false,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
    },
];

describe('AlertRulesManager email toggle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGet.mockResolvedValue({ data: sampleRules });
        mockPatch.mockResolvedValue({ data: {} });
        mockGetTemplates.mockResolvedValue(sampleTemplates);
    });

    it('shows email toggle for each rule', async () => {
        render(<AlertRulesManager />);

        await waitFor(() => {
            expect(screen.getByText('ARC Expiring')).toBeInTheDocument();
        });

        // Email toggle should be present (checkbox or switch)
        expect(screen.getByRole('checkbox', { name: /email/i })).toBeInTheDocument();
    });

    it('shows template selector when rule has emailEnabled: true', async () => {
        // Use a rule where email is already enabled — tests the rendering, not the toggle
        const enabledRule = { ...sampleRules[0], emailEnabled: true };
        mockGet.mockResolvedValue({ data: [enabledRule] });

        render(<AlertRulesManager />);

        await waitFor(() => {
            expect(screen.getByText('ARC Expiring')).toBeInTheDocument();
        });

        // Template selector should be visible because emailEnabled is true
        expect(screen.queryByLabelText(/template/i)).toBeInTheDocument();
    });

    it('calls api.patch when email toggle is enabled', async () => {
        const user = userEvent.setup();
        render(<AlertRulesManager />);

        await waitFor(() => {
            expect(screen.getByText('ARC Expiring')).toBeInTheDocument();
        });

        const emailToggle = screen.getByRole('checkbox', { name: /email/i });
        await user.click(emailToggle);

        await waitFor(() => {
            expect(mockPatch).toHaveBeenCalledWith(
                '/alerts/rule1',
                expect.objectContaining({ emailEnabled: true })
            );
        });
    });

    it('shows success toast when email setting saved', async () => {
        const user = userEvent.setup();
        render(<AlertRulesManager />);

        await waitFor(() => {
            expect(screen.getByText('ARC Expiring')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('checkbox', { name: /email/i }));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalled();
        });
    });
});
