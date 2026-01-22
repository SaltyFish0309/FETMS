import axios from 'axios';

const API_URL = 'http://localhost:5000/api/schools';

export interface School {
    _id: string;
    name: {
        chinese: string;
        english?: string;
    };
    address?: {
        chinese?: string;
        english?: string;
    };
    principal?: {
        chineseName?: string;
        englishName?: string;
    };
    contact?: {
        name?: string;
        position?: string;
        email?: string;
        phone?: string;
    };
    employedTeachers?: Array<{
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        personalInfo?: {
            nationality?: { english?: string };
            hiringStatus?: string;
        };
    }>; // Populated from Teacher model in profile view
    createdAt?: string;
    updatedAt?: string;
}

export const schoolService = {
    getAll: async (search?: string) => {
        const params = search ? { search } : {};
        const response = await axios.get<School[]>(API_URL, { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await axios.get<School>(`${API_URL}/${id}`);
        return response.data;
    },

    create: async (data: Partial<School>) => {
        const response = await axios.post<School>(API_URL, data);
        return response.data;
    },

    update: async (id: string, data: Partial<School>) => {
        const response = await axios.put<School>(`${API_URL}/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await axios.delete(`${API_URL}/${id}`);
    }
};
