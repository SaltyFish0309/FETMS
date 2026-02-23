import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailTemplateManager } from '../EmailTemplateManager';
import { emailService } from '@/services/emailService';
import { toast } from 'sonner';

vi.mock('@/services/emailService', () => ({
    emailService: {
        getTemplates: vi.fn(),
        createTemplate: vi.fn(),
        updateTemplate: vi.fn(),
        deleteTemplate: vi.fn(),
    },
}));

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

const mockGetTemplates = emailService.getTemplates as ReturnType<typeof vi.fn>;
const mockCreateTemplate = emailService.createTemplate as ReturnType<typeof vi.fn>;
const mockDeleteTemplate = emailService.deleteTemplate as ReturnType<typeof vi.fn>;

const sampleTemplates = [
    {
        _id: 'tmpl1',
        name: 'Expiry Reminder',
        subject: 'Your doc expires on {{expiryDate}}',
        body: 'Dear {{teacherName}}, ...',
        variables: ['teacherName', 'expiryDate'],
        isDefault: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
];

describe('EmailTemplateManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetTemplates.mockResolvedValue([]);
    });

    it('loads and displays templates on mount', async () => {
        mockGetTemplates.mockResolvedValue(sampleTemplates);
        render(<EmailTemplateManager />);

        expect(await screen.findByText('Expiry Reminder')).toBeInTheDocument();
    });

    it('shows empty state when no templates', async () => {
        mockGetTemplates.mockResolvedValue([]);
        render(<EmailTemplateManager />);

        await waitFor(() => {
            expect(mockGetTemplates).toHaveBeenCalled();
        });
        expect(screen.getByText(/No templates yet/)).toBeInTheDocument();
    });

    it('shows error toast when fetch fails', async () => {
        mockGetTemplates.mockRejectedValue(new Error('Network error'));
        render(<EmailTemplateManager />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });

    it('shows validation error when submitting empty template name', async () => {
        mockGetTemplates.mockResolvedValue([]);
        const user = userEvent.setup();
        render(<EmailTemplateManager />);

        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());

        const createButton = screen.getByRole('button', { name: /Create Template/i });
        await user.click(createButton);

        // Submit the form without filling in name
        const submitButton = screen.getByRole('button', { name: /save|create|submit/i });
        await user.click(submitButton);

        expect(await screen.findByText(/Template name is required/i)).toBeInTheDocument();
        expect(mockCreateTemplate).not.toHaveBeenCalled();
    });

    it('calls deleteTemplate and shows success toast after confirmation', async () => {
        mockGetTemplates.mockResolvedValue(sampleTemplates);
        mockDeleteTemplate.mockResolvedValue(undefined);
        const user = userEvent.setup();
        render(<EmailTemplateManager />);

        await screen.findByText('Expiry Reminder');

        // Click delete button
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        await user.click(deleteButton);

        // Confirm in dialog
        const confirmButton = await screen.findByRole('button', { name: /^Delete$/i });
        await user.click(confirmButton);

        await waitFor(() => {
            expect(mockDeleteTemplate).toHaveBeenCalledWith('tmpl1');
        });
        expect(toast.success).toHaveBeenCalled();
    });

    it('shows error toast and does not crash when delete API fails', async () => {
        mockGetTemplates.mockResolvedValue(sampleTemplates);
        mockDeleteTemplate.mockRejectedValue(new Error('Delete failed'));
        const user = userEvent.setup();
        render(<EmailTemplateManager />);

        await screen.findByText('Expiry Reminder');

        const deleteButton = screen.getByRole('button', { name: /delete/i });
        await user.click(deleteButton);

        const confirmButton = await screen.findByRole('button', { name: /^Delete$/i });
        await user.click(confirmButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
        // Template still in DOM
        expect(screen.getByText('Expiry Reminder')).toBeInTheDocument();
    });
});
