import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * Comprehensive Test Setup Utility
 *
 * This file provides centralized mocking for all common test requirements:
 * - i18n with all translation namespaces
 * - window.matchMedia for responsive design
 * - ResizeObserver for component resize tracking
 * - IntersectionObserver for visibility detection
 * - CSS modules
 *
 * All mocks are configured to work seamlessly with JSDOM.
 */

// ============================================================================
// i18n Mock - All Namespaces
// ============================================================================

const translations: Record<string, string> = {
  // Common namespace
  'common:app.name': 'FETMS',
  'common:nav.dashboard': 'Dashboard',
  'common:nav.teachers': 'Teachers',
  'common:nav.schools': 'Schools',
  'common:nav.documents': 'Documents',
  'common:nav.settings': 'Settings',
  'common:actions.save': 'Save',
  'common:actions.cancel': 'Cancel',
  'common:actions.edit': 'Edit',
  'common:actions.delete': 'Delete',
  'common:actions.confirm': 'Confirm',
  'common:actions.search': 'Search',
  'common:actions.filter': 'Filter',
  'common:actions.export': 'Export',
  'common:actions.archive': 'Archive',
  'common:theme.light': 'Light',
  'common:theme.dark': 'Dark',
  'common:theme.system': 'System',

  // Dashboard namespace
  'dashboard:title': 'Dashboard',
  'dashboard:qualifiedCandidates.title': 'Qualified Candidates',
  'dashboard:qualifiedCandidates.found': 'Found',
  'dashboard:qualifiedCandidates.initial.title': 'Ready to Search',
  'dashboard:qualifiedCandidates.initial.description': 'Select segments...',
  'dashboard:qualifiedCandidates.empty.description': 'No qualified candidates',

  // Teachers namespace
  'teachers:pageTitle': 'Teachers',
  'teachers:pageDescription': 'Manage your Foreign English Teachers.',
  'teachers:viewMode.list': 'List View',
  'teachers:viewMode.kanban': 'Kanban View',
  'teachers:filterSheet.search': 'Search filters...',
  'teachers:filterSheet.title': 'Filters',
  'teachers:filters.searchPlaceholder': 'Search by name...',
  'teachers:filters.filters': 'Filters',
  'teachers:filters.activeFilters': 'Active:',
  'teachers:filters.clearAll': 'Clear All',

  // Settings namespace
  'settings:projects.page.addButton': 'Create Project',
  'settings:projects.actions.edit': 'Edit',
  'settings:projects.actions.archive': 'Archive',
  'settings:projects.page.title': 'Project Settings',
  'settings:projects.page.subtitle': 'Manage projects',
  'settings:projects.dialog.createTitle': 'Create Project',
  'settings:projects.dialog.editTitle': 'Edit Project',
  'settings:projects.dialog.fields.name.label': 'Project Name',
  'settings:projects.dialog.fields.code.label': 'Project Code',
  'settings:projects.dialog.fields.description.label': 'Description',
  'settings:projects.dialog.buttons.create': 'Create',
  'settings:projects.dialog.buttons.save': 'Save Changes',
  'settings:projects.dialog.buttons.cancel': 'Cancel',
  'settings:projects.deleteConfirm.title': 'Archive Project',
  'settings:projects.deleteConfirm.description': 'Are you sure you want to archive this project? It can be restored later.',
  'settings:projects.deleteConfirm.confirm': 'Archive',
  'settings:projects.deleteConfirm.cancel': 'Cancel',

  // Email namespace
  'email:nav': 'Email',
  'email:page.title': 'Email',
  'email:tabs.compose': 'Compose',
  'email:tabs.templates': 'Templates',
  'email:tabs.history': 'History',
  'email:templates.title': 'Email Templates',
  'email:templates.empty': 'No templates yet. Create your first template.',
  'email:templates.create': 'Create Template',
  'email:templates.edit': 'Edit Template',
  'email:templates.delete': 'Delete Template',
  'email:templates.deleteConfirm.title': 'Delete Template',
  'email:templates.deleteConfirm.description': 'Are you sure you want to delete "{{name}}"? This cannot be undone.',
  'email:templates.deleteConfirm.confirm': 'Delete',
  'email:templates.deleteConfirm.cancel': 'Cancel',
  'email:templates.form.name': 'Template Name',
  'email:templates.form.namePlaceholder': 'e.g. Document Expiry Reminder',
  'email:templates.form.subject': 'Subject',
  'email:templates.form.subjectPlaceholder': 'e.g. Your {{documentType}} expires on {{expiryDate}}',
  'email:templates.form.body': 'Body (HTML supported)',
  'email:templates.form.bodyPlaceholder': 'Dear {{teacherName}}, ...',
  'email:templates.form.variables': 'Variables (comma-separated)',
  'email:templates.form.variablesPlaceholder': 'teacherName, expiryDate',
  'email:templates.form.isDefault': 'Set as default template',
  'email:templates.errors.nameRequired': 'Template name is required',
  'email:templates.errors.subjectRequired': 'Subject is required',
  'email:templates.errors.bodyRequired': 'Body is required',
  'email:templates.errors.fetchFailed': 'Failed to load templates',
  'email:templates.errors.createFailed': 'Failed to create template',
  'email:templates.errors.updateFailed': 'Failed to update template',
  'email:templates.errors.deleteFailed': 'Failed to delete template',
  'email:templates.errors.inUse': 'This template is in use by an alert rule and cannot be deleted',
  'email:templates.success.created': 'Template created successfully',
  'email:templates.success.updated': 'Template updated successfully',
  'email:templates.success.deleted': 'Template deleted successfully',
  'email:history.title': 'Send History',
  'email:history.empty': 'No emails sent yet',
  'email:history.columns.date': 'Date',
  'email:history.columns.subject': 'Subject',
  'email:history.columns.recipients': 'Recipients',
  'email:history.columns.sent': 'Sent',
  'email:history.columns.failed': 'Failed',
  'email:history.columns.triggeredBy': 'Triggered By',
  'email:history.triggeredBy.manual': 'Manual',
  'email:history.triggeredBy.alert': 'Alert',
  'email:history.details': 'View Details',
  'email:history.hideDetails': 'Hide Details',
  'email:history.recipientStatus.sent': 'Sent',
  'email:history.recipientStatus.failed': 'Failed',
  'email:history.errors.fetchFailed': 'Failed to load email history',
  'email:compose.title': 'Compose Email',
  'email:compose.preview.send': 'Send',
  'email:compose.preview.sending': 'Sending...',
  'email:compose.result.summary': '{{sent}} sent, {{failed}} failed',

  // Legacy keys (without namespace prefix for backward compatibility)
  'actions.filter': 'Filter',
  'actions.export': 'Export',
  'actions.delete': 'Delete',
  'actions.edit': 'Edit',
  'actions.archive': 'Archive',
  'actions.search': 'Search...',
  'nav.dashboard': 'Dashboard',
  'dashboard.title': 'Dashboard',
  'qualifiedCandidates.title': 'Qualified Candidates',
  'qualifiedCandidates.found': 'Found',
  'qualifiedCandidates.initial.title': 'Ready to Search',
  'qualifiedCandidates.initial.description': 'Select segments...',
  'qualifiedCandidates.empty.description': 'No qualified candidates',
  'projects.page.addButton': 'Create Project',
  'projects.actions.edit': 'Edit',
  'projects.actions.archive': 'Archive',
  'projects.page.title': 'Project Settings',
  'projects.page.subtitle': 'Manage projects',
  'projects.dialog.createTitle': 'Create Project',
  'projects.dialog.editTitle': 'Edit Project',
  'projects.dialog.fields.name.label': 'Project Name',
  'projects.dialog.fields.code.label': 'Project Code',
  'projects.dialog.fields.description.label': 'Description',
  'projects.dialog.buttons.create': 'Create',
  'projects.dialog.buttons.save': 'Save Changes',
  'projects.dialog.buttons.cancel': 'Cancel',
  'projects.deleteConfirm.title': 'Archive Project',
  'projects.deleteConfirm.description': 'Are you sure you want to archive this project? It can be restored later.',
  'projects.deleteConfirm.confirm': 'Archive',
  'projects.deleteConfirm.cancel': 'Cancel',
  'filterSheet.search': 'Search filters...',
  'filterSheet.title': 'Filters',
  'filters.searchPlaceholder': 'Search by name...',
  'filters.filters': 'Filters',
  'filters.activeFilters': 'Active:',
  'filters.clearAll': 'Clear All',
};

vi.mock('react-i18next', () => ({
  useTranslation: (namespace?: string) => ({
    t: (key: string, options?: Record<string, unknown>) => {
      // Handle namespaced keys (e.g., "common:nav.dashboard" or using namespace parameter)
      let fullKey = key;
      if (namespace && !key.includes(':')) {
        fullKey = `${namespace}:${key}`;
      }

      // Return explicit translation if available
      if (translations[fullKey]) {
        let translation = translations[fullKey];

        // Handle interpolation (e.g., {{count}}, {{min}}, {{max}})
        if (options) {
          Object.entries(options).forEach(([optKey, value]) => {
            translation = translation.replace(new RegExp(`{{${optKey}}}`, 'g'), String(value));
          });
        }

        return translation;
      }

      // Try without namespace prefix as fallback
      if (translations[key]) {
        return translations[key];
      }

      // Handle teacher column translations (e.g., "columns.englishName")
      if (key.startsWith('columns.')) {
        const columnKey = key.replace('columns.', '');
        // Capitalize first letter and add spaces before capital letters
        return columnKey.charAt(0).toUpperCase() + columnKey.slice(1).replace(/([A-Z])/g, ' $1').trim();
      }

      // Handle group translations (e.g., "groups.personalInfo")
      if (key.startsWith('groups.')) {
        const groupKeys: Record<string, string> = {
          'groups.personalInfo': 'Personal Information',
          'groups.education': 'Education',
          'groups.legalDocs': 'Legal Documents',
          'groups.employment': 'Employment'
        };
        return groupKeys[key] || key;
      }

      // Fallback: Return the key itself
      return key;
    },
    i18n: {
      changeLanguage: vi.fn(() => Promise.resolve()),
      language: 'en',
      languages: ['en', 'zh-TW'],
      on: vi.fn(),
      off: vi.fn(),
    },
    ready: true,
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// ============================================================================
// window.matchMedia Mock
// ============================================================================
// Used by responsive components and theme detection

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ============================================================================
// ResizeObserver Mock
// ============================================================================
// Used by components that respond to size changes (e.g., responsive tables, charts)

(globalThis as Record<string, unknown>).ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// ============================================================================
// IntersectionObserver Mock
// ============================================================================
// Used by components that implement lazy loading or visibility tracking

(globalThis as Record<string, unknown>).IntersectionObserver = class IntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
  takeRecords = vi.fn(() => []);
};

// ============================================================================
// CSS Module Mock
// ============================================================================
// CSS imports are handled by Vite, but we ensure they don't break tests

