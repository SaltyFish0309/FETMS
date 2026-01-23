import api from './api';

export interface Project {
    _id: string;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const projectService = {
    async getAll(): Promise<Project[]> {
        const response = await api.get<Project[]>('/projects');
        return response.data;
    },

    async create(data: Partial<Project>): Promise<Project> {
        const response = await api.post<Project>('/projects', data);
        return response.data;
    }
};
