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
}
