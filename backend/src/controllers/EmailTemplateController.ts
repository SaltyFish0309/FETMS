import { Request, Response } from 'express';
import { z } from 'zod';
import {
  EmailTemplateService,
  DuplicateNameError,
  NotFoundError,
  TemplateInUseError,
} from '../services/EmailTemplateService.js';

const createBodySchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1),
  body: z.string().min(1),
  variables: z.array(z.string()),
  isDefault: z.boolean().optional(),
});

const updateBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
});

export class EmailTemplateController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const templates = await EmailTemplateService.getAll();
      res.json(templates);
    } catch {
      res.status(500).json({ message: 'Error fetching email templates' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const parsed = createBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request body', errors: parsed.error.errors });
      return;
    }
    try {
      const template = await EmailTemplateService.create(parsed.data);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof DuplicateNameError) {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(400).json({ message: 'Error creating email template' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const parsed = updateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request body', errors: parsed.error.errors });
      return;
    }
    try {
      const { id } = req.params;
      const template = await EmailTemplateService.update(id, parsed.data);
      res.json(template);
    } catch (error) {
      if (error instanceof DuplicateNameError) {
        res.status(409).json({ message: error.message });
        return;
      }
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(400).json({ message: 'Error updating email template' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await EmailTemplateService.delete(id);
      res.json({ message: 'Email template deleted successfully' });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof TemplateInUseError) {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Error deleting email template' });
    }
  }
}
