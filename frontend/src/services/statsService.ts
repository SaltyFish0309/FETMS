import api from './api';

export interface ExpiryAlert {
    teacherId: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    expiryDate: string;
    ruleName: string;
}

export interface DashboardStats {
    kpi: {
        totalTeachers: number;
        activeSchools: number;
        inRecruitment: number;
        actionsNeeded: number;
    };
    expiry: {
        arc: ExpiryAlert[];
        workPermit: ExpiryAlert[];
        passport: ExpiryAlert[];
        other: ExpiryAlert[];
    };
    charts: {
        pipeline: Array<{ name: string; value: number; color?: string; id?: string }>;
        nationality: Array<{ name: string; value: number }>;
        gender: Array<{ name: string; value: number }>;
        education: Array<{ name: string; value: number }>;
        salary: Array<{ name: string; value: number }>;
        hiringStatus: Array<{ name: string; value: number }>;
        seniority: Array<{ name: string; value: number }>;
    };
    candidates?: Array<{
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        pipelineStage: string;
        salary?: number;
        seniority?: string;
    }>;
}

export interface DashboardFilters {
    projectId?: string | null;
    gender?: string | null;
    nationality?: string | null;
    degree?: string | null;
    salaryRange?: string | null;
    hiringStatus?: string | null;
    pipelineStage?: string | null;
    seniority?: string | null;
}

export const statsService = {
    getDashboardStats: async (filters: DashboardFilters = {}): Promise<DashboardStats> => {
        const params = new URLSearchParams();
        if (filters.projectId) params.append('projectId', filters.projectId);
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.nationality) params.append('nationality', filters.nationality);
        if (filters.degree) params.append('degree', filters.degree);
        if (filters.salaryRange) params.append('salaryRange', filters.salaryRange);
        if (filters.hiringStatus) params.append('hiringStatus', filters.hiringStatus);
        if (filters.pipelineStage) params.append('pipelineStage', filters.pipelineStage);
        if (filters.seniority) params.append('seniority', filters.seniority);

        const response = await api.get(`/stats/dashboard?${params.toString()}`);
        return response.data;
    }
};
