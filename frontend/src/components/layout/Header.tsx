import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectToggle } from "@/components/teachers/list/ProjectToggle";
import { useProjectContext } from "@/contexts/ProjectContext";

interface HeaderProps {
    title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
    const { selectedProjectId, setSelectedProjectId } = useProjectContext();

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-8 shadow-sm">
            <div className="flex items-center gap-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
                <ProjectToggle value={selectedProjectId} onChange={setSelectedProjectId} />
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 w-64 rounded-md border border-input bg-background pl-9 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring"
                    />
                </div>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                </Button>
            </div>
        </header>
    );
}
