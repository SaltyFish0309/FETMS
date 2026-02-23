import AlertRule from '../models/AlertRule.js';
import EmailTemplate from '../models/EmailTemplate.js';
import EmailLog from '../models/EmailLog.js';
import Teacher from '../models/Teacher.js';
import { EmailService } from './EmailService.js';

function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function getMatchingTeachers(rule: {
  documentType: string;
  conditionType: string;
  value: number | Date;
}) {
  const now = new Date();

  if (rule.conditionType === 'DAYS_REMAINING' && typeof rule.value === 'number') {
    const thresholdDate = new Date(now.getTime() + rule.value * 86400000);
    return Teacher.find({
      isDeleted: { $ne: true },
      [`${rule.documentType}.expiryDate`]: { $lte: thresholdDate, $gte: now },
    });
  }

  if (rule.conditionType === 'DATE_THRESHOLD') {
    return Teacher.find({
      isDeleted: { $ne: true },
      [`${rule.documentType}.expiryDate`]: { $lte: rule.value },
    });
  }

  return [];
}

async function isAlreadyNotifiedToday(
  teacherId: string,
  alertRuleId: string
): Promise<boolean> {
  const todayStart = getTodayStart();
  const existing = await EmailLog.findOne({
    alertRuleId,
    'recipients.teacherId': teacherId,
    sentAt: { $gte: todayStart },
  });
  return existing !== null;
}

export class AlertEmailService {
  static async runScheduledAlerts(): Promise<void> {
    const rules = await AlertRule.find({ isActive: true, emailEnabled: true });

    for (const rule of rules) {
      if (!rule.emailEnabled) continue;

      if (!rule.emailTemplateId) {
        continue;
      }

      const template = await EmailTemplate.findById(rule.emailTemplateId);
      if (!template) {
        continue;
      }

      const teachers = await getMatchingTeachers(rule);
      const recipients = [];

      for (const teacher of teachers) {
        const alreadySent = await isAlreadyNotifiedToday(
          String(teacher._id),
          String(rule._id)
        );
        if (alreadySent) continue;

        recipients.push({
          email: teacher.email,
          name: `${teacher.firstName} ${teacher.lastName}`,
          teacherId: String(teacher._id),
          variables: {
            teacherName: `${teacher.firstName} ${teacher.lastName}`,
            ruleName: rule.name,
          },
        });
      }

      if (recipients.length === 0) continue;

      await EmailService.sendBulkEmails({
        subject: template.subject,
        body: template.body,
        templateId: String(template._id),
        triggeredBy: 'alert',
        alertRuleId: String(rule._id),
        recipients,
      });

      await AlertRule.findByIdAndUpdate(rule._id, { lastTriggeredAt: new Date() });
    }
  }
}
