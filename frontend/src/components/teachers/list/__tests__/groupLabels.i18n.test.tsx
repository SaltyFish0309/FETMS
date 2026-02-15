import { describe, it, expect } from 'vitest';
import { GROUP_LABELS } from '../columnDefinitions';
import enTranslations from '@/../public/locales/en/teachers.json';
import zhTranslations from '@/../public/locales/zh-TW/teachers.json';

describe('Group Labels i18n', () => {
  it('should have labelKey property instead of label', () => {
    GROUP_LABELS.forEach(group => {
      expect(group).toHaveProperty('labelKey');
      expect(group).not.toHaveProperty('label');
    });
  });

  it('should have labelKey in correct format', () => {
    GROUP_LABELS.forEach(group => {
      expect(group.labelKey).toMatch(/^groups\./);
    });
  });

  it('should have translations for all group labelKeys in English', () => {
    GROUP_LABELS.forEach(group => {
      const key = group.labelKey.replace('groups.', '');
      expect(enTranslations.groups).toHaveProperty(key);
      expect(enTranslations.groups[key as keyof typeof enTranslations.groups]).toBeTruthy();
    });
  });

  it('should have translations for all group labelKeys in Chinese', () => {
    GROUP_LABELS.forEach(group => {
      const key = group.labelKey.replace('groups.', '');
      expect(zhTranslations.groups).toHaveProperty(key);
      expect(zhTranslations.groups[key as keyof typeof zhTranslations.groups]).toBeTruthy();
    });
  });
});
