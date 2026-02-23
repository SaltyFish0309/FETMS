export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DuplicateNameError extends Error {
  constructor(name: string) {
    super(`Email template with name "${name}" already exists`);
    this.name = 'DuplicateNameError';
  }
}

export class TemplateInUseError extends Error {
  constructor(id: string) {
    super(`Email template "${id}" is in use by an alert rule and cannot be deleted`);
    this.name = 'TemplateInUseError';
  }
}
