import { Request, Response } from 'express';
import { z } from 'zod';
import {
  EmailNotificationService,
  NotFoundError,
} from '../services/EmailNotificationService.js';

const recipientSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  teacherId: z.string().optional(),
  schoolId: z.string().optional(),
  variables: z.record(z.string(), z.string()),
});

const previewBodySchema = z.object({
  templateId: z.string().min(1),
  recipients: z.array(recipientSchema).min(1).max(200),
});

const sendBodySchema = z.object({
  templateId: z.string().min(1),
  recipients: z.array(recipientSchema).min(1).max(200),
  triggeredBy: z.enum(['manual', 'alert']),
  alertRuleId: z.string().optional(),
});

export class EmailController {
  static async preview(req: Request, res: Response): Promise<void> {
    const parsed = previewBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request body', errors: parsed.error.errors });
      return;
    }
    try {
      const { templateId, recipients } = parsed.data;
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
    const parsed = sendBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request body', errors: parsed.error.errors });
      return;
    }
    try {
      const result = await EmailNotificationService.send(parsed.data);
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
      const rawPage = parseInt(String(req.query.page ?? '1'), 10);
      const rawLimit = parseInt(String(req.query.limit ?? '20'), 10);
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;
      const result = await EmailNotificationService.getHistory({ page, limit });
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Error fetching email history' });
    }
  }
}
