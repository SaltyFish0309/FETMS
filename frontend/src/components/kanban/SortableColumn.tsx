import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableColumnProps {
    id: string;
    children: React.ReactNode;
}

export const SortableColumn: React.FC<SortableColumnProps> = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, data: { type: 'column' } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="h-full min-h-[500px] w-80 shrink-0 rounded-xl border-2 border-dashed border-slate-300 bg-slate-200/50"
            />
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
            {children}
        </div>
    );
};
