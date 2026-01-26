import type { Stage } from '@/services/stageService';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableStageItemProps {
    stage: Stage;
    onDelete: (id: string) => void;
}

export function SortableStageItem({ stage, onDelete }: SortableStageItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stage._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
            <button className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                <GripVertical className="h-5 w-5 text-slate-400" />
            </button>
            <div className="flex-1">
                <p className="font-medium">{stage.title}</p>
                <p className="text-sm text-slate-500">Order: {stage.order}</p>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(stage._id)}
                className="text-red-600 hover:text-red-700"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
