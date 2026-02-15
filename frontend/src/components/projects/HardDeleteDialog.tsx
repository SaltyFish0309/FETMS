import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('settings');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      await projectService.hardDelete(project._id);
      toast.success(t('projects.toast.hardDeleteSuccess'));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || t('projects.toast.error');
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('projects.deleteConfirm.hardDeleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('projects.deleteConfirm.hardDeleteDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t('projects.deleteConfirm.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : t('projects.deleteConfirm.hardDeleteConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
