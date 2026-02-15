import { Building2, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectContext } from "@/contexts/ProjectContext";

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
    const { projects, loading } = useProjectContext();

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">載入專案中...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
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
                                ? 'bg-background text-foreground shadow-sm hover:bg-background'
                                : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
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
