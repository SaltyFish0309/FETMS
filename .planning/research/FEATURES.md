# Feature Research - User Preferences/Settings

**Domain:** User Preferences and Settings Pages
**Researched:** 2026-01-27
**Confidence:** MEDIUM (Based on training knowledge; WebSearch unavailable for verification)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Dark Mode Toggle (Light/Dark/System) | Universal expectation in 2025+ web apps; accessibility and eye strain reduction | LOW | Three options standard: Light, Dark, System (respects OS preference) |
| Theme Persistence | Users expect theme choice to survive page reload | LOW | localStorage is standard; no backend needed |
| Consistent Dark Theme Styling | Dark mode must work across ALL components | MEDIUM | Requires comprehensive CSS variable system; header, forms, tables, modals all adapt |
| Smooth Theme Transitions | Instant switching without visual glitches or flash of unstyled content (FOUC) | LOW | CSS transitions on theme class change; prevent FOUC on load |
| Language/Locale Switching | Bilingual apps require clear language toggle | MEDIUM | Dropdown or toggle in header/settings; flag icons common |
| Language Persistence | Selected language survives reload | LOW | localStorage standard for client-side apps |
| Browser Language Detection | App defaults to user's browser language on first visit | LOW | navigator.language detection; fallback to default |
| Instant Language Switch | No page reload required when changing language | MEDIUM | Client-side i18n libraries handle this; React context pattern |
| UI Label Translation | All static text (buttons, labels, menus, navigation) translates | HIGH | Requires comprehensive translation file; ongoing maintenance burden |
| Preserve User Data Language | User-generated content (names, notes) stays in original language | LOW | Translation applies only to UI, not data fields |

### Dark Mode Implementation Details (Industry Standards)

| Aspect | Expected Behavior | Complexity | Notes |
|--------|-------------------|------------|-------|
| Color Contrast Ratios | WCAG AA minimum (4.5:1 for text, 3:1 for UI components) | MEDIUM | Use contrast checking tools; test with actual dark backgrounds |
| Semantic Color Variables | Use CSS custom properties for theme-aware colors (--background, --foreground, --primary, etc.) | LOW | Shadcn/UI already provides this pattern |
| Component Coverage | Header, sidebar, modals, dropdowns, forms, tables, cards ALL adapt | MEDIUM | Requires audit of every component; common miss: headers stay light |
| Input Field Styling | Forms must have sufficient contrast in dark mode (borders, placeholders, focus states) | MEDIUM | Light text on dark input backgrounds; clear focus indicators |
| Chart/Graph Adaptation | Data visualizations must use dark-compatible colors | MEDIUM | Recharts needs theme-aware color schemes |
| Image/Icon Handling | Icons and logos may need dark variants | LOW | Lucide icons adapt via currentColor; custom images may need swapping |
| Prevent FOUC | Theme loads before first render to prevent light flash on dark mode | LOW | Script in HTML head or ThemeProvider early in tree |

### Internationalization (i18n) Details

| Aspect | Expected Behavior | Complexity | Notes |
|--------|-------------------|------------|-------|
| Static Content Translation | All UI text (buttons, labels, headings, help text, validation messages) | HIGH | Requires translation files (e.g., en.json, zh-TW.json) |
| Dynamic Content Handling | User-generated data NOT translated (teacher names, school names, custom notes) | LOW | i18n applies to keys only, not dynamic values |
| Date/Time Formatting | Dates format per locale (MM/DD/YYYY vs DD/MM/YYYY vs YYYY-MM-DD) | MEDIUM | Use date-fns with locale support |
| Number Formatting | Numbers, currency per locale (1,234.56 vs 1 234,56) | LOW | Intl.NumberFormat standard API |
| Pluralization Rules | Handle singular/plural forms per language rules | MEDIUM | Some languages have complex plural rules (e.g., Slavic languages have 3+ forms) |
| Text Direction | LTR for English/Chinese; future RTL support (Arabic, Hebrew) out of scope for v1 | HIGH | Defer RTL to future; Chinese and English both LTR |
| Dropdown Option Translation | Both label AND options translate (e.g., Status: "Active"/"Inactive" becomes "啟用"/"停用") | MEDIUM | Requires translation keys for all enum values |
| Fallback Language | If translation missing, fall back to default language (typically English) | LOW | i18n libraries handle this automatically |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Font Size Control | Accessibility for users with vision impairments; allows comfortable reading at different screen distances | LOW | Scale multiplier (Small/Medium/Large); apply via CSS root font size |
| Display Density Control | Power users want compact views; beginners want spacious layouts | MEDIUM | Adjust padding/spacing via CSS variables (Compact/Comfortable/Spacious) |
| Reduced Motion Preference | Accessibility for users sensitive to animations | LOW | Respect prefers-reduced-motion media query; disable transitions/animations |
| High Contrast Mode | Enhanced accessibility for low vision users | MEDIUM | Higher contrast color scheme variant; WCAG AAA (7:1 ratio) |
| Color Blind Friendly Themes | Alternative color palettes for different types of color blindness | HIGH | Requires specialized color schemes (deuteranopia, protanopia, tritanopia variants) |
| Keyboard Navigation Indicators | Enhanced focus indicators for keyboard-only users | LOW | Thicker focus outlines, skip-to-content links |
| Custom Accent Color | Let users choose primary brand color | MEDIUM | Limited palette to maintain contrast; update CSS variables |
| Export Preferences | Save preferences to file for backup/transfer | LOW | JSON export from localStorage |
| Default Project Selection | Auto-select user's preferred project on login | LOW | Store projectId in preferences; auto-apply on dashboard load |
| Sidebar Collapse Preference | Remember sidebar expanded/collapsed state | LOW | Boolean in localStorage |
| Table Column Preferences | Remember which columns are visible/hidden in data tables | MEDIUM | Store column visibility state per table |
| Notification Preferences | Control which alerts/notifications user wants to see | MEDIUM | Backend integration needed for email; client-side for toast notifications |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Per-Component Theme Override | "Let users choose dark sidebar with light content area" | Creates visual chaos; violates consistency; hard to maintain contrast | Offer 2-3 pre-designed theme variants (all consistent) instead of per-component control |
| Real-Time Translation of User Data | "Translate teacher names/school names automatically" | Destroys data integrity; names are proper nouns not meant for translation; introduces errors | Clearly separate UI translation from data; explain that user data preserves original language |
| Unlimited Custom Themes | "Let users create their own color schemes" | Accessibility nightmare; users will create unreadable combinations; support burden | Offer 3-5 curated, accessible themes instead |
| Auto-Detect Language from Content | "Detect if user types Chinese and auto-switch UI" | Confusing UX; user may type Chinese but prefer English UI; creates unpredictable behavior | Explicit language toggle only; respect user choice |
| Sync Preferences Across Devices (v1) | "Share my settings between computer and phone" | Requires backend sync infrastructure; authentication; increases complexity significantly | Defer to v2; use localStorage for v1; document as future enhancement |
| Per-Page Theme | "Let me use dark mode on dashboard but light mode on settings" | Jarring experience; increases cognitive load; no user research supports this | Global theme only; consistent across entire app |
| Animated Theme Transitions | "Smooth color fade when switching themes" | Can cause flicker; performance issues; accessibility concerns (motion sensitivity) | Instant switch is faster and more reliable; optional subtle transition on theme change only |

## Feature Dependencies

```
Dark Mode System
    ├──requires──> CSS Variable System (already exists in Shadcn/UI)
    ├──requires──> ThemeProvider (already exists via next-themes)
    └──requires──> Component Audit (fix all components to respect theme)

Language Switching
    ├──requires──> i18n Library (react-i18next or similar)
    ├──requires──> Translation Files (en.json, zh-TW.json)
    ├──requires──> Language Context/Provider
    └──enhances──> Date/Time Formatting (date-fns already installed)

Font Size Control
    └──requires──> CSS Variable System (root font-size scaling)

Display Density Control
    └──requires──> CSS Variable System (spacing scale adjustment)

Reduced Motion
    └──requires──> prefers-reduced-motion CSS media query
    └──enhances──> Dark Mode (both accessibility features)

Default Project Selection
    ├──requires──> Project Context (already exists)
    └──enhances──> Dashboard (auto-filter on load)
```

### Dependency Notes

- **Dark Mode requires Component Audit:** Every component must be checked for dark theme compatibility. Current issue: header stays white in dark mode.
- **Language Switching requires i18n Library:** Need to add react-i18next or similar. Next-themes exists for dark mode but not language.
- **Font Size enhances ALL features:** Larger fonts improve readability across dark mode, language switching, and all content.
- **Reduced Motion impacts Dark Mode:** Theme transitions should respect reduced motion preference.

## MVP Definition

### Launch With (v1.0 - Current Milestone)

Minimum viable preferences — what's needed to fix current issues and meet user expectations.

- [x] Dark Mode Toggle (Light/Dark/System) — ALREADY EXISTS (via next-themes)
- [ ] **Fix Dark Theme Implementation** — CRITICAL: header, contrast, component coverage
- [ ] Theme Persistence — EXISTS but needs verification
- [ ] Language Toggle (Traditional Chinese / English) — NEW
- [ ] Language Persistence — NEW
- [ ] Browser Language Detection — NEW
- [ ] UI Label Translation (comprehensive) — NEW
- [ ] Date/Time Locale Formatting — NEW
- [ ] Font Size Control (Small/Medium/Large) — NEW

**Rationale:** Addresses current flawed dark mode AND adds requested bilingual support. Font size is table stakes for accessibility.

### Add After Validation (v1.1)

Features to add once core is working and user feedback collected.

- [ ] Display Density Control (Compact/Comfortable/Spacious) — Wait for user feedback on need
- [ ] Reduced Motion Preference — Good accessibility addition
- [ ] Default Project Selection — Quality of life improvement
- [ ] Sidebar Collapse Preference — If users request it
- [ ] Number Formatting per Locale — If currency/numbers become important

**Trigger for adding:** User requests OR accessibility audit identifies need

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] High Contrast Mode — Requires design work; defer until accessibility audit
- [ ] Color Blind Friendly Themes — Specialized need; wait for user requests
- [ ] Custom Accent Color — Nice-to-have; defer
- [ ] Export/Import Preferences — Low demand; defer
- [ ] Table Column Preferences — Useful but requires per-table configuration
- [ ] Notification Preferences — Requires backend notification system first
- [ ] Sync Preferences Across Devices — Requires authentication/backend sync

**Rationale:** These are genuinely useful but not critical for launch. Defer until core features proven and user demand confirmed.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Phase |
|---------|------------|---------------------|----------|-------|
| Fix Dark Theme (header, contrast, coverage) | HIGH | MEDIUM | P1 | v1.0 |
| Language Toggle UI | HIGH | LOW | P1 | v1.0 |
| UI Label Translation (comprehensive) | HIGH | HIGH | P1 | v1.0 |
| Language Persistence | HIGH | LOW | P1 | v1.0 |
| Browser Language Detection | MEDIUM | LOW | P1 | v1.0 |
| Font Size Control | MEDIUM | LOW | P1 | v1.0 |
| Date/Time Locale Formatting | MEDIUM | MEDIUM | P1 | v1.0 |
| Theme Persistence Verification | HIGH | LOW | P1 | v1.0 |
| Smooth Theme Transitions | MEDIUM | LOW | P1 | v1.0 |
| Display Density Control | LOW | MEDIUM | P2 | v1.1 |
| Reduced Motion Preference | MEDIUM | LOW | P2 | v1.1 |
| Default Project Selection | MEDIUM | LOW | P2 | v1.1 |
| Sidebar Collapse Preference | LOW | LOW | P2 | v1.1 |
| High Contrast Mode | MEDIUM | HIGH | P3 | v2+ |
| Color Blind Themes | LOW | HIGH | P3 | v2+ |
| Custom Accent Color | LOW | MEDIUM | P3 | v2+ |
| Table Column Preferences | MEDIUM | MEDIUM | P3 | v2+ |
| Sync Across Devices | HIGH | HIGH | P3 | v2+ |

**Priority key:**
- P1: Must have for v1.0 — Fixes current issues + core bilingual support
- P2: Should have for v1.1 — Quality of life improvements after validation
- P3: Nice to have for v2+ — Future enhancements based on user demand

## Industry Pattern Analysis

Based on observation of modern web applications (MEDIUM confidence - training data):

### Common Settings Page Organization Patterns

1. **Sidebar Navigation** (e.g., GitHub, Linear, Notion)
   - Settings as separate page with sidebar categories
   - Categories: Appearance, Language, Notifications, Account, etc.
   - Advantage: Scales to many settings; clear organization
   - Best for: Apps with 10+ settings

2. **Tabbed Interface** (e.g., Slack, Discord)
   - Horizontal or vertical tabs for categories
   - Advantage: Compact; all settings visible at once in small apps
   - Best for: Apps with 3-7 settings categories

3. **Single Page with Sections** (e.g., Simple apps)
   - All settings on one scrollable page with headings
   - Advantage: Simple; no navigation needed
   - Best for: Apps with <15 total settings

4. **Modal/Drawer** (e.g., Mobile-first apps)
   - Settings open in overlay rather than dedicated page
   - Advantage: Quick access; doesn't disrupt flow
   - Best for: Simple apps with few settings

**Recommendation for FETMS:** Single page with sections initially (Phase 1-2), migrate to sidebar navigation if settings grow beyond 15 items (Phase 3+).

### Dark Mode Implementation Patterns

Based on training knowledge of common implementations:

1. **CSS Variables Approach** (Most Modern)
   - Define semantic colors as CSS custom properties
   - Toggle `dark` class on root element
   - Colors automatically update via variable cascade
   - **Advantage:** Maintainable; single source of truth
   - **Used by:** Shadcn/UI (already in FETMS), Tailwind, modern component libraries

2. **Tailwind Dark Mode Utilities**
   - Use `dark:` variant prefixes
   - Tailwind generates dark mode classes
   - **Advantage:** Co-located with components
   - **Used by:** Tailwind-based apps (FETMS uses this)

3. **next-themes Library**
   - Handles theme detection, persistence, system preference
   - Prevents FOUC via script injection
   - **Advantage:** Battle-tested; handles edge cases
   - **Used by:** Next.js apps (FETMS already has this)

**FETMS Current Stack:** Has next-themes + Tailwind + Shadcn/UI = ideal stack for dark mode. Issue is incomplete implementation (components not respecting theme), not architecture.

### i18n Library Options

Common libraries for React internationalization:

1. **react-i18next** (Most Popular)
   - Full-featured; supports namespaces, lazy loading, pluralization
   - **Complexity:** MEDIUM
   - **Bundle size:** ~15KB gzipped
   - **Best for:** Apps with complex translation needs

2. **react-intl** (Format.js)
   - Strong date/time/number formatting
   - ICU message syntax
   - **Complexity:** MEDIUM-HIGH
   - **Best for:** Apps with heavy formatting needs

3. **Lightweight alternatives** (i18next-lite, custom context)
   - Simple key-value lookup
   - **Complexity:** LOW
   - **Best for:** Simple apps with basic translation needs

**Recommendation for FETMS:** react-i18next — most popular, good TypeScript support, handles Traditional Chinese well. FETMS already has date-fns (handles date formatting), so don't need react-intl's format power.

## Expected Behavior - Dark Mode Standards

Based on industry observation (MEDIUM confidence):

| Scenario | Expected Behavior | Current FETMS Issue |
|----------|-------------------|---------------------|
| User toggles to dark mode | Entire app (header, sidebar, content, modals) switches to dark colors instantly | Header stays white; text becomes unreadable |
| Dark mode text | Sufficient contrast (WCAG AA: 4.5:1); light text on dark backgrounds | Text visibility issues reported |
| Form inputs in dark mode | Dark input backgrounds with light text; visible borders; clear focus states | Unknown if affected |
| Charts/graphs in dark mode | Colors adapt to dark background (not pure white lines on dark, but muted colors) | Recharts may need theme-aware config |
| Page reload with dark mode | App loads in dark mode immediately; no flash of light content | May have FOUC issue |
| System preference changes | If "System" selected, app updates when OS theme changes | next-themes handles this |
| Dropdowns/modals in dark mode | Dark backgrounds matching main theme; proper contrast | Unknown if affected |

## Expected Behavior - Language Switching

Based on industry observation (MEDIUM confidence):

| Scenario | Expected Behavior |
|----------|-------------------|
| First visit (browser = Chinese) | App defaults to Traditional Chinese UI |
| First visit (browser = English) | App defaults to English UI |
| User switches language | All UI labels update instantly; no reload |
| User-generated data | Teacher names, school names remain in original language (not translated) |
| Dropdown options | Both label AND options translate ("Status: Active" → "狀態：啟用") |
| Dates | Format per locale (English: MM/DD/YYYY; Chinese: YYYY-MM-DD or localized) |
| Numbers | Thousands separator per locale (English: 1,234; some locales: 1 234) |
| Page reload | Selected language persists from localStorage |
| Missing translation | Falls back to English (default) for that key |
| Validation messages | Error messages appear in selected language |

## Competitor Feature Analysis

Cannot perform competitor analysis (WebSearch unavailable). Based on training knowledge of typical web app settings:

| Feature | Typical Web App Pattern | FETMS Current | FETMS Target |
|---------|-------------------------|---------------|--------------|
| Dark Mode | Light/Dark/System toggle in header or settings | Exists but flawed | Fix + ensure system detection works |
| Language | Dropdown with flag icons; usually in header + settings page | Not present | Add Traditional Chinese support |
| Font Size | Slider or 3-size toggle (S/M/L) in accessibility settings | Not present | Add to v1 |
| Display Density | Compact/Comfortable/Spacious radio buttons | Not present | Defer to v1.1 |
| Reduced Motion | Checkbox in accessibility settings | Not present | Defer to v1.1 |
| Theme Persistence | localStorage (client-side apps) or backend (multi-device sync) | localStorage via next-themes | Keep localStorage for v1 |

## Sources

**Confidence Level: MEDIUM**

All findings based on training data (knowledge cutoff January 2025). WebSearch unavailable for verification.

- Training knowledge of modern web app patterns (GitHub, Linear, Notion, Slack, Discord, etc.)
- WCAG accessibility standards (well-established, unlikely to change)
- React i18n ecosystem knowledge (react-i18next, react-intl)
- Tailwind CSS + Shadcn/UI dark mode patterns (documented officially)
- next-themes library capabilities (from npm documentation in training)

**Limitations:**
- Could not verify 2026 trends (WebSearch denied)
- Could not check for new i18n libraries released after training cutoff
- Could not verify current state-of-the-art patterns in production apps

**Recommendations for validation:**
- Check official Tailwind CSS dark mode docs
- Review react-i18next documentation for Traditional Chinese support
- Audit popular web apps (GitHub, Linear, Notion) for current settings patterns
- Test Shadcn/UI dark mode examples for expected behavior

---
*Feature research for: User Preferences/Settings Enhancement*
*Researched: 2026-01-27*
*Confidence: MEDIUM (Training data only; WebSearch unavailable)*
