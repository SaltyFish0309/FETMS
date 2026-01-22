import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CreateBoxDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (name: string) => void;
}

export const CreateBoxDialog: React.FC<CreateBoxDialogProps> = ({ isOpen, onOpenChange, onSubmit }) => {
    const [name, setName] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name);
        setName('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Create New Box</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Box Name" autoFocus />
                    <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

interface RenameBoxDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    currentName: string;
    onSubmit: (name: string) => void;
}

export const RenameBoxDialog: React.FC<RenameBoxDialogProps> = ({ isOpen, onOpenChange, currentName, onSubmit }) => {
    const [name, setName] = React.useState(currentName);

    React.useEffect(() => {
        if (isOpen) setName(currentName);
    }, [isOpen, currentName]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Rename Box</DialogTitle></DialogHeader>
                <Input value={name} onChange={e => setName(e.target.value)} />
                <DialogFooter><Button onClick={() => onSubmit(name)}>Save</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface DeleteBoxDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export const DeleteBoxDialog: React.FC<DeleteBoxDialogProps> = ({ isOpen, onOpenChange, onConfirm }) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>Moving content to Uncategorized.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="bg-red-600">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
