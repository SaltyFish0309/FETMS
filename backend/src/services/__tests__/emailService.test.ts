import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '../EmailService.js';

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'mock-id' }),
    })),
  },
}));

// Mock EmailLog model
vi.mock('../../models/EmailLog.js', () => ({
  default: {
    create: vi.fn(),
  },
}));

import EmailLog from '../../models/EmailLog.js';

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renderTemplate', () => {
    it('replaces {{name}} placeholder with provided value', () => {
      const result = EmailService.renderTemplate('Dear {{name}}', { name: 'John' });
      expect(result).toBe('Dear John');
    });

    it('replaces multiple different placeholders', () => {
      const result = EmailService.renderTemplate(
        'Hello {{firstName}} {{lastName}}',
        { firstName: 'Jane', lastName: 'Doe' }
      );
      expect(result).toBe('Hello Jane Doe');
    });

    it('keeps original {{variable}} when key is missing from variables', () => {
      const result = EmailService.renderTemplate('Dear {{name}}', {});
      expect(result).toBe('Dear {{name}}');
    });

    it('escapes < and > characters in variable values to prevent XSS', () => {
      const result = EmailService.renderTemplate('Hello {{name}}', {
        name: '<script>alert("xss")</script>',
      });
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('escapes double quotes in variable values', () => {
      const result = EmailService.renderTemplate('Value: {{val}}', { val: '"quoted"' });
      expect(result).toContain('&quot;');
    });

    it('escapes single quotes in variable values', () => {
      const result = EmailService.renderTemplate('Value: {{val}}', { val: "it's" });
      expect(result).toContain('&#x27;');
    });
  });

  describe('sendBulkEmails', () => {
    const basePayload = {
      subject: 'Test Subject',
      body: 'Hello {{teacherName}}',
      triggeredBy: 'manual' as const,
      recipients: [
        {
          email: 'a@test.com',
          name: 'Alice',
          variables: { teacherName: 'Alice' },
        },
        {
          email: 'b@test.com',
          name: 'Bob',
          variables: { teacherName: 'Bob' },
        },
      ],
    };

    it('returns { sent, failed } statistics after sending', async () => {
      vi.mocked(EmailLog.create).mockResolvedValue({} as any);

      const result = await EmailService.sendBulkEmails(basePayload);

      expect(result).toEqual({ sent: 2, failed: 0 });
    });

    it('continues sending to remaining recipients when one fails', async () => {
      vi.mocked(EmailLog.create).mockResolvedValue({} as any);

      // Make nodemailer fail on the first call, succeed on the second
      const nodemailer = await import('nodemailer');
      const sendMailMock = vi.fn()
        .mockRejectedValueOnce(new Error('SMTP error'))
        .mockResolvedValueOnce({ messageId: 'ok' });
      vi.mocked(nodemailer.default.createTransport).mockReturnValue({
        sendMail: sendMailMock,
      } as any);

      const result = await EmailService.sendBulkEmails(basePayload);

      expect(result.sent).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('writes an EmailLog record after bulk send completes', async () => {
      vi.mocked(EmailLog.create).mockResolvedValue({} as any);

      await EmailService.sendBulkEmails(basePayload);

      expect(EmailLog.create).toHaveBeenCalledOnce();
      const logArg = vi.mocked(EmailLog.create).mock.calls[0][0] as Record<string, unknown>;
      expect(logArg).toMatchObject({
        subject: 'Test Subject',
        triggeredBy: 'manual',
        totalSent: 2,
        totalFailed: 0,
      });
    });

    it('records per-recipient status in the EmailLog', async () => {
      vi.mocked(EmailLog.create).mockResolvedValue({} as any);

      await EmailService.sendBulkEmails(basePayload);

      const logArg = vi.mocked(EmailLog.create).mock.calls[0][0] as Record<string, unknown>;
      const recipients = logArg.recipients as Array<{ email: string; status: string }>;
      expect(recipients).toHaveLength(2);
      expect(recipients[0]).toMatchObject({ email: 'a@test.com', status: 'sent' });
      expect(recipients[1]).toMatchObject({ email: 'b@test.com', status: 'sent' });
    });
  });
});
