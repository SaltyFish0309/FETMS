import { Request, Response } from 'express';
import {
  EmailNotificationService,
  NotFoundError,
} from '../services/EmailNotificationService.js';

export class EmailController {
  static async preview(req: Request, res: Response): Promise<void> {
    try {
      const { templateId, recipients } = req.body;
      if (!templateId || !Array.isArray(recipients)) {
        res.status(400).json({ message: 'templateId and recipients are required' });
        return;
      }
      const result = await EmailNotificationService.preview(templateId, recipients);
      res.json(result);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Error generating preview' });
    }
  }

  static async send(req: Request, res: Response): Promise<void> {
    try {
      const { templateId, recipients, triggeredBy, alertRuleId } = req.body;
      if (!templateId || !Array.isArray(recipients) || !triggeredBy) {
        res.status(400).json({ message: 'templateId, recipients, and triggeredBy are required' });
        return;
      }
      const result = await EmailNotificationService.send({
        templateId,
        recipients,
        triggeredBy,
        alertRuleId,
      });
      res.json(result);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Error sending emails' });
    }
  }

  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(String(req.query.page ?? '1'), 10);
      const limit = parseInt(String(req.query.limit ?? '20'), 10);
      const result = await EmailNotificationService.getHistory({ page, limit });
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Error fetching email history' });
    }
  }
}
