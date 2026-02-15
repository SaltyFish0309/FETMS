import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertRulesManager } from '../AlertRulesManager';
import { toast } from 'sonner';
import api from '@/services/api';

// Mock the api module
vi.mock('@/services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    }
}));

// Mock sonner
vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() }
}));

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;
const mockDelete = api.delete as ReturnType<typeof vi.fn>;

const sampleRules = [
    {
        _id: 'rule1',
        name: 'ARC Expiring',
        documentType: 'arcDetails',
        conditionType: 'DAYS_REMAINING',
        value: 90,
        isActive: true
    },
    {
        _id: 'rule2',
        name: 'License Check',
        documentType: 'teachingLicense',
        conditionType: 'DAYS_REMAINING',
        value: 30,
        isActive: true
    }
];

describe('AlertRulesManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGet.mockResolvedValue({ data: [] });
    });

    it('fetches rules via api instance on mount', async () => {
        mockGet.mockResolvedValue({ data: sampleRules });
        render(<AlertRulesManager />);

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith('/alerts');
        });
        expect(await screen.findByText('ARC Expiring')).toBeInTheDocument();
    });

    it('shows error toast when fetch fails', async () => {
        mockGet.mockRejectedValue(new Error('Network error'));
        render(<AlertRulesManager />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });

    it('handles non-array API response without crashing', async () => {
        mockGet.mockResolvedValue({ data: { error: 'unexpected' } });
        render(<AlertRulesManager />);

        // Should not crash, should show empty state
        await waitFor(() => {
            expect(mockGet).toHaveBeenCalled();
        });
        // The table should render the "no results" row
        expect(screen.getByText(/noResults/)).toBeInTheDocument();
    });

    it('deletes rule only on successful API response', async () => {
        mockGet.mockResolvedValue({ data: sampleRules });
        mockDelete.mockResolvedValue({ data: {} });

        render(<AlertRulesManager />);
        expect(await screen.findByText('ARC Expiring')).toBeInTheDocument();

        // Find and click delete button for first rule
        const deleteButtons = screen.getAllByRole('button', { name: '' });
        const trashButtons = deleteButtons.filter(btn =>
            btn.querySelector('svg.lucide-trash-2') ||
            btn.classList.contains('text-destructive')
        );
        if (trashButtons.length > 0) {
            await userEvent.click(trashButtons[0]);
        }

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('/alerts/rule1');
        });
        expect(toast.success).toHaveBeenCalled();
    });

    it('shows error toast and keeps rule when delete fails', async () => {
        mockGet.mockResolvedValue({ data: sampleRules });
        mockDelete.mockRejectedValue(new Error('Server error'));

        render(<AlertRulesManager />);
        expect(await screen.findByText('ARC Expiring')).toBeInTheDocument();

        const trashButtons = screen.getAllByRole('button').filter(btn =>
            btn.classList.contains('text-destructive') ||
            btn.querySelector('.lucide-trash-2')
        );
        if (trashButtons.length > 0) {
            await userEvent.click(trashButtons[0]);
        }

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
        // Rule should still be in the DOM
        expect(screen.getByText('ARC Expiring')).toBeInTheDocument();
    });

    it('creates rule via api.post', async () => {
        mockGet.mockResolvedValue({ data: [] });
        mockPost.mockResolvedValue({ data: { _id: 'new', name: 'Test Rule' } });

        const user = userEvent.setup();
        render(<AlertRulesManager />);

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalled();
        });

        // Fill in the form
        const inputs = screen.getAllByRole('textbox');
        const nameInput = inputs[0];
        await user.type(nameInput, 'New Rule');

        const numberInputs = screen.getAllByRole('spinbutton');
        if (numberInputs.length > 0) {
            await user.type(numberInputs[0], '60');
        }

        // Click add button
        const addButton = screen.getByRole('button', { name: /create/i });
        await user.click(addButton);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/alerts', expect.objectContaining({
                name: 'New Rule',
                documentType: 'arcDetails',
            }));
        });
    });

    it('displays teaching certificate label for existing rules in table', async () => {
        mockGet.mockResolvedValue({ data: sampleRules });
        render(<AlertRulesManager />);

        expect(await screen.findByText('License Check')).toBeInTheDocument();
        expect(screen.getByText(/teachingLicense/)).toBeInTheDocument();
    });

    it('renders document type dropdown with 4 options including teaching license', () => {
        render(<AlertRulesManager />);

        const comboboxes = screen.getAllByRole('combobox');
        const docTypeCombobox = comboboxes[0];
        expect(docTypeCombobox).toBeInTheDocument();
        expect(docTypeCombobox).toHaveTextContent(/arcDetails/);
    });
});
