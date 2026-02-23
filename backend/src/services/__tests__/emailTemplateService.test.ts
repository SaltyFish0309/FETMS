import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  EmailTemplateService,
  DuplicateNameError,
  NotFoundError,
  TemplateInUseError,
} from '../EmailTemplateService.js';

// Mock EmailTemplate model
vi.mock('../../models/EmailTemplate.js', () => ({
  default: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    findOne: vi.fn(),
  },
}));

// Mock AlertRule model (for "template in use" check)
vi.mock('../../models/AlertRule.js', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import EmailTemplate from '../../models/EmailTemplate.js';
import AlertRule from '../../models/AlertRule.js';

const mockTemplate = {
  _id: '64b0000000000000000000aa',
  name: 'Welcome Email',
  subject: 'Welcome {{teacherName}}',
  body: '<p>Hi {{teacherName}}</p>',
  variables: ['teacherName'],
  isDefault: false,
};

describe('EmailTemplateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns all templates', async () => {
      vi.mocked(EmailTemplate.find).mockResolvedValue([mockTemplate] as any);

      const result = await EmailTemplateService.getAll();

      expect(result).toHaveLength(1);
      expect(EmailTemplate.find).toHaveBeenCalledOnce();
    });
  });

  describe('create', () => {
    it('creates template when name is unique', async () => {
      vi.mocked(EmailTemplate.findOne).mockResolvedValue(null);
      vi.mocked(EmailTemplate.create).mockResolvedValue(mockTemplate as any);

      const result = await EmailTemplateService.create({
        name: 'Welcome Email',
        subject: 'Welcome',
        body: '<p>Hi</p>',
        variables: [],
      });

      expect(result).toMatchObject({ name: 'Welcome Email' });
    });

    it('throws DuplicateNameError when template name already exists', async () => {
      vi.mocked(EmailTemplate.findOne).mockResolvedValue(mockTemplate as any);

      await expect(
        EmailTemplateService.create({
          name: 'Welcome Email',
          subject: 'Subject',
          body: 'Body',
          variables: [],
        })
      ).rejects.toThrow(DuplicateNameError);
    });
  });

  describe('update', () => {
    it('updates template when found', async () => {
      const updated = { ...mockTemplate, subject: 'Updated Subject' };
      vi.mocked(EmailTemplate.findByIdAndUpdate).mockResolvedValue(updated as any);

      const result = await EmailTemplateService.update('64b0000000000000000000aa', {
        subject: 'Updated Subject',
      });

      expect(result).toMatchObject({ subject: 'Updated Subject' });
    });

    it('throws NotFoundError when template ID does not exist', async () => {
      vi.mocked(EmailTemplate.findByIdAndUpdate).mockResolvedValue(null);

      await expect(
        EmailTemplateService.update('64b0000000000000000000ff', { subject: 'X' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('deletes template when it is not used by any AlertRule', async () => {
      vi.mocked(EmailTemplate.findById).mockResolvedValue(mockTemplate as any);
      vi.mocked(AlertRule.findOne).mockResolvedValue(null);
      vi.mocked(EmailTemplate.findByIdAndDelete).mockResolvedValue(mockTemplate as any);

      await expect(
        EmailTemplateService.delete('64b0000000000000000000aa')
      ).resolves.toBeUndefined();

      expect(EmailTemplate.findByIdAndDelete).toHaveBeenCalledWith('64b0000000000000000000aa');
    });

    it('throws TemplateInUseError when template is referenced by an AlertRule', async () => {
      vi.mocked(EmailTemplate.findById).mockResolvedValue(mockTemplate as any);
      vi.mocked(AlertRule.findOne).mockResolvedValue({
        _id: 'rule1',
        name: 'Expiry Rule',
      } as any);

      await expect(
        EmailTemplateService.delete('64b0000000000000000000aa')
      ).rejects.toThrow(TemplateInUseError);

      expect(EmailTemplate.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when template ID does not exist', async () => {
      vi.mocked(EmailTemplate.findById).mockResolvedValue(null);

      await expect(
        EmailTemplateService.delete('64b0000000000000000000ff')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
