import React from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentBox } from './DocumentBox';
import { KanbanBoard } from '../kanban/KanbanBoard';
import { SortableColumn } from '../kanban/SortableColumn';
import { DocumentCard } from './DocumentCard';
import { useDocumentManager } from './useDocumentManager';
import { CreateBoxDialog, RenameBoxDialog, DeleteBoxDialog } from './BoxManagementDialogs';
import type { DocumentBox as DocumentBoxType, AdHocDocument } from '@/types/document';

interface DocumentManagerProps {
    teacherId: string;
    boxes: DocumentBoxType[];
    documents: AdHocDocument[];
    onRefresh: () => void;
    onEditDoc: (docId: string, currentName: string) => void;
    onDeleteDoc: (docId: string) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
    teacherId,
    boxes: initialBoxes,
    documents,
    onRefresh,
    onEditDoc,
    onDeleteDoc
}) => {
    const {
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
    } = useDocumentManager(teacherId, initialBoxes, documents, onRefresh);

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Document Organization</h2>
                    <p className="text-xs text-muted-foreground">Drag documents to organize.</p>
                </div>
                <Button onClick={() => setIsCreatingBox(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New Box
                </Button>
            </div>

            <div className="flex-1 overflow-x-auto min-h-[500px]">
                <KanbanBoard
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    dragOverlay={
                        activeItem ? (
                            activeItem.type === 'Box' ? (
                                <div className="w-80 bg-card p-3 rounded-xl border border-blue-400 shadow-2xl cursor-grabbing flex gap-2 opacity-90">
                                    <FolderOpen className="text-blue-500" />
                                    <h3 className="font-semibold">{activeItem.name}</h3>
                                </div>
                            ) : (
                                <div className="w-80">
                                    <DocumentCard doc={activeItem} onDelete={() => { }} onUpdate={() => { }} />
                                </div>
                            )
                        ) : null
                    }
                >
                    {/* Uncategorized Fixed First */}
                    {boxes.filter(b => b._id === 'uncategorized-box').map(box => (
                        <DocumentBox
                            key={box._id}
                            box={box}
                            documents={columns[box._id] || []}
                            onDeleteBox={() => { }}
                            onUpdateBox={() => { }}
                            onDownloadBoxZip={() => downloadBoxZip('uncategorized')}
                            onDownloadBoxFiles={() => downloadBoxFiles('uncategorized')}
                            onDeleteDoc={onDeleteDoc}
                            onUpdateDoc={(doc) => onEditDoc(doc._id, doc.name)}
                            isUncategorized={true}
                        />
                    ))}

                    {/* Draggable Boxes */}
                    <SortableContext
                        items={boxes.filter(b => b._id !== 'uncategorized-box').map(b => b._id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {boxes.filter(b => b._id !== 'uncategorized-box').map(box => (
                            <SortableColumn key={box._id} id={box._id}>
                                <DocumentBox
                                    box={box}
                                    documents={columns[box._id] || []}
                                    onDeleteBox={() => setBoxToDelete({ id: box._id, name: box.name })}
                                    onUpdateBox={(id) => setEditingBox({ id, name: box.name })}
                                    onDownloadBoxZip={downloadBoxZip}
                                    onDownloadBoxFiles={downloadBoxFiles}
                                    onDeleteDoc={onDeleteDoc}
                                    onUpdateDoc={(doc) => onEditDoc(doc._id, doc.name)}
                                />
                            </SortableColumn>
                        ))}
                    </SortableContext>
                </KanbanBoard>
            </div>

            <CreateBoxDialog
                isOpen={isCreatingBox}
                onOpenChange={setIsCreatingBox}
                onSubmit={createBox}
            />

            <RenameBoxDialog
                isOpen={!!editingBox}
                onOpenChange={(open) => !open && setEditingBox(null)}
                currentName={editingBox?.name || ''}
                onSubmit={updateBox}
            />

            <DeleteBoxDialog
                isOpen={!!boxToDelete}
                onOpenChange={(open) => !open && setBoxToDelete(null)}
                onConfirm={deleteBox}
            />
        </div>
    );
};
