import Teacher from '../models/Teacher.js';
import School from '../models/School.js';
import Stage from '../models/Stage.js';
import AlertRule from '../models/AlertRule.js';
import { startOfDay, addDays } from 'date-fns';
import mongoose from 'mongoose';

interface StatsFilter {
    projectId?: string;
    gender?: string;
    nationality?: string;
    degree?: string;
    salaryRange?: string;
    hiringStatus?: string;
    pipelineStage?: string;
    seniority?: string;
}

export class StatsService {

    static async getDashboardStats(filters: StatsFilter) {
        // 1. Alert Rules
        const rules = await AlertRule.find({ isActive: true });

        // 2. Build Query
        const matchQuery = this.buildMatchQuery(filters);

        // 3. Fetch Data
        const [
            allTeachers,
            activeSchools,
            stages,
            filteredTeachers
        ] = await Promise.all([
            Teacher.find({ isDeleted: false }).select('firstName lastName profilePicture pipelineStage email personalInfo arcDetails workPermitDetails passportDetails education contractDetails'),
            School.countDocuments({ isDeleted: false }),
            Stage.find({}).sort({ order: 1 }),
            Teacher.find({ ...matchQuery, isDeleted: false }).select('firstName lastName profilePicture pipelineStage email personalInfo arcDetails workPermitDetails passportDetails education contractDetails')
        ]);

        // 4. Candidates List
        const candidates = filteredTeachers.slice(0, 100).map(t => {
            const stage = stages.find(s => String(s._id) === String(t.pipelineStage));
            return {
                _id: t._id,
                firstName: t.firstName,
                lastName: t.lastName,
                profilePicture: t.profilePicture,
                pipelineStage: stage ? stage.title : 'Uncategorized',
                salary: t.contractDetails?.salary,
                seniority: t.contractDetails?.senioritySalary
            };
        });

        const totalTeachers = allTeachers.length;

        // 5. "In Recruitment" Logic
        const employedStage = stages.find(s => s.title.includes('Employed'));
        const employedStageId = employedStage ? String(employedStage._id) : null;
        const inRecruitmentCount = allTeachers.filter(t =>
            employedStageId ? String(t.pipelineStage) !== employedStageId : true
        ).length;

        // 6. Expiry Alerts
        const expiryAlerts = this.calculateExpiryAlerts(allTeachers, rules);

        const mappedAlerts: Record<string, any[]> = {
            arc: [],
            workPermit: [],
            passport: [],
            other: []
        };

        expiryAlerts.forEach(alert => {
            if (alert.documentType === 'arcDetails') mappedAlerts['arc']!.push(alert);
            else if (alert.documentType === 'workPermitDetails') mappedAlerts['workPermit']!.push(alert);
            else if (alert.documentType === 'passportDetails') mappedAlerts['passport']!.push(alert);
            else mappedAlerts['other']!.push(alert);
        });

        // 7. Charts
        return {
            kpi: {
                totalTeachers,
                activeSchools,
                inRecruitment: inRecruitmentCount,
                actionsNeeded: expiryAlerts.length
            },
            expiry: mappedAlerts,
            charts: {
                pipeline: this.getPipelineDistribution(filteredTeachers, stages),
                nationality: this.getNationalityDistribution(filteredTeachers),
                gender: this.getGenderDistribution(filteredTeachers),
                education: this.getEducationDistribution(filteredTeachers),
                salary: this.getSalaryDistribution(filteredTeachers),
                hiringStatus: this.getHiringStatusDistribution(filteredTeachers),
                seniority: this.getSeniorityDistribution(filteredTeachers)
            },
            candidates
        };
    }

    private static buildMatchQuery(filters: StatsFilter) {
        const query: any = {};
        const { projectId, gender, nationality, degree, salaryRange, hiringStatus, pipelineStage, seniority } = filters;

        if (projectId) {
            query.project = new mongoose.Types.ObjectId(projectId);
        }

        if (seniority) {
            if (seniority === '10+ Years') {
                query['contractDetails.senioritySalary'] = { $regex: /^\d{2,}\s*year/i };
            } else {
                const years = parseInt(seniority);
                if (!isNaN(years)) {
                    query['contractDetails.senioritySalary'] = { $regex: new RegExp(`^${years}\\s*year`, 'i') };
                }
            }
        }

        if (gender) {
            const g = gender.trim();
            query['personalInfo.gender'] = g === 'Not Specified' ? { $in: [null, ''] } : { $regex: new RegExp(`^${g}$`, 'i') };
        }

        if (nationality) {
            const n = nationality.trim();
            query['personalInfo.nationality.english'] = n === 'Unknown' ? { $in: [null, ''] } : { $regex: new RegExp(`^${n}$`, 'i') };
        }

        if (degree) {
            const d = degree.trim();
            query['education.degree'] = d === 'Not Specified' ? { $in: [null, ''] } : { $regex: new RegExp(`^${d}$`, 'i') };
        }

        if (hiringStatus) {
            const h = hiringStatus.trim();
            query['personalInfo.hiringStatus'] = h === 'Pending' ? { $in: [null, '', 'Pending'] } : { $regex: new RegExp(`^${h}$`, 'i') };
        }

        if (pipelineStage) {
            query['pipelineStage'] = pipelineStage.trim();
        }

        if (salaryRange) {
            const normalized = salaryRange.replace(/k/g, '000').replace(/ /g, '');
            if (normalized.includes('+')) {
                const min = parseInt(normalized.replace('+', ''));
                query['contractDetails.salary'] = { $gte: min };
            } else if (normalized.includes('-')) {
                const [min, max] = normalized.split('-').map(Number);
                query['contractDetails.salary'] = { $gte: min, $lte: max };
            } else if (normalized.startsWith('<')) {
                const max = parseInt(normalized.replace('<', ''));
                query['contractDetails.salary'] = { $lt: max };
            } else if (salaryRange === 'Unspecified') {
                query['contractDetails.salary'] = { $exists: false };
            }
        }

        return query;
    }

    private static calculateExpiryAlerts(teachers: any[], rules: any[]) {
        const alerts: any[] = [];
        const today = startOfDay(new Date());

        teachers.forEach(teacher => {
            rules.forEach(rule => {
                let docExpiry: Date | null = null;
                const details = (teacher as any)[rule.documentType];
                if (details && details.expiryDate) {
                    docExpiry = new Date(details.expiryDate);
                }

                if (docExpiry) {
                    let isTriggered = false;
                    if (rule.conditionType === 'DAYS_REMAINING') {
                        const daysThreshold = rule.value as number;
                        const thresholdDate = addDays(today, daysThreshold);
                        if (docExpiry > today && docExpiry <= thresholdDate) {
                            isTriggered = true;
                        }
                    } else if (rule.conditionType === 'DATE_THRESHOLD') {
                        const targetDate = new Date(rule.value as string | Date);
                        if (docExpiry > today && docExpiry <= targetDate) {
                            isTriggered = true;
                        }
                    }

                    if (isTriggered) {
                        alerts.push({
                            teacherId: teacher._id,
                            firstName: teacher.firstName,
                            lastName: teacher.lastName,
                            profilePicture: teacher.profilePicture,
                            ruleName: rule.name,
                            documentType: rule.documentType,
                            expiryDate: docExpiry,
                            type: 'EXPIRY'
                        });
                    }
                }
            });
        });
        return alerts;
    }

    private static getPipelineDistribution(teachers: any[], stages: any[]) {
        const pipelineCounts: Record<string, number> = {};
        teachers.forEach(t => {
            const stageId = String(t.pipelineStage);
            pipelineCounts[stageId] = (pipelineCounts[stageId] || 0) + 1;
        });

        const dist = stages.map(stage => ({
            name: stage.title,
            value: pipelineCounts[String(stage._id)] || 0,
            id: String(stage._id),
            color: stage.title.toLowerCase().includes('employed') ? '#10b981' : undefined
        }));

        const knownStageIds = stages.map(s => String(s._id));
        const uncategorizedCount = teachers.filter(t => !knownStageIds.includes(String(t.pipelineStage))).length;
        if (uncategorizedCount > 0) {
            dist.unshift({
                name: 'Uncategorized',
                value: uncategorizedCount,
                id: 'uncategorized',
                color: '#94a3b8'
            });
        }
        return dist;
    }

    private static getNationalityDistribution(teachers: any[]) {
        const counts: Record<string, number> = {};
        teachers.forEach(t => {
            const val = t.personalInfo?.nationality?.english || 'Unknown';
            counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }

    private static getGenderDistribution(teachers: any[]) {
        const counts: Record<string, number> = {};
        teachers.forEach(t => {
            const val = t.personalInfo?.gender || 'Not Specified';
            counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    private static getEducationDistribution(teachers: any[]) {
        const counts: Record<string, number> = {};
        teachers.forEach(t => {
            const val = t.education?.degree || 'Not Specified';
            counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }

    private static getSalaryDistribution(teachers: any[]) {
        const buckets = {
            '< 60k': 0, '60k - 70k': 0, '70k - 80k': 0, '80k - 90k': 0, '90k +': 0, 'Unspecified': 0
        };
        teachers.forEach(t => {
            const sal = t.contractDetails?.salary;
            if (!sal) buckets['Unspecified']++;
            else if (sal < 60000) buckets['< 60k']++;
            else if (sal < 70000) buckets['60k - 70k']++;
            else if (sal < 80000) buckets['70k - 80k']++;
            else if (sal < 90000) buckets['80k - 90k']++;
            else buckets['90k +']++;
        });
        return Object.entries(buckets).map(([name, value]) => ({ name, value }));
    }

    private static getHiringStatusDistribution(teachers: any[]) {
        const counts: Record<string, number> = {};
        teachers.forEach(t => {
            const val = t.personalInfo?.hiringStatus || 'Pending';
            counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    private static getSeniorityDistribution(teachers: any[]) {
        const counts: Record<string, number> = {};
        for (let i = 0; i <= 10; i++) counts[i === 10 ? '10+ Years' : `${i} Year${i !== 1 ? 's' : ''}`] = 0;

        teachers.forEach(t => {
            const match = (t.contractDetails?.senioritySalary || '').match(/(\d+)\s*year/i);
            const years = match?.[1] ? parseInt(match[1], 10) : 0;
            const key = years >= 10 ? '10+ Years' : `${years} Year${years !== 1 ? 's' : ''}`;
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
}
