import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.js';

export interface BulkEmailRecipient {
  email: string;
  name: string;
  teacherId?: string;
  schoolId?: string;
  variables: Record<string, string>;
}

export interface BulkEmailPayload {
  subject: string;
  body: string;
  templateId?: string;
  triggeredBy: 'manual' | 'alert';
  alertRuleId?: string;
  recipients: BulkEmailRecipient[];
}

export interface BulkEmailResult {
  sent: number;
  failed: number;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export class EmailService {
  static renderTemplate(
    template: string,
    variables: Record<string, string>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        return escapeHtml(variables[key]);
      }
      return match;
    });
  }

  static async sendBulkEmails(payload: BulkEmailPayload): Promise<BulkEmailResult> {
    const { EmailConfigService } = await import('./EmailConfigService.js');
    const authConfig = await EmailConfigService.getTransportConfig();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: authConfig,
    });
    const fromName = 'FETMS System';
    const fromEmail = authConfig.user;

    const recipientResults: Array<{
      email: string;
      name: string;
      teacherId?: string;
      schoolId?: string;
      variables: Record<string, string>;
      status: 'sent' | 'failed';
      error?: string;
    }> = [];

    let sent = 0;
    let failed = 0;

    for (const recipient of payload.recipients) {
      const renderedSubject = EmailService.renderTemplate(payload.subject, recipient.variables);
      const renderedBody = EmailService.renderTemplate(payload.body, recipient.variables);

      try {
        const safeName = recipient.name.replace(/"/g, '');
        await transport.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: `"${safeName}" <${recipient.email}>`,
          subject: renderedSubject,
          html: renderedBody,
        });
        recipientResults.push({
          ...recipient,
          status: 'sent',
        });
        sent++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        recipientResults.push({
          ...recipient,
          status: 'failed',
          error: errorMsg,
        });
        failed++;
      }
    }

    await EmailLog.create({
      recipients: recipientResults,
      subject: payload.subject,
      templateId: payload.templateId,
      triggeredBy: payload.triggeredBy,
      alertRuleId: payload.alertRuleId,
      totalSent: sent,
      totalFailed: failed,
      sentAt: new Date(),
    });

    return { sent, failed };
  }
}
