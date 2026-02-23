import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailCompose } from '../EmailCompose';
import { emailService } from '@/services/emailService';
import type { EmailRecipient } from '@/services/emailService';
import { toast } from 'sonner';

vi.mock('@/services/emailService', () => ({
    emailService: {
        getTemplates: vi.fn(),
        previewEmails: vi.fn(),
        sendEmails: vi.fn(),
    },
}));

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

const mockGetTemplates = emailService.getTemplates as ReturnType<typeof vi.fn>;
const mockPreviewEmails = emailService.previewEmails as ReturnType<typeof vi.fn>;
const mockSendEmails = emailService.sendEmails as ReturnType<typeof vi.fn>;

const sampleTemplates = [
    {
        _id: 'tmpl1',
        name: 'Expiry Reminder',
        subject: 'Your doc expires on {{expiryDate}}',
        body: 'Dear {{teacherName}}, your document is expiring.',
        variables: ['teacherName', 'expiryDate'],
        isDefault: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
];

const sampleRecipients: EmailRecipient[] = [
    { email: 'alice@example.com', name: 'Alice', teacherId: 'tid1', variables: {} },
    { email: 'bob@example.com', name: 'Bob', teacherId: 'tid2', variables: {} },
];

const samplePreviews = [
    { email: 'alice@example.com', name: 'Alice', subject: 'Your doc expires soon', body: 'Dear Alice, your document is expiring.' },
    { email: 'bob@example.com', name: 'Bob', subject: 'Your doc expires soon', body: 'Dear Bob, your document is expiring.' },
];

describe('EmailCompose', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetTemplates.mockResolvedValue(sampleTemplates);
        mockPreviewEmails.mockResolvedValue(samplePreviews);
        mockSendEmails.mockResolvedValue({ sent: 2, failed: 0 });
    });

    it('shows recipient list from initialRecipients on step 1', async () => {
        render(<EmailCompose initialRecipients={sampleRecipients} />);
        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('shows empty state when no recipients provided', async () => {
        render(<EmailCompose initialRecipients={[]} />);
        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());
        expect(screen.getByText(/No recipients selected/i)).toBeInTheDocument();
    });

    it('can remove a recipient from step 1', async () => {
        const user = userEvent.setup();
        render(<EmailCompose initialRecipients={sampleRecipients} />);
        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());

        const removeButtons = screen.getAllByRole('button', { name: /remove/i });
        await user.click(removeButtons[0]);

        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('navigates to template selection on step 2', async () => {
        const user = userEvent.setup();
        render(<EmailCompose initialRecipients={sampleRecipients} />);
        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());

        await user.click(screen.getByRole('button', { name: /^Next$/i }));

        expect(screen.getByText(/Select Template/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows subject preview when template is selected in step 2', async () => {
        const user = userEvent.setup();
        render(<EmailCompose initialRecipients={sampleRecipients} />);
        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());

        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        await user.selectOptions(screen.getByRole('combobox'), 'Expiry Reminder');

        expect(screen.getByText('Your doc expires on {{expiryDate}}')).toBeInTheDocument();
    });

    it('fetches previews and shows first recipient preview on step 3', async () => {
        const user = userEvent.setup();
        render(<EmailCompose initialRecipients={sampleRecipients} />);
        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());

        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        await user.selectOptions(screen.getByRole('combobox'), 'Expiry Reminder');
        await user.click(screen.getByRole('button', { name: /^Next$/i }));

        await waitFor(() => expect(mockPreviewEmails).toHaveBeenCalledWith('tmpl1', sampleRecipients));
        expect(screen.getByText('Dear Alice, your document is expiring.')).toBeInTheDocument();
        expect(screen.getByText(/1 of 2/i)).toBeInTheDocument();
    });

    it('navigates between recipient previews with arrows', async () => {
        const user = userEvent.setup();
        render(<EmailCompose initialRecipients={sampleRecipients} />);
        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());

        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        await user.selectOptions(screen.getByRole('combobox'), 'Expiry Reminder');
        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        await waitFor(() => expect(mockPreviewEmails).toHaveBeenCalled());

        expect(screen.getByText('Dear Alice, your document is expiring.')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        expect(screen.getByText('Dear Bob, your document is expiring.')).toBeInTheDocument();
        expect(screen.getByText(/2 of 2/i)).toBeInTheDocument();
    });

    it('disables send button while sending', async () => {
        mockSendEmails.mockImplementation(() => new Promise(() => {})); // never resolves
        const user = userEvent.setup();
        render(<EmailCompose initialRecipients={sampleRecipients} />);
        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());

        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        await user.selectOptions(screen.getByRole('combobox'), 'Expiry Reminder');
        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        await waitFor(() => expect(mockPreviewEmails).toHaveBeenCalled());

        await user.click(screen.getByRole('button', { name: /^Send$/i }));

        expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    });

    it('shows result summary after successful send', async () => {
        const user = userEvent.setup();
        render(<EmailCompose initialRecipients={sampleRecipients} />);
        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());

        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        await user.selectOptions(screen.getByRole('combobox'), 'Expiry Reminder');
        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        await waitFor(() => expect(mockPreviewEmails).toHaveBeenCalled());

        await user.click(screen.getByRole('button', { name: /^Send$/i }));

        await waitFor(() => {
            expect(screen.getByText(/2 sent, 0 failed/i)).toBeInTheDocument();
        });
    });

    it('shows error toast when send fails', async () => {
        mockSendEmails.mockRejectedValue(new Error('Network error'));
        const user = userEvent.setup();
        render(<EmailCompose initialRecipients={sampleRecipients} />);
        await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());

        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        await user.selectOptions(screen.getByRole('combobox'), 'Expiry Reminder');
        await user.click(screen.getByRole('button', { name: /^Next$/i }));
        await waitFor(() => expect(mockPreviewEmails).toHaveBeenCalled());

        await user.click(screen.getByRole('button', { name: /^Send$/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
        // Still on preview step, not crashed
        expect(screen.getByRole('button', { name: /^Send$/i })).toBeInTheDocument();
    });
});
