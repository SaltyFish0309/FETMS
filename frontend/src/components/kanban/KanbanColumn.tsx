import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
    id: string;
    items: string[];
    children: React.ReactNode;
    className?: string;
    title?: React.ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, items, children, className, title }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`flex flex-col ${className}`}>
            {title && <div className="mb-3">{title}</div>}
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="flex-1 flex flex-col gap-2 min-h-[100px]">
                    {children}
                </div>
            </SortableContext>
        </div>
    );
};
