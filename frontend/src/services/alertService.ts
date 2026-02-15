import api from './api';

export interface AlertRule {
    _id: string;
    name: string;
    documentType: 'arcDetails' | 'workPermitDetails' | 'passportDetails' | 'teachingLicense';
    conditionType: 'DAYS_REMAINING' | 'DATE_THRESHOLD';
    value: number | Date;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const alertService = {
    async getAll(): Promise<AlertRule[]> {
        const response = await api.get<AlertRule[]>('/alerts');
        return response.data;
    },

    async create(data: Partial<AlertRule>): Promise<AlertRule> {
        const response = await api.post<AlertRule>('/alerts', data);
        return response.data;
    },

    async update(id: string, data: Partial<AlertRule>): Promise<AlertRule> {
        const response = await api.patch<AlertRule>(`/alerts/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/alerts/${id}`);
    }
};
