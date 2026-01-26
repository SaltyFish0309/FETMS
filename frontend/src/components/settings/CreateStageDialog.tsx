import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CreateStageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    onTitleChange: (title: string) => void;
    onCreate: () => void;
}

export function CreateStageDialog({
    open,
    onOpenChange,
    title,
    onTitleChange,
    onCreate,
}: CreateStageDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Pipeline Stage</DialogTitle>
                    <DialogDescription>Add a new stage to the recruitment pipeline</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">Stage Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            placeholder="e.g., Interview Scheduled"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onCreate}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
