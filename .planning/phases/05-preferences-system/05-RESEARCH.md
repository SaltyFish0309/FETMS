# Phase 5: Preferences System - Research

**Researched:** 2026-01-29
**Domain:** User preferences management with React Context, localStorage persistence, and CSS custom properties
**Confidence:** HIGH

## Summary

Phase 5 implements a comprehensive user preferences system for font size, display density, and reduced motion controls. The research confirms that the standard approach combines React Context API for state management, localStorage for persistence, and CSS custom properties for styling implementation. The existing codebase already uses this pattern (ProjectContext, ThemeProvider with next-themes), providing proven reference implementations.

The technical domain is well-established with clear best practices: next-themes demonstrates the Provider + localStorage + cross-tab sync pattern, while the existing ProjectContext shows localStorage integration in this codebase. For new preferences (font size, density, reduced motion), CSS custom properties on `:root` enable reactive styling without component-level changes.

**Primary recommendation:** Follow the next-themes pattern with PreferencesContext + preferencesService abstraction layer, use CSS custom properties for font/spacing scaling, and leverage the storage event for cross-tab synchronization. This approach matches existing codebase patterns while providing the extensibility needed for future preference additions.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Context API | Built-in (React 19) | State management and distribution | Native React solution, already used in ProjectContext |
| localStorage API | Built-in (Browser) | Client-side persistence | Standard for browser-local data, synchronous access |
| CSS Custom Properties | Built-in (CSS) | Dynamic styling variables | Browser-native, reactive, no runtime overhead |
| next-themes | 0.4.6 (current) | Reference pattern only | Already in stack, demonstrates best practices |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Broadcast Channel API | Built-in (Browser) | Alternative cross-tab sync | If storage event proves insufficient (research shows storage event is preferred for localStorage sync) |
| matchMedia API | Built-in (Browser) | Detect prefers-reduced-motion | Required for accessibility, browser-native |
| Tailwind CSS | 4.1.17 (current) | Utility classes for density variants | Optional supplement to CSS custom properties |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage | sessionStorage | Data persists only for session, lost on browser close |
| localStorage | IndexedDB | Overcomplicated for simple key-value preferences |
| CSS custom properties | Tailwind theme extension | Less flexible, requires rebuild for changes |
| storage event | Broadcast Channel API | Broadcast Channel faster but storage event simpler and well-tested |
| Context API | Zustand/Redux | Over-engineered for preferences, unnecessary dependency |

**Installation:**
```bash
# No new dependencies required - all APIs are built-in
# Existing stack already has necessary foundations
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── contexts/
│   ├── ProjectContext.tsx         # Existing reference
│   └── PreferencesContext.tsx     # NEW - preferences state
├── services/
│   ├── projectService.ts          # Existing reference
│   └── preferencesService.ts      # NEW - localStorage abstraction
├── hooks/
│   └── usePrefersReducedMotion.ts # NEW - media query hook
├── lib/
│   └── utils.ts                   # Existing - no changes needed
├── components/ui/
│   ├── theme-provider.tsx         # Existing reference (next-themes)
│   └── language-toggle.tsx        # Existing reference (i18next)
└── pages/
    └── PreferencesSettings.tsx    # Existing - extend with new controls
```

### Pattern 1: Context + Service Layer Architecture
**What:** Separate state management (Context) from persistence logic (Service)
**When to use:** Always - matches existing ProjectContext pattern
**Example:**
```typescript
// preferencesService.ts - Storage abstraction
export const preferencesService = {
  load: () => {
    try {
      const stored = localStorage.getItem('userPreferences');
      return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  },
  save: (preferences: UserPreferences) => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }
};

// PreferencesContext.tsx - State management
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    preferencesService.load()
  );

  useEffect(() => {
    preferencesService.save(preferences);
  }, [preferences]);

  // ... rest of context
}
```

### Pattern 2: CSS Custom Properties for Font Scaling
**What:** Use `:root` CSS variables to scale typography reactively
**When to use:** Font size preferences - enables global scaling without component changes
**Example:**
```css
/* index.css */
:root {
  --font-size-scale: 1;     /* Medium (default) */
}

:root[data-font-size="small"] {
  --font-size-scale: 0.875; /* 14/16 = 87.5% */
}

:root[data-font-size="large"] {
  --font-size-scale: 1.125; /* 18/16 = 112.5% */
}

body {
  font-size: calc(1rem * var(--font-size-scale));
}
```

### Pattern 3: Storage Event for Cross-Tab Sync
**What:** Listen to storage events to detect preference changes from other tabs
**When to use:** Always - standard pattern for localStorage synchronization
**Example:**
```typescript
// Inside PreferencesContext
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'userPreferences' && e.newValue) {
      const updated = JSON.parse(e.newValue);
      setPreferences(updated);
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### Pattern 4: matchMedia Hook for Reduced Motion
**What:** Detect and respond to OS-level prefers-reduced-motion setting
**When to use:** Always - WCAG requirement for accessibility
**Example:**
```typescript
// Source: Josh W. Comeau's usePrefersReducedMotion hook
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}
```

### Pattern 5: Spacing Density with CSS Custom Properties
**What:** Scale spacing/padding globally with CSS variables
**When to use:** Display density preferences - allows uniform scaling
**Example:**
```css
:root {
  --density-scale: 1;       /* Comfortable (default) */
}

:root[data-density="compact"] {
  --density-scale: 0.75;
}

:root[data-density="spacious"] {
  --density-scale: 1.25;
}

/* Apply to spacing utilities */
.p-4 {
  padding: calc(1rem * var(--density-scale));
}
```

### Anti-Patterns to Avoid
- **Don't access localStorage directly in components:** Always use service layer for error handling and abstraction
- **Don't use inline styles for preferences:** CSS custom properties enable reactive changes without re-renders
- **Don't ignore SSR concerns:** Check for `window` existence before accessing localStorage (though this is Vite-only, good practice)
- **Don't skip error handling:** localStorage can throw QuotaExceededError or be disabled
- **Don't use separate localStorage keys:** Single `userPreferences` object is easier to manage and sync
- **Don't forget cleanup:** Always remove event listeners in useEffect cleanup functions

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme persistence | Custom theme manager | next-themes (existing) | Already handles localStorage, cross-tab sync, SSR, and system preference detection |
| Language persistence | Custom i18n state | i18next-browser-languagedetector (existing) | Built-in localStorage integration and detection |
| localStorage hooks | Custom useLocalStorage | Follow ProjectContext pattern | Codebase already has proven implementation with error handling |
| Reduced motion detection | Poll for preference changes | matchMedia API with listener | Browser-native, efficient, real-time updates |
| Cross-tab sync | Custom event emitter | storage event (built-in) | Browser-native, automatic, no overhead |
| Form controls | Custom sliders/switches | Radix UI (existing via Shadcn) | Accessible, keyboard-navigable, tested |

**Key insight:** Browser-native APIs (localStorage, matchMedia, storage event, CSS custom properties) are mature, performant, and well-tested. Custom implementations introduce bugs and maintenance burden for zero benefit.

## Common Pitfalls

### Pitfall 1: localStorage Access Without Error Handling
**What goes wrong:** App crashes when localStorage is disabled, quota exceeded, or in private browsing mode
**Why it happens:** Developers assume localStorage is always available and writable
**How to avoid:**
- Wrap all localStorage calls in try-catch blocks
- Provide default values on read failure
- Log errors but don't throw to user
- Test with disabled localStorage (Firefox private browsing)
**Warning signs:** `DOMException: QuotaExceededError` in production logs

### Pitfall 2: Race Conditions in Multi-Tab Sync
**What goes wrong:** Rapid changes in multiple tabs cause inconsistent state
**Why it happens:** storage event fires asynchronously, state updates aren't atomic
**How to avoid:**
- Accept eventual consistency (perfect sync is impossible)
- Use last-write-wins strategy
- Don't build complex conflict resolution
- Trust that users rarely change preferences simultaneously in multiple tabs
**Warning signs:** Users report preferences "flipping back" randomly

### Pitfall 3: CSS Transition Performance with Reduced Motion
**What goes wrong:** Setting transition-duration to 0 causes layout thrashing
**Why it happens:** Browser still calculates transitions, just instantly
**How to avoid:** Use `transition: none` instead of `transition-duration: 0.01ms`
**Warning signs:** Performance issues when reduced motion is enabled

### Pitfall 4: Font Size Breaking Layouts
**What goes wrong:** Components overflow, break, or misalign at Large font size
**Why it happens:** Fixed pixel dimensions don't scale with font size
**How to avoid:**
- Use relative units (rem, em) for sizing
- Test all pages at all three font sizes
- Avoid fixed heights on text containers
- Use `overflow: hidden` or `text-overflow: ellipsis` where appropriate
**Warning signs:** Horizontal scrollbars, overlapping text, broken cards at Large size

### Pitfall 5: Storage Event Doesn't Fire in Same Tab
**What goes wrong:** Preferences don't sync within the tab that changed them
**Why it happens:** storage event only fires in OTHER tabs, not the originating tab
**How to avoid:**
- Update local state immediately when user changes preference
- storage event only handles external changes
- Don't rely on storage event for same-tab updates
**Warning signs:** Preferences update in other tabs but not the current one

### Pitfall 6: Forgetting to Apply CSS Custom Properties
**What goes wrong:** Changed preferences have no visual effect
**Why it happens:** CSS custom properties defined but not applied to `html` or `:root`
**How to avoid:**
- Set `data-font-size` and `data-density` attributes on `document.documentElement`
- Verify in DevTools that attributes are present
- Use effect to update DOM on preference change
**Warning signs:** UI doesn't change despite state updating correctly

## Code Examples

### Example 1: PreferencesContext Structure
```typescript
// contexts/PreferencesContext.tsx
// Based on existing ProjectContext pattern
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { preferencesService } from '../services/preferencesService';
import type { UserPreferences } from '../services/preferencesService';

interface PreferencesContextValue {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    preferencesService.load()
  );

  // Persist to localStorage on change
  useEffect(() => {
    preferencesService.save(preferences);

    // Apply to DOM for CSS custom properties
    document.documentElement.setAttribute('data-font-size', preferences.fontSize);
    document.documentElement.setAttribute('data-density', preferences.density);

    // Handle reduced motion
    if (preferences.reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
    }
  }, [preferences]);

  // Cross-tab sync via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userPreferences' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setPreferences(updated);
        } catch (error) {
          console.error('Failed to parse preferences from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(preferencesService.getDefaults());
  }, []);

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
```

### Example 2: preferencesService Implementation
```typescript
// services/preferencesService.ts
// Follows existing projectService pattern
import { toast } from 'sonner';

export interface UserPreferences {
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
  reducedMotion: boolean;
}

const STORAGE_KEY = 'userPreferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  fontSize: 'medium',
  density: 'comfortable',
  reducedMotion: false,
};

export const preferencesService = {
  load: (): UserPreferences => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_PREFERENCES;

      const parsed = JSON.parse(stored);

      // Validate structure
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid preferences format');
      }

      // Merge with defaults (handles missing keys from old versions)
      return { ...DEFAULT_PREFERENCES, ...parsed };
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.warning('Preferences corrupted, reset to defaults');
      return DEFAULT_PREFERENCES;
    }
  },

  save: (preferences: UserPreferences): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    }
  },

  getDefaults: (): UserPreferences => DEFAULT_PREFERENCES,
};
```

### Example 3: CSS Implementation for Font Size
```css
/* index.css additions */
:root {
  --font-size-scale: 1;
  --density-scale: 1;
}

/* Font Size Variants */
:root[data-font-size="small"] {
  --font-size-scale: 0.875; /* 14px base */
}

:root[data-font-size="large"] {
  --font-size-scale: 1.125; /* 18px base */
}

/* Display Density Variants */
:root[data-density="compact"] {
  --density-scale: 0.75;
}

:root[data-density="spacious"] {
  --density-scale: 1.25;
}

/* Reduced Motion Override */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* User preference override (takes precedence) */
:root[data-reduced-motion="true"] *,
:root[data-reduced-motion="true"] *::before,
:root[data-reduced-motion="true"] *::after {
  animation: none !important;
  transition: none !important;
}

/* Apply scaling to body */
body {
  font-size: calc(1rem * var(--font-size-scale));
}
```

### Example 4: Reduced Motion Toggle Component
```typescript
// components/PreferencesSettings.tsx section
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePreferences } from '@/contexts/PreferencesContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export default function PreferencesSettings() {
  const { preferences, updatePreferences } = usePreferences();
  const systemPrefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <Label htmlFor="reduced-motion">
          Reduced Motion
        </Label>
        <span className="text-sm text-muted-foreground">
          Minimize animations and transitions
          {systemPrefersReducedMotion && ' (System preference detected)'}
        </span>
      </div>
      <Switch
        id="reduced-motion"
        checked={preferences.reducedMotion}
        onCheckedChange={(checked) => updatePreferences({ reducedMotion: checked })}
      />
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for preferences | Context API + localStorage | 2023+ | Simpler, less boilerplate, no Redux dependency |
| Inline styles for dynamic values | CSS custom properties | 2020+ | Better performance, reactive without re-renders |
| setInterval polling for sync | storage event + Broadcast Channel | 2018+ | Event-driven, no wasted cycles |
| Hard-coded media queries | matchMedia API with listeners | 2021+ | Reactive to system changes |
| Separate localStorage keys | Single preferences object | 2024+ | Easier versioning and validation |

**Deprecated/outdated:**
- **Broadcast Channel over storage event**: Broadcast Channel API is modern but storage event is simpler for localStorage sync (storage event is specifically designed for this use case)
- **Manual DOM manipulation**: Using `document.querySelector` instead of data attributes on `documentElement`
- **Component-level styling**: Passing preferences as props instead of CSS custom properties

## Open Questions

1. **Should we version the preferences schema?**
   - What we know: preferencesService.load() merges with defaults, handles missing keys
   - What's unclear: Whether explicit version number is needed for future migrations
   - Recommendation: Start without versioning, merge-with-defaults handles additive changes. Add version number only if we need breaking schema changes.

2. **Should reduced motion affect loading spinners and skeleton screens?**
   - What we know: WCAG requires respecting prefers-reduced-motion for decorative animations
   - What's unclear: Whether loading indicators count as "decorative" or "essential feedback"
   - Recommendation: Keep loading spinners (essential feedback), disable decorative animations only. Monitor user feedback.

3. **Should we add font size preview in Settings?**
   - What we know: User chose "description text only" in CONTEXT.md decisions
   - What's unclear: N/A - decision is clear
   - Recommendation: Follow user decision, no previews

## Sources

### Primary (HIGH confidence)
- **React Context API**: Built-in React documentation, version 19 (current in project)
- **localStorage API**: MDN Web Docs - [Using localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- **CSS Custom Properties**: MDN Web Docs - [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- **matchMedia API**: MDN Web Docs - [Window.matchMedia()](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
- **storage event**: MDN Web Docs - [StorageEvent](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent)
- **prefers-reduced-motion**: W3C WCAG Technique C39 - [Using the CSS prefers-reduced-motion query](https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html)
- **next-themes GitHub**: [pacocoursey/next-themes](https://github.com/pacocoursey/next-themes) - Reference implementation for theme persistence patterns
- **Codebase references**:
  - `frontend/src/contexts/ProjectContext.tsx` - Existing Context + localStorage pattern
  - `frontend/src/components/ui/theme-provider.tsx` - next-themes integration
  - `frontend/src/index.css` lines 160-167 - Existing prefers-reduced-motion implementation

### Secondary (MEDIUM confidence)
- [How to Use React for State Persistence | UXPin](https://www.uxpin.com/studio/blog/how-to-use-react-for-state-persistence/) - Best practices for Context + localStorage
- [Accessible Font Sizing, Explained | CSS-Tricks](https://css-tricks.com/accessible-font-sizing-explained/) - rem/em units for WCAG compliance
- [Syncing React State Across Tabs: Using Broadcast Channel API - DEV](https://dev.to/franciscomendes10866/syncing-react-state-across-tabs-using-broadcast-channel-api-420k) - Cross-tab sync patterns
- [Accessible Animations in React with "prefers-reduced-motion" • Josh W. Comeau](https://www.joshwcomeau.com/react/prefers-reduced-motion/) - usePrefersReducedMotion hook pattern
- [Tailwind CSS Best Practices 2025-2026 | FrontendTools](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) - Design system spacing patterns
- [Persisting React State in localStorage • Josh W. Comeau](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/) - localStorage pitfalls and solutions

### Tertiary (LOW confidence)
- None - all key claims verified with official documentation or codebase references

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All technologies are built-in browser/React APIs or already in project
- Architecture: HIGH - Follows existing codebase patterns (ProjectContext, next-themes)
- Pitfalls: MEDIUM-HIGH - Based on documented best practices and community experience
- Code examples: HIGH - Adapted from official docs and existing codebase patterns

**Research date:** 2026-01-29
**Valid until:** 60 days (stable domain - browser APIs and React Context unlikely to change significantly)
