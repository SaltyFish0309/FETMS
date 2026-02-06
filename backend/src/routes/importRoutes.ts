import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import Teacher from '../models/Teacher.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Helper to unflatten dot-notation keys
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unflatten = (data: Record<string, unknown>): Record<string, any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};
    for (const i in data) {
        const keys = i.split('.');
        keys.reduce((acc, value, index) => {
            if (index === keys.length - 1) {
                acc[value] = data[i];
            } else {
                acc[value] = acc[value] || {};
            }
            return acc[value];
        }, result);
    }
    return result;
};

router.post('/import', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results: Record<string, unknown>[] = [];

    fs.createReadStream(req.file.path)
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, '')
        }))
        .on('data', (data) => {
            // 1. Clean raw data first
            const cleanedRaw: Record<string, unknown> = {};
            Object.keys(data).forEach(key => {
                let value = data[key];

                // Remove currency symbols and commas from salary fields
                if (typeof value === 'string' && (value.includes('$') || value.includes(',')) && !isNaN(Number(value.replace(/[$,]/g, '')))) {
                    value = Number(value.replace(/[$,]/g, ''));
                }

                // Convert Booleans
                if (value === 'TRUE') value = true;
                if (value === 'FALSE') value = false;

                // Normalize Hiring Status
                if (key === 'personalInfo.hiringStatus' && value === 'Re-hired') {
                    value = 'Re-Hired';
                }

                if (value !== '') {
                    cleanedRaw[key] = value;
                }
            });

            // 2. Unflatten
            const structured = unflatten(cleanedRaw);
            results.push(structured);
        })
        .on('end', async () => {
            try {
                // 3. Bulk Insert
                const result = await Teacher.insertMany(results, { ordered: false, throwOnValidationError: true });

                // Clean up file
                fs.unlinkSync(req.file!.path);

                res.json({
                    message: 'Import successful',
                    count: result.length,
                    total: results.length
                });
            } catch (error: unknown) {
                // Clean up file
                if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

                const err = error as { name?: string; result?: { nInserted: number }; writeErrors?: Array<{ index: number; errmsg: string }>; errors?: unknown; message?: string };
                if (err.name === 'MongoBulkWriteError') {
                    res.status(207).json({
                        message: 'Partial import completed',
                        insertedCount: err.result?.nInserted,
                        writeErrors: err.writeErrors?.map((e) => ({
                            index: e.index,
                            message: e.errmsg
                        }))
                    });
                } else if (err.name === 'ValidationError') {
                    res.status(400).json({ message: 'Validation Error', details: err.errors });
                } else {
                    console.error('Import error:', error);
                    res.status(500).json({ message: 'Import failed', error: err.message });
                }
            }
        });
});

export default router;
