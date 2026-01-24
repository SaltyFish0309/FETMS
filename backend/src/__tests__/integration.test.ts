import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from '../services/projectService.js';
import { TeacherService } from '../services/teacherService.js';
import Project from '../models/Project.js';
import Teacher from '../models/Teacher.js';

// Mock the models
vi.mock('../models/Project.js', () => {
  const mockProject = vi.fn();
  mockProject.find = vi.fn();
  mockProject.findById = vi.fn();
  mockProject.findByIdAndUpdate = vi.fn();
  return { default: mockProject };
});

vi.mock('../models/Teacher.js', () => {
  const mockTeacher = vi.fn();
  mockTeacher.find = vi.fn();
  return { default: mockTeacher };
});

describe('Project Filtering Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create 2 projects, create teachers in each, and filter by project', async () => {
    // Step 1: Mock project creation
    const project1 = { _id: 'p1', name: 'TFETP 2024', code: 'TFETP', isActive: true };
    const project2 = { _id: 'p2', name: 'Summer Camp', code: 'SUMMER', isActive: true };

    // Project uses new Project() then save()
    vi.mocked(Project as any)
      .mockImplementationOnce(function(this: any) {
        this.save = vi.fn().mockResolvedValue(project1);
        return this;
      })
      .mockImplementationOnce(function(this: any) {
        this.save = vi.fn().mockResolvedValue(project2);
        return this;
      });

    const createdProject1 = await ProjectService.createProject({ name: 'TFETP 2024', code: 'TFETP' });
    const createdProject2 = await ProjectService.createProject({ name: 'Summer Camp', code: 'SUMMER' });

    expect(createdProject1.name).toBe('TFETP 2024');
    expect(createdProject2.name).toBe('Summer Camp');

    // Step 2: Mock teacher creation
    const teacher1 = {
      _id: 't1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      project: 'p1',
      isDeleted: false
    };

    // Teacher uses new Teacher() then save()
    vi.mocked(Teacher as any).mockImplementation(function(this: any) {
      this.save = vi.fn().mockResolvedValue(teacher1);
      return this;
    });

    await TeacherService.createTeacher({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      project: 'p1'
    } as any);

    // Step 3: Filter teachers by project
    const sortMock = vi.fn().mockResolvedValue([teacher1]);
    const populateMock2 = vi.fn().mockReturnValue({ sort: sortMock });
    const populateMock1 = vi.fn().mockReturnValue({ populate: populateMock2 });
    vi.mocked(Teacher.find).mockReturnValue({ populate: populateMock1 } as any);

    const filteredTeachers = await TeacherService.getAllTeachers('p1');

    expect(Teacher.find).toHaveBeenCalledWith({ isDeleted: false, project: 'p1' });
    expect(filteredTeachers).toEqual([teacher1]);
  });

  it('should update project and archive project, verify getAllProjects excludes archived', async () => {
    // Step 1: Update project
    const updatedProject = {
      _id: 'p1',
      name: 'TFETP 2025',
      code: 'TFETP',
      isActive: true
    };

    vi.mocked(Project.findByIdAndUpdate).mockResolvedValue(updatedProject as any);

    const result = await ProjectService.updateProject('p1', { name: 'TFETP 2025' });

    expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
      'p1',
      { name: 'TFETP 2025' },
      { new: true }
    );
    expect(result).toEqual(updatedProject);

    // Step 2: Archive project
    vi.mocked(Project.findByIdAndUpdate).mockResolvedValue({ _id: 'p1', isActive: false } as any);

    const deleteResult = await ProjectService.deleteProject('p1');

    expect(Project.findByIdAndUpdate).toHaveBeenCalledWith('p1', { isActive: false });
    expect(deleteResult).toBe(true);

    // Step 3: Verify getAllProjects excludes archived
    const activeProjects = [
      { _id: 'p2', name: 'Summer Camp', code: 'SUMMER', isActive: true }
    ];

    const sortMock = vi.fn().mockResolvedValue(activeProjects);
    vi.mocked(Project.find).mockReturnValue({ sort: sortMock } as any);

    const projects = await ProjectService.getAllProjects();

    expect(Project.find).toHaveBeenCalledWith({ isActive: true });
    expect(projects).toEqual(activeProjects);
    expect(projects.length).toBe(1);
    expect(projects.every(p => p.isActive)).toBe(true);
  });

  it('should filter teachers by projectId and verify correct query', async () => {
    const projectId = 'test-project-123';
    const mockTeachers = [
      { _id: 't1', firstName: 'Alice', project: projectId, isDeleted: false },
      { _id: 't2', firstName: 'Bob', project: projectId, isDeleted: false }
    ];

    const sortMock = vi.fn().mockResolvedValue(mockTeachers);
    const populateMock2 = vi.fn().mockReturnValue({ sort: sortMock });
    const populateMock1 = vi.fn().mockReturnValue({ populate: populateMock2 });
    vi.mocked(Teacher.find).mockReturnValue({ populate: populateMock1 } as any);

    const result = await TeacherService.getAllTeachers(projectId);

    expect(Teacher.find).toHaveBeenCalledWith({ isDeleted: false, project: projectId });
    expect(result).toEqual(mockTeachers);
  });

  it('should return all teachers when projectId is not provided', async () => {
    const mockTeachers = [
      { _id: 't1', firstName: 'Alice', project: 'p1', isDeleted: false },
      { _id: 't2', firstName: 'Bob', project: 'p2', isDeleted: false }
    ];

    const sortMock = vi.fn().mockResolvedValue(mockTeachers);
    const populateMock2 = vi.fn().mockReturnValue({ sort: sortMock });
    const populateMock1 = vi.fn().mockReturnValue({ populate: populateMock2 });
    vi.mocked(Teacher.find).mockReturnValue({ populate: populateMock1 } as any);

    const result = await TeacherService.getAllTeachers();

    expect(Teacher.find).toHaveBeenCalledWith({ isDeleted: false });
    expect(result).toEqual(mockTeachers);
  });
});
