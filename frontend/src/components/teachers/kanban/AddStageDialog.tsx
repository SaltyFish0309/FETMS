import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface AddStageDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddStage: (title: string) => Promise<void>;
}

export const AddStageDialog: React.FC<AddStageDialogProps> = ({ isOpen, onOpenChange, onAddStage }) => {
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            await onAddStage(title);
            setTitle('');
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Stage</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="stageTitle">Stage Title</Label>
                        <Input
                            id="stageTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Interview, Offer Sent"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>Create Stage</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
