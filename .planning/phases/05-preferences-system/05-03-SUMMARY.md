---
phase: 05-preferences-system
plan: 03
subsystem: preferences
tags: [ui, preferences, css, density, accessibility, i18n]
requires: [05-01-preferencesService, 05-02-fontSizeControl]
provides:
  - Display density preference control (compact/comfortable/spacious)
  - CSS custom properties for density scaling
  - Density DOM attribute synchronization
  - Density control UI in Settings
affects: [all future UI components using spacing]
tech-stack:
  added: []
  patterns:
    - CSS custom properties for spacing scale
    - data-density attribute for CSS selectors
    - Targeted density scaling approach
decisions:
  - decision_id: density-targeted-scaling
    summary: "Apply density scaling to key elements only (main, cards, common gaps)"
    rationale: "Provides noticeable density changes without breaking complex layouts that rely on precise spacing"
  - decision_id: density-scale-values
    summary: "Compact (0.75x), Comfortable (1.0x), Spacious (1.25x)"
    rationale: "25% variance provides meaningful visual difference while maintaining layout integrity"
  - decision_id: density-separate-effect
    summary: "Separate useEffect for data-density attribute"
    rationale: "Follows same pattern as data-font-size for consistency and clarity"
key-files:
  created: []
  modified:
    - frontend/src/index.css
    - frontend/src/contexts/PreferencesContext.tsx
    - frontend/src/pages/PreferencesSettings.tsx
    - frontend/public/locales/en/settings.json
    - frontend/public/locales/zh-TW/settings.json
completed: 2026-01-30
duration: 2.5m
---

# Phase [05] Plan [03]: Display Density Control Summary

**One-liner:** Display density preference control with CSS custom properties scaling spacing across main, cards, and common gap utilities

## Overview

Implemented display density preference allowing users to choose between Compact (0.75x spacing), Comfortable (1.0x default), and Spacious (1.25x spacing) layouts. Uses CSS custom properties and data-density attribute for immediate application-wide scaling of key spacing elements.

## What Was Built

### 1. CSS Custom Properties for Density Scaling (Task 1)
- **File:** `frontend/src/index.css`
- **Added:**
  - `--density-scale` variable with three variants (compact/comfortable/spacious)
  - Six density-specific spacing variables (padding-sm/padding/padding-lg, gap-sm/gap/gap-lg)
  - CSS rules targeting main, cards, and common spacing utilities
- **Scale factors:**
  - Compact: 0.75 (tighter spacing, more content visible)
  - Comfortable: 1.0 (default Tailwind spacing)
  - Spacious: 1.25 (more breathing room, easier scanning)
- **Commit:** `6171306`

### 2. Data-Density DOM Attribute (Task 2)
- **File:** `frontend/src/contexts/PreferencesContext.tsx`
- **Added:** useEffect hook that sets `data-density` attribute on `document.documentElement`
- **Behavior:** Updates immediately when `preferences.density` changes
- **Pattern:** Follows same approach as `data-font-size` for consistency
- **Commit:** `3085a00`

### 3. Density Control UI (Task 3)
- **Files:**
  - `frontend/src/pages/PreferencesSettings.tsx` - Added Select control
  - `frontend/public/locales/en/settings.json` - English translations
  - `frontend/public/locales/zh-TW/settings.json` - Traditional Chinese translations
- **UI Location:** Settings > User Preferences > Appearance section (below Font Size)
- **Options:** Compact / Comfortable / Spacious
- **Translations:**
  - English: "Display Density", "Adjust spacing and padding across the interface"
  - Chinese: "顯示密度", "調整介面的間距和留白"
- **Commit:** `5103ac8`

## Decisions Made

### Targeted Scaling Approach
Applied density scaling selectively to high-impact elements rather than globally:
- Main content area padding
- Card padding (CardContent, CardHeader)
- Common gap utilities (space-y-4, space-y-6, gap-4, gap-6)

**Rationale:** Provides noticeable density changes while avoiding layout breaks in components with precise spacing requirements.

### Scale Factor Selection
Chose 25% variance (0.75x / 1.0x / 1.25x) for density options.

**Rationale:** Large enough to be visually meaningful, small enough to maintain layout integrity across diverse UI components.

### Separate useEffect for Density
Created independent useEffect for data-density attribute instead of consolidating with data-font-size.

**Rationale:** Follows established pattern from Plan 05-02, maintains clear separation of concerns, easier to track dependencies.

## Technical Implementation

### CSS Architecture
```css
/* Custom properties */
--density-scale: 1;
--density-padding: calc(1rem * var(--density-scale));

/* Attribute selectors */
:root[data-density="compact"] { --density-scale: 0.75; }
:root[data-density="comfortable"] { --density-scale: 1; }
:root[data-density="spacious"] { --density-scale: 1.25; }

/* Targeted application */
main { padding: var(--density-padding-lg) !important; }
.card { padding: var(--density-padding); }
```

### React Context Integration
```typescript
useEffect(() => {
  document.documentElement.setAttribute('data-density', preferences.density);
}, [preferences.density]);
```

### UI Component Pattern
```tsx
<Select
  value={preferences.density}
  onValueChange={(value: 'compact' | 'comfortable' | 'spacious') =>
    updatePreferences({ density: value })
  }
>
```

## Verification Completed

1. ✅ TypeScript build succeeds (`npm run build --prefix frontend`)
2. ✅ CSS custom properties defined with all three density variants
3. ✅ PreferencesContext sets data-density attribute on mount and update
4. ✅ PreferencesSettings displays density selector in Appearance section
5. ✅ English and Traditional Chinese translations added
6. ✅ Three atomic commits with proper prefixes

## Files Changed

**Modified (5 files):**
1. `frontend/src/index.css` - CSS custom properties and density scaling rules
2. `frontend/src/contexts/PreferencesContext.tsx` - data-density attribute effect
3. `frontend/src/pages/PreferencesSettings.tsx` - Density Select control UI
4. `frontend/public/locales/en/settings.json` - English translations
5. `frontend/public/locales/zh-TW/settings.json` - Traditional Chinese translations

## Deviations from Plan

None - plan executed exactly as written.

## Metrics

- **Tasks completed:** 3/3
- **Commits:** 3 (one per task)
- **Files modified:** 5
- **Duration:** ~2.5 minutes
- **Build status:** ✅ Success

## Integration Points

### Dependencies
- **05-01 (PreferencesService):** Provides `density` field in UserPreferences type and defaults
- **05-02 (Font Size Control):** Established pattern for data-attribute effects and Select controls

### Future Impact
All future UI components that use Tailwind spacing utilities (space-y-*, gap-*) or layout padding will automatically inherit density scaling. Component developers should prefer using the custom properties for density-sensitive spacing.

## Next Phase Readiness

**Blockers:** None

**Recommendations:**
- Consider extending density scaling to additional spacing patterns as they're identified
- Monitor user feedback on density scale factors (may need adjustment)
- Document density custom properties in component development guidelines

## Testing Notes

Manual verification recommended:
1. Navigate to `/settings/preferences`
2. Toggle between Compact/Comfortable/Spacious
3. Observe spacing changes in main content, cards, and gap utilities
4. Verify persistence after page refresh
5. Test with both English and Traditional Chinese languages

Integration with existing preferences:
- Works alongside fontSize preference without conflicts
- Combined with reducedMotion preference (no interactions)
- Persists in localStorage alongside other preferences

---

**Completed:** 2026-01-30
**Duration:** 2.5 minutes
**Status:** ✅ All tasks complete, builds successfully
