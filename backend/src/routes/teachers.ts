import express from 'express';
import { upload } from '../middleware/upload.js';
import { TeacherController } from '../controllers/teacherController.js';

const router = express.Router();

// Create a new Teacher
router.post('/', TeacherController.createTeacher);

// Get all Teachers
router.get('/', TeacherController.getAllTeachers);

// Pipeline Management (Must come before /:id to prevent matching issues if structure changes)
// Although /pipeline/reorder doesn't match /:id, good practice to keep specific routes first
router.put('/pipeline/reorder', TeacherController.reorderPipeline);

// Get Teacher by ID
router.get('/:id', TeacherController.getTeacherById);

// Update Teacher Profile
router.put('/:id', TeacherController.updateTeacher);

// Delete Teacher
router.delete('/:id', TeacherController.deleteTeacher);

// Avatar
router.post('/:id/avatar', upload.single('avatar'), TeacherController.uploadAvatar);
router.delete('/:id/avatar', TeacherController.deleteAvatar);

// Ad-hoc Documents
router.post('/:id/documents/adhoc', upload.single('file'), TeacherController.uploadAdHocDocument);
router.put('/:id/documents/adhoc/reorder', TeacherController.reorderAdHocDocuments);
router.put('/:id/documents/adhoc/:docId', upload.single('file'), TeacherController.updateAdHocDocument);
router.delete('/:id/documents/adhoc/:docId', TeacherController.deleteAdHocDocument); // fixed route path order in original logic? No, original was safe.

// Core Documents
router.post('/:id/documents/:type', upload.single('file'), TeacherController.uploadCoreDocument);
router.delete('/:id/documents/:type', TeacherController.deleteCoreDocument);

// Box Management
router.post('/:id/boxes', TeacherController.createBox);
router.put('/:id/boxes/reorder', TeacherController.reorderBoxes);
router.get('/:id/boxes/:boxId/download', TeacherController.downloadBox);
router.put('/:id/boxes/:boxId', TeacherController.updateBox);
router.delete('/:id/boxes/:boxId', TeacherController.deleteBox);

export default router;
