import { useState, useEffect } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { teacherService } from '../../services/teacherService';
import { toast } from 'sonner';
import type { DocumentBox, AdHocDocument } from '@/types/document';

export const useDocumentManager = (
    teacherId: string,
    initialBoxes: DocumentBox[],
    documents: AdHocDocument[],
    onRefresh: () => void
) => {
    // Local State Mapped from Props (for Optimistic Updates)
    const [columns, setColumns] = useState<Record<string, AdHocDocument[]>>({});
    const [boxes, setBoxes] = useState<DocumentBox[]>([]);

    const [activeItem, setActiveItem] = useState<(AdHocDocument & { type: 'Doc' }) | (DocumentBox & { type: 'Box' }) | null>(null);

    // Box Management State
    const [isCreatingBox, setIsCreatingBox] = useState(false);
    const [editingBox, setEditingBox] = useState<{ id: string, name: string } | null>(null);
    const [boxToDelete, setBoxToDelete] = useState<{ id: string, name: string } | null>(null);

    // Sync Props to Local State
    useEffect(() => {
        const sortedBoxes = [
            { _id: 'uncategorized-box', name: 'Uncategorized', order: -1 },
            ...[...initialBoxes].sort((a, b) => a.order - b.order)
        ];
        setBoxes(sortedBoxes);

        const newColumns: Record<string, AdHocDocument[]> = {};
        sortedBoxes.forEach(box => {
            const docsInBox = documents.filter(d => {
                if (box._id === 'uncategorized-box') return !d.boxId;
                return d.boxId === box._id;
            });
            newColumns[box._id] = docsInBox;
        });
        setColumns(newColumns);

    }, [initialBoxes, documents]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;

        if (active.data.current?.type === 'column') {
            const box = boxes.find(b => b._id === active.id);
            if (box) setActiveItem({ type: 'Box', ...box });
        } else {
            let foundDoc: AdHocDocument | null = null;
            Object.values(columns).forEach(col => {
                const d = col.find(item => item._id === active.id);
                if (d) foundDoc = d;
            });
            if (foundDoc) setActiveItem({ type: 'Doc' as const, ...(foundDoc as AdHocDocument) });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        // 1. Box Reordering
        if (active.data.current?.type === 'column') {
            if (active.id !== over.id) {
                const oldIndex = boxes.findIndex(b => b._id === active.id);
                const newIndex = boxes.findIndex(b => b._id === over.id);

                if (boxes[oldIndex]._id === 'uncategorized-box' || boxes[newIndex]._id === 'uncategorized-box') {
                    return;
                }

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newBoxes = arrayMove(boxes, oldIndex, newIndex);
                    setBoxes(newBoxes);

                    try {
                        const boxIds = newBoxes
                            .filter(b => b._id !== 'uncategorized-box')
                            .map(b => b._id);
                        await teacherService.reorderBoxes(teacherId, boxIds);
                    } catch {
                        toast.error('Failed to reorder boxes');
                        onRefresh();
                    }
                }
            }
            return;
        }

        // 2. Document Moving
        const activeId = active.id as string;
        const overId = over.id as string;

        const sourceBoxId = Object.keys(columns).find(key => columns[key].some(d => d._id === activeId));
        let destBoxId = Object.keys(columns).find(key => columns[key].some(d => d._id === overId));

        if (!destBoxId && boxes.some(b => b._id === overId)) {
            destBoxId = overId;
        }

        if (!sourceBoxId || !destBoxId) return;

        const sourceColumn = [...columns[sourceBoxId]];
        const destColumn = sourceBoxId === destBoxId ? sourceColumn : [...columns[destBoxId]];

        const oldIndex = sourceColumn.findIndex(d => d._id === activeId);
        let newIndex = destColumn.findIndex(d => d._id === overId);

        if (newIndex === -1) newIndex = destColumn.length;

        if (sourceBoxId === destBoxId) {
            if (oldIndex !== newIndex) {
                const reordered = arrayMove(sourceColumn, oldIndex, newIndex);
                setColumns({ ...columns, [sourceBoxId]: reordered });

                try {
                    const payload = reordered.map(d => ({
                        _id: d._id,
                        boxId: sourceBoxId === 'uncategorized-box' ? undefined : sourceBoxId
                    }));
                    await teacherService.reorderAdHocDocuments(teacherId, payload);
                } catch {
                    toast.error('Refreshed');
                    onRefresh();
                }
            }
        } else {
            const [movedDoc] = sourceColumn.splice(oldIndex, 1);
            const newBoxId = destBoxId === 'uncategorized-box' ? undefined : destBoxId;
            const updatedDoc = { ...movedDoc, boxId: newBoxId };

            destColumn.splice(newIndex, 0, updatedDoc);

            setColumns({
                ...columns,
                [sourceBoxId]: sourceColumn,
                [destBoxId]: destColumn
            });

            try {
                const allAffected = [...sourceColumn, ...destColumn];
                const payload = allAffected.map(d => ({
                    _id: d._id,
                    boxId: d.boxId
                }));

                await teacherService.reorderAdHocDocuments(teacherId, payload);
                toast.success('Moved');
            } catch {
                toast.error('Failed to move');
                onRefresh();
            }
        }
    };

    const createBox = async (name: string) => {
        try {
            await teacherService.createBox(teacherId, name);
            setIsCreatingBox(false);
            toast.success('Box created');
            onRefresh();
        } catch { toast.error('Error creating box'); }
    };

    const updateBox = async (name: string) => {
        if (!editingBox) return;
        try {
            await teacherService.updateBox(teacherId, editingBox.id, { name });
            setEditingBox(null);
            toast.success('Box updated');
            onRefresh();
        } catch { toast.error('Error updating box'); }
    };

    const deleteBox = async () => {
        if (!boxToDelete) return;
        try {
            await teacherService.deleteBox(teacherId, boxToDelete.id);
            toast.success('Box deleted');
            onRefresh();
        } catch { toast.error('Error deleting box'); }
        finally { setBoxToDelete(null); }
    };

    const downloadBoxZip = async (boxId: string) => {
        try {
            toast.success('Download started');
            const blob = await teacherService.downloadBox(teacherId, boxId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `box-${boxId}.zip`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch { toast.error('Download failed'); }
    };

    const downloadBoxFiles = (boxId: string) => {
        const boxDocs = columns[boxId] || [];
        if (boxDocs.length === 0) { toast.error("No documents"); return; }
        boxDocs.forEach(d => window.open(`http://localhost:5000/${d.filePath.replace(/\\/g, '/')}`, '_blank'));
    };

    return {
        columns,
        boxes,
        activeItem,
        isCreatingBox,
        setIsCreatingBox,
        editingBox,
        setEditingBox,
        boxToDelete,
        setBoxToDelete,
        handleDragStart,
        handleDragEnd,
        createBox,
        updateBox,
        deleteBox,
        downloadBoxZip,
        downloadBoxFiles
    };
};
