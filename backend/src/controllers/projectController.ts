import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService.js';

export class ProjectController {
  static async getAllProjects(req: Request, res: Response) {
    try {
      const projects = await ProjectService.getAllProjects();
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
      const project = await ProjectService.getProjectById(req.params.id);
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
      const project = await ProjectService.updateProject(req.params.id, req.body);
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
      const success = await ProjectService.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting project', error });
    }
  }
}
