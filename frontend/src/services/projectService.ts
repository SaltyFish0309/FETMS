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

    async getById(id: string): Promise<Project> {
        const response = await api.get<Project>(`/projects/${id}`);
        return response.data;
    },

    async create(data: Partial<Project>): Promise<Project> {
        const response = await api.post<Project>('/projects', data);
        return response.data;
    },

    async update(id: string, data: Partial<Project>): Promise<Project> {
        const response = await api.put<Project>(`/projects/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/projects/${id}`);
    }
};
