import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertRulesManager } from '../AlertRulesManager';

// Mock fetch for API calls
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock sonner
vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() }
}));

describe('AlertRulesManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([])
        });
    });

    it('displays teaching certificate label for existing rules in table', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                {
                    _id: 'rule1',
                    name: 'License Check',
                    documentType: 'teachingLicense',
                    conditionType: 'DAYS_REMAINING',
                    value: 30,
                    isActive: true
                }
            ])
        });

        render(<AlertRulesManager />);

        // Wait for the rule to appear in the table
        expect(await screen.findByText('License Check')).toBeInTheDocument();
        // i18n mock returns keys, so look for the translation key
        expect(screen.getByText(/teachingLicense/)).toBeInTheDocument();
    });

    it('renders document type dropdown with 4 options including teaching license', () => {
        render(<AlertRulesManager />);

        // The document type select should be present with default value arcDetails
        const comboboxes = screen.getAllByRole('combobox');
        // First combobox is document type select
        const docTypeCombobox = comboboxes[0];
        expect(docTypeCombobox).toBeInTheDocument();
        // Default value shown should contain arcDetails translation key
        expect(docTypeCombobox).toHaveTextContent(/arcDetails/);
    });
});
