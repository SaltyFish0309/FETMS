import Project, { IProject } from '../models/Project.js';

export class ProjectService {
  static async getAllProjects(): Promise<IProject[]> {
    return await Project.find({ isActive: true }).sort({ createdAt: 1 });
  }

  static async getProjectById(id: string): Promise<IProject | null> {
    return await Project.findById(id);
  }

  static async getProjectByCode(code: string): Promise<IProject | null> {
    return await Project.findOne({ code: code.toUpperCase(), isActive: true });
  }

  static async createProject(data: Partial<IProject>): Promise<IProject> {
    const project = new Project({
      ...data,
      code: data.code?.toUpperCase()
    });
    return await project.save();
  }

  static async updateProject(id: string, data: Partial<IProject>): Promise<IProject | null> {
    const { code, ...updateData } = data;  // code is immutable
    return await Project.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteProject(id: string): Promise<boolean> {
    const result = await Project.findByIdAndUpdate(id, { isActive: false });
    return result !== null;
  }
}
