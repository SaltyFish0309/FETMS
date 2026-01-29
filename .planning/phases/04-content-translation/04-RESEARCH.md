# Research: Phase 04 - Content Translation

## 1. Current State Assessment
- **Infrastructure**: Complete. `i18next`, `react-i18next`, `i18next-http-backend` are installed and configured in `frontend/src/i18n.ts`.
- **Languages**: English (`en`) and Traditional Chinese (`zh-TW`) are supported.
- **Current Translations**: Only a minimal `common.json` exists in `frontend/public/locales/{en,zh-TW}`.
- **UI Components**: Most strings are currently hardcoded in English within components (e.g., `Sidebar.tsx`, `ImportTeachersDialog.tsx`).

## 2. Translation Strategy

### 2.1 Namespace Architecture
To maintain manageability and performance, we will split translations into namespaces matching the application structure:

| Namespace | Scope |
|-----------|-------|
| `common` | Navigation, Generic Buttons (Save, Cancel), Dialog titles, Validation messages, Toast notifications |
| `auth` | Login/Logout related strings |
| `dashboard` | Dashboard widgets, chart titles, KPI labels |
| `teachers` | Teacher list columns, filters, form labels, enum values (Status, Gender) |
| `schools` | School list columns, filters, form labels |
| `documents` | Document management strings |
| `settings` | Settings page sections and labels |

### 2.2 Implementation Pattern
1.  **Hook Usage**: Use `const { t } = useTranslation(['namespace', 'common'])` in components.
2.  **Key Naming**: Use nested keys for organization (e.g., `teachers.list.columns.englishName`).
3.  **Enum Translation**: Translate database values using a consistent prefix pattern:
    ```typescript
    // Example for status
    t(`teachers.enums.status.${status.toLowerCase()}`)
    ```
4.  **Date Formatting**: Use `date-fns` with locale for dates, but UI labels around dates (e.g., "Date of Birth") use `i18next`.

### 2.3 Component Refactoring Targets
- **Layout**: `Sidebar.tsx`, `Header.tsx`
- **Dashboard**: `KPICard.tsx`, Charts
- **Teachers**:
    - List: `columns.tsx` (headers), `DataTableToolbar.tsx`, `FilterSheet.tsx`
    - Kanban: `KanbanBoard.tsx`, `KanbanCard.tsx`
    - Forms: `ImportTeachersDialog.tsx`, `TeacherProfile.tsx` (implied)
- **Schools**: `Schools.tsx`, `ImportSchoolsDialog.tsx`
- **Settings**: `Settings.tsx`, `AlertRulesManager.tsx`

## 3. Risks & Considerations
- **Dynamic Content**: User-generated content (names, notes) must remain in original language (Requirement I18N-19).
- **Layout Breaks**: Chinese text is often shorter than English. Need to ensure UI layout (especially grids and table columns) doesn't break with variable text lengths.
- **Missing Keys**: Use `i18next-inspector` or similar if available, or rely on `debug: true` in development to spot missing keys.
- **Zod Validation**: Form validation schemas defined outside components need a way to access translation or pass messages at runtime.

## 4. Execution Plan
1.  **Structure**: Create all empty JSON namespace files.
2.  **Common**: Populate `common.json` with navigation, common actions, and validation messages. Refactor Layout components.
3.  **Pages**: Tackle one page at a time (Teachers -> Schools -> Dashboard -> Settings).
    - Extract strings.
    - Add to JSON.
    - Replace with `t()`.
4.  **Verification**: Switch languages and verify all visible text updates.
