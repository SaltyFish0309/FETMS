import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanCardProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ id, children, className }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

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
                className={`rounded-lg border-2 border-dashed border-border bg-muted/50 min-h-[4rem] w-full ${className}`}
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing ${className}`}
        >
            {children}
        </div>
    );
};
