# Architecture Research

**Domain:** User Preferences (Dark Mode, i18n, Preferences Storage)
**Researched:** 2026-01-27
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      App Root (App.tsx)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ThemeProvider │  │ i18nProvider │  │ProjectProvider│      │
│  │(next-themes) │  │(react-i18next│  │  (existing)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘      │
│         │                 │                 │                │
├─────────┴─────────────────┴─────────────────┴────────────────┤
│                      Router/Layout                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Page Components                         │    │
│  │  - useTheme() for dark mode                         │    │
│  │  - useTranslation() for i18n                        │    │
│  │  - useProjectContext() for project state            │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    localStorage Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  theme   │  │ language │  │projectId │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **ThemeProvider** | Manages theme state (light/dark/system), syncs with localStorage and system preferences | next-themes wrapper, already exists at `components/ui/theme-provider.tsx` |
| **i18nProvider** | Manages language state, loads translation files, provides translation functions | i18next + react-i18next I18nextProvider wrapping App |
| **useTheme hook** | Provides theme state and setTheme function to components | From next-themes, used by ThemeToggle component |
| **useTranslation hook** | Provides t() translation function and i18n instance to components | From react-i18next, to be used in all UI components |
| **localStorage** | Persists theme, language, and other preferences across sessions | Managed automatically by providers + custom PreferencesContext for additional settings |
| **PreferencesContext** | Custom context for app-specific preferences (e.g., date format, time zone, compact mode) | Custom Context API following ProjectContext pattern |

## Recommended Project Structure

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── theme-provider.tsx       # ✓ EXISTS: next-themes wrapper
│   │   └── theme-toggle.tsx         # ✓ EXISTS: theme switcher UI
│   └── preferences/
│       └── language-selector.tsx    # NEW: language switcher UI
├── contexts/
│   ├── ProjectContext.tsx           # ✓ EXISTS: project selection
│   └── PreferencesContext.tsx       # NEW: app-specific preferences
├── i18n/
│   ├── config.ts                    # NEW: i18next initialization
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json          # Shared translations
│   │   │   ├── teachers.json        # Teacher-specific translations
│   │   │   ├── schools.json
│   │   │   ├── dashboard.json
│   │   │   └── settings.json
│   │   └── zh/                      # Chinese translations (mirror structure)
│   └── types.ts                     # TypeScript types for translation keys
├── pages/
│   └── PreferencesSettings.tsx      # ✓ EXISTS: settings UI page
└── services/
    └── preferencesService.ts        # NEW: localStorage abstraction for preferences
```

### Structure Rationale

- **i18n/ folder:** Centralizes all internationalization logic. Config file initializes i18next, locales/ contains language-specific JSON files organized by feature domain (matching page structure).
- **contexts/PreferencesContext.tsx:** Follows existing ProjectContext pattern for consistency. Manages non-theme/non-language preferences like date format, compact view mode, etc.
- **services/preferencesService.ts:** Abstracts localStorage operations with type safety, following existing service pattern (projectService, teacherService).
- **ThemeProvider:** Already correctly positioned at app root, wraps entire app for dark mode support via Tailwind's `dark:` classes.

## Architectural Patterns

### Pattern 1: Context Provider Composition

**What:** Stack multiple context providers at app root, each managing independent concerns.

**When to use:** When app needs multiple global state slices (theme, language, project, preferences) that don't have circular dependencies.

**Trade-offs:**
- **PRO:** Clean separation of concerns, each provider is independently testable
- **PRO:** Follows React composition patterns, easy to add/remove providers
- **CON:** Can create "provider hell" with deep nesting (mitigated with proper organization)
- **CON:** Each provider adds slight performance overhead (negligible for <10 providers)

**Example:**
```typescript
// App.tsx (EXISTING PATTERN - already implemented)
function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nextProvider i18n={i18n}>
        <Router>
          <ProjectProvider>
            <PreferencesProvider>
              <AppContent />
            </PreferencesProvider>
          </ProjectProvider>
        </Router>
      </I18nextProvider>
    </ThemeProvider>
  );
}
```

### Pattern 2: Hook-Based State Access

**What:** Consumers access state via custom hooks (useTheme, useTranslation, usePreferences) rather than direct context access.

**When to use:** Always. Hooks provide better DX, type safety, and error handling.

**Trade-offs:**
- **PRO:** Type-safe API, IDE autocomplete works perfectly
- **PRO:** Can throw helpful errors if used outside provider
- **PRO:** Easy to add derived state or computed values
- **CON:** Requires custom hook per context (minimal boilerplate)

**Example:**
```typescript
// Component using all three concerns
function TeacherList() {
  const { theme, setTheme } = useTheme(); // from next-themes
  const { t, i18n } = useTranslation('teachers'); // from react-i18next
  const { dateFormat, compactMode } = usePreferences(); // custom hook

  return (
    <div>
      <h1>{t('title')}</h1>
      {/* Component logic */}
    </div>
  );
}
```

### Pattern 3: localStorage Synchronization with useEffect

**What:** Providers sync state to localStorage in useEffect hooks to persist across sessions.

**When to use:** For any user preference that should survive page refresh.

**Trade-offs:**
- **PRO:** Automatic persistence, no manual save/load
- **PRO:** Works seamlessly with SSR (localStorage only accessed client-side)
- **CON:** Can cause flicker on initial load if not handled correctly
- **CON:** localStorage size limits (5-10MB, sufficient for preferences)

**Example:**
```typescript
// PreferencesContext.tsx (following ProjectContext pattern)
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    // Initialize from localStorage on mount
    const stored = localStorage.getItem('userPreferences');
    return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
  });

  // Persist to localStorage whenever preferences change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}
```

### Pattern 4: Namespace-Based Translation Organization

**What:** Organize translations by feature domain, load them as namespaces in i18next.

**When to use:** For medium to large apps with multiple features. Prevents monolithic translation files.

**Trade-offs:**
- **PRO:** Lazy-load translations per feature, reduces initial bundle size
- **PRO:** Easier to maintain, each team can own their domain's translations
- **PRO:** Prevents merge conflicts in translation files
- **CON:** Requires careful namespace management
- **CON:** Can lead to duplication of common strings (mitigated with 'common' namespace)

**Example:**
```typescript
// i18n/config.ts
i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEN,
      teachers: teachersEN,
      schools: schoolsEN,
      dashboard: dashboardEN,
      settings: settingsEN,
    },
    zh: {
      common: commonZH,
      teachers: teachersZH,
      // ... mirror structure
    }
  },
  defaultNS: 'common',
  fallbackNS: 'common',
});

// Usage in component
const { t } = useTranslation('teachers'); // loads teachers namespace
t('add_teacher'); // → "Add Teacher" (from teachers.json)
t('common:save'); // → "Save" (from common.json, explicit namespace)
```

### Pattern 5: Tailwind Dark Mode via Class Strategy

**What:** Tailwind's dark mode using `class` strategy, toggled by adding/removing `dark` class on root element.

**When to use:** With next-themes and Tailwind CSS (already configured in this project).

**Trade-offs:**
- **PRO:** Works perfectly with next-themes, no configuration needed
- **PRO:** Supports system preference detection + manual override
- **PRO:** No flicker on load (next-themes handles SSR correctly)
- **CON:** All dark styles must be manually specified with `dark:` prefix
- **CON:** Requires consistent dark mode implementation across all components

**Example:**
```typescript
// Tailwind classes with dark mode support (EXISTING PATTERN)
<div className="bg-slate-50 dark:bg-slate-950 transition-colors">
  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
    <p className="text-slate-900 dark:text-slate-100">
      Content that adapts to theme
    </p>
  </Card>
</div>
```

## Data Flow

### Theme Change Flow

```
User clicks theme toggle
    ↓
ThemeToggle calls setTheme('dark')
    ↓
next-themes updates internal state
    ↓
next-themes updates localStorage ('theme' key)
    ↓
next-themes adds/removes 'dark' class on <html>
    ↓
Tailwind CSS applies dark: variant styles
    ↓
UI re-renders with new colors
```

### Language Change Flow

```
User selects language
    ↓
LanguageSelector calls i18n.changeLanguage('zh')
    ↓
i18next updates internal language state
    ↓
i18next saves to localStorage ('i18nextLng' key)
    ↓
i18next loads translation files for 'zh' namespace
    ↓
All components using t() function re-render
    ↓
UI displays Chinese translations
```

### Preference Change Flow

```
User toggles compact mode in settings
    ↓
PreferencesSettings calls setPreferences({ compactMode: true })
    ↓
PreferencesContext updates state
    ↓
useEffect syncs to localStorage ('userPreferences' key)
    ↓
Components using usePreferences() re-render
    ↓
UI layout changes to compact mode
```

### Key Data Flows

1. **Initial Load:** App reads from localStorage (theme, language, preferences) → initializes providers → renders UI in correct state. Order matters: ThemeProvider must wrap app before first render to prevent flash.

2. **Cross-Provider Independence:** Theme, language, and preferences are independent. Changing theme doesn't affect language. This enables parallel development and testing.

3. **Persistence Strategy:** Each provider owns its localStorage key. No central preferences object. This prevents conflicts and makes each system independently removable.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is perfect. Single-language (English only) with theme toggle. localStorage for all preferences. |
| 1k-10k users | Add i18n for internationalization (Chinese + English). Lazy-load translation namespaces. Consider adding preference migration system for breaking changes. |
| 10k+ users | Consider server-side preference sync for cross-device experience. Add analytics to track which languages/themes are most used. Cache translations in Service Worker for offline support. |

### Scaling Priorities

1. **First optimization:** Lazy-load translation files per route. Users don't need all translations on first load. Use React.lazy() + Suspense boundaries to defer loading non-critical language packs.

2. **Second optimization:** If localStorage preferences grow beyond user's preferences (e.g., caching API data), consider IndexedDB for larger storage. But for theme + language + ~10 app preferences, localStorage is sufficient.

## Anti-Patterns

### Anti-Pattern 1: Monolithic Translation Files

**What people do:** Put all translations in a single `en.json` and `zh.json` file.

**Why it's wrong:**
- File becomes massive (1000+ lines), hard to navigate
- All translations loaded on initial page load, slows app startup
- Merge conflicts when multiple developers edit same file
- Can't code-split translations by route

**Do this instead:** Use namespace-based organization (common, teachers, schools, dashboard, settings). Each namespace is a separate JSON file. Components explicitly declare which namespace they need: `useTranslation('teachers')`.

### Anti-Pattern 2: Manual localStorage Key Management

**What people do:** Scatter localStorage.getItem/setItem calls throughout components.

**Why it's wrong:**
- Hard to track what's stored and where
- No type safety, typos cause silent bugs
- Difficult to migrate data structure changes
- Can't easily clear all preferences or export/import

**Do this instead:** Abstract localStorage access into a service layer (preferencesService.ts) with TypeScript types. All reads/writes go through the service, which handles serialization, validation, and migrations.

### Anti-Pattern 3: Inline Translation Strings

**What people do:** Keep hardcoded strings in components even after adding i18n: `<button>Add Teacher</button>`.

**Why it's wrong:**
- Partial i18n implementation is confusing for users
- Forces developers to remember which strings are translatable
- Creates inconsistent language switching (some text changes, some doesn't)
- Defeats the purpose of internationalization

**Do this instead:** Commit to full i18n. Every user-facing string goes through t() function: `<button>{t('add_teacher')}</button>`. Use linting rules to enforce this (eslint-plugin-i18next). Accept initial overhead of translating all strings.

### Anti-Pattern 4: Theme-Specific CSS Variables Without Fallbacks

**What people do:** Define CSS variables only for light mode, assume dark mode will override them.

**Why it's wrong:**
- Dark mode breaks if variables aren't redefined
- Hard to debug missing color issues
- Creates maintenance burden (must remember to define both)

**Do this instead:** With Tailwind + Shadcn/UI, use semantic color tokens that automatically work in both modes: `bg-card`, `text-foreground`, `border-input`. These are already defined for dark mode via Shadcn's theme system. Avoid custom color classes without dark: variants.

### Anti-Pattern 5: Multiple Sources of Truth for Preferences

**What people do:** Store theme in localStorage, language in URL params, preferences in React state without sync.

**Why it's wrong:**
- Preferences can get out of sync across sources
- Hard to reset all preferences at once
- Confusing for users where their settings are saved
- Difficult to implement "export settings" feature

**Do this instead:** Single source of truth per preference domain. Theme → next-themes (localStorage 'theme'). Language → i18next (localStorage 'i18nextLng'). App preferences → PreferencesContext (localStorage 'userPreferences'). Each provider owns its domain, no overlaps.

## Integration Points

### Existing Integrations

| Integration | Pattern | Notes |
|-------------|---------|-------|
| **next-themes ↔ Tailwind CSS** | next-themes adds `dark` class to `<html>`, Tailwind's `dark:` variants activate | Already working. ThemeProvider configured with `attribute="class"` in App.tsx. |
| **ProjectContext ↔ localStorage** | ProjectContext reads/writes selectedProjectId to localStorage | Existing pattern to follow for PreferencesContext. Uses useEffect for sync. |
| **Shadcn/UI components ↔ Theme** | All Shadcn components use semantic tokens (bg-card, text-foreground) that adapt to dark mode | No changes needed. Components automatically support dark mode. |

### New Integrations (To Be Built)

| Integration | Pattern | Implementation Notes |
|-------------|---------|----------------------|
| **react-i18next ↔ All UI Text** | Wrap all user-facing strings with t() function from useTranslation() | Requires refactoring all pages and components. Start with Settings page, then expand. |
| **i18next ↔ date-fns** | Configure date-fns locale based on i18n.language | Import locales dynamically: `import { zh } from 'date-fns/locale'`. Pass to date-fns formatters. |
| **PreferencesContext ↔ Settings UI** | Settings page reads/writes preferences via usePreferences() hook | Settings page is form UI, PreferencesContext is data layer. Standard form → context flow. |
| **Theme + Language ↔ Toaster** | Ensure toast notifications respect theme colors and display in selected language | Sonner (toast library) already respects theme. Toast messages must use t() function. |

### Component Integration Strategy

**Phase 1: Infrastructure**
1. Install i18next + react-i18next
2. Create i18n/config.ts with initial en/zh namespaces
3. Create PreferencesContext following ProjectContext pattern
4. Create preferencesService for localStorage abstraction

**Phase 2: Settings UI**
1. Build LanguageSelector component (mirrors ThemeToggle pattern)
2. Build PreferencesSettings form with all preference options
3. Wire up PreferencesContext to Settings UI
4. Test persistence across page reloads

**Phase 3: App-Wide Rollout**
1. Translate Settings page strings (t() everywhere)
2. Translate Dashboard page strings
3. Translate Teachers page strings
4. Translate Schools page strings
5. Translate Documents page strings

**Rationale:** Start with infrastructure, then settings UI (where users control preferences), then roll out to rest of app. This enables incremental development and testing.

## Build Order and Dependencies

### Dependency Graph

```
next-themes (already installed)
    ↓
ThemeProvider + ThemeToggle (already built)
    ↓
[PARALLEL TRACKS - no dependencies between them]
    ├── Track 1: i18n
    │   ├── Install i18next + react-i18next
    │   ├── Create i18n/config.ts
    │   ├── Create translation files (en/common.json, zh/common.json)
    │   ├── Wrap App with I18nextProvider
    │   └── Build LanguageSelector component
    │
    └── Track 2: Custom Preferences
        ├── Create types for Preferences interface
        ├── Create preferencesService.ts
        ├── Create PreferencesContext.tsx
        ├── Build PreferencesSettings UI form
        └── Wire up to usePreferences() hook
```

### Critical Path

1. **Install i18next libraries** (npm install i18next react-i18next) — MUST be first
2. **Initialize i18n config** (create i18n/config.ts, import in main.tsx) — MUST be before any t() usage
3. **Create translation structure** (locales/en/common.json, locales/zh/common.json) — MUST exist before i18n.init()
4. **Build PreferencesContext** (independent of i18n) — Can be parallel with i18n setup
5. **Build Settings UI** (consumes both i18n and PreferencesContext) — MUST be after both providers exist
6. **Translate existing pages** (refactor strings to t()) — MUST be after i18n is working

### Parallel Development

These can be built simultaneously by different developers:
- **Developer A:** i18n infrastructure (config, translation files, LanguageSelector)
- **Developer B:** PreferencesContext + preferencesService + Settings UI

They converge at PreferencesSettings.tsx, which uses both t() and usePreferences().

## Sources

- **next-themes:** Verified from existing codebase (`frontend/src/components/ui/theme-provider.tsx`). Using version 0.4.6 per package.json. Standard pattern for React theme management with Tailwind CSS.
- **ProjectContext pattern:** Verified from existing codebase (`frontend/src/contexts/ProjectContext.tsx`). Established pattern for Context API + localStorage sync using useEffect.
- **Shadcn/UI theme integration:** Verified from existing components (`button.tsx`, `card.tsx`). Uses semantic tokens (bg-card, text-foreground) that automatically adapt to dark mode via Tailwind's dark: variants.
- **React Context API patterns:** Standard React 19 patterns for context providers and custom hooks. Source: React official documentation, verified in existing codebase usage.
- **i18next architecture:** Standard i18next + react-i18next patterns for React applications. Namespace-based organization is recommended pattern from i18next documentation for apps with 5+ feature domains.
- **localStorage patterns:** Standard Web Storage API usage. 5-10MB limit is browser standard. Pattern of reading in useState initializer and writing in useEffect is established React pattern, verified in existing ProjectContext.

---
*Architecture research for: User Preferences, Dark Mode, i18n*
*Researched: 2026-01-27*
