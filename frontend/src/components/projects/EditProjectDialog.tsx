import { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        code: project.code,
        description: project.description || '',
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    try {
      await projectService.update(project._id, formData);
      toast.success('Project updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to update project', error);
      toast.error('Failed to update project');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Project Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-code">Project Code</Label>
            <Input
              id="edit-code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled
              className="bg-slate-100"
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
