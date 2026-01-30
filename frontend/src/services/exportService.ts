/**
 * Export Service - CSV/PDF export functionality
 * Following clean-code principles: SRP, DRY, KISS
 */

export interface ExportColumn {
    key: string;
    label: string;
}

/**
 * Get nested property value from object using dot notation
 * e.g., getNestedValue(obj, 'personalInfo.nationality.english')
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
        if (current === null || current === undefined) return undefined;
        return (current as Record<string, unknown>)[key];
    }, obj as unknown);
}

/**
 * Escape CSV value (wrap in quotes if contains comma, quote, or newline)
 */
function escapeCSVValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

export const exportService = {
    /**
     * Generate CSV string from data array
     */
    generateCSV(data: Record<string, unknown>[], columns: ExportColumn[]): string {
        const header = columns.map(col => col.label).join(',');

        if (data.length === 0) {
            return header + '\n';
        }

        const rows = data.map(item =>
            columns.map(col => escapeCSVValue(getNestedValue(item, col.key))).join(',')
        );

        return [header, ...rows].join('\n');
    },

    /**
     * Get predefined columns for teacher export
     */
    getTeacherExportColumns(): ExportColumn[] {
        return [
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'email', label: 'Email' },
            { key: 'personalInfo.nationality.english', label: 'Nationality' },
            { key: 'personalInfo.gender', label: 'Gender' },
            { key: 'personalInfo.hiringStatus', label: 'Hiring Status' },
            { key: 'education.degree', label: 'Degree' },
            { key: 'contractDetails.salary', label: 'Salary' },
        ];
    },

    /**
     * Download CSV content as file
     */
    downloadCSV(content: string, filename: string): void {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `${filename}.csv`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    },
};
