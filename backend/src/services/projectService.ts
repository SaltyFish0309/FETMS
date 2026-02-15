import Project, { IProject } from '../models/Project.js';
import Teacher from '../models/Teacher.js';

export class ProjectService {
  static async getAllProjects(includeArchived: boolean = false): Promise<IProject[]> {
    const query = includeArchived ? {} : { isActive: true };
    return await Project.find(query).sort({ createdAt: 1 });
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

  static async restoreProject(id: string): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(id, { isActive: true }, { new: true });
  }

  static async hardDeleteProject(id: string): Promise<boolean> {
    const project = await Project.findById(id);

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.isActive) {
      throw new Error('Cannot hard delete active project. Archive it first.');
    }

    const teacherCount = await Teacher.countDocuments({ project: id });
    if (teacherCount > 0) {
      throw new Error('Cannot delete project with associated teachers');
    }

    await Project.findByIdAndDelete(id);
    return true;
  }
}
