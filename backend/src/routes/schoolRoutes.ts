import express from 'express';
import { SchoolController } from '../controllers/schoolController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Bulk Import
router.post('/import', upload.single('file'), SchoolController.importSchools);

// List (Search)
router.get('/', SchoolController.getAllSchools);

// Create
router.post('/', SchoolController.createSchool);

// Get by ID
router.get('/:id', SchoolController.getSchoolById);

// Update
router.put('/:id', SchoolController.updateSchool);

// Delete
router.delete('/:id', SchoolController.deleteSchool);

export default router;
