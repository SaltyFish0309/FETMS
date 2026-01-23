import express from 'express';
import { ProjectController } from '../controllers/projectController.js';

const router = express.Router();

router.get('/', ProjectController.getAllProjects);
router.post('/', ProjectController.createProject);

export default router;
