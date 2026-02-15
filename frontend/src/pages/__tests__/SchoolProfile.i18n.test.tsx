import { describe, it, expect } from 'vitest';
import enTranslations from '@/../public/locales/en/teachers.json';
import zhTranslations from '@/../public/locales/zh-TW/teachers.json';

describe('SchoolProfile Status Translation', () => {
  const statusCases = [
    { dbValue: 'Newly Hired', key: 'newly_hired' },
    { dbValue: 'Re-Hired', key: 're_hired' }
  ];

  it('should have underscore format translation keys for all statuses in English', () => {
    statusCases.forEach(({ key }) => {
      expect(enTranslations.enums.status).toHaveProperty(key);
      expect(enTranslations.enums.status[key as keyof typeof enTranslations.enums.status]).toBeTruthy();
    });
  });

  it('should have underscore format translation keys for all statuses in Chinese', () => {
    statusCases.forEach(({ key }) => {
      expect(zhTranslations.enums.status).toHaveProperty(key);
      expect(zhTranslations.enums.status[key as keyof typeof zhTranslations.enums.status]).toBeTruthy();
    });
  });

  it('should convert database status format to translation key format', () => {
    statusCases.forEach(({ dbValue, key }) => {
      // Test the conversion logic used in SchoolProfile.tsx
      const convertedKey = dbValue.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
      expect(convertedKey).toBe(key);
    });
  });
});
