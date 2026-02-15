import { describe, it, expect } from 'vitest';
import { ALL_COLUMNS } from '../columnDefinitions';
import enTranslations from '@/../public/locales/en/teachers.json';
import zhTranslations from '@/../public/locales/zh-TW/teachers.json';

describe('Column Labels i18n', () => {
  it('should have labelKey property instead of label', () => {
    ALL_COLUMNS.forEach(col => {
      expect(col).toHaveProperty('labelKey');
      expect(col).not.toHaveProperty('label');
    });
  });

  it('should have labelKey in correct format', () => {
    ALL_COLUMNS.forEach(col => {
      expect(col.labelKey).toMatch(/^columns\./);
    });
  });

  it('should have translations for all column labelKeys in English', () => {
    ALL_COLUMNS.forEach(col => {
      const key = col.labelKey.replace('columns.', '');
      expect(enTranslations.columns).toHaveProperty(key);
      expect(enTranslations.columns[key as keyof typeof enTranslations.columns]).toBeTruthy();
    });
  });

  it('should have translations for all column labelKeys in Chinese', () => {
    ALL_COLUMNS.forEach(col => {
      const key = col.labelKey.replace('columns.', '');
      expect(zhTranslations.columns).toHaveProperty(key);
      expect(zhTranslations.columns[key as keyof typeof zhTranslations.columns]).toBeTruthy();
    });
  });
});
