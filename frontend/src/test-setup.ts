import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock i18next
const translations: Record<string, string> = {
  // Common
  'actions.filter': 'Filter',
  'actions.export': 'Export',
  'actions.delete': 'Delete',
  'actions.edit': 'Edit',
  'actions.archive': 'Archive',
  'actions.search': 'Search...',
  'nav.dashboard': 'Dashboard',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'qualifiedCandidates.title': 'Qualified Candidates',
  'qualifiedCandidates.found': 'Found',
  'qualifiedCandidates.initial.title': 'Ready to Search',
  'qualifiedCandidates.initial.description': 'Select segments...',
  'qualifiedCandidates.empty.description': 'No qualified candidates',
  
  // Projects
  'projects.page.addButton': 'Create Project',
  'projects.actions.edit': 'Edit',
  'projects.actions.archive': 'Archive',
  'projects.page.title': 'Project Settings',
  'projects.page.subtitle': 'Manage projects',
  
  // Project Dialog
  'projects.dialog.createTitle': 'Create Project',
  'projects.dialog.editTitle': 'Edit Project',
  'projects.dialog.fields.name.label': 'Project Name',
  'projects.dialog.fields.code.label': 'Project Code',
  'projects.dialog.fields.description.label': 'Description',
  'projects.dialog.buttons.create': 'Create',
  'projects.dialog.buttons.save': 'Save Changes',
  'projects.dialog.buttons.cancel': 'Cancel',
  
  // Project Delete Confirm
  'projects.deleteConfirm.title': 'Archive Project',
  'projects.deleteConfirm.description': 'Are you sure you want to archive this project? It can be restored later.',
  'projects.deleteConfirm.confirm': 'Archive',
  'projects.deleteConfirm.cancel': 'Cancel',
  
  // Teachers / FilterSheet
  'filterSheet.search': 'Search filters...',
  'filterSheet.title': 'Filters',
  'filters.searchPlaceholder': 'Search by name...',
  'filters.filters': 'Filters',
  'filters.activeFilters': 'Active:',
  'filters.clearAll': 'Clear All',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      // Return explicit translation if available
      if (translations[k]) return translations[k];
      
      // Fallback: Return the key itself (or last part for readability in logs)
      return k;
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

