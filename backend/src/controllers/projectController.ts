import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService.js';

export class ProjectController {
  static async getAllProjects(req: Request, res: Response) {
    try {
      const includeArchived = req.query.includeArchived === 'true';
      const projects = await ProjectService.getAllProjects(includeArchived);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects', error });
    }
  }

  static async createProject(req: Request, res: Response) {
    try {
      const project = await ProjectService.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error creating project', error });
    }
  }

  static async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Project ID is required' });
      }
      const project = await ProjectService.getProjectById(id);
      if (!project) {
        return res.status(404).json({ message: 'Not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching project', error });
    }
  }

  static async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Project ID is required' });
      }
      const project = await ProjectService.updateProject(id, req.body);
      if (!project) {
        return res.status(404).json({ message: 'Not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error updating project', error });
    }
  }

  static async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Project ID is required' });
      }
      const success = await ProjectService.deleteProject(id);
      if (!success) {
        return res.status(404).json({ message: 'Not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting project', error });
    }
  }

  static async restoreProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Project ID is required' });
      }
      const project = await ProjectService.restoreProject(id);
      if (!project) {
        return res.status(404).json({ message: 'Not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error restoring project', error });
    }
  }

  static async hardDeleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Project ID is required' });
      }
      await ProjectService.hardDeleteProject(id);
      res.json({ message: 'Project permanently deleted' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = message === 'Project not found' ? 404 : 400;
      res.status(statusCode).json({ message });
    }
  }
}
