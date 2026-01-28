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
import { useImportTeacher } from './import/useImportTeacher';

interface ImportTeachersDialogProps {
    onSuccess: () => void;
}

export function ImportTeachersDialog({ onSuccess }: ImportTeachersDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const {
        file,
        isUploading,
        uploadResult,
        validationError,
        handleDownloadTemplate,
        handleFileChange,
        handleUpload,
        resetState
    } = useImportTeacher(onSuccess);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) resetState();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Upload className="h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Import Teachers</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to bulk import teacher profiles.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Template Download Section */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                CSV Template
                            </h4>
                            <p className="text-xs text-muted-foreground">
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
                                    <div className="mt-2 text-xs max-h-32 overflow-y-auto bg-card/50 p-2 rounded">
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
