import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { projectService, type Project } from '@/services/projectService';
import { toast } from 'sonner';

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditProjectDialog({ project, open, onOpenChange, onSuccess }: EditProjectDialogProps) {
  const { t } = useTranslation('settings');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  // Initial form data loading from props - standard React pattern
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        code: project.code,
        description: project.description || '',
      });
    }
  }, [project]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    try {
      await projectService.update(project._id, formData);
      toast.success(t('projects.toast.updateSuccess'));
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to update project', error);
      toast.error(t('projects.toast.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('projects.dialog.editTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">{t('projects.dialog.fields.name.label')}</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('projects.dialog.fields.name.placeholder')}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-code">{t('projects.dialog.fields.code.label')}</Label>
            <Input
              id="edit-code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder={t('projects.dialog.fields.code.placeholder')}
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="edit-description">{t('projects.dialog.fields.description.label')}</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('projects.dialog.fields.description.placeholder')}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('projects.dialog.buttons.cancel')}
            </Button>
            <Button type="submit">{t('projects.dialog.buttons.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
