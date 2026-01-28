import React from 'react';
import { KanbanColumn } from '../kanban/KanbanColumn';
import { MoreVertical, Download, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentCard } from './DocumentCard';
import type { AdHocDocument } from '@/types/document';

interface DocumentBoxProps {
    box: {
        _id: string;
        name: string;
        order: number;
    };
    documents: AdHocDocument[];
    onDeleteBox: (id: string) => void;
    onUpdateBox: (id: string) => void;
    onDownloadBoxZip: (id: string) => void;
    onDownloadBoxFiles: (id: string) => void;
    onDeleteDoc: (id: string) => void;
    onUpdateDoc: (doc: AdHocDocument) => void;
    isUncategorized?: boolean;
}

export const DocumentBox: React.FC<DocumentBoxProps> = ({
    box,
    documents,
    onDeleteBox,
    onUpdateBox,
    onDownloadBoxZip,
    onDownloadBoxFiles,
    onDeleteDoc,
    onUpdateDoc,
    isUncategorized = false
}) => {
    // Header
    const Header = (
        <div className="flex items-center justify-between mb-2 group">
            <div className="flex items-center gap-2 overflow-hidden">

                <h3 className="font-semibold text-foreground truncate px-1" title={box.name}>{box.name}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {documents.length}
                </span>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={14} className="text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDownloadBoxZip(box._id)}>
                        <Download className="mr-2 h-4 w-4" /> Download Zip
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownloadBoxFiles(box._id)}>
                        <Download className="mr-2 h-4 w-4" /> Open Files
                    </DropdownMenuItem>
                    {!isUncategorized && (
                        <>
                            <DropdownMenuItem onClick={() => onUpdateBox(box._id)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDeleteBox(box._id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    return (
        <KanbanColumn
            id={box._id}
            items={documents.map(d => d._id)}
            title={Header}
            className="w-80 shrink-0 bg-muted/50 p-3 rounded-xl border border-border/60 h-full max-h-full flex flex-col"
        >
            {documents.length === 0 && (
                <div className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    Empty Box
                </div>
            )}
            {documents.map((doc) => (
                <DocumentCard
                    key={doc._id}
                    doc={doc}
                    onDelete={onDeleteDoc}
                    onUpdate={onUpdateDoc}
                />
            ))}
        </KanbanColumn>
    );
};
