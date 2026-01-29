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

interface ConfirmDeleteDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ConfirmDeleteDialog({ project, open, onOpenChange, onSuccess }: ConfirmDeleteDialogProps) {
  const { t } = useTranslation('settings');

  const handleDelete = async () => {
    if (!project) return;

    try {
      await projectService.delete(project._id);
      toast.success(t('projects.toast.deleteSuccess'));
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to archive project', error);
      toast.error(t('projects.toast.error'));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('projects.deleteConfirm.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('projects.deleteConfirm.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('projects.deleteConfirm.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>{t('projects.deleteConfirm.confirm')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
