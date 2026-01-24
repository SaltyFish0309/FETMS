import { useEffect, useState, useCallback } from 'react';
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
import { Pencil, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { EditProjectDialog } from '@/components/projects/EditProjectDialog';
import { ConfirmDeleteDialog } from '@/components/projects/ConfirmDeleteDialog';

export default function ProjectSettings() {
  const { refreshProjects } = useProjectContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects', error);
      toast.error('Failed to load projects');
    }
  }, []);

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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Settings</h1>
        <CreateProjectDialog onSuccess={handleSuccess} />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.code}</TableCell>
                  <TableCell>{project.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={project.isActive ? 'default' : 'secondary'}>
                      {project.isActive ? 'Active' : 'Archived'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(project)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(project)}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No projects found.
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
    </div>
  );
}
