import React, { useState } from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanBoard } from '../kanban/KanbanBoard';
import { KanbanColumn } from '../kanban/KanbanColumn';
import { KanbanCard } from '../kanban/KanbanCard';
import { SortableColumn } from '../kanban/SortableColumn';
import type { Teacher } from '../../services/teacherService';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useTeacherKanban } from './kanban/useTeacherKanban';
import { AddStageDialog } from './kanban/AddStageDialog';

interface TeacherKanbanBoardProps {
    teachers: Teacher[];
    onRefresh: () => void;
    selectedStages?: string[];
}

export const TeacherKanbanBoard: React.FC<TeacherKanbanBoardProps> = ({ teachers, onRefresh, selectedStages = [] }) => {
    const {
        columns,
        stages,
        activeTeacher,
        activeColumn,
        handleDragStart,
        handleDragEnd,
        createStage,
        deleteStage
    } = useTeacherKanban(teachers, onRefresh);

    const [isAddingStage, setIsAddingStage] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = (teacherId: string) => {
        navigate(`/teachers/${teacherId}`);
    };

    const handleDeleteStageWrapper = (stageId: string) => {
        if (!confirm('Delete this stage? Teachers will be moved to Uncategorized.')) return;
        deleteStage(stageId);
    };

    // Filter stages based on selectedStages prop
    const visibleStages = stages.filter(stage => {
        if (stage._id === 'uncategorized') return true;
        if (selectedStages.length === 0) return true;
        return selectedStages.includes(stage._id);
    });

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsAddingStage(true)} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Stage
                </Button>
            </div>

            <KanbanBoard
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                dragOverlay={
                    activeTeacher ? (
                        <div className="bg-card p-3 rounded-lg shadow-xl border border-primary/50 w-[280px] cursor-grabbing">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`http://localhost:5000/uploads/${activeTeacher._id}/profile.jpg`} />
                                    <AvatarFallback>{activeTeacher.firstName[0]}{activeTeacher.lastName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-sm text-foreground">{activeTeacher.firstName} {activeTeacher.lastName}</h4>
                                    <p className="text-xs text-muted-foreground">{activeTeacher.email}</p>
                                </div>
                            </div>
                        </div>
                    ) : activeColumn ? (
                        <div className="w-80 h-[500px] bg-muted/80 p-3 rounded-xl border border-border/60 opacity-80 cursor-grabbing">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-foreground">{activeColumn.title}</h3>
                            </div>
                        </div>
                    ) : null
                }
            >
                {/* Render Uncategorized Fixed First */}
                {visibleStages.filter(s => s._id === 'uncategorized').map(stage => (
                    <KanbanColumn
                        key={stage._id}
                        id={stage._id}
                        items={columns[stage._id]?.map(t => t._id) || []}
                        title={
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">{stage.title}</h3>
                                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                        {columns[stage._id]?.length || 0}
                                    </Badge>
                                </div>
                            </div>
                        }
                        className="w-80 min-w-[320px] bg-muted/50 p-3 rounded-xl border border-border/60"
                    >
                        {columns[stage._id]?.map(teacher => (
                            <div key={teacher._id} onClick={() => handleCardClick(teacher._id)}>
                                <KanbanCard id={teacher._id}>
                                    <div className="bg-card p-3 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing hover:border-primary/50">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`http://localhost:5000/uploads/${teacher._id}/profile.jpg`} />
                                                <AvatarFallback>{teacher.firstName[0]}{teacher.lastName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm text-foreground truncate">{teacher.firstName} {teacher.lastName}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                                {Object.keys(teacher.documents || {}).filter(k => (teacher.documents as Record<string, { status?: string }>)[k]?.status === 'valid').length} Docs
                                            </Badge>
                                        </div>
                                    </div>
                                </KanbanCard>
                            </div>
                        ))}
                    </KanbanColumn>
                ))}

                {/* Render Draggable Stages */}
                <SortableContext items={visibleStages.filter(s => s._id !== 'uncategorized').map(s => s._id)} strategy={horizontalListSortingStrategy}>
                    {visibleStages.filter(s => s._id !== 'uncategorized').map(stage => (
                        <SortableColumn key={stage._id} id={stage._id}>
                            <KanbanColumn
                                id={stage._id}
                                items={columns[stage._id]?.map(t => t._id) || []}
                                title={
                                    <div className="flex items-center justify-between mb-2 group cursor-grab active:cursor-grabbing">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-foreground">{stage.title}</h3>
                                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                                {columns[stage._id]?.length || 0}
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStageWrapper(stage._id);
                                            }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                }
                                className="w-80 min-w-[320px] bg-muted/50 p-3 rounded-xl border border-border/60 h-full"
                            >
                                {columns[stage._id]?.map(teacher => (
                                    <div key={teacher._id} onClick={() => handleCardClick(teacher._id)}>
                                        <KanbanCard id={teacher._id}>
                                            <div className="bg-card p-3 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing hover:border-primary/50">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={`http://localhost:5000/uploads/${teacher._id}/profile.jpg`} />
                                                        <AvatarFallback>{teacher.firstName[0]}{teacher.lastName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm text-foreground truncate">{teacher.firstName} {teacher.lastName}</h4>
                                                        <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                                        {Object.keys(teacher.documents || {}).filter(k => (teacher.documents as Record<string, { status?: string }>)[k]?.status === 'valid').length} Docs
                                                    </Badge>
                                                </div>
                                            </div>
                                        </KanbanCard>
                                    </div>
                                ))}
                            </KanbanColumn>
                        </SortableColumn>
                    ))}
                </SortableContext>
            </KanbanBoard>

            <AddStageDialog
                isOpen={isAddingStage}
                onOpenChange={setIsAddingStage}
                onAddStage={createStage}
            />
        </div>
    );
};
