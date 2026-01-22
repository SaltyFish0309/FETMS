import React from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface KanbanBoardProps {
    children: React.ReactNode;
    onDragEnd: (event: DragEndEvent) => void;
    onDragStart?: (event: DragStartEvent) => void;
    dragOverlay?: React.ReactNode;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ children, onDragEnd, onDragStart, dragOverlay }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="flex h-full gap-6 overflow-x-auto pb-4">
                {children}
            </div>
            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                {dragOverlay}
            </DragOverlay>
        </DndContext>
    );
};
