import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailHistory } from '../EmailHistory';
import { emailService } from '@/services/emailService';
import { toast } from 'sonner';

vi.mock('@/services/emailService', () => ({
    emailService: {
        getHistory: vi.fn(),
    },
}));

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

const mockGetHistory = emailService.getHistory as ReturnType<typeof vi.fn>;

const sampleLog = {
    _id: 'log1',
    subject: 'Your ARC expires soon',
    recipients: [
        { email: 'teacher@example.com', name: 'John Doe', status: 'sent' as const },
        { email: 'other@example.com', name: 'Jane Smith', status: 'failed' as const, error: 'Mailbox full' },
    ],
    templateId: 'tmpl1',
    triggeredBy: 'manual' as const,
    totalSent: 1,
    totalFailed: 1,
    sentAt: '2026-01-15T10:00:00.000Z',
};

describe('EmailHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetHistory.mockResolvedValue({ logs: [], total: 0, page: 1, limit: 20 });
    });

    it('shows empty state when no history', async () => {
        mockGetHistory.mockResolvedValue({ logs: [], total: 0, page: 1, limit: 20 });
        render(<EmailHistory />);

        await waitFor(() => expect(mockGetHistory).toHaveBeenCalled());
        expect(screen.getByText(/No emails sent yet/i)).toBeInTheDocument();
    });

    it('displays sent/failed statistics for each log entry', async () => {
        mockGetHistory.mockResolvedValue({ logs: [sampleLog], total: 1, page: 1, limit: 20 });
        render(<EmailHistory />);

        await screen.findByText('Your ARC expires soon');
        expect(screen.getByText(/Sent: 1/)).toBeInTheDocument(); // totalSent
        expect(screen.getByText('Manual')).toBeInTheDocument(); // triggeredBy
    });

    it('expands recipient details on clicking View Details', async () => {
        mockGetHistory.mockResolvedValue({ logs: [sampleLog], total: 1, page: 1, limit: 20 });
        const user = userEvent.setup();
        render(<EmailHistory />);

        await screen.findByText('Your ARC expires soon');

        const detailsButton = screen.getByRole('button', { name: /View Details/i });
        await user.click(detailsButton);

        expect(await screen.findByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('shows error toast when fetch fails', async () => {
        mockGetHistory.mockRejectedValue(new Error('Network error'));
        render(<EmailHistory />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });
});
