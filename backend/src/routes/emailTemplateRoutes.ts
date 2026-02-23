import express from 'express';
import { EmailTemplateController } from '../controllers/EmailTemplateController.js';

const router = express.Router();

router.get('/', EmailTemplateController.getAll);
router.post('/', EmailTemplateController.create);
router.put('/:id', EmailTemplateController.update);
router.delete('/:id', EmailTemplateController.delete);

export default router;
