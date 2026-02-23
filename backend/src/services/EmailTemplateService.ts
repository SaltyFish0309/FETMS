import EmailTemplate from '../models/EmailTemplate.js';
import AlertRule from '../models/AlertRule.js';

export class DuplicateNameError extends Error {
  constructor(name: string) {
    super(`Email template with name "${name}" already exists`);
    this.name = 'DuplicateNameError';
  }
}

export class NotFoundError extends Error {
  constructor(id: string) {
    super(`Email template "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

export class TemplateInUseError extends Error {
  constructor(id: string) {
    super(`Email template "${id}" is in use by an alert rule and cannot be deleted`);
    this.name = 'TemplateInUseError';
  }
}

export interface CreateTemplateDto {
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isDefault?: boolean;
}

export interface UpdateTemplateDto {
  name?: string;
  subject?: string;
  body?: string;
  variables?: string[];
  isDefault?: boolean;
}

export class EmailTemplateService {
  static async getAll() {
    return EmailTemplate.find();
  }

  static async create(dto: CreateTemplateDto) {
    const existing = await EmailTemplate.findOne({ name: dto.name });
    if (existing) {
      throw new DuplicateNameError(dto.name);
    }
    return EmailTemplate.create(dto);
  }

  static async update(id: string, dto: UpdateTemplateDto) {
    const updated = await EmailTemplate.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) {
      throw new NotFoundError(id);
    }
    return updated;
  }

  static async delete(id: string): Promise<void> {
    const template = await EmailTemplate.findById(id);
    if (!template) {
      throw new NotFoundError(id);
    }

    const inUse = await AlertRule.findOne({ emailTemplateId: id });
    if (inUse) {
      throw new TemplateInUseError(id);
    }

    await EmailTemplate.findByIdAndDelete(id);
  }
}
