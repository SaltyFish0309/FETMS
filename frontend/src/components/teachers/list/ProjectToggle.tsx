import { useEffect, useState } from "react";
import { Building2, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectService, type Project } from "@/services/projectService";

interface ProjectToggleProps {
    value: string | null;
    onChange: (projectId: string) => void;
}

const getIcon = (code: string) => {
    if (code === 'TFETP') return Building2;
    if (code === 'INDEPENDENT') return Users;
    return Building2;
};

export function ProjectToggle({ value, onChange }: ProjectToggleProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectService.getAll();
                setProjects(data);
                if (!value && data.length > 0) {
                    onChange(data[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">載入專案中...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            {projects.map((project) => {
                const Icon = getIcon(project.code);
                const isActive = value === project._id;

                return (
                    <Button
                        key={project._id}
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange(project._id)}
                        className={
                            isActive
                                ? 'bg-white text-slate-900 shadow-sm hover:bg-white'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-transparent'
                        }
                    >
                        <Icon className="h-4 w-4 mr-2" />
                        {project.name}
                    </Button>
                );
            })}
        </div>
    );
}
