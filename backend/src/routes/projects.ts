import express from 'express';
import { ProjectController } from '../controllers/projectController.js';

const router = express.Router();

router.get('/', ProjectController.getAllProjects);
router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProjectById);
router.put('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);
router.put('/:id/restore', ProjectController.restoreProject);
router.delete('/:id/permanent', ProjectController.hardDeleteProject);

export default router;
