import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileUp, CheckCircle, AlertCircle, Loader2, Download, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ImportSchoolsDialogProps {
    onSuccess: () => void;
}

const REQUIRED_HEADERS = [
    "name.chinese",
    "name.english",
    "address.chinese",
    "address.english",
    "principal.chineseName",
    "principal.englishName",
    "contact.name",
    "contact.position",
    "contact.email",
    "contact.phone"
];

export function ImportSchoolsDialog({ onSuccess }: ImportSchoolsDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; details?: unknown } | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleDownloadTemplate = () => {
        const headers = REQUIRED_HEADERS.join(',');
        // Example row with dummy data matching the headers
        const exampleRow = [
            "新北市立忠孝國民中學", "New Taipei Municipal Zhong Xiao Junior High School",
            "220067 新北市板橋區重慶路168號", "No. 168, Chongqing Rd., Banqiao Dist., New Taipei City 220067, Taiwan (R.O.C.)",
            "陳秀標", "CHEN,SIOU-BIAO",
            "白莉芳", "教務主任", "chjscurr@chjs.ntpc.edu.tw", "02-29631350"
        ].map(value => `"${value}"`).join(',');

        const csvContent = "\uFEFF" + headers + "\n" + exampleRow; // Add BOM for Excel compatibility
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'school_import_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const validateFile = (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            // 1. File Type Check
            if (!file.name.endsWith('.csv')) {
                reject("Invalid file type. Please upload a .csv file.");
                return;
            }

            // 2. Empty File Check
            if (file.size === 0) {
                reject("The file is empty.");
                return;
            }

            // 3. Header Validation
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const firstLine = text.split('\n')[0].trim();
                // Remove BOM if present
                const cleanFirstLine = firstLine.replace(/^\ufeff/, '');
                const headers = cleanFirstLine.split(',').map(h => h.trim());

                const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    reject(`Invalid CSV headers. Missing: ${missingHeaders.join(', ')}`);
                } else {
                    resolve();
                }
            };
            reader.onerror = () => reject("Failed to read file.");
            reader.readAsText(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setValidationError(null);
        setUploadResult(null);
        setFile(null);

        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            try {
                await validateFile(selectedFile);
                setFile(selectedFile);
            } catch (error: unknown) {
                setValidationError(error instanceof Error ? error.message : String(error));
                // Reset input
                e.target.value = '';
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/api/schools/import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setUploadResult({
                    success: true,
                    message: `Successfully imported ${data.count} schools!`,
                });
                onSuccess();
            } else {
                setUploadResult({
                    success: false,
                    message: data.message || 'Upload failed',
                    details: data.writeErrors || data.error
                });
            }
        } catch {
            setUploadResult({
                success: false,
                message: 'Network error or server is down.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Import Schools</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to bulk import schools.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Template Download Section */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                CSV Template
                            </h4>
                            <p className="text-xs text-slate-500">
                                Download the required format to avoid errors.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                            <Download className="h-3 w-3" />
                            Download Template
                        </Button>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="csv-file">Upload CSV</Label>
                        <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                        {validationError && (
                            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {validationError}
                            </p>
                        )}
                    </div>

                    {uploadResult && (
                        <Alert variant={uploadResult.success ? "default" : "destructive"} className={uploadResult.success ? "border-green-500 text-green-700 bg-green-50" : ""}>
                            {uploadResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{uploadResult.success ? "Success" : "Error"}</AlertTitle>
                            <AlertDescription>
                                {uploadResult.message}
                                {uploadResult.details ? (
                                    <div className="mt-2 text-xs max-h-32 overflow-y-auto bg-white/50 p-2 rounded">
                                        <pre>{JSON.stringify(uploadResult.details as object, null, 2)}</pre>
                                    </div>
                                ) : null}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <FileUp className="mr-2 h-4 w-4" />
                                Upload
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
