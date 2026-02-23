import express from 'express';
import { EmailController } from '../controllers/EmailController.js';

const router = express.Router();

router.post('/preview', EmailController.preview);
router.post('/send', EmailController.send);
router.get('/history', EmailController.getHistory);

export default router;
