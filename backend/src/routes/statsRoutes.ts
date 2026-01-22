import express from 'express';
import { StatsController } from '../controllers/statsController.js';

const router = express.Router();

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get aggregated statistics for the dashboard
 * @access  Private
 */
router.get('/dashboard', StatsController.getDashboardStats);

export default router;
