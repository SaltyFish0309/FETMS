import { Request, Response } from 'express';
import { SchoolService } from '../services/schoolService.js';
import fs from 'fs';

export class SchoolController {

    static async getAllSchools(req: Request, res: Response) {
        try {
            const { search } = req.query;
            const schools = await SchoolService.getAllSchools(search as string);
            res.json(schools);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching schools', error });
        }
    }

    static async getSchoolById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'School ID is required' });
            const school = await SchoolService.getSchoolById(id);
            if (!school) {
                return res.status(404).json({ message: 'School not found' });
            }
            res.json(school);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching school details', error });
        }
    }

    static async createSchool(req: Request, res: Response) {
        try {
            const school = await SchoolService.createSchool(req.body);
            res.status(201).json(school);
        } catch (error) {
            res.status(400).json({ message: 'Error creating school', error });
        }
    }

    static async updateSchool(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'School ID is required' });
            const updatedSchool = await SchoolService.updateSchool(id, req.body);
            if (!updatedSchool) {
                return res.status(404).json({ message: 'School not found' });
            }
            res.json(updatedSchool);
        } catch (error) {
            res.status(400).json({ message: 'Error updating school', error });
        }
    }

    static async deleteSchool(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'School ID is required' });
            const success = await SchoolService.deleteSchool(id);
            if (!success) {
                return res.status(404).json({ message: 'School not found' });
            }
            res.json({ message: 'School deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting school', error });
        }
    }

    static async importSchools(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const result = await SchoolService.importSchools(req.file.path);

            // Clean up
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

            res.json({
                message: 'Import successful',
                ...result
            });
        } catch (error: any) {
            // Clean up on error
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

            if (error.name === 'MongoBulkWriteError') {
                res.status(207).json({
                    message: 'Partial import completed',
                    insertedCount: error.result.nInserted,
                    writeErrors: error.writeErrors.map((e: any) => ({
                        index: e.index,
                        message: e.errmsg
                    }))
                });
            } else if (error.name === 'ValidationError') {
                res.status(400).json({ message: 'Validation Error', details: error.errors });
            } else {
                console.error('Import error:', error);
                res.status(500).json({ message: 'Import failed', error: error.message });
            }
        }
    }
}
