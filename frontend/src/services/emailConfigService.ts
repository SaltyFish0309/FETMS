import api from './api';

export interface EmailConfigStatus {
  configured: boolean;
  connected: boolean;
  connectedEmail: string | null;
}

export const emailConfigService = {
  async getStatus(): Promise<EmailConfigStatus> {
    const res = await api.get<EmailConfigStatus>('/email-config');
    return res.data;
  },

  async saveCredentials(clientId: string, clientSecret: string): Promise<void> {
    await api.post('/email-config', { clientId, clientSecret });
  },

  async getAuthUrl(): Promise<string> {
    const res = await api.get<{ url: string }>('/email-config/auth-url');
    return res.data.url;
  },

  async disconnect(): Promise<void> {
    await api.delete('/email-config');
  },
};
