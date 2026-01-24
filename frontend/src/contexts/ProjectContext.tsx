import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { projectService, Project } from '../services/projectService';

interface ProjectContextValue {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string) => void;
  projects: Project[];
  loading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(() => {
    return localStorage.getItem('selectedProjectId') || null;
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);

      // Auto-select first project if none selected
      if (!selectedProjectId && data.length > 0) {
        const firstProjectId = data[0]._id;
        setSelectedProjectIdState(firstProjectId);
        localStorage.setItem('selectedProjectId', firstProjectId);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Persist to localStorage when selection changes
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
    }
  }, [selectedProjectId]);

  const setSelectedProjectId = useCallback((id: string) => {
    setSelectedProjectIdState(id);
  }, []);

  const refreshProjects = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  const value: ProjectContextValue = {
    selectedProjectId,
    setSelectedProjectId,
    projects,
    loading,
    refreshProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}
