import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailNotificationService, NotFoundError } from '../EmailNotificationService.js';

vi.mock('../../models/EmailTemplate.js', () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock('../../models/EmailLog.js', () => ({
  default: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('../EmailService.js', () => ({
  EmailService: {
    renderTemplate: vi.fn((template: string, vars: Record<string, string>) => {
      return template.replace(/\{\{(\w+)\}\}/g, (_m, k: string) => vars[k] ?? `{{${k}}}`);
    }),
    sendBulkEmails: vi.fn(),
  },
}));

import EmailTemplate from '../../models/EmailTemplate.js';
import EmailLog from '../../models/EmailLog.js';
import { EmailService } from '../EmailService.js';

const mockTemplate = {
  _id: '64b0000000000000000000aa',
  subject: 'Hello {{teacherName}}',
  body: '<p>Dear {{teacherName}}</p>',
};

const mockRecipients = [
  { email: 'a@test.com', name: 'Alice', teacherId: 'teacher1', variables: { teacherName: 'Alice' } },
  { email: 'b@test.com', name: 'Bob', teacherId: 'teacher2', variables: { teacherName: 'Bob' } },
];

describe('EmailNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('preview', () => {
    it('returns rendered subject and body for each recipient without sending', async () => {
      vi.mocked(EmailTemplate.findById).mockResolvedValue(mockTemplate as any);

      const result = await EmailNotificationService.preview(
        '64b0000000000000000000aa',
        mockRecipients
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        email: 'a@test.com',
        subject: 'Hello Alice',
        body: '<p>Dear Alice</p>',
      });
      expect(result[1]).toMatchObject({
        email: 'b@test.com',
        subject: 'Hello Bob',
        body: '<p>Dear Bob</p>',
      });
      expect(EmailService.sendBulkEmails).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when template does not exist', async () => {
      vi.mocked(EmailTemplate.findById).mockResolvedValue(null);

      await expect(
        EmailNotificationService.preview('nonexistent', mockRecipients)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('send', () => {
    it('delegates to EmailService.sendBulkEmails with template subject/body and returns stats', async () => {
      vi.mocked(EmailTemplate.findById).mockResolvedValue(mockTemplate as any);
      vi.mocked(EmailService.sendBulkEmails).mockResolvedValue({ sent: 2, failed: 0 });

      const result = await EmailNotificationService.send({
        templateId: '64b0000000000000000000aa',
        recipients: mockRecipients,
        triggeredBy: 'manual',
      });

      expect(result).toEqual({ sent: 2, failed: 0 });
      expect(EmailService.sendBulkEmails).toHaveBeenCalledOnce();
      const callArg = vi.mocked(EmailService.sendBulkEmails).mock.calls[0][0];
      expect(callArg).toMatchObject({
        subject: mockTemplate.subject,
        body: mockTemplate.body,
        triggeredBy: 'manual',
        templateId: '64b0000000000000000000aa',
      });
    });

    it('returns partial stats when some recipients fail', async () => {
      vi.mocked(EmailTemplate.findById).mockResolvedValue(mockTemplate as any);
      vi.mocked(EmailService.sendBulkEmails).mockResolvedValue({ sent: 1, failed: 1 });

      const result = await EmailNotificationService.send({
        templateId: '64b0000000000000000000aa',
        recipients: mockRecipients,
        triggeredBy: 'manual',
      });

      expect(result.sent).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('throws NotFoundError when template does not exist', async () => {
      vi.mocked(EmailTemplate.findById).mockResolvedValue(null);

      await expect(
        EmailNotificationService.send({
          templateId: 'nonexistent',
          recipients: mockRecipients,
          triggeredBy: 'manual',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getHistory', () => {
    it('returns logs sorted by date descending with total count', async () => {
      const mockLogs = [
        { _id: 'log2', sentAt: new Date('2024-02-01') },
        { _id: 'log1', sentAt: new Date('2024-01-01') },
      ];

      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockLogs),
      };
      vi.mocked(EmailLog.find).mockReturnValue(mockQuery as any);
      vi.mocked(EmailLog.countDocuments).mockResolvedValue(2);

      const result = await EmailNotificationService.getHistory({ page: 1, limit: 10 });

      expect(result.logs).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockQuery.sort).toHaveBeenCalledWith({ sentAt: -1 });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });

    it('applies correct skip offset for page 2', async () => {
      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(EmailLog.find).mockReturnValue(mockQuery as any);
      vi.mocked(EmailLog.countDocuments).mockResolvedValue(0);

      await EmailNotificationService.getHistory({ page: 2, limit: 5 });

      expect(mockQuery.skip).toHaveBeenCalledWith(5);
    });
  });
});
