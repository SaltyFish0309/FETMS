import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExportButton } from '../ExportButton';

describe('ExportButton', () => {
    const mockOnExportCSV = vi.fn();
    const mockOnExportPDF = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render export button with default label', () => {
            render(<ExportButton onExportCSV={mockOnExportCSV} />);

            expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
        });

        it('should render with custom label', () => {
            render(<ExportButton onExportCSV={mockOnExportCSV} label="Download Data" />);

            expect(screen.getByRole('button', { name: /download data/i })).toBeInTheDocument();
        });

        it('should disable button when isLoading is true', () => {
            render(<ExportButton onExportCSV={mockOnExportCSV} isLoading />);

            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('should enable button when isLoading is false', () => {
            render(<ExportButton onExportCSV={mockOnExportCSV} isLoading={false} />);

            expect(screen.getByRole('button')).not.toBeDisabled();
        });
    });

    describe('Props', () => {
        it('should accept onExportCSV callback', () => {
            expect(() => render(<ExportButton onExportCSV={mockOnExportCSV} />)).not.toThrow();
        });

        it('should accept optional onExportPDF callback', () => {
            expect(() => render(
                <ExportButton onExportCSV={mockOnExportCSV} onExportPDF={mockOnExportPDF} />
            )).not.toThrow();
        });
    });
});
