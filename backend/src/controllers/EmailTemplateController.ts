import { Request, Response } from 'express';
import {
  EmailTemplateService,
  DuplicateNameError,
  NotFoundError,
  TemplateInUseError,
} from '../services/EmailTemplateService.js';

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
    try {
      const template = await EmailTemplateService.create(req.body);
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
    try {
      const { id } = req.params;
      const template = await EmailTemplateService.update(id, req.body);
      res.json(template);
    } catch (error) {
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
