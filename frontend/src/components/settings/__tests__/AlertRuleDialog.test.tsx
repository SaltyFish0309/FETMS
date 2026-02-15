import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { AlertRuleDialog, type AlertRuleFormData } from '../AlertRuleDialog';

describe('AlertRuleDialog', () => {
    const defaultFormData: AlertRuleFormData = {
        name: '',
        documentType: 'arcDetails',
        conditionType: 'DAYS_REMAINING',
        value: '',
        isActive: true,
    };

    const renderDialog = (overrides?: Partial<AlertRuleFormData>) => {
        const onFormChange = vi.fn();
        const onSave = vi.fn();
        const onOpenChange = vi.fn();

        render(
            <AlertRuleDialog
                open={true}
                onOpenChange={onOpenChange}
                formData={{ ...defaultFormData, ...overrides }}
                onFormChange={onFormChange}
                onSave={onSave}
                isEditing={false}
            />
        );

        return { onFormChange, onSave, onOpenChange };
    };

    it('renders dialog with document type and condition comboboxes', () => {
        renderDialog();

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('alerts.dialog.fields.documentType.label')).toBeInTheDocument();

        const comboboxes = within(dialog).getAllByRole('combobox');
        expect(comboboxes.length).toBeGreaterThanOrEqual(2);
    });

    it('shows the correct document type when pre-selected as teachingLicense', () => {
        renderDialog({ documentType: 'teachingLicense' });

        const dialog = screen.getByRole('dialog');
        const comboboxes = within(dialog).getAllByRole('combobox');

        // The first combobox should show the teaching license translation key
        expect(comboboxes[0].textContent).toContain('teachingLicense');
    });

    it('shows the correct document type when pre-selected as workPermitDetails', () => {
        renderDialog({ documentType: 'workPermitDetails' });

        const dialog = screen.getByRole('dialog');
        const comboboxes = within(dialog).getAllByRole('combobox');
        expect(comboboxes[0].textContent).toContain('workPermitDetails');
    });

    it('shows the correct document type when pre-selected as passportDetails', () => {
        renderDialog({ documentType: 'passportDetails' });

        const dialog = screen.getByRole('dialog');
        const comboboxes = within(dialog).getAllByRole('combobox');
        expect(comboboxes[0].textContent).toContain('passportDetails');
    });
});
