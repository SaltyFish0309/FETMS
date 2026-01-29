import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { statsService } from "@/services/statsService";
import type { DashboardFilters } from "@/services/statsService";
import type { DashboardStats } from "@/services/statsService";
import { useProjectContext } from "@/contexts/ProjectContext";
import { ExpiryWidget } from "@/components/dashboard/ExpiryWidget";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { DemographicsChart } from "@/components/dashboard/DemographicsChart";
import { EducationChart } from "@/components/dashboard/EducationChart";
import { SalaryChart } from "@/components/dashboard/SalaryChart";
import { SeniorityChart } from "@/components/dashboard/SeniorityChart";
import { CandidateList } from "@/components/dashboard/CandidateList";
import { KPICard } from "@/components/dashboard/KPICard";
import { Users, School, AlertTriangle, X, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
    const { t } = useTranslation('dashboard');
    const { t: tTeachers } = useTranslation('teachers');
    const { selectedProjectId } = useProjectContext();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DashboardFilters>({});

    const translateFilterValue = (filterKey: string, value: string): string => {
        // Map filter keys to enum types
        const enumMap: Record<string, string> = {
            'status': 'status',
            'hiringStatus': 'status',
            'gender': 'gender',
            'degree': 'degree',
            'educationLevel': 'degree'
        };

        const enumType = enumMap[filterKey];

        if (enumType) {
            // Translate as enum value
            const enumKey = value.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
            return tTeachers(`enums.${enumType}.${enumKey}` as any);
        }

        // Return raw value for non-enum filters (nationality, etc.)
        return value;
    };

    const loadStats = useCallback(async () => {
        if (!selectedProjectId) return;
        try {
            setLoading(true);
            const data = await statsService.getDashboardStats({
                ...filters,
                projectId: selectedProjectId
            });

            setStats(data);
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
            toast.error(t('toast.loadError'));
        } finally {
            setLoading(false);
        }
    }, [filters, selectedProjectId]);

    // Reload stats when filters change
    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const handleFilterChange = (key: keyof DashboardFilters, value: string | null) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key] === value ? null : value // Toggle off if clicked again
        }));
    };

    const clearFilters = () => setFilters({});

    const hasFilters = Object.values(filters).some(v => v !== null && v !== undefined);

    const getPipelineStageName = (id: string) => {
        if (!stats) return id;
        const stage = stats.charts.pipeline.find(s => s.id === id);
        return stage ? stage.name : id;
    };

    if (loading && !stats) {
        return <div className="p-8 text-center text-muted-foreground">{t('loading')}</div>;
    }

    if (!stats) return null;

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
                    {t('title')}
                </h1>
                <p className="text-sm text-muted-foreground font-body">
                    {t('subtitle')}
                </p>
            </div>

            {/* Top Section: KPI Matrix (Left) & Action Center (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Left: KPI Matrix (2x2) */}
                <div className="grid grid-cols-2 gap-4 h-full">
                    <KPICard
                        title={t('kpi.totalTeachers')}
                        value={stats.kpi.totalTeachers}
                        icon={Users}
                        iconColor="text-blue-500"
                        accentColor="from-blue-500 to-blue-600"
                    />
                    <KPICard
                        title={t('kpi.activeSchools')}
                        value={stats.kpi.activeSchools}
                        icon={School}
                        iconColor="text-emerald-500"
                        accentColor="from-emerald-500 to-emerald-600"
                    />
                    <KPICard
                        title={t('kpi.inRecruitment')}
                        value={stats.kpi.inRecruitment}
                        icon={Briefcase}
                        iconColor="text-violet-500"
                        accentColor="from-violet-500 to-violet-600"
                    />
                    <KPICard
                        title={t('kpi.actionsNeeded')}
                        value={stats.kpi.actionsNeeded}
                        icon={AlertTriangle}
                        iconColor="text-amber-500"
                        accentColor="from-amber-500 to-orange-500"
                    />
                </div>

                {/* Right: Action Center (Expiry Widget) */}
                <div className="h-full">
                    <ExpiryWidget
                        data={stats.expiry}
                        onRefresh={loadStats}
                        className="h-full"
                    />
                </div>
            </div>

            {/* Analysis Section */}
            <Card className="border shadow-sm">
                <CardHeader className="border-b bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg font-semibold text-foreground font-heading">
                            {t('analyticsOverview')}
                        </CardTitle>
                        {/* Active Filters */}
                        {hasFilters && (
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-medium text-blue-700 uppercase tracking-wider mr-1">{t('filters.label')}</span>
                                {Object.entries(filters).map(([key, value]) => {
                                    if (!value) return null;
                                    const displayValue = key === 'pipelineStage' ? getPipelineStageName(value) : value;
                                    const filterLabel = t(`filters.${key}`, { defaultValue: key });
                                    return (
                                        <Badge
                                            key={key}
                                            variant="secondary"
                                            className="bg-white text-blue-700 border border-blue-200 shadow-sm hover:bg-blue-50 cursor-pointer flex items-center gap-1 group"
                                            onClick={() => handleFilterChange(key as keyof DashboardFilters, null)}
                                        >
                                            <span className="capitalize">{filterLabel}:</span>
                                            <span className="font-bold">{translateFilterValue(key, displayValue)}</span>
                                            <X className="h-3 w-3 opacity-50 group-hover:opacity-100 ml-1" />
                                        </Badge>
                                    );
                                })}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 ml-2"
                                >
                                    {t('filters.clearAll')}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Main Charts Column - spans 2 columns on xl */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Pipeline Chart */}
                            <PipelineChart
                                data={stats.charts.pipeline}
                                onClick={(data) => handleFilterChange('pipelineStage', data.id!)}
                            />

                            {/* Demographics Row */}
                            <DemographicsChart
                                nationalityData={stats.charts.nationality}
                                genderData={stats.charts.gender}
                                hiringStatusData={stats.charts.hiringStatus}
                                onClick={(category: string, name: string) => handleFilterChange(category as keyof DashboardFilters, name)}
                            />

                            {/* Professional Charts Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <EducationChart
                                    data={stats.charts.education}
                                    onClick={(data) => handleFilterChange('degree', data.name)}
                                />
                                <SalaryChart
                                    data={stats.charts.salary}
                                    onClick={(data) => handleFilterChange('salaryRange', data.name)}
                                />
                                <SeniorityChart
                                    data={stats.charts.seniority}
                                    onClick={(data) => handleFilterChange('seniority', data.name)}
                                />
                            </div>
                        </div>

                        {/* Candidate List Sidebar */}
                        <div className="xl:col-span-1 xl:relative">
                            <div className="xl:absolute xl:inset-0">
                                <CandidateList
                                    candidates={stats.candidates || []}
                                    isLoading={loading}
                                    hasFilters={hasFilters}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}
