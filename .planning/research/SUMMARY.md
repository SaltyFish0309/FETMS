# Project Research Summary

**Project:** FETMS User Preferences Enhancement (Dark Mode, i18n, Settings)
**Domain:** User Interface Preferences and Internationalization
**Researched:** 2026-01-27
**Confidence:** MEDIUM-HIGH

## Executive Summary

This research synthesizes findings for implementing comprehensive user preferences in the FETMS (Foreign English Teachers Management System). The project requires fixing an existing flawed dark mode implementation and adding bilingual support (Traditional Chinese/English) with persistent user preferences.

The recommended approach leverages the existing React 19 + TypeScript + Tailwind CSS + Shadcn/UI stack with minimal, well-maintained additions: next-themes (already installed but misconfigured) for dark mode, i18next ecosystem for internationalization, and custom React Context for app-specific preferences. The architecture follows existing patterns in the codebase (Context API + localStorage sync via useEffect) for consistency and maintainability.

Critical risks include incomplete dark mode coverage causing accessibility violations (WCAG contrast failures), flash of unstyled content (FOUC) degrading user experience, and text expansion breaking layouts when translating between English and Traditional Chinese. These can be mitigated through proper Tailwind configuration, inline theme initialization scripts, CSS custom properties for semantic colors, and flexible layout design with comprehensive testing in both languages.

## Key Findings

### Recommended Stack

The research confirms that the existing stack is well-suited for this enhancement. The key is proper configuration and complete implementation rather than adding new dependencies.

**Core technologies:**
- **next-themes (0.4.6, KEEP)**: Industry standard theme provider with system preference detection — already installed, needs proper configuration with Tailwind's `darkMode: 'class'` strategy
- **Tailwind CSS (4.1.17)**: Built-in dark mode via `dark:` prefix utilities — requires `darkMode: 'class'` config and comprehensive application across all components
- **i18next + react-i18next (NEW)**: Industry standard i18n framework with 30M+ weekly downloads — best-in-class TypeScript support and Traditional Chinese compatibility
- **CSS Custom Properties**: Semantic color tokens for theme-aware styling — essential for maintainable dark mode and Shadcn/UI compatibility
- **React Context API**: App-specific preferences management — follows existing ProjectContext pattern

**Critical version requirements:**
- react-i18next ^15.0.0 (React 19 compatible)
- i18next ^24.0.0 (framework-agnostic core)
- i18next-browser-languagedetector ^8.0.0 (automatic language detection)

**Anti-pattern to avoid:** CSS-in-JS solutions (styled-components, emotion) — conflicts with Tailwind, adds bundle size and runtime overhead

### Expected Features

**Must have (table stakes) — Phase 1:**
- **Fix Dark Theme Implementation** — CRITICAL: header, consistent styling, component coverage (current implementation is flawed with white header in dark mode)
- **Dark Mode Toggle** (Light/Dark/System) — Already exists via next-themes but needs fixes
- **Theme Persistence** — Exists but needs FOUC prevention
- **Language Toggle** (Traditional Chinese/English) — Standard bilingual app expectation
- **Language Persistence** — localStorage with browser language detection on first visit
- **UI Label Translation** — All static text (buttons, labels, menus, navigation) must translate
- **Font Size Control** (Small/Medium/Large) — Basic accessibility requirement

**Should have (competitive) — Phase 2:**
- **Display Density Control** (Compact/Comfortable/Spacious) — Power user feature
- **Reduced Motion Preference** — Accessibility enhancement
- **Default Project Selection** — Quality of life improvement
- **Sidebar Collapse Preference** — User-specific workspace optimization

**Defer (v2+):**
- **High Contrast Mode** — Requires specialized design work
- **Color Blind Themes** — Specialized need, wait for user requests
- **Sync Preferences Across Devices** — Requires backend infrastructure
- **Table Column Preferences** — Complex per-table configuration

**Anti-features identified (do NOT build):**
- Per-component theme override (creates visual chaos)
- Real-time translation of user data (destroys data integrity)
- Unlimited custom themes (accessibility nightmare)
- Auto-detect language from content (unpredictable UX)

### Architecture Approach

The architecture uses Context Provider Composition at app root, with each provider managing independent concerns (theme, language, preferences). This follows React composition patterns and matches the existing ProjectContext implementation in the codebase.

**Major components:**
1. **ThemeProvider** (next-themes) — Already exists, wraps app for theme state management, syncs with localStorage and system preferences
2. **I18nextProvider** (react-i18next) — NEW: Manages language state, loads translation files via namespace organization (common, teachers, schools, dashboard, settings)
3. **PreferencesContext** (custom) — NEW: App-specific preferences (font size, density, etc.) following existing ProjectContext pattern with localStorage sync
4. **Theme Color System** — CSS custom properties in globals.css with semantic tokens (--background, --foreground, --primary, etc.) that change per theme
5. **Translation Files** — Organized by feature domain matching page structure, enabling code splitting and parallel development

**Key patterns:**
- Hook-based state access (useTheme, useTranslation, usePreferences) for type safety
- localStorage synchronization via useEffect (established pattern in ProjectContext)
- Tailwind dark mode via class strategy (`dark:` variants activated by class on `<html>`)
- Namespace-based translation organization preventing monolithic files

**Critical path dependency:**
1. Fix Tailwind config (`darkMode: 'class'`) → MUST be first
2. Add FOUC prevention script → MUST be before component styling
3. Define CSS custom properties → MUST be before Shadcn/UI work
4. Install i18next → MUST be before any translation work
5. Create PreferencesContext → Can be parallel with i18n

### Critical Pitfalls

1. **Flash of Unstyled Content (FOUC)** — Users see brief flash of wrong theme on page load; prevented by inline blocking script in `<head>` that reads localStorage and sets theme class before any content renders
2. **Missing Tailwind Dark Mode Config** — `dark:` utilities don't work without `darkMode: 'class'` in tailwind.config.js; this is the root cause of "header stays white" issue
3. **No CSS Custom Properties** — Hardcoded colors (bg-slate-900, text-gray-100) create inconsistent theming and break Shadcn/UI; requires semantic tokens (--background, --foreground, --primary)
4. **Contrast Ratio Failures (WCAG)** — Insufficient contrast in dark mode violates accessibility standards (need 4.5:1 for text); must test with contrast checker tools
5. **Text Expansion Breaking Layouts** — Traditional Chinese characters are wider than English despite shorter character count; requires flexible layouts (no fixed widths), test both languages
6. **Traditional Chinese Font Stack Issues** — System fallback fonts use Simplified Chinese variants; requires proper font stack with Noto Sans TC, PingFang TC, Microsoft JhengHei
7. **Missing i18n for Dynamic Content** — Error messages, dates, numbers, enum values remain in English; requires comprehensive translation strategy (backend error codes, date-fns locales, i18n template strings)
8. **Incomplete Dark Mode Coverage** — Modals, dropdowns, tooltips, loading/error states forgotten; requires component checklist and systematic testing
9. **Recharts Theming** — Charts don't automatically adapt to dark mode; needs theme-aware color configuration for axes, grids, tooltips

## Implications for Roadmap

Based on research, the natural phase structure follows dependency order and architectural boundaries:

### Phase 1: Theme Infrastructure (Foundation)
**Rationale:** All subsequent work depends on properly configured dark mode. Current implementation is broken (header stays white), must be fixed before adding features.

**Delivers:**
- Properly configured Tailwind dark mode (`darkMode: 'class'`)
- FOUC prevention via inline script
- CSS custom properties for semantic colors
- ThemeProvider correctly configured
- ThemeToggle component working flawlessly

**Addresses:**
- Table stakes feature: Fixed dark theme implementation
- Table stakes feature: Theme persistence

**Avoids:**
- Pitfall 1: FOUC
- Pitfall 2: Missing Tailwind config
- Pitfall 3: No CSS custom properties
- Pitfall 5: Hydration mismatch

**Research flag:** SKIP research-phase — well-documented Tailwind + next-themes pattern

### Phase 2: Component Dark Mode Coverage (Systematic Rollout)
**Rationale:** With infrastructure in place, systematically apply dark mode to ALL components. This prevents the "90% done" trap where some components are forgotten.

**Delivers:**
- Header/navigation dark mode styling
- All Shadcn/UI components verified in dark mode
- Forms, inputs, tables with proper dark styling
- Modals, dropdowns, tooltips dark mode
- Recharts theme-aware configuration
- SVG icons and images with dark variants

**Addresses:**
- Comprehensive dark theme coverage
- WCAG contrast compliance

**Avoids:**
- Pitfall 4: Contrast ratio failures
- Pitfall 6: Forgotten Shadcn/UI theming
- Pitfall 11: Inconsistent coverage
- Pitfall 12: SVG/image issues
- Pitfall 13: Recharts theming

**Research flag:** SKIP research-phase — standard component styling patterns

### Phase 3: i18n Infrastructure (Language Foundation)
**Rationale:** Dark mode complete and stable. Now add internationalization foundation before translating content.

**Delivers:**
- i18next + react-i18next installed
- i18n/config.ts initialization
- Translation file structure (namespaces by feature)
- I18nextProvider wrapping app
- LanguageSelector component
- Traditional Chinese font stack configured

**Addresses:**
- Table stakes feature: Language toggle
- Table stakes feature: Language persistence
- Table stakes feature: Browser language detection

**Avoids:**
- Pitfall 8: Traditional Chinese font issues
- Pitfall 14: i18n bundle size (via code splitting)
- Pitfall 15: Translation key maintenance hell

**Research flag:** SKIP research-phase — standard i18next setup pattern

### Phase 4: Content Translation (Comprehensive i18n)
**Rationale:** With i18n infrastructure ready, systematically translate all user-facing content.

**Delivers:**
- Settings page fully translated
- Dashboard translations
- Teachers page translations
- Schools page translations
- Date/time locale formatting
- Number formatting per locale
- Error message translations
- Validation message translations
- Enum value translations

**Addresses:**
- Table stakes feature: UI label translation
- Complete bilingual support

**Avoids:**
- Pitfall 7: Text expansion breaking layouts
- Pitfall 9: Missing i18n for dynamic content
- Pitfall 18: Traditional Chinese punctuation

**Research flag:** CONSIDER research-phase for Traditional Chinese quality review — native speaker needed for translation verification

### Phase 5: Preferences UI and Persistence (User Control)
**Rationale:** Theme and language working. Now add custom preferences (font size, density, etc.) with unified settings page.

**Delivers:**
- PreferencesContext implementation
- preferencesService for localStorage abstraction
- Font size control (Small/Medium/Large)
- Display density control (optional, based on feedback)
- Reduced motion preference
- Multi-tab sync for all preferences
- Unified settings page UI

**Addresses:**
- Table stakes feature: Font size control
- Competitive features: Display density, reduced motion
- Complete preferences management

**Avoids:**
- Pitfall 10: localStorage sync issues with multi-tab

**Research flag:** SKIP research-phase — follows existing ProjectContext pattern

### Phase Ordering Rationale

- **Phase 1 before 2:** Must configure Tailwind dark mode before styling components
- **Phase 2 before 3:** Stabilize dark mode before adding i18n complexity
- **Phase 3 before 4:** Must set up i18n infrastructure before translating content
- **Phase 5 can be parallel with 4:** Preferences don't depend on translations
- **Linear dependency chain:** 1 → 2 → 3 → 4, with 5 joining after 3

This ordering:
- Avoids rework (no styling components before theme system ready)
- Enables incremental testing (each phase independently verifiable)
- Matches architecture boundaries (infrastructure → implementation → content)
- Prevents pitfalls by addressing foundation issues first

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 4 (Content Translation):** Traditional Chinese translation quality review — recommend engaging native speaker for verification of translations, punctuation, and typography

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Theme Infrastructure):** Well-documented Tailwind + next-themes pattern
- **Phase 2 (Component Styling):** Standard component styling with Shadcn/UI
- **Phase 3 (i18n Infrastructure):** Established i18next setup pattern
- **Phase 5 (Preferences):** Follows existing ProjectContext pattern in codebase

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing stack verified in package.json; i18next is industry standard; next-themes already installed |
| Features | HIGH | Table stakes and differentiators based on modern web app standards; anti-features identified from common mistakes |
| Architecture | HIGH | Patterns verified in existing codebase (ProjectContext, ThemeProvider); follows React 19 best practices |
| Pitfalls | MEDIUM-HIGH | WCAG standards (HIGH), Tailwind + next-themes patterns (HIGH), Traditional Chinese specifics need native speaker verification (MEDIUM) |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

**Traditional Chinese specifics (MEDIUM confidence):**
- Text expansion ratios need measurement with actual translations
- Font rendering differences between Traditional and Simplified need testing on target OS (Windows)
- Punctuation spacing rules need native speaker verification
- Recommended mitigation: Engage Traditional Chinese speaker for Phase 4 translation review

**Bundle size impact (MEDIUM confidence):**
- i18next library size estimates based on training data, not measured in this project
- Recommended mitigation: Analyze bundle size during Phase 3 with webpack-bundle-analyzer or Vite equivalent

**React 19 compatibility (HIGH confidence):**
- Versions cited (react-i18next ^15.0.0, i18next ^24.0.0) expected to support React 19
- Recommended mitigation: Verify version compatibility against npm registry before installation

**Date-fns Traditional Chinese locale:**
- Package.json shows date-fns 4.1.0 installed
- Research verified `zhTW` locale exists in date-fns
- Recommended mitigation: Test date formatting with zh-TW locale during Phase 4

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis (package.json, tailwind.config.js, component structure)
- WCAG 2.1 Color Contrast Guidelines (official specification)
- Tailwind CSS 4.x dark mode documentation (official docs)
- React 19 Context API patterns (official React documentation)
- next-themes 0.4.6 implementation patterns (verified in codebase)

### Secondary (MEDIUM confidence)
- i18next ecosystem documentation (training knowledge, industry standard)
- Shadcn/UI theming architecture (well-documented pattern)
- Traditional Chinese web typography patterns (general CJK practices)
- React-i18next best practices (community consensus)

### Tertiary (requires validation)
- Traditional Chinese text expansion ratios (needs measurement)
- Specific bundle sizes for i18next in this project (needs analysis)
- Traditional Chinese font availability on target platforms (needs testing)
- Translation quality standards (needs native speaker review)

### Unable to Verify (tools unavailable)
- Latest npm package versions (WebSearch blocked)
- Current state-of-the-art i18n patterns in 2026 (WebSearch blocked)
- Competitor implementations for reference (WebSearch blocked)

**Recommendation:** Verify i18next package versions against npm registry before installation:
```bash
npm view i18next version
npm view react-i18next version
npm view i18next-browser-languagedetector version
```

---
*Research completed: 2026-01-27*
*Ready for roadmap: yes*
*Files synthesized: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
