# CSS Fixes TODO

These bugs were identified during the test overhaul session but intentionally deferred to a separate session to keep scope focused on tests only.

---

## Bug 1: Undefined `--density-*` CSS Variables

**File:** `frontend/src/index.css`, lines 303-336

**Problem:** The CSS references `var(--density-padding-lg)`, `var(--density-padding)`, `var(--density-gap)`, `var(--density-gap-lg)`, `var(--density-gap-xl)`, `var(--density-gap-sm)` — but these custom properties are never defined anywhere. The `data-density` attribute is set on the root element by `PreferencesContext`, but no CSS rules map `data-density` values to concrete `--density-*` variable definitions.

**Impact:** All density-based spacing (`main` padding, card padding, `.space-y-*` and `.gap-*` overrides) silently falls back to nothing, breaking layout spacing.

**Fix:** Add CSS variable definitions for each density level before the rules that consume them:

```css
/* Density variable definitions */
:root, :root[data-density="comfortable"] {
  --density-padding-sm: 0.5rem;
  --density-padding: 1rem;
  --density-padding-lg: 1.5rem;
  --density-gap-sm: 0.5rem;
  --density-gap: 1rem;
  --density-gap-lg: 1.5rem;
  --density-gap-xl: 2rem;
}

:root[data-density="compact"] {
  --density-padding-sm: 0.25rem;
  --density-padding: 0.5rem;
  --density-padding-lg: 0.75rem;
  --density-gap-sm: 0.25rem;
  --density-gap: 0.5rem;
  --density-gap-lg: 0.75rem;
  --density-gap-xl: 1rem;
}

:root[data-density="spacious"] {
  --density-padding-sm: 0.75rem;
  --density-padding: 1.5rem;
  --density-padding-lg: 2rem;
  --density-gap-sm: 0.75rem;
  --density-gap: 1.5rem;
  --density-gap-lg: 2rem;
  --density-gap-xl: 3rem;
}
```

---

## Bug 2: Duplicate Conflicting Reduced Motion Rules

**File:** `frontend/src/index.css`, lines 250-301

**Problem:** There are two separate blocks of reduced motion CSS:

1. **Lines 250-265** — Uses `:root:not([data-reduced-motion="false"])` selector (scoped) and sets `transition-duration: 0.01ms` or `animation: none / transition: none`.
2. **Lines 272-301** — A second "ANIMATION OVERRIDE SYSTEM" block uses bare `*` selectors and `revert !important` patterns.

These conflict: the first block's `:root:not(...)` scoping clashes with the second block's unscoped selectors. The `revert !important` on `[data-reduced-motion="false"]` tries to undo all `!important` overrides but `revert` behavior with `!important` is unreliable across browsers.

**Fix:** Delete lines 267-301 (the second "ANIMATION OVERRIDE SYSTEM" block entirely). The first block (lines 250-265) correctly handles both system preference and user override. Specifically:
- Lines 250-257: System preference respects `data-reduced-motion="false"` override via `:not()`.
- Lines 259-265: User override `data-reduced-motion="true"` forces no animation regardless of system setting.

---

## Bug 3: Global Tailwind Override Approach is Broken

**File:** `frontend/src/index.css`, lines 314-336

**Problem:** The CSS overrides Tailwind utility classes (`.space-y-4`, `.space-y-6`, `.space-y-8`, `.gap-2`, `.gap-4`, `.gap-6`) with `var(--density-*)` values. This is fragile because:
1. Tailwind v4 may generate different class names or use `@layer` ordering that defeats these overrides.
2. The overrides apply globally, affecting components that should not respond to density.
3. The `!important` on `main { padding: ... }` fights with Tailwind's own specificity.

**Fix:** Instead of overriding Tailwind utility classes globally, use `data-density` attribute selectors on specific component containers where density should apply. For example:

```css
[data-density="spacious"] .density-aware {
  --spacing-base: 1.5rem;
}
```

Then add `density-aware` class to components that should respond to density settings. This is a bigger refactor and should be planned carefully.

---

## Verification Steps (Playwright MCP)

After applying fixes, verify with Playwright:

1. Navigate to settings/preferences page
2. Toggle density between compact/comfortable/spacious
3. Verify spacing changes visually on dashboard cards and grid
4. Toggle reduced motion on/off
5. Verify animations stop/start correctly
6. Check that `document.documentElement.getAttribute('data-density')` matches selection
7. Check that `document.documentElement.getAttribute('data-reduced-motion')` matches selection
8. Refresh page and verify preferences persist from localStorage
