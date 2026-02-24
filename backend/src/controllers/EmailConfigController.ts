import { Request, Response } from 'express';
import { z } from 'zod';
import { EmailConfigService } from '../services/EmailConfigService.js';
import { EmailNotConfiguredError } from '../errors.js';

const saveCredentialsSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
});

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

export class EmailConfigController {
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await EmailConfigService.getStatus();
      res.json(status);
    } catch {
      res.status(500).json({ message: 'Error fetching email config status' });
    }
  }

  static async saveCredentials(req: Request, res: Response): Promise<void> {
    const parsed = saveCredentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'clientId and clientSecret are required', errors: parsed.error.errors });
      return;
    }
    try {
      await EmailConfigService.saveCredentials(parsed.data.clientId, parsed.data.clientSecret);
      res.json({ message: 'Credentials saved' });
    } catch {
      res.status(500).json({ message: 'Error saving credentials' });
    }
  }

  static async getAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const url = await EmailConfigService.getAuthUrl();
      res.json({ url });
    } catch (error) {
      if (error instanceof EmailNotConfiguredError) {
        res.status(503).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Error generating auth URL' });
    }
  }

  static async handleCallback(req: Request, res: Response): Promise<void> {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    if (!code || !state) {
      res.status(400).json({ message: 'Missing code or state parameter' });
      return;
    }
    try {
      await EmailConfigService.handleCallback(code, state);
      res.redirect(`${FRONTEND_ORIGIN}/settings/email-config?email=connected`);
    } catch {
      res.redirect(`${FRONTEND_ORIGIN}/settings/email-config?email=error`);
    }
  }

  static async disconnect(req: Request, res: Response): Promise<void> {
    try {
      await EmailConfigService.disconnect();
      res.json({ message: 'Disconnected' });
    } catch {
      res.status(500).json({ message: 'Error disconnecting' });
    }
  }
}
