import api from './api';

export interface DocumentBox {
    _id: string;
    name: string;
    order: number;
}

export interface Teacher {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    remarks?: string;
    documents: {
        passport: { status: string; filePath?: string };
        arc: { status: string; filePath?: string };
        contract: { status: string; filePath?: string };
        workPermit: { status: string; filePath?: string };
    };
    documentBoxes: DocumentBox[];
    otherDocuments: Array<{
        _id: string;
        name: string;
        filePath: string;
        uploadDate: string;
        boxId?: string;
    }>;
    pipelineStage: string;
    pipelineOrder: number;

    // Enhanced Profile Fields
    personalInfo?: {
        chineseName?: string;
        englishName?: string;
        serviceSchool?: string;
        nationality?: {
            chinese?: string;
            english?: string;
        };
        email?: string;
        phone?: string;
        dob?: string; // Date string
        gender?: string;
        address?: {
            taiwan?: string;
            home?: string;
        };
        hiringStatus?: 'Newly Hired' | 'Re-Hired';
    };
    emergencyContact?: {
        name?: string;
        relationship?: string;
        phone?: string;
        email?: string;
    };
    passportDetails?: {
        number?: string;
        expiryDate?: string;
        issuingCountry?: string;
        issuingAuthority?: string;
        issueDate?: string;
    };
    education?: {
        degree?: string;
        major?: string;
        school?: string;
    };
    teachingLicense?: {
        expiryDate?: string;
    };
    criminalRecord?: {
        issueDate?: string;
    };
    workPermitDetails?: {
        issueDate?: string;
        expiryDate?: string;
        startDate?: string;
        permitNumber?: string;
    };
    contractDetails?: {
        contractStartDate?: string;
        contractEndDate?: string;
        payStartDate?: string;
        payEndDate?: string;
        senioritySalary?: string;
        seniorityLeave?: string;
        salary?: number;
        hasSalaryIncrease?: boolean;
        salaryIncreaseDate?: string;
        estimatedPromotedSalary?: number;
    };
    arcDetails?: {
        expiryDate?: string;
        purpose?: string;
    };
}

export const teacherService = {
    getAll: async () => {
        const response = await api.get<Teacher[]>('/teachers');
        return response.data;
    },

    create: async (data: { firstName: string; lastName: string; email: string }) => {
        const response = await api.post<Teacher>('/teachers', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Teacher>) => {
        const response = await api.put<Teacher>(`/teachers/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete<{ message: string }>(`/teachers/${id}`);
        return response.data;
    },

    uploadAvatar: async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post<Teacher>(`/teachers/${id}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteAvatar: async (id: string) => {
        const response = await api.delete<Teacher>(`/teachers/${id}/avatar`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Teacher>(`/teachers/${id}`);
        return response.data;
    },

    uploadDocument: async (id: string, type: string, file: File, data?: Record<string, string>) => {
        const formData = new FormData();
        formData.append('file', file);
        if (data) {
            Object.keys(data).forEach(key => formData.append(key, data[key]));
        }

        const response = await api.post<Teacher>(`/teachers/${id}/documents/${type}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    uploadAdHocDocument: async (id: string, name: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);

        const response = await api.post<Teacher>(`/teachers/${id}/documents/adhoc`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteDocument: async (id: string, type: string) => {
        const response = await api.delete<Teacher>(`/teachers/${id}/documents/${type}`);
        return response.data;
    },

    deleteAdHocDocument: async (id: string, docId: string) => {
        const response = await api.delete<Teacher>(`/teachers/${id}/documents/adhoc/${docId}`);
        return response.data;
    },

    updateAdHocDocument: async (id: string, docId: string, name?: string, file?: File) => {
        const formData = new FormData();
        if (name) formData.append('name', name);
        if (file) formData.append('file', file);

        const response = await api.put<Teacher>(`/teachers/${id}/documents/adhoc/${docId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Box Management
    createBox: async (id: string, name: string) => {
        const response = await api.post<Teacher>(`/teachers/${id}/boxes`, { name });
        return response.data;
    },

    updateBox: async (id: string, boxId: string, data: { name?: string; order?: number }) => {
        const response = await api.put<Teacher>(`/teachers/${id}/boxes/${boxId}`, data);
        return response.data;
    },

    deleteBox: async (id: string, boxId: string) => {
        const response = await api.delete<Teacher>(`/teachers/${id}/boxes/${boxId}`);
        return response.data;
    },

    reorderAdHocDocuments: async (id: string, documents: { _id: string; boxId?: string }[]) => {
        const response = await api.put<Teacher>(`/teachers/${id}/documents/adhoc/reorder`, { documents });
        return response.data;
    },

    reorderBoxes: async (id: string, boxes: string[]) => {
        const response = await api.put<Teacher>(`/teachers/${id}/boxes/reorder`, { boxes });
        return response.data;
    },

    downloadBox: async (teacherId: string, boxId: string) => {
        const response = await api.get(`/teachers/${teacherId}/boxes/${boxId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Pipeline
    reorderPipeline: async (stage: string, teacherIds: string[]) => {
        const response = await api.put('/teachers/pipeline/reorder', { stage, teacherIds });
        return response.data;
    },

    // Stages
    getStages: async () => {
        const response = await api.get('/stages');
        return response.data;
    },

    createStage: async (title: string) => {
        const response = await api.post('/stages', { title });
        return response.data;
    },

    deleteStage: async (id: string) => {
        const response = await api.delete(`/stages/${id}`);
        return response.data;
    },

    reorderStages: async (stages: { _id: string; order: number }[]) => {
        const response = await api.put('/stages/reorder', { stages });
        return response.data;
    }
};
