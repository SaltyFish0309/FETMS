import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,

  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { toast } from 'sonner';

interface CreateProjectDialogProps {
  onSuccess: () => void;
}

export function CreateProjectDialog({ onSuccess }: CreateProjectDialogProps) {
  const { t } = useTranslation('settings');
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectService.create(formData);
      toast.success(t('projects.toast.createSuccess'));
      setIsOpen(false);
      setFormData({ name: '', code: '', description: '' });
      onSuccess();
    } catch (error) {
      console.error('Failed to create project', error);
      toast.error(t('projects.toast.error'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('projects.page.addButton')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('projects.dialog.createTitle')}</DialogTitle>
          <DialogDescription>
            {t('projects.dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="create-name">{t('projects.dialog.fields.name.label')}</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('projects.dialog.fields.name.placeholder')}
              required
            />
          </div>
          <div>
            <Label htmlFor="create-code">{t('projects.dialog.fields.code.label')}</Label>
            <Input
              id="create-code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder={t('projects.dialog.fields.code.placeholder')}
              required
            />
          </div>
          <div>
            <Label htmlFor="create-description">{t('projects.dialog.fields.description.label')}</Label>
            <Input
              id="create-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('projects.dialog.fields.description.placeholder')}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              {t('projects.dialog.buttons.cancel')}
            </Button>
            <Button type="submit">{t('projects.dialog.buttons.create')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
