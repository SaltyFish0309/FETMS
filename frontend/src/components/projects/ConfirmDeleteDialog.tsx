import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { projectService, type Project } from '@/services/projectService';
import { toast } from 'sonner';

interface ConfirmDeleteDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ConfirmDeleteDialog({ project, open, onOpenChange, onSuccess }: ConfirmDeleteDialogProps) {
  const handleDelete = async () => {
    if (!project) return;

    try {
      await projectService.delete(project._id);
      toast.success('Project archived successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to archive project', error);
      toast.error('Failed to archive project');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will archive the project "{project?.name}". Archived projects will no longer appear in the project selector.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Archive</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
