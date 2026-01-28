import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = 'list' | 'kanban';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('list')}
        className={value === 'list'
          ? 'bg-card text-foreground shadow-sm hover:bg-card'
          : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
        }
        aria-label="List view"
      >
        <List className="h-4 w-4 mr-2" /> List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('kanban')}
        className={value === 'kanban'
          ? 'bg-card text-foreground shadow-sm hover:bg-card'
          : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
        }
        aria-label="Kanban view"
      >
        <LayoutGrid className="h-4 w-4 mr-2" /> Kanban
      </Button>
    </div>
  );
}
