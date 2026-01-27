# Roadmap: User Preferences Enhancement

## Overview

This roadmap transforms the FETMS User Preferences feature from a flawed basic implementation into a fully-functional, industry-standard settings system. Starting with fixing the broken dark mode infrastructure, we systematically apply dark theme styling across all components, build internationalization infrastructure for Traditional Chinese and English bilingual support, translate all user-facing content, and finally implement comprehensive user preferences (font size, display density, reduced motion) with persistent storage. Each phase builds on the previous, ensuring stable foundations before adding complexity.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Theme Infrastructure** - Fix broken dark mode configuration and prevent FOUC
- [ ] **Phase 2: Component Dark Mode Coverage** - Apply dark styling systematically across all components
- [ ] **Phase 3: i18n Infrastructure** - Build internationalization foundation for bilingual support
- [ ] **Phase 4: Content Translation** - Translate all UI elements to Traditional Chinese
- [ ] **Phase 5: Preferences System** - Implement comprehensive user preference controls

## Phase Details

### Phase 1: Theme Infrastructure
**Goal**: Dark mode works correctly with proper Tailwind configuration, no flash of unstyled content, and semantic color tokens ready for component styling

**Depends on**: Nothing (first phase)

**Requirements**: DARK-01, DARK-02, DARK-03, DARK-04

**Success Criteria** (what must be TRUE):
  1. User switches between Light/Dark/System theme modes without visual glitches
  2. Page loads in correct theme without flashing white (FOUC prevented)
  3. Theme preference persists across browser sessions
  4. All Shadcn/UI components can reference semantic color tokens (--background, --foreground, --primary)

**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md — Configure Tailwind dark mode and add FOUC prevention

### Phase 2: Component Dark Mode Coverage
**Goal**: Every component in the application renders correctly in dark mode with WCAG AA contrast compliance

**Depends on**: Phase 1

**Requirements**: DARK-05, DARK-06, DARK-07, DARK-08, DARK-09, DARK-10, DARK-11, DARK-12, DARK-13, DARK-14, DARK-15, DARK-16, DARK-17, DARK-18, DARK-19

**Success Criteria** (what must be TRUE):
  1. Header/navigation adapts to dark theme with proper background and text color
  2. All pages (Dashboard, Teachers, Schools, Settings) display correctly in dark mode
  3. All interactive elements (forms, tables, modals, dropdowns) have proper contrast in dark mode
  4. Dashboard charts (Recharts) use dark-compatible colors
  5. All text meets WCAG AA contrast ratio (4.5:1 minimum) in dark mode

**Plans**: TBD

Plans:
- [ ] 02-01: Fix header and navigation dark mode styling
- [ ] 02-02: Fix Dashboard page components for dark mode
- [ ] 02-03: Fix Teachers and Schools pages for dark mode
- [ ] 02-04: Fix forms, modals, and interactive elements for dark mode
- [ ] 02-05: Verify WCAG contrast compliance

### Phase 3: i18n Infrastructure
**Goal**: Application has full internationalization infrastructure with language toggle working between Traditional Chinese and English

**Depends on**: Phase 2

**Requirements**: I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06, I18N-07, I18N-08

**Success Criteria** (what must be TRUE):
  1. User can toggle language between Traditional Chinese and English from Settings page
  2. Language preference persists across browser sessions
  3. Browser language auto-detected on first visit to set initial language
  4. Language switches instantly without page reload
  5. Traditional Chinese text renders with proper font stack (no Simplified Chinese fallback)

**Plans**: TBD

Plans:
- [ ] 03-01: Install and configure i18next ecosystem
- [ ] 03-02: Create translation file structure and LanguageProvider
- [ ] 03-03: Implement language selector UI and Traditional Chinese fonts

### Phase 4: Content Translation
**Goal**: All user-facing content is available in both Traditional Chinese and English with proper formatting

**Depends on**: Phase 3

**Requirements**: I18N-09, I18N-10, I18N-11, I18N-12, I18N-13, I18N-14, I18N-15, I18N-16, I18N-17, I18N-18, I18N-19

**Success Criteria** (what must be TRUE):
  1. All navigation, buttons, labels, headings display in selected language
  2. All form validation messages and error notifications display in selected language
  3. Dropdown option values (Status, Hiring Status, Gender) display in selected language
  4. User-generated data (teacher names, school names, notes) remains in original language
  5. Missing translations fall back to English gracefully

**Plans**: TBD

Plans:
- [ ] 04-01: Translate common UI elements and navigation
- [ ] 04-02: Translate Settings page
- [ ] 04-03: Translate Dashboard page
- [ ] 04-04: Translate Teachers page
- [ ] 04-05: Translate Schools and Documents pages
- [ ] 04-06: Translate validation messages, errors, and enum values

### Phase 5: Preferences System
**Goal**: Users can customize font size, display density, and reduced motion preferences with persistence across sessions

**Depends on**: Phase 3

**Requirements**: ACC-01, ACC-02, ACC-03, ACC-04, ACC-05, ACC-06, ACC-07, ACC-08, ACC-09, ACC-10, ACC-11, ACC-12, ACC-13, ACC-14, PREF-01, PREF-02, PREF-03, PREF-04

**Success Criteria** (what must be TRUE):
  1. User can adjust font size (Small/Medium/Large) and all layouts adapt correctly
  2. User can adjust display density (Compact/Comfortable/Spacious) and spacing scales appropriately
  3. User can toggle reduced motion and animations disable when enabled
  4. All preferences persist across browser sessions
  5. Preference changes sync across multiple tabs in real-time
  6. Settings page is organized into clear sections (Appearance, Language, Accessibility)

**Plans**: TBD

Plans:
- [ ] 05-01: Create PreferencesContext and localStorage service
- [ ] 05-02: Implement font size control
- [ ] 05-03: Implement display density control
- [ ] 05-04: Implement reduced motion preference
- [ ] 05-05: Organize Settings page UI and add multi-tab sync

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Theme Infrastructure | 0/1 | Ready to execute | - |
| 2. Component Dark Mode Coverage | 0/TBD | Not started | - |
| 3. i18n Infrastructure | 0/TBD | Not started | - |
| 4. Content Translation | 0/TBD | Not started | - |
| 5. Preferences System | 0/TBD | Not started | - |
