import EmailTemplate from '../models/EmailTemplate.js';
import EmailLog from '../models/EmailLog.js';
import { EmailService, BulkEmailRecipient } from './EmailService.js';
import { NotFoundError } from '../errors.js';

export { NotFoundError };

export interface PreviewResult {
  email: string;
  name: string;
  subject: string;
  body: string;
}

export interface SendPayload {
  templateId: string;
  recipients: BulkEmailRecipient[];
  triggeredBy: 'manual' | 'alert';
  alertRuleId?: string;
}

export interface HistoryOptions {
  page: number;
  limit: number;
}

export interface HistoryResult {
  logs: unknown[];
  total: number;
  page: number;
  limit: number;
}

export class EmailNotificationService {
  static async preview(
    templateId: string,
    recipients: BulkEmailRecipient[]
  ): Promise<PreviewResult[]> {
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      throw new NotFoundError(`Email template not found: ${templateId}`);
    }

    return recipients.map((recipient) => ({
      email: recipient.email,
      name: recipient.name,
      subject: EmailService.renderTemplate(template.subject, recipient.variables),
      body: EmailService.renderTemplate(template.body, recipient.variables),
    }));
  }

  static async send(payload: SendPayload): Promise<{ sent: number; failed: number }> {
    const template = await EmailTemplate.findById(payload.templateId);
    if (!template) {
      throw new NotFoundError(`Email template not found: ${payload.templateId}`);
    }

    return EmailService.sendBulkEmails({
      subject: template.subject,
      body: template.body,
      templateId: payload.templateId,
      triggeredBy: payload.triggeredBy,
      alertRuleId: payload.alertRuleId,
      recipients: payload.recipients,
    });
  }

  static async getHistory(options: HistoryOptions): Promise<HistoryResult> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      EmailLog.find().sort({ sentAt: -1 }).skip(skip).limit(limit),
      EmailLog.countDocuments(),
    ]);

    return { logs, total, page, limit };
  }
}
