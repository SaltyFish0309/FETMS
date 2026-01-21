import { useEffect, useState } from "react";
import { statsService } from "@/services/statsService";
import type { DashboardFilters } from "@/services/statsService";
import type { DashboardStats } from "@/services/statsService";
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

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DashboardFilters>({});

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await statsService.getDashboardStats(filters);

            setStats(data);
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [filters]);

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
        return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    }

    if (!stats) return null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-2">Overview of school management operations.</p>
                </div>
            </div>

            {/* Top Section: KPI Matrix (Left) & Action Center (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Left: KPI Matrix (2x2) */}
                <div className="grid grid-cols-2 gap-4 h-full">
                    <KPICard
                        title="Total Teachers"
                        value={stats.kpi.totalTeachers}
                        icon={Users}
                        iconColor="text-blue-500"
                        accentColor="from-blue-500 to-blue-600"
                    />
                    <KPICard
                        title="Partner Schools"
                        value={stats.kpi.activeSchools}
                        icon={School}
                        iconColor="text-emerald-500"
                        accentColor="from-emerald-500 to-emerald-600"
                    />
                    <KPICard
                        title="In Recruitment"
                        value={stats.kpi.inRecruitment}
                        icon={Briefcase}
                        iconColor="text-violet-500"
                        accentColor="from-violet-500 to-violet-600"
                    />
                    <KPICard
                        title="Actions Needed"
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

            {/* Analysis Section (Unified Container) */}
            <div className={`border rounded-xl shadow-sm overflow-hidden transition-colors ${hasFilters ? 'border-blue-200 ring-1 ring-blue-100' : 'bg-white'}`}>
                <div className={`px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${hasFilters ? 'bg-blue-50/80' : 'bg-slate-50/50'}`}>
                    <div>
                        <h2 className={`text-lg font-semibold ${hasFilters ? 'text-blue-900' : 'text-slate-800'}`}>Recruitment & Demographics Analysis</h2>
                        <p className={`text-sm ${hasFilters ? 'text-blue-600' : 'text-slate-500'}`}>Interactive pipeline and distribution metrics</p>
                    </div>

                    {/* Active Filters in Header */}
                    {hasFilters && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-medium text-blue-700 uppercase tracking-wider mr-1">Active Filters:</span>
                            {Object.entries(filters).map(([key, value]) => {
                                if (!value) return null;
                                const displayValue = key === 'pipelineStage' ? getPipelineStageName(value) : value;
                                return (
                                    <Badge
                                        key={key}
                                        variant="secondary"
                                        className="bg-white text-blue-700 border border-blue-200 shadow-sm hover:bg-blue-50 cursor-pointer flex items-center gap-1 group"
                                        onClick={() => handleFilterChange(key as keyof DashboardFilters, null)}
                                    >
                                        <span className="capitalize">{key === 'salaryRange' ? 'Salary' : key}:</span>
                                        <span className="font-bold">{displayValue}</span>
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
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50/30">
                    <div className="relative flex flex-col xl:block">
                        {/* Charts Area (66% Width on Desktop, standard flow to determine height) */}
                        <div className="w-full xl:w-[66%] space-y-6 min-w-0">
                            {/* Row 1: Pipeline Chart */}
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <PipelineChart
                                    data={stats.charts.pipeline}
                                    onClick={(data) => handleFilterChange('pipelineStage', data.id!)}
                                />
                            </div>

                            {/* Row 2: Demographics (Nationality, Gender, Hiring Status) */}
                            <DemographicsChart
                                nationalityData={stats.charts.nationality}
                                genderData={stats.charts.gender}
                                hiringStatusData={stats.charts.hiringStatus}
                                onClick={(category: string, name: string) => handleFilterChange(category as keyof DashboardFilters, name)}
                            />

                            {/* Row 3: Professional (Education, Salary, Seniority) */}
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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

                        {/* Candidate List (33% Width, Absolute on Desktop to match neighbor height) */}
                        <div className="w-full xl:w-[32%] mt-6 xl:mt-0 xl:absolute xl:top-0 xl:right-0 xl:bottom-0">
                            <CandidateList
                                candidates={stats.candidates || []}
                                isLoading={loading}
                                hasFilters={hasFilters}
                            />
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}
