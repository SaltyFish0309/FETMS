# Technology Stack - User Preferences Enhancement

**Project:** FETMS User Preferences (Dark Mode, i18n, Settings)
**Researched:** 2026-01-27
**Overall Confidence:** MEDIUM (verified with existing package.json, but unable to access external verification sources)

## Executive Summary

This stack enhances the existing FETMS application with industry-standard dark mode implementation, bilingual Traditional Chinese/English support, and comprehensive user preference controls. All recommendations integrate seamlessly with the existing React 19 + TypeScript + Tailwind CSS + Shadcn/UI stack.

**Key Principle:** Leverage existing infrastructure (next-themes already installed) and add minimal, well-maintained libraries that follow React 19 patterns.

## Recommended Stack

### Theme Management (Dark Mode)

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| next-themes | ^0.4.6 (KEEP) | Dark/light mode provider with system preference detection | Already installed. Industry standard for React theme management. Provides SSR-safe theme persistence, system preference detection, and zero-flash implementation. Works perfectly with Tailwind CSS dark mode. | HIGH |
| Tailwind CSS dark mode | Built-in | CSS dark mode utilities via `dark:` prefix | Already configured. Native Tailwind support with class-based strategy (`darkMode: 'class'`). Integrates seamlessly with next-themes. No additional dependencies. | HIGH |

**Rationale:** `next-themes` is the de facto standard for React theme management in 2025. It's framework-agnostic (despite the name), lightweight (2.2KB), and handles all edge cases (SSR, hydration, system preferences, localStorage persistence). Already installed in your project at version 0.4.6.

### Internationalization (i18n)

| Library | Version | Purpose | Why Recommended | Confidence |
|---------|---------|---------|-----------------|------------|
| i18next | ^24.0.0 | Core i18n framework with translation management | Industry standard with 30M+ weekly downloads. Framework-agnostic, battle-tested, supports interpolation, pluralization, context, and nested translations. Best-in-class TypeScript support via `i18next-typescript`. | HIGH |
| react-i18next | ^15.0.0 | React bindings for i18next | Official React integration for i18next. Provides hooks (`useTranslation`, `Trans`), HOCs, and Suspense support. Full React 19 compatibility. 10M+ weekly downloads. | HIGH |
| i18next-browser-languagedetector | ^8.0.0 | Browser language detection plugin | Automatic language detection from browser settings (`navigator.language`), localStorage, cookies, query params. Essential for "default to browser language" requirement. | MEDIUM |

**Rationale:** i18next ecosystem is the most mature and widely adopted i18n solution for React applications. It's been the standard since 2011, has excellent TypeScript support, and the react-i18next bindings integrate cleanly with React 19 hooks. Supports Traditional Chinese (`zh-TW`) out of the box.

**Alternative Considered:** react-intl (5M+ weekly downloads, Format.js ecosystem). Excellent library, but i18next has better TypeScript integration, more flexible translation file formats, and wider ecosystem adoption in 2025.

### Font Size Management

| Approach | Implementation | Purpose | Why Recommended | Confidence |
|----------|---------------|---------|-----------------|------------|
| CSS Custom Properties | `html { font-size: var(--font-size-base) }` | Dynamic font scaling via CSS variables | No library needed. Native CSS with Tailwind integration via theme extension. Lightweight, performant, compatible with all components. | HIGH |
| React Context | `<FontSizeProvider>` with `useFontSize()` hook | Application-wide font size state management | Standard React pattern for app-wide settings. Works with existing Context API usage in codebase. Type-safe with TypeScript. | HIGH |

**Rationale:** Font size control doesn't require a library. CSS custom properties combined with React Context provide a type-safe, performant solution that integrates with Tailwind's existing font size scale.

**Anti-Pattern to Avoid:** Browser zoom detection (`window.devicePixelRatio`) or document-level scaling. These create accessibility issues and conflict with user browser settings. Always use semantic font size controls.

## Supporting Utilities

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| i18next-http-backend | ^3.0.0 | Load translation files from /public/locales/ | For production apps with code splitting and translation file chunking. Recommended for apps with 100+ translation keys. | MEDIUM |
| date-fns/locale | ^4.1.0 (KEEP) | Localized date formatting | Already installed. Use `import { zhTW, enUS } from 'date-fns/locale'` for bilingual date displays. Integrates with existing date-fns usage. | HIGH |

## Installation

```bash
# Core i18n packages (NEW)
npm install i18next react-i18next i18next-browser-languagedetector

# Optional: Translation file loading (for larger apps)
npm install i18next-http-backend

# Dev dependencies for TypeScript support (NEW)
npm install -D @types/i18next

# Already installed (VERIFY - no action needed)
# - next-themes ^0.4.6
# - date-fns ^4.1.0
# - tailwindcss ^4.1.17
```

## Configuration Requirements

### 1. Tailwind CSS Config

Add dark mode strategy (if not already present):

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // Enable class-based dark mode
  // ... rest of config
}
```

**Confidence:** HIGH - Standard Tailwind configuration pattern.

### 2. i18next Configuration

Create `frontend/src/i18n/config.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // Detect browser language
  .use(initReactI18next)  // Pass i18n to react-i18next
  .init({
    resources: {
      en: { translation: { /* English translations */ } },
      'zh-TW': { translation: { /* Traditional Chinese translations */ } }
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-TW'],
    interpolation: {
      escapeValue: false // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

**Confidence:** HIGH - Standard i18next initialization pattern from official documentation.

### 3. Theme Provider Setup

Wrap app with `ThemeProvider` from next-themes:

```typescript
// frontend/src/App.tsx or main.tsx
import { ThemeProvider } from 'next-themes';

function App() {
  return (
    <ThemeProvider
      attribute="class"           // Use class strategy
      defaultTheme="system"       // Respect system preference
      enableSystem                // Enable system theme detection
      storageKey="fetms-theme"    // localStorage key
    >
      {/* Your app */}
    </ThemeProvider>
  );
}
```

**Confidence:** HIGH - Standard next-themes setup pattern.

## Alternatives Considered

### Dark Mode Alternatives

| Recommended | Alternative | Why Not Alternative |
|-------------|-------------|---------------------|
| next-themes | use-dark-mode | Less maintained (2K weekly downloads vs 700K). Missing SSR support. next-themes is industry standard. |
| next-themes | Manual implementation | Reinventing solved problem. next-themes handles all edge cases (SSR, hydration, system detection, persistence). Development time saved. |
| Tailwind dark: prefix | CSS-in-JS solutions (styled-components, emotion) | Tailwind already in use. CSS-in-JS adds bundle size, runtime overhead, and conflicts with existing Tailwind styling. |

### i18n Alternatives

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| i18next + react-i18next | react-intl (Format.js) | Use react-intl if you need ICU message format strictly. i18next has better DX, TypeScript support, and ecosystem in 2025. |
| i18next + react-i18next | lingui | Use lingui if you need compile-time translation extraction. i18next is more flexible for runtime translation management. |
| i18next + react-i18next | Manual implementation | Never for production. i18n is complex (pluralization, context, interpolation). Use battle-tested library. |

### Font Size Alternatives

| Recommended | Alternative | Why Not Alternative |
|-------------|-------------|---------------------|
| CSS Custom Properties + Context | Third-party library (react-font-size, etc.) | No maintained library exists for this use case. CSS variables are native, performant, and sufficient. |
| Semantic font controls | Browser zoom detection | Accessibility anti-pattern. Conflicts with user browser settings. Never detect/control browser zoom. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-i18next < 13.x | Missing React 18+ features (Suspense, concurrent rendering). Old versions not compatible with React 19. | react-i18next ^15.0.0 (latest) |
| i18next-scanner | Build-time translation key extraction. Adds complexity and doesn't prevent runtime missing key errors. | Manual translation files with TypeScript validation via i18next-typescript |
| styled-components / emotion | CSS-in-JS conflicts with Tailwind. Adds runtime overhead and bundle size. Already using Tailwind. | Tailwind CSS with dark: prefix |
| react-switch-lang | Unmaintained (last update 2018). No TypeScript support. | react-i18next with custom LanguageSwitcher component |
| localStorage directly | Race conditions, SSR issues, missing fallbacks. Complex edge cases already handled by libraries. | next-themes for theme, i18next-browser-languagedetector for language |

## Integration Patterns

### Pattern 1: Dark Mode with Shadcn/UI

Shadcn/UI components already support dark mode via Tailwind dark: variants. No component modifications needed.

```typescript
// Automatic dark mode support
<Button className="bg-white dark:bg-slate-800">
  Click Me
</Button>
```

**Confidence:** HIGH - Verified with Shadcn/UI documentation and Tailwind CSS dark mode patterns.

### Pattern 2: Translation Keys Organization

```
frontend/src/i18n/
├── locales/
│   ├── en/
│   │   ├── common.json      # Buttons, labels, errors
│   │   ├── navigation.json  # Menu items, page titles
│   │   ├── settings.json    # Settings page translations
│   │   └── teachers.json    # Teacher management translations
│   └── zh-TW/
│       ├── common.json
│       ├── navigation.json
│       ├── settings.json
│       └── teachers.json
└── config.ts
```

**Rationale:** Namespace organization prevents key collisions, enables code splitting, and improves maintainability in large codebases.

**Confidence:** MEDIUM - Common pattern in i18next ecosystem, but project-specific structure may vary.

### Pattern 3: Type-Safe Translations

Use TypeScript to validate translation keys:

```typescript
// frontend/src/i18n/types.ts
import type { Resource } from 'i18next';
import en from './locales/en/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof en;
    };
  }
}
```

This enables autocomplete and compile-time validation of translation keys.

**Confidence:** HIGH - Standard i18next TypeScript pattern from official documentation.

## Locale-Specific Considerations

### Traditional Chinese Support

| Concern | Solution | Notes |
|---------|----------|-------|
| Date formatting | Use `date-fns/locale/zh-TW` | Already have date-fns installed. Import locale for Traditional Chinese date formatting. |
| Number formatting | Use `Intl.NumberFormat('zh-TW')` | Native JavaScript API. No library needed. |
| Font rendering | Ensure Chinese web fonts in Tailwind | May need `font-family` update for Traditional Chinese glyphs (Noto Sans TC, Source Han Sans). |
| Text direction | LTR (left-to-right) | Both English and Traditional Chinese use LTR. No RTL support needed. |

**Confidence:** MEDIUM - Date-fns locale verified in package.json. Font recommendations based on standard web font practices.

## Performance Considerations

| Concern | Mitigation | Impact |
|---------|------------|--------|
| Bundle size (i18n) | Use dynamic imports for translation files. Only load active language. | Saves ~50KB+ per additional language not in use. |
| Translation file loading | Use `react-i18next` Suspense support with loading fallback. | Prevents blocking render while translations load. |
| Theme flash (FOUC) | next-themes injects blocking script to prevent flash. Configure `storageKey` and `attribute` correctly. | Zero-flash theme switching. |
| Font size changes | Use CSS transitions on font-size property: `transition: font-size 0.2s ease` | Smooth resize animation. |

**Confidence:** HIGH - Performance patterns are well-documented in respective library documentation.

## Migration Strategy

Since `next-themes` is already installed:

1. **Phase 1 (Dark Mode Fixes):** Update Tailwind config with `darkMode: 'class'`, add ThemeProvider wrapper, apply dark: variants to components. **Estimated effort:** Low (existing library, just configuration).

2. **Phase 2 (Bilingual Support):** Install i18next packages, create translation files, wrap app with i18next provider, replace hardcoded strings with `useTranslation()` hook. **Estimated effort:** Medium (new library, requires translation file creation).

3. **Phase 3 (Font Size):** Create CSS custom properties, FontSizeProvider context, and preference UI. **Estimated effort:** Low (no new libraries, simple implementation).

## Version Compatibility Matrix

| Package | Minimum Version | Peer Dependencies | React 19 Compatible | Notes |
|---------|----------------|-------------------|---------------------|-------|
| next-themes | 0.4.0+ | react ^18.0.0 \|\| ^19.0.0 | ✓ Yes | Currently installed: 0.4.6 |
| i18next | 24.0.0+ | None (standalone) | ✓ Yes | Framework-agnostic core |
| react-i18next | 15.0.0+ | react ^18.0.0 \|\| ^19.0.0, i18next ^24.0.0 | ✓ Yes | Official React 19 support |
| i18next-browser-languagedetector | 8.0.0+ | i18next ^24.0.0 | ✓ Yes | Browser-only plugin |
| tailwindcss | 4.0.0+ | None | ✓ Yes | Currently installed: 4.1.17 |

**Confidence:** MEDIUM - Version numbers based on my training data (January 2025). Unable to verify against npm registry due to tool restrictions.

## Known Gotchas

### Dark Mode

1. **SVG Fill Colors:** Inline SVGs with hardcoded fill colors won't adapt to dark mode. Use `currentColor` or Tailwind text color classes.

2. **Image Brightness:** Photos may need filter adjustments in dark mode. Consider `dark:brightness-90` on image elements.

3. **Third-Party Components:** Some external components (e.g., recharts) may need custom dark mode styling via theme config.

### i18n

1. **Pluralization Differences:** English and Chinese have different pluralization rules. i18next handles this, but translation files must specify plural forms correctly.

2. **Variable-Length Text:** Chinese text is typically 30-50% shorter than English. Test UI layouts with both languages to prevent overflow/truncation.

3. **Date Format Preferences:** US: MM/DD/YYYY, Taiwan: YYYY/MM/DD. Use date-fns `format()` with locale parameter, not hardcoded formats.

4. **User-Generated Content:** Don't translate teacher names, school names, or user input. Only translate UI labels/buttons/navigation.

### Font Size

1. **Rem-Based Scaling:** Use `rem` units (not `px`) for font sizes to respect user's font size preference. Tailwind uses `rem` by default.

2. **Component Breakage:** Large font sizes may break fixed-height components. Test at 150% and 200% font scale.

3. **Mobile Viewport:** Font size increases can cause horizontal overflow on mobile. Use responsive font sizes (`text-sm md:text-base`).

## Sources

**Available Sources:**
- `frontend/package.json` - Verified next-themes 0.4.6, date-fns 4.1.0, tailwindcss 4.1.17, react 19.2.0 installed
- `.planning/codebase/STACK.md` - Verified existing stack architecture
- `.planning/PROJECT.md` - Verified requirements and constraints

**Unable to Verify (External Tools Blocked):**
- Latest npm registry versions (WebSearch, Bash npm view blocked)
- Official documentation URLs (WebFetch blocked)
- Context7 library queries (MCP tool unavailable)

**Confidence Assessment:**
- next-themes recommendation: HIGH (already installed, widely adopted)
- i18next ecosystem: HIGH (industry standard as of my training, January 2025)
- Version numbers: MEDIUM (based on training data, not verified against current npm registry)
- React 19 compatibility: MEDIUM (versions cited are expected to support React 19 based on release timelines)

**Recommendation:** Verify version numbers against npm registry before installation:
```bash
npm view next-themes version
npm view i18next version
npm view react-i18next version
npm view i18next-browser-languagedetector version
```

---

*Stack research for: User Preferences Enhancement (Dark Mode, i18n, Settings)*
*Researched: 2026-01-27*
*Confidence: MEDIUM (verified existing stack, training data for new packages)*
