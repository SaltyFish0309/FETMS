import api from './api';

export interface EmailTemplate {
    _id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EmailRecipient {
    email: string;
    name: string;
    teacherId?: string;
    schoolId?: string;
    variables: Record<string, string>;
}

export interface PreviewResult {
    email: string;
    name: string;
    subject: string;
    body: string;
}

export interface SendResult {
    sent: number;
    failed: number;
}

export interface EmailLogEntry {
    _id: string;
    recipients: Array<{
        email: string;
        name: string;
        status: 'sent' | 'failed';
        error?: string;
    }>;
    subject: string;
    templateId?: string;
    triggeredBy: 'manual' | 'alert';
    totalSent: number;
    totalFailed: number;
    sentAt: string;
}

export interface HistoryResult {
    logs: EmailLogEntry[];
    total: number;
    page: number;
    limit: number;
}

export interface SendPayload {
    templateId: string;
    recipients: EmailRecipient[];
    triggeredBy: 'manual' | 'alert';
    alertRuleId?: string;
}

export const emailService = {
    async getTemplates(): Promise<EmailTemplate[]> {
        const response = await api.get<EmailTemplate[]>('/email-templates');
        return response.data;
    },

    async createTemplate(data: Omit<EmailTemplate, '_id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
        const response = await api.post<EmailTemplate>('/email-templates', data);
        return response.data;
    },

    async updateTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        const response = await api.put<EmailTemplate>(`/email-templates/${id}`, data);
        return response.data;
    },

    async deleteTemplate(id: string): Promise<void> {
        await api.delete(`/email-templates/${id}`);
    },

    async previewEmails(templateId: string, recipients: EmailRecipient[]): Promise<PreviewResult[]> {
        const response = await api.post<PreviewResult[]>('/emails/preview', { templateId, recipients });
        return response.data;
    },

    async sendEmails(payload: SendPayload): Promise<SendResult> {
        const response = await api.post<SendResult>('/emails/send', payload);
        return response.data;
    },

    async getHistory(params: { page?: number; limit?: number } = {}): Promise<HistoryResult> {
        const response = await api.get<HistoryResult>('/emails/history', { params });
        return response.data;
    },
};
