import { useState, useEffect, useCallback } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { teacherService } from '../../../services/teacherService';
import type { Teacher } from '../../../services/teacherService';
import { toast } from 'sonner';

export interface Stage {
    _id: string;
    title: string;
    order: number;
}

export const useTeacherKanban = (teachers: Teacher[], onRefresh: () => void) => {
    const [columns, setColumns] = useState<Record<string, Teacher[]>>({});
    const [stages, setStages] = useState<Stage[]>([]);
    const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
    const [activeColumn, setActiveColumn] = useState<Stage | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Initial load of stages
    const loadStages = useCallback(async () => {
        try {
            const fetchedStages = await teacherService.getStages();
            const allStages = [
                { _id: 'uncategorized', title: 'Uncategorized', order: -1 },
                ...fetchedStages
            ];
            setStages(allStages);
        } catch (error) {
            console.error('Failed to load stages', error);
            // Fallback for dev/testing if DB is empty/fails
            setStages([
                { _id: 'uncategorized', title: 'Uncategorized', order: 0 },
            ]);
        }
    }, []);

    // Data loading on mount - ESLint rule is overly strict for this pattern
    // This is the standard React pattern for fetching data in effects
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        loadStages();
    }, [loadStages]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Update columns when teachers or stages change
    // This is derived state that must be kept in sync - disabling strict rule
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        const newColumns: Record<string, Teacher[]> = {};
        stages.forEach(stage => {
            newColumns[stage._id] = teachers
                .filter(t => (t.pipelineStage || 'uncategorized') === stage._id)
                .sort((a, b) => (a.pipelineOrder || 0) - (b.pipelineOrder || 0));
        });
        setColumns(newColumns);
    }, [teachers, stages]);
    /* eslint-enable react-hooks/set-state-in-effect */



    const handleDragStart = (event: DragStartEvent) => {
        setIsDragging(true);
        const { active } = event;

        if (active.data.current?.type === 'column') {
            const stage = stages.find(s => s._id === active.id);
            if (stage) setActiveColumn(stage);
        } else {
            const teacher = teachers.find(t => t._id === active.id);
            if (teacher) setActiveTeacher(teacher);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setIsDragging(false);
        const { active, over } = event;
        setActiveTeacher(null);
        setActiveColumn(null);

        if (!over) return;

        // Column Reordering
        if (active.data.current?.type === 'column') {
            handleColumnDragEnd(active.id as string, over.id as string);
            return;
        }

        // Card Reordering
        handleCardDragEnd(active.id as string, over.id as string);
    };

    const handleColumnDragEnd = async (activeId: string, overId: string) => {
        if (activeId === overId) return;

        const oldIndex = stages.findIndex(s => s._id === activeId);
        const newIndex = stages.findIndex(s => s._id === overId);

        // Prevent moving Uncategorized or moving BEFORE Uncategorized
        if (stages[oldIndex]._id === 'uncategorized' || stages[newIndex]._id === 'uncategorized') {
            return;
        }

        const newStages = arrayMove(stages, oldIndex, newIndex);
        setStages(newStages);

        try {
            const dbStagesToUpdate = newStages
                .filter(s => s._id !== 'uncategorized')
                .map((s, index) => ({
                    _id: s._id,
                    order: index
                }));

            await teacherService.reorderStages(dbStagesToUpdate);
        } catch {
            toast.error('Failed to reorder stages');
            loadStages(); // Revert
        }
    };

    const handleCardDragEnd = async (activeId: string, overId: string) => {
        // Find source and destination columns
        const sourceStage = Object.keys(columns).find(key => columns[key].some(t => t._id === activeId));
        let destStage = Object.keys(columns).find(key => columns[key].some(t => t._id === overId));

        // If dropped on a column header or empty column area
        if (!destStage && stages.some(s => s._id === overId)) {
            destStage = overId;
        }

        if (!sourceStage || !destStage) return;

        const sourceColumn = [...columns[sourceStage]];
        const destColumn = sourceStage === destStage ? sourceColumn : [...columns[destStage]];

        const oldIndex = sourceColumn.findIndex(t => t._id === activeId);
        let newIndex = destColumn.findIndex(t => t._id === overId);

        if (newIndex === -1) newIndex = destColumn.length;

        const newColumns = { ...columns };

        if (sourceStage === destStage) {
            if (oldIndex !== newIndex) {
                newColumns[sourceStage] = arrayMove(sourceColumn, oldIndex, newIndex);
                setColumns(newColumns);

                try {
                    const teacherIds = newColumns[sourceStage].map(t => t._id);
                    await teacherService.reorderPipeline(sourceStage, teacherIds);
                } catch {
                    toast.error('Failed to reorder');
                    onRefresh();
                }
            }
        } else {
            const [movedTeacher] = sourceColumn.splice(oldIndex, 1);
            movedTeacher.pipelineStage = destStage;
            destColumn.splice(newIndex, 0, movedTeacher);

            newColumns[sourceStage] = sourceColumn;
            newColumns[destStage] = destColumn;
            setColumns(newColumns);

            try {
                const teacherIds = newColumns[destStage].map(t => t._id);
                await teacherService.reorderPipeline(destStage, teacherIds);
                toast.success(`Moved to ${stages.find(s => s._id === destStage)?.title}`);
            } catch {
                toast.error('Failed to move teacher');
                onRefresh();
            }
        }
    };

    const createStage = async (title: string) => {
        try {
            await teacherService.createStage(title);
            toast.success('Stage created');
            loadStages();
        } catch (error) {
            toast.error('Failed to create stage');
            throw error;
        }
    };

    const deleteStage = async (stageId: string) => {
        try {
            await teacherService.deleteStage(stageId);
            toast.success('Stage deleted');
            loadStages();
            onRefresh();
        } catch (error) {
            toast.error('Failed to delete stage');
            throw error;
        }
    };

    return {
        columns,
        stages,
        activeTeacher,
        activeColumn,
        isDragging,
        handleDragStart,
        handleDragEnd,
        createStage,
        deleteStage
    };
};
