import { Request, Response } from 'express';
import { StatsService } from '../services/statsService.js';

export class StatsController {
    static async getDashboardStats(req: Request, res: Response) {
        try {
            const data = await StatsService.getDashboardStats(req.query as Record<string, string | undefined>);
            res.json(data);
        } catch (error) {
            console.error('Stats Error:', error);
            res.status(500).json({ message: 'Server Error fetching stats', error });
        }
    }
}
