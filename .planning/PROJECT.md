# User Preferences Enhancement

## What This Is

A comprehensive enhancement to the FETMS User Preferences feature, transforming it from a flawed basic implementation into a fully-functional, industry-standard settings system. Users can customize the application theme (with properly implemented dark mode), switch between Traditional Chinese and English interfaces, and control display preferences like font size—all while preserving their user-generated content in its original language.

## Core Value

Users can customize the application experience to match their preferences (theme, language, and display settings), making the FETMS app more accessible and comfortable to use for different users and contexts.

## Requirements

### Validated

<!-- Existing capabilities from the codebase -->

- ✓ Teacher management with recruitment pipeline (Kanban) — existing
- ✓ Document vault with file uploads — existing
- ✓ School management system — existing
- ✓ Analytics dashboard with KPIs — existing
- ✓ Settings page with basic User Preferences card — existing
- ✓ Dark theme toggle (flawed implementation) — existing

### Active

<!-- Current scope - building toward these -->

**Phase 1: Dark Theme Fixes (Priority 1)**
- [ ] Fix header background to adapt to dark theme
- [ ] Fix text contrast across all components for readability
- [ ] Implement industry-standard dark mode design patterns
- [ ] Apply consistent dark theme styling across entire application
- [ ] Ensure smooth theme switching without visual glitches

**Phase 2: Bilingual Support (Priority 2)**
- [ ] Add Traditional Chinese translations for all UI elements
- [ ] Implement language toggle in User Preferences
- [ ] Add browser language detection for default language
- [ ] Store language preference in localStorage
- [ ] Translate all labels, buttons, menus, navigation, help text
- [ ] Implement bilingual dropdown options (labels + option values)
- [ ] Preserve user-generated data in original language
- [ ] Support instant language switching without page reload

**Phase 3: Enhanced User Preferences (Priority 3)**
- [ ] Research and identify common user preference settings
- [ ] Add font size control
- [ ] Implement additional commonly-seen settings
- [ ] Organize Settings page for better UX

### Out of Scope

- Translation of user-generated data (teacher names, school names, user input) — User data stays in original language
- Real-time sync of preferences across devices — localStorage only for v1
- Additional languages beyond Traditional Chinese and English — Future consideration
- Mobile app preferences — Web-first approach
- Advanced theme customization (custom colors, theme builder) — Standard dark/light themes only

## Context

**Current State:**
- FETMS is a working MERN stack application for managing Foreign English Teachers
- Settings page exists at `/src/pages/Settings.tsx` with a User Preferences card
- Dark theme toggle exists but is flawed:
  - Header remains white when theme is dark
  - Text becomes barely visible in dark mode
  - Inconsistent styling across components
- No bilingual support currently exists
- Tech stack: React 19, TypeScript, Vite, Tailwind CSS, Shadcn/UI components

**Known Issues:**
- Dark theme incomplete: header, text contrast, component consistency
- No internationalization (i18n) infrastructure
- Settings page could be more comprehensive

**User Research:**
- User wants industry-standard dark mode implementation
- User wants comprehensive bilingual UI (Traditional Chinese primary, English secondary)
- User wants common preference settings (font size, etc.)

## Constraints

- **Tech Stack**: React 19, TypeScript, Tailwind CSS, Shadcn/UI — Must work within existing stack
- **Data Preservation**: User-generated content must remain in original language — No translation of data
- **Storage**: localStorage for v1 — Simple client-side persistence
- **Browser Compatibility**: Must detect browser language settings — For default language
- **Design Standards**: Must follow industry best practices for dark mode — Research required
- **Code Quality**: Max 200 lines per file, TDD workflow, type safety enforced — Per CLAUDE.md standards

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark theme fixes before language support | User prioritized fixing existing flawed feature before adding new functionality | — Pending |
| Browser language detection for default | Better UX than forcing English or Chinese | — Pending |
| localStorage for preferences | Simpler than DB sync, sufficient for v1 | — Pending |
| Traditional Chinese (not Simplified) | User specified Traditional Chinese explicitly | — Pending |
| Research common settings patterns | User wants industry-standard settings, not custom invention | — Pending |

---
*Last updated: 2026-01-27 after initialization*
