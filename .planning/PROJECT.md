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
- ✓ Dark theme toggle (fully fixed and functional) — v1.0
- ✓ Dark mode coverage across all components and pages — v1.0
- ✓ Bilingual support (English / Traditional Chinese) — v1.0
- ✓ Language toggle with persistence — v1.0
- ✓ Font size control (Small/Medium/Large) — v1.0
- ✓ Display density control (Compact/Comfortable/Spacious) — v1.0
- ✓ Reduced motion preference — v1.0
- ✓ Settings page organization (Appearance, Language, Accessibility) — v1.0

### Active

<!-- Current scope - building toward these -->

(None - v1.0 Complete)

### Out of Scope

- Translation of user-generated data (teacher names, school names, user input) — User data stays in original language
- Real-time sync of preferences across devices — localStorage only for v1
- Additional languages beyond Traditional Chinese and English — Future consideration
- Mobile app preferences — Web-first approach
- Advanced theme customization (custom colors, theme builder) — Standard dark/light themes only

## Context

**Current State:**
- FETMS is a working MERN stack application for managing Foreign English Teachers
- Shipped v1.0 User Preferences Enhancement (Jan 2026)
- Features robust dark mode, full i18n infrastructure (EN/ZH-TW), and accessibility preferences (font/density/motion)
- Tech stack: React 19, TypeScript, Vite, Tailwind CSS, Shadcn/UI components, i18next
- LOC: ~18,000 lines (Frontend + Backend)

**Known Issues:**
- Minor hardcoded text in low-traffic components (BoxManagementDialogs)
- Dynamic toast messages partially hardcoded for context (intentional decision)

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
| Dark theme fixes before language support | User prioritized fixing existing flawed feature before adding new functionality | ✓ Good |
| Browser language detection for default | Better UX than forcing English or Chinese | ✓ Good |
| localStorage for preferences | Simpler than DB sync, sufficient for v1 | ✓ Good |
| Traditional Chinese (not Simplified) | User specified Traditional Chinese explicitly | ✓ Good |
| Research common settings patterns | User wants industry-standard settings, not custom invention | ✓ Good |
| Class-based dark mode (`darkMode: 'class'`) | Matches next-themes implementation (adds/removes .dark on html) | ✓ Good |
| Blocking FOUC script | Prevent flash of unstyled content on page load | ✓ Good |
| Mocking Radix UI in tests | Avoid portal/interaction complexity when testing logic | ✓ Good |
| Dynamic Toast Messages | Keep 'Moved to {stage}' context instead of generic translation | ✓ Good |
| Root-based Font Scaling | Ensure all rem-based UI elements scale proportionally | ✓ Good |
| Explicit Motion Override | Allow users to force-enable motion even if system prefers reduced | ✓ Good |
| Targeted Density Scaling | Apply density to key elements only to avoid breaking complex layouts | ✓ Good |

## Tech Stack & Capabilities

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Shadcn/UI
- **Backend:** Node.js, Express, MongoDB
- **Testing:** Vitest, React Testing Library
- **MCP Tools:**
  - [Context7]: When you need to search docs, use `context7` tools. Use skill: use-context-7 for more information.
  - [gh_grep]: If you are unsure how to do something, use `gh_grep` to search code examples from GitHub. Use skill: use-gh-grep for more information.

---
*Last updated: 2026-01-30 after v1.0 milestone completion*
