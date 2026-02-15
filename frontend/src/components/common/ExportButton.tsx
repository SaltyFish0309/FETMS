import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportButtonProps {
    onExportCSV: () => void;
    onExportPDF?: () => void;
    label?: string;
    isLoading?: boolean;
}

export function ExportButton({
    onExportCSV,
    onExportPDF,
    label = 'Export',
    isLoading = false,
}: ExportButtonProps) {
    const [open, setOpen] = useState(false);

    const handleExportCSV = () => {
        onExportCSV();
        setOpen(false);
    };

    const handleExportPDF = () => {
        if (onExportPDF) {
            onExportPDF();
            setOpen(false);
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading}>
                    <Download className="mr-2 h-4 w-4" />
                    {label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
                {onExportPDF && (
                    <DropdownMenuItem onClick={handleExportPDF}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export as PDF
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
