import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlertEmailService } from '../AlertEmailService.js';

vi.mock('../../models/AlertRule.js', () => ({
  default: {
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('../../models/EmailTemplate.js', () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock('../../models/EmailLog.js', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../models/Teacher.js', () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock('../EmailService.js', () => ({
  EmailService: {
    sendBulkEmails: vi.fn(),
  },
}));

import AlertRule from '../../models/AlertRule.js';
import EmailTemplate from '../../models/EmailTemplate.js';
import EmailLog from '../../models/EmailLog.js';
import Teacher from '../../models/Teacher.js';
import { EmailService } from '../EmailService.js';

const mockRule = {
  _id: 'rule1',
  name: 'Work Permit Expiry',
  documentType: 'workPermitDetails',
  conditionType: 'DAYS_REMAINING',
  value: 30,
  isActive: true,
  emailEnabled: true,
  emailTemplateId: 'template1',
};

const mockTemplate = {
  _id: 'template1',
  subject: 'Expiry Notice for {{teacherName}}',
  body: '<p>Dear {{teacherName}}, your document expires soon.</p>',
};

const mockTeachers = [
  {
    _id: 'teacher1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@test.com',
    workPermitDetails: { expiryDate: new Date(Date.now() + 10 * 86400000) },
  },
  {
    _id: 'teacher2',
    firstName: 'Bob',
    lastName: 'Jones',
    email: 'bob@test.com',
    workPermitDetails: { expiryDate: new Date(Date.now() + 20 * 86400000) },
  },
];

describe('AlertEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runScheduledAlerts', () => {
    it('skips rules where emailEnabled is false', async () => {
      const disabledRule = { ...mockRule, emailEnabled: false };
      vi.mocked(AlertRule.find).mockResolvedValue([disabledRule] as any);

      await AlertEmailService.runScheduledAlerts();

      expect(EmailService.sendBulkEmails).not.toHaveBeenCalled();
    });

    it('skips and logs error when emailTemplateId has no matching template', async () => {
      vi.mocked(AlertRule.find).mockResolvedValue([mockRule] as any);
      vi.mocked(EmailTemplate.findById).mockResolvedValue(null);

      // Should not throw - gracefully skips
      await expect(AlertEmailService.runScheduledAlerts()).resolves.toBeUndefined();
      expect(EmailService.sendBulkEmails).not.toHaveBeenCalled();
    });

    it('sends emails only to teachers who have not received one today for this rule', async () => {
      vi.mocked(AlertRule.find).mockResolvedValue([mockRule] as any);
      vi.mocked(EmailTemplate.findById).mockResolvedValue(mockTemplate as any);
      vi.mocked(Teacher.find).mockResolvedValue(mockTeachers as any);

      // teacher1 already received email today, teacher2 has not
      vi.mocked(EmailLog.findOne)
        .mockResolvedValueOnce({ _id: 'existingLog' } as any) // teacher1 deduped
        .mockResolvedValueOnce(null);                          // teacher2 gets email

      vi.mocked(EmailService.sendBulkEmails).mockResolvedValue({ sent: 1, failed: 0 });
      vi.mocked(AlertRule.findByIdAndUpdate).mockResolvedValue({} as any);

      await AlertEmailService.runScheduledAlerts();

      expect(EmailService.sendBulkEmails).toHaveBeenCalledOnce();
      const callArg = vi.mocked(EmailService.sendBulkEmails).mock.calls[0][0];
      expect(callArg.recipients).toHaveLength(1);
      expect(callArg.recipients[0].email).toBe('bob@test.com');
    });

    it('does not call sendBulkEmails when all recipients are deduped', async () => {
      vi.mocked(AlertRule.find).mockResolvedValue([mockRule] as any);
      vi.mocked(EmailTemplate.findById).mockResolvedValue(mockTemplate as any);
      vi.mocked(Teacher.find).mockResolvedValue(mockTeachers as any);

      // Both teachers already received email today
      vi.mocked(EmailLog.findOne).mockResolvedValue({ _id: 'existingLog' } as any);

      await AlertEmailService.runScheduledAlerts();

      expect(EmailService.sendBulkEmails).not.toHaveBeenCalled();
    });

    it('updates lastTriggeredAt after sending emails', async () => {
      vi.mocked(AlertRule.find).mockResolvedValue([mockRule] as any);
      vi.mocked(EmailTemplate.findById).mockResolvedValue(mockTemplate as any);
      vi.mocked(Teacher.find).mockResolvedValue([mockTeachers[0]] as any);
      vi.mocked(EmailLog.findOne).mockResolvedValue(null);
      vi.mocked(EmailService.sendBulkEmails).mockResolvedValue({ sent: 1, failed: 0 });
      vi.mocked(AlertRule.findByIdAndUpdate).mockResolvedValue({} as any);

      await AlertEmailService.runScheduledAlerts();

      expect(AlertRule.findByIdAndUpdate).toHaveBeenCalledWith(
        'rule1',
        expect.objectContaining({ lastTriggeredAt: expect.any(Date) })
      );
    });
  });
});
