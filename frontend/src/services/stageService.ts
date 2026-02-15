import api from './api';

export interface Stage {
    _id: string;
    title: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export const stageService = {
    async getAll(): Promise<Stage[]> {
        const response = await api.get<Stage[]>('/stages');
        return response.data;
    },

    async create(data: { title: string }): Promise<Stage> {
        const response = await api.post<Stage>('/stages', data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/stages/${id}`);
    },

    async reorder(stages: { _id: string; order: number }[]): Promise<void> {
        await api.put('/stages/reorder', { stages });
    }
};
