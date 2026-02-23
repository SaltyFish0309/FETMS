import express from 'express';
import { EmailConfigController } from '../controllers/EmailConfigController.js';

const router = express.Router();

router.get('/auth-url', EmailConfigController.getAuthUrl);
router.get('/callback', EmailConfigController.handleCallback);
router.get('/', EmailConfigController.getStatus);
router.post('/', EmailConfigController.saveCredentials);
router.delete('/', EmailConfigController.disconnect);

export default router;
