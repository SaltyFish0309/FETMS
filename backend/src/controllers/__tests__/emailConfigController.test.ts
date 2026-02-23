import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

process.env.EMAIL_ENCRYPTION_KEY = 'a'.repeat(64);
process.env.FRONTEND_ORIGIN = 'http://localhost:5173';

vi.mock('../../services/EmailConfigService.js', () => ({
  EmailConfigService: {
    saveCredentials: vi.fn(),
    getStatus: vi.fn(),
    getAuthUrl: vi.fn(),
    handleCallback: vi.fn(),
    disconnect: vi.fn(),
  },
}));

import { EmailConfigService } from '../../services/EmailConfigService.js';
import { EmailNotConfiguredError } from '../../errors.js';
import emailConfigRoutes from '../../routes/emailConfigRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/email-config', emailConfigRoutes);

describe('EmailConfig API — HTTP behavior', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /api/email-config — status endpoint', () => {
    it('returns current connection status with 200', async () => {
      vi.mocked(EmailConfigService.getStatus).mockResolvedValue({
        configured: true, connected: true, connectedEmail: 'admin@gmail.com',
      });
      const res = await request(app).get('/api/email-config');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ configured: true, connected: true, connectedEmail: 'admin@gmail.com' });
    });
  });

  describe('POST /api/email-config — save credentials', () => {
    it('rejects incomplete input with 400 before touching the service', async () => {
      const res = await request(app).post('/api/email-config').send({ clientId: 'only-id' });
      expect(res.status).toBe(400);
      expect(EmailConfigService.saveCredentials).not.toHaveBeenCalled();
    });

    it('saves credentials and returns 200 on valid input', async () => {
      vi.mocked(EmailConfigService.saveCredentials).mockResolvedValue();
      const res = await request(app)
        .post('/api/email-config')
        .send({ clientId: 'my-client', clientSecret: 'my-secret' });
      expect(res.status).toBe(200);
      expect(EmailConfigService.saveCredentials).toHaveBeenCalledWith('my-client', 'my-secret');
    });
  });

  describe('GET /api/email-config/auth-url — OAuth redirect URL', () => {
    it('returns the Google OAuth URL', async () => {
      vi.mocked(EmailConfigService.getAuthUrl).mockResolvedValue('https://accounts.google.com/mock');
      const res = await request(app).get('/api/email-config/auth-url');
      expect(res.status).toBe(200);
      expect(res.body.url).toBe('https://accounts.google.com/mock');
    });

    it('returns 503 when email is not configured yet', async () => {
      vi.mocked(EmailConfigService.getAuthUrl).mockRejectedValue(
        new EmailNotConfiguredError()
      );
      const res = await request(app).get('/api/email-config/auth-url');
      expect(res.status).toBe(503);
    });
  });

  describe('GET /api/email-config/callback — OAuth callback', () => {
    it('redirects to /settings?email=connected on successful token exchange', async () => {
      vi.mocked(EmailConfigService.handleCallback).mockResolvedValue();
      const res = await request(app).get('/api/email-config/callback?code=auth-code&state=csrf-state');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('/settings?email=connected');
    });

    it('passes both code and state to the service', async () => {
      vi.mocked(EmailConfigService.handleCallback).mockResolvedValue();
      await request(app).get('/api/email-config/callback?code=my-code&state=my-state');
      expect(EmailConfigService.handleCallback).toHaveBeenCalledWith('my-code', 'my-state');
    });

    it('redirects to /settings?email=error when token exchange fails', async () => {
      vi.mocked(EmailConfigService.handleCallback).mockRejectedValue(new Error('token error'));
      const res = await request(app).get('/api/email-config/callback?code=bad-code&state=csrf-state');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('/settings?email=error');
    });

    it('returns 400 when code or state query parameter is missing', async () => {
      const res = await request(app).get('/api/email-config/callback?code=only-code');
      expect(res.status).toBe(400);
    });

    it('returns 400 when both code and state are missing', async () => {
      const res = await request(app).get('/api/email-config/callback');
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/email-config — disconnect', () => {
    it('disconnects and returns 200', async () => {
      vi.mocked(EmailConfigService.disconnect).mockResolvedValue();
      const res = await request(app).delete('/api/email-config');
      expect(res.status).toBe(200);
      expect(EmailConfigService.disconnect).toHaveBeenCalledOnce();
    });
  });
});
