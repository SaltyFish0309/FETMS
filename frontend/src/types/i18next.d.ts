import 'i18next';
import common from '../../public/locales/en/common.json';
import dashboard from '../../public/locales/en/dashboard.json';
import documents from '../../public/locales/en/documents.json';
import schools from '../../public/locales/en/schools.json';
import settings from '../../public/locales/en/settings.json';
import teachers from '../../public/locales/en/teachers.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      dashboard: typeof dashboard;
      documents: typeof documents;
      schools: typeof schools;
      settings: typeof settings;
      teachers: typeof teachers;
    };
  }
}
