import EmailTemplate from '../models/EmailTemplate.js';
import AlertRule from '../models/AlertRule.js';
import { NotFoundError, DuplicateNameError, TemplateInUseError } from '../errors.js';

export { NotFoundError, DuplicateNameError, TemplateInUseError };

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
    if (dto.name) {
      const conflict = await EmailTemplate.findOne({ name: dto.name, _id: { $ne: id } });
      if (conflict) {
        throw new DuplicateNameError(dto.name);
      }
    }
    const updated = await EmailTemplate.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) {
      throw new NotFoundError(`Email template "${id}" not found`);
    }
    return updated;
  }

  static async delete(id: string): Promise<void> {
    const template = await EmailTemplate.findById(id);
    if (!template) {
      throw new NotFoundError(`Email template "${id}" not found`);
    }

    const inUse = await AlertRule.findOne({ emailTemplateId: id });
    if (inUse) {
      throw new TemplateInUseError(id);
    }

    await EmailTemplate.findByIdAndDelete(id);
  }
}
