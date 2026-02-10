import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ExpiryWidget } from '../ExpiryWidget';
import type { DashboardStats, ExpiryAlert } from '@/services/statsService';

const makeAlert = (overrides: Partial<ExpiryAlert> = {}): ExpiryAlert => ({
    teacherId: 't1',
    firstName: 'John',
    lastName: 'Doe',
    expiryDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    ruleName: 'Test Rule',
    ...overrides
});

const emptyExpiry: DashboardStats['expiry'] = {
    arc: [],
    workPermit: [],
    passport: [],
    teachingLicense: [],
    other: []
};

const renderWidget = (data: DashboardStats['expiry'] = emptyExpiry) =>
    render(
        <BrowserRouter>
            <ExpiryWidget data={data} />
        </BrowserRouter>
    );

describe('ExpiryWidget', () => {
    it('renders all four document type tabs', () => {
        renderWidget();

        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(4);
        // i18n mock returns keys: arc, workPermit, passport, teachingCertificate
        expect(tabs[0]).toHaveTextContent(/arc/i);
        expect(tabs[1]).toHaveTextContent(/workPermit/i);
        expect(tabs[2]).toHaveTextContent(/passport/i);
        expect(tabs[3]).toHaveTextContent(/teachingCertificate/i);
    });

    it('shows correct count on teaching certificate tab', () => {
        const data: DashboardStats['expiry'] = {
            ...emptyExpiry,
            teachingLicense: [makeAlert(), makeAlert({ teacherId: 't2', firstName: 'Jane' })]
        };
        renderWidget(data);

        const tabs = screen.getAllByRole('tab');
        expect(tabs[3]).toHaveTextContent('(2)');
    });

    it('displays teaching certificate alert items when tab is clicked', async () => {
        const user = userEvent.setup();
        const data: DashboardStats['expiry'] = {
            ...emptyExpiry,
            teachingLicense: [makeAlert({ firstName: 'Alice', lastName: 'Wong' })]
        };
        renderWidget(data);

        const tabs = screen.getAllByRole('tab');
        await user.click(tabs[3]);

        expect(screen.getByText('Alice Wong')).toBeInTheDocument();
    });

    it('shows empty state when no teaching certificate alerts', async () => {
        const user = userEvent.setup();
        renderWidget();

        const tabs = screen.getAllByRole('tab');
        await user.click(tabs[3]);

        // i18n key for empty state
        expect(screen.getByText(/noExpiries/i)).toBeInTheDocument();
    });
});
