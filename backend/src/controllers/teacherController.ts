import { Request, Response } from 'express';
import { TeacherService } from '../services/teacherService.js';

export class TeacherController {

    static async createTeacher(req: Request, res: Response) {
        try {
            const teacher = await TeacherService.createTeacher(req.body);
            res.status(201).json(teacher);
        } catch (error) {
            console.error('Error creating teacher:', error);
            res.status(400).json({ message: 'Error creating teacher', error });
        }
    }

    static async getAllTeachers(req: Request, res: Response) {
        try {
            const teachers = await TeacherService.getAllTeachers();
            res.json(teachers);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching teachers', error });
        }
    }

    static async getTeacherById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            const teacher = await TeacherService.getTeacherById(id);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.json(teacher);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching teacher', error });
        }
    }

    static async updateTeacher(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            const teacher = await TeacherService.updateTeacher(id, req.body);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.json(teacher);
        } catch (error) {
            console.error('Error updating teacher:', error);
            res.status(500).json({ message: 'Error updating teacher', error });
        }
    }

    static async deleteTeacher(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            const success = await TeacherService.deleteTeacher(id);
            if (!success) return res.status(404).json({ message: 'Teacher not found' });
            res.json({ message: 'Teacher deleted successfully' });
        } catch (error) {
            console.error('Error deleting teacher:', error);
            res.status(500).json({ message: 'Error deleting teacher', error });
        }
    }

    static async uploadAvatar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            const file = req.file;
            if (!file) return res.status(400).json({ message: 'No file uploaded' });

            const teacher = await TeacherService.uploadAvatar(id, file);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.json(teacher);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            res.status(500).json({ message: 'Error uploading avatar', error });
        }
    }

    static async deleteAvatar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            const teacher = await TeacherService.deleteAvatar(id);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.json(teacher);
        } catch (error) {
            console.error('Error deleting avatar:', error);
            res.status(500).json({ message: 'Error deleting avatar', error });
        }
    }

    static async uploadAdHocDocument(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            const { name } = req.body;
            const file = req.file;
            if (!file || !name) return res.status(400).json({ message: 'Name and File are required' });

            const teacher = await TeacherService.uploadAdHocDocument(id, name, file);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.json(teacher);
        } catch (error) {
            res.status(500).json({ message: 'Error uploading ad-hoc document', error });
        }
    }

    static async uploadCoreDocument(req: Request, res: Response) {
        try {
            const { id, type } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            if (!type || !['passport', 'arc', 'contract', 'workPermit'].includes(type)) {
                return res.status(400).json({ message: 'Invalid document type' });
            }

            const teacher = await TeacherService.uploadCoreDocument(id, type, req.file, req.body);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.json(teacher);
        } catch (error) {
            res.status(500).json({ message: 'Error uploading document', error });
        }
    }

    static async deleteCoreDocument(req: Request, res: Response) {
        try {
            const { id, type } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            if (!type || !['passport', 'arc', 'contract', 'workPermit'].includes(type)) {
                return res.status(400).json({ message: 'Invalid document type' });
            }

            const teacher = await TeacherService.deleteCoreDocument(id, type);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.json(teacher);
        } catch (error) {
            res.status(500).json({ message: 'Error deleting document', error });
        }
    }

    static async deleteAdHocDocument(req: Request, res: Response) {
        try {
            const { id, docId } = req.params;
            if (!id || !docId) return res.status(400).json({ message: 'Teacher ID and Document ID are required' });
            const teacher = await TeacherService.deleteAdHocDocument(id, docId);
            if (!teacher) return res.status(404).json({ message: 'Document or Teacher not found' });
            res.json(teacher);
        } catch (error) {
            console.error('Error deleting ad-hoc document:', error);
            res.status(500).json({ message: 'Error deleting ad-hoc document', error });
        }
    }

    static async reorderAdHocDocuments(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            const { documents } = req.body;
            if (!Array.isArray(documents)) return res.status(400).json({ message: 'Invalid data format' });

            const teacher = await TeacherService.reorderAdHocDocuments(id, documents);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.json(teacher);
        } catch (error) {
            res.status(500).json({ message: 'Error reordering documents', error });
        }
    }

    static async updateAdHocDocument(req: Request, res: Response) {
        try {
            const { id, docId } = req.params;
            if (!id || !docId) return res.status(400).json({ message: 'Teacher ID and Document ID are required' });
            const teacher = await TeacherService.updateAdHocDocument(id, docId, req.body.name, req.file);
            if (!teacher) return res.status(404).json({ message: 'Document or Teacher not found' });
            res.json(teacher);
        } catch (error) {
            console.error('Error updating ad-hoc document:', error);
            res.status(500).json({ message: 'Error updating ad-hoc document', error });
        }
    }

    static async createBox(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: 'Box name is required' });

            const teacher = await TeacherService.createBox(id, name);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.status(201).json(teacher);
        } catch (error) {
            res.status(500).json({ message: 'Error creating box', error });
        }
    }

    static async reorderBoxes(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'Teacher ID is required' });
            const { boxes } = req.body;
            if (!Array.isArray(boxes)) return res.status(400).json({ message: 'Invalid data format' });

            const teacher = await TeacherService.reorderBoxes(id, boxes);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.json(teacher);
        } catch (error) {
            res.status(500).json({ message: 'Error reordering boxes', error });
        }
    }

    static async updateBox(req: Request, res: Response) {
        try {
            const { id, boxId } = req.params;
            if (!id || !boxId) return res.status(400).json({ message: 'Teacher ID and Box ID are required' });
            const { name, order } = req.body;
            const teacher = await TeacherService.updateBox(id, boxId, name, order);
            if (!teacher) return res.status(404).json({ message: 'Box or Teacher not found' });
            res.json(teacher);
        } catch (error) {
            res.status(500).json({ message: 'Error updating box', error });
        }
    }

    static async deleteBox(req: Request, res: Response) {
        try {
            const { id, boxId } = req.params;
            if (!id || !boxId) return res.status(400).json({ message: 'Teacher ID and Box ID are required' });
            const teacher = await TeacherService.deleteBox(id, boxId);
            if (!teacher) return res.status(404).json({ message: 'Box or Teacher not found' });
            res.json(teacher);
        } catch (error) {
            console.error('Error deleting box:', error);
            res.status(500).json({ message: 'Error deleting box', error });
        }
    }

    static async downloadBox(req: Request, res: Response) {
        try {
            const { id, boxId } = req.params;
            if (!id || !boxId) return res.status(400).json({ message: 'Teacher ID and Box ID are required' });
            const result = await TeacherService.getBoxDownload(id, boxId);
            if (!result) return res.status(404).json({ message: 'Box not found or empty' });

            const { archive, filename } = result;
            res.attachment(filename);
            archive.pipe(res);
            await archive.finalize();
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({ message: 'Error downloading files' });
        }
    }

    static async reorderPipeline(req: Request, res: Response) {
        try {
            const { stage, teacherIds } = req.body;
            if (!stage || !Array.isArray(teacherIds)) return res.status(400).json({ message: 'Invalid data format' });

            await TeacherService.reorderPipeline(stage, teacherIds);
            res.json({ message: 'Pipeline updated successfully' });
        } catch (error) {
            console.error('Error reordering pipeline:', error);
            res.status(500).json({ message: 'Error reordering pipeline', error });
        }
    }
}
