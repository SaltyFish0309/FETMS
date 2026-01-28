import React from 'react';
import { KanbanCard } from '../kanban/KanbanCard';
import { FileText, FileImage, MoreVertical, Download, Trash2, Edit2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { AdHocDocument } from '@/types/document';

interface DocumentCardProps {
    doc: AdHocDocument;
    onDelete: (id: string) => void;
    onUpdate: (doc: AdHocDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onDelete, onUpdate }) => {
    const isImage = doc.filePath.match(/\.(jpg|jpeg|png|gif)$/i);
    const downloadUrl = `http://localhost:5000/${doc.filePath.replace(/\\/g, '/')}`;

    return (
        <KanbanCard id={doc._id}>
            <div className="bg-card p-3 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing hover:border-blue-300 group">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isImage ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {isImage ? <FileImage size={20} /> : <FileText size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-foreground truncate pr-2" title={doc.name}>
                                {doc.name}
                            </h4>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-2"
                                        onClick={(e) => e.stopPropagation()} // Prevent card drag/click
                                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                                    >
                                        <MoreVertical size={14} className="text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => window.open(downloadUrl, '_blank')}>
                                        <Download className="mr-2 h-4 w-4" /> Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onUpdate(doc)}>
                                        <Edit2 className="mr-2 h-4 w-4" /> Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(doc._id)} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                            {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'Unknown Date'}
                        </p>
                    </div>
                </div>
            </div>
        </KanbanCard>
    );
};
