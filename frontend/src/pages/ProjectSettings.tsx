import { useEffect, useState, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectContext } from '@/contexts/ProjectContext';
import { projectService, type Project } from '@/services/projectService';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Archive, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { EditProjectDialog } from '@/components/projects/EditProjectDialog';
import { ConfirmDeleteDialog } from '@/components/projects/ConfirmDeleteDialog';
import { HardDeleteDialog } from '@/components/projects/HardDeleteDialog';

// Memoized ProjectRow component for performance
const ProjectRow = memo(({
  project,
  onEdit,
  onArchive,
  onRestore,
  onHardDelete,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onArchive: (project: Project) => void;
  onRestore: (project: Project) => void;
  onHardDelete: (project: Project) => void;
}) => {
  const { t } = useTranslation('settings');

  return (
    <TableRow key={project._id}>
      <TableCell className="font-medium">{project.name}</TableCell>
      <TableCell>{project.code}</TableCell>
      <TableCell>{project.description || '-'}</TableCell>
      <TableCell>
        <Badge variant={project.isActive ? 'default' : 'secondary'}>
          {project.isActive ? t('projects.status.active') : t('projects.status.archived')}
        </Badge>
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(project)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t('projects.actions.edit')}
        </Button>
        {project.isActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(project)}
          >
            <Archive className="mr-2 h-4 w-4" />
            {t('projects.actions.archive')}
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(project)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('projects.actions.restore')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onHardDelete(project)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('projects.actions.deletePermanently')}
            </Button>
          </>
        )}
      </TableCell>
    </TableRow>
  );
});

ProjectRow.displayName = 'ProjectRow';

export default function ProjectSettings() {
  const { t } = useTranslation('settings');
  const { refreshProjects } = useProjectContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isHardDeleteOpen, setIsHardDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectService.getAll(true); // Include archived projects
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects', error);
      toast.error(t('projects.toast.error'));
    }
  }, [t]);

  // Initial data loading on mount - standard React pattern
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSuccess = async () => {
    await loadProjects();
    await refreshProjects();
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const openHardDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsHardDeleteOpen(true);
  };

  const handleRestore = async (project: Project) => {
    try {
      await projectService.restore(project._id);
      toast.success(t('projects.toast.restoreSuccess'));
      await handleSuccess();
    } catch (error) {
      console.error('Failed to restore project:', error);
      toast.error(t('projects.toast.error'));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('projects.page.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('projects.page.subtitle')}</p>
        </div>
        <CreateProjectDialog onSuccess={handleSuccess} />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('projects.table.columns.name')}</TableHead>
              <TableHead>{t('projects.table.columns.code')}</TableHead>
              <TableHead>{t('projects.table.columns.description')}</TableHead>
              <TableHead>{t('projects.table.columns.status')}</TableHead>
              <TableHead className="text-right">{t('projects.table.columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectRow
                  key={project._id}
                  project={project}
                  onEdit={openEditDialog}
                  onArchive={openDeleteDialog}
                  onRestore={handleRestore}
                  onHardDelete={openHardDeleteDialog}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  {t('projects.table.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EditProjectDialog
        project={selectedProject}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleSuccess}
      />

      <ConfirmDeleteDialog
        project={selectedProject}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={handleSuccess}
      />

      <HardDeleteDialog
        project={selectedProject}
        open={isHardDeleteOpen}
        onOpenChange={setIsHardDeleteOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
