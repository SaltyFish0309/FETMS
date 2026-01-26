import { useState } from 'react';
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

interface HardDeleteDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function HardDeleteDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: HardDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      await projectService.hardDelete(project._id);
      toast.success('Project permanently deleted');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete project';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete <strong>{project?.name}</strong>?
            <br />
            <br />
            <span className="text-red-600 font-semibold">
              This action cannot be undone.
            </span>
            <br />
            This will only work if the project has no associated teachers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
