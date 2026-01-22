import { useState } from 'react';

const REQUIRED_HEADERS = [
    "firstName", "middleName", "lastName", "email",
    "personalInfo.chineseName", "personalInfo.englishName", "personalInfo.serviceSchool",
    "personalInfo.nationality.chinese", "personalInfo.nationality.english",
    "personalInfo.phone", "personalInfo.dob", "personalInfo.gender",
    "personalInfo.address.taiwan", "personalInfo.address.home", "personalInfo.hiringStatus",
    "emergencyContact.name", "emergencyContact.relationship", "emergencyContact.phone", "emergencyContact.email",
    "passportDetails.number", "passportDetails.expiryDate", "passportDetails.issuingCountry", "passportDetails.issuingAuthority", "passportDetails.issueDate",
    "education.degree", "education.major", "education.school",
    "teachingLicense.expiryDate", "criminalRecord.issueDate",
    "workPermitDetails.issueDate", "workPermitDetails.expiryDate", "workPermitDetails.startDate", "workPermitDetails.permitNumber",
    "contractDetails.contractStartDate", "contractDetails.contractEndDate", "contractDetails.payStartDate", "contractDetails.payEndDate",
    "contractDetails.senioritySalary", "contractDetails.seniorityLeave", "contractDetails.salary",
    "contractDetails.hasSalaryIncrease", "contractDetails.salaryIncreaseDate", "contractDetails.estimatedPromotedSalary",
    "arcDetails.expiryDate", "arcDetails.purpose"
];

export const useImportTeacher = (onSuccess: () => void) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleDownloadTemplate = () => {
        const headers = REQUIRED_HEADERS.join(',');
        const exampleRow = [
            "John", "Quincy", "Doe", "john.doe@example.com",
            "王大明", "John Doe", "Taipei First Girls High School", "美國", "USA", "0912345678", "1990-01-01", "Male", "Taipei City", "New York, USA", "Newly Hired",
            "Jane Doe", "Spouse", "0987654321", "jane@example.com",
            "A12345678", "2030-01-01", "USA", "US Dept of State", "2020-01-01",
            "Master", "Education", "Harvard University",
            "2025-01-01", "2023-01-01",
            "2023-08-01", "2024-07-31", "2023-08-01", "WP123456",
            "2023-08-01", "2024-07-31", "2023-08-01", "2024-07-31", "Level 1", "7 days", "65000", "FALSE", "", "",
            "2024-07-31", "Employed"
        ].map(value => `"${value}"`).join(',');

        const csvContent = "\uFEFF" + headers + "\n" + exampleRow;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'teacher_import_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const validateFile = (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!file.name.endsWith('.csv')) {
                reject("Invalid file type. Please upload a .csv file.");
                return;
            }
            if (file.size === 0) {
                reject("The file is empty.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const firstLine = text.split('\n')[0].trim();
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
            } catch (error: any) {
                setValidationError(error);
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
            const response = await fetch('http://localhost:5000/api/teachers/import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setUploadResult({
                    success: true,
                    message: `Successfully imported ${data.count} teachers!`,
                });
                onSuccess();
            } else {
                setUploadResult({
                    success: false,
                    message: data.message || 'Upload failed',
                    details: data.writeErrors || data.error
                });
            }
        } catch (error) {
            setUploadResult({
                success: false,
                message: 'Network error or server is down.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setUploadResult(null);
        setValidationError(null);
        setIsUploading(false);
    };

    return {
        file,
        isUploading,
        uploadResult,
        validationError,
        handleDownloadTemplate,
        handleFileChange,
        handleUpload,
        resetState
    };
};
