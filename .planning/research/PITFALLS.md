# Pitfalls Research: Dark Mode and i18n Implementation

**Domain:** Dark mode and internationalization (i18n) for React + Tailwind applications
**Researched:** 2026-01-27
**Confidence:** MEDIUM-HIGH

**Note on sources:** WebSearch unavailable during research. Findings based on:
- Analysis of existing codebase implementation
- React 19 + Tailwind CSS 4 + next-themes library patterns (training knowledge)
- WCAG accessibility standards
- Traditional Chinese i18n requirements (training knowledge)
- Confidence levels marked throughout

---

## Current Implementation Analysis

**Identified issues in existing dark theme:**

1. **Missing Tailwind dark mode configuration** - `tailwind.config.js` lacks `darkMode: 'class'`
2. **No FOUC prevention** - `index.html` has no theme initialization script
3. **Incomplete color system** - No CSS custom properties for theme colors
4. **Shadcn/UI colors not configured** - Missing theme-aware color variables
5. **Sporadic dark mode classes** - Only 2-3 components use `dark:` variants
6. **Header stays white** - Layout components lack dark mode styling

These are textbook dark mode implementation pitfalls that will be addressed below.

---

## Critical Pitfalls

### Pitfall 1: Flash of Unstyled Content (FOUC) / Flash of Incorrect Theme

**What goes wrong:**
On initial page load or refresh, users see a brief flash of the wrong theme (usually light theme) before the correct theme loads from localStorage. This is jarring and unprofessional, especially for users who prefer dark mode.

**Why it happens:**
- Theme is stored in localStorage and read by JavaScript after HTML is parsed
- React hydration happens after initial render
- By the time next-themes reads localStorage and applies the theme class, the page has already rendered with default (light) styling
- The gap between HTML parsing and JavaScript execution causes the flash

**How to avoid:**
- Inject a blocking inline script in `<head>` that reads localStorage and sets the theme class on `<html>` BEFORE any content renders
- Use next-themes' built-in script injection or manual implementation
- Script must be synchronous and before any CSS that uses `.dark` selector

```html
<!-- In index.html <head> -->
<script>
  (function() {
    const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  })();
</script>
```

**Warning signs:**
- Users report "flickering" on page load
- Light background briefly visible before dark theme applies
- Different theme shown for ~100-300ms on initial load

**Phase to address:**
Phase 1 (Theme Infrastructure) - This MUST be solved before any dark mode styling work begins. All subsequent phases depend on flicker-free theme switching.

**Confidence:** HIGH (well-documented next-themes pattern, WCAG usability issue)

---

### Pitfall 2: Incomplete Tailwind Dark Mode Configuration

**What goes wrong:**
`dark:` utility classes don't work or are inconsistent across the application. Components that should respond to theme changes remain in light mode. This is the root cause of "header stays white" and similar issues.

**Why it happens:**
Tailwind requires explicit dark mode strategy configuration. Without `darkMode: 'class'` in `tailwind.config.js`, Tailwind either:
- Doesn't generate `dark:` variants at all (v3+), OR
- Uses media query strategy (relies on system preference, ignores user toggle)

**How to avoid:**
```js
// tailwind.config.js
export default {
  darkMode: 'class', // CRITICAL: enables dark: variants based on .dark class
  content: [...],
  theme: {...}
}
```

Then Tailwind will generate utilities like `dark:bg-slate-900`, `dark:text-white`, etc.

**Warning signs:**
- `dark:` classes in JSX have no effect
- DevTools shows `dark:` classes aren't in compiled CSS
- Theme toggle changes class on `<html>` but nothing visually changes
- **CURRENT ISSUE:** Header, sidebar, and most components don't respond to theme toggle

**Phase to address:**
Phase 1 (Theme Infrastructure) - Required before any component can use `dark:` utilities.

**Confidence:** HIGH (official Tailwind documentation requirement)

---

### Pitfall 3: Missing CSS Custom Properties for Semantic Colors

**What goes wrong:**
Colors are hardcoded (e.g., `bg-slate-900`, `text-gray-100`) instead of using semantic theme variables. This creates:
- Inconsistent colors across dark mode (some components use `slate-900`, others use `gray-900`, others use `zinc-900`)
- Difficulty maintaining consistent design system
- Need to update every single component when adjusting dark theme colors
- Incompatibility with Shadcn/UI components which expect CSS variables

**Why it happens:**
Developers use Tailwind's default color scale directly instead of defining semantic theme tokens. Tailwind doesn't enforce semantic naming - it's easy to write `bg-blue-500` everywhere instead of `bg-primary`.

**How to avoid:**
Define CSS custom properties for semantic colors that change based on theme:

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;      /* hsl values */
    --foreground: 222 47% 11%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    /* ... more semantic tokens */
  }

  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    --primary: 217 91% 60%;
    --primary-foreground: 222 47% 11%;
    --muted: 223 47% 11%;
    --muted-foreground: 215 20% 65%;
    /* ... matching dark tokens */
  }
}
```

Configure Tailwind to use these:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      // ...
    }
  }
}
```

Then use: `bg-background`, `text-foreground`, `bg-primary`, etc.

**Warning signs:**
- Twenty different gray shades used across app (`slate-800`, `gray-800`, `zinc-800`)
- Shadcn/UI components look broken or unstyled
- Changing brand color requires updating 50+ files
- Dark mode colors feel inconsistent or "off-brand"

**Phase to address:**
Phase 1 (Theme Infrastructure) - Foundational color system required before styling components.

**Confidence:** HIGH (Shadcn/UI requirement, design system best practice)

---

### Pitfall 4: Contrast Ratio Failures (WCAG Accessibility)

**What goes wrong:**
Dark mode text has insufficient contrast against dark backgrounds, making content hard to read or inaccessible to users with visual impairments. Common violations:
- Gray text on slightly darker gray background (contrast ratio < 4.5:1)
- Colored text on dark background doesn't meet AA standard
- Form inputs, borders, and disabled states become invisible

**Why it happens:**
- Developers assume dark mode is just "invert colors" - it's not
- Light mode has `text-gray-700` on `bg-white` (good contrast), but dark mode `text-gray-300` on `bg-gray-900` may fail
- Tailwind's default color scales don't guarantee WCAG compliance when mixed
- No automated testing for contrast ratios during development

**WCAG Standards:**
- **Level AA (minimum):** 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold)
- **Level AAA (enhanced):** 7:1 for normal text, 4.5:1 for large text

**How to avoid:**
1. Use a contrast checker tool during theme design (e.g., WebAIM, Contrast Ratio, WCAG Color Contrast Checker)
2. Test common combinations:
   - Body text on background
   - Primary button text on primary background
   - Muted text on muted background
   - Form input borders and placeholder text
3. Use darker text colors in dark mode than you think (e.g., `text-slate-100` or `text-white`, not `text-slate-300`)
4. Implement automated contrast testing in CI (e.g., axe-core, pa11y)

**Example contrast failures to avoid:**
```tsx
// ❌ BAD: Likely fails WCAG AA
<div className="bg-slate-900 text-slate-400">
  {/* text-slate-400 (#94a3b8) on bg-slate-900 (#0f172a) = 3.7:1 - FAIL */}
</div>

// ✅ GOOD: Passes WCAG AA
<div className="bg-slate-900 text-slate-100">
  {/* text-slate-100 (#f1f5f9) on bg-slate-900 (#0f172a) = 14.8:1 - PASS */}
</div>
```

**Warning signs:**
- User complaints about readability in dark mode
- Text is hard to read under certain lighting conditions
- Disabled form elements are invisible
- Axe DevTools or Lighthouse flags color contrast issues

**Phase to address:**
Phase 2 (Component Styling) - Test contrast ratios as each component is styled. Include in PR review checklist.

**Confidence:** HIGH (WCAG 2.1 specification, legal requirement in many jurisdictions)

---

### Pitfall 5: Hydration Mismatch with next-themes

**What goes wrong:**
React throws hydration errors: "Text content does not match server-rendered HTML" or "Hydration failed because the initial UI does not match what was rendered on the server." Caused by theme-dependent content rendering differently on server vs. client.

**Why it happens:**
In SSR/SSG contexts, the server doesn't know the user's theme preference (stored in browser localStorage). If components render theme-specific content:
- Server renders default theme
- Client hydrates with user's actual theme
- React detects mismatch and throws error

**How to avoid:**
1. **Suppress hydration warnings** for theme-dependent content (acceptable for theme toggle icon):
   ```tsx
   <div suppressHydrationWarning>
     {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
   </div>
   ```

2. **Defer rendering** theme-specific content until mounted:
   ```tsx
   const [mounted, setMounted] = useState(false);
   useEffect(() => setMounted(true), []);

   if (!mounted) return null; // or skeleton
   return <ThemeToggle />;
   ```

3. **Use CSS-only solutions** for theme-dependent visuals (preferred):
   ```tsx
   {/* Both icons always render, CSS controls visibility */}
   <Sun className="dark:hidden" />
   <Moon className="hidden dark:block" />
   ```

**Note:** This is less critical for Vite SPA (no SSR), but important if migrating to Next.js or SSR later.

**Warning signs:**
- Console errors mentioning hydration
- Warning about mismatched text content
- Flash of different icon/content before correct version appears

**Phase to address:**
Phase 1 (Theme Infrastructure) - Handle in ThemeToggle component implementation.

**Confidence:** MEDIUM-HIGH (next-themes documentation, React 19 behavior may differ from training knowledge)

---

### Pitfall 6: Forgotten Shadcn/UI Component Theming

**What goes wrong:**
Shadcn/UI components (Button, Card, Dialog, etc.) look broken or inconsistent in dark mode because they weren't installed with proper theme configuration. Symptoms:
- Buttons have light backgrounds in dark mode
- Dialogs are blinding white
- Cards don't have proper borders
- Form inputs are invisible

**Why it happens:**
Shadcn/UI components are designed to work with the CSS custom properties pattern (Pitfall 3). If you:
- Install components before setting up theme variables, OR
- Modify `globals.css` without updating component styles, OR
- Use Tailwind arbitrary values instead of semantic tokens

...components won't respond to theme changes.

**How to avoid:**
1. Set up CSS custom properties FIRST (see Pitfall 3)
2. Install Shadcn/UI components AFTER theme infrastructure is ready
3. Use Shadcn's CLI to generate components (automatically uses correct tokens)
4. Don't modify component files to use hardcoded colors
5. If manually editing, always use semantic tokens: `bg-background`, `text-foreground`, `border-border`, etc.

**Warning signs:**
- Button component still shows light colors in dark mode
- Card backgrounds are wrong
- Radix UI primitives (Dialog, Popover) don't respect theme
- Need to override component styles in consuming code

**Phase to address:**
Phase 2 (Component Styling) - Audit all Shadcn/UI components, regenerate if needed.

**Confidence:** HIGH (Shadcn/UI architecture requirement)

---

### Pitfall 7: i18n Text Expansion Breaks Layouts

**What goes wrong:**
UI layouts designed for English break when translated to Traditional Chinese (or other languages) due to:
- **Traditional Chinese text is ~30% longer** than English for same content
- Fixed-width containers cause text overflow
- Buttons become too wide or text wraps awkwardly
- Table columns truncate important information

**Why it happens:**
Developers design with English text lengths in mind, using:
- Fixed widths (`w-32`, `w-64`)
- Truncation that's too aggressive (`truncate` without fallback)
- Grid/flex layouts without proper spacing
- Buttons sized for short English labels

**Examples:**

| English | Traditional Chinese | Length Difference |
|---------|---------------------|-------------------|
| "Edit" | "編輯" | 2 chars → 2 chars (similar) |
| "Delete" | "刪除" | 6 chars → 2 chars (shorter!) |
| "Settings" | "設定" | 8 chars → 2 chars (shorter!) |
| "Pipeline Stages" | "招聘階段設定" | 15 chars → 6 chars (shorter in chars, but wider in px) |
| "Foreign English Teachers" | "外籍英語教師" | 25 chars → 6 chars (much shorter in chars) |

**Correction:** Traditional Chinese is often SHORTER in character count but WIDER in pixel width due to wider glyphs. Need to test actual rendered width.

**How to avoid:**
1. **Use flexible layouts:**
   ```tsx
   // ❌ BAD: Fixed width
   <button className="w-32">Settings</button>

   // ✅ GOOD: Content-driven width
   <button className="px-4 py-2">{t('settings')}</button>
   ```

2. **Test with longest translations** during development
3. **Use `min-w-` and `max-w-` instead of fixed `w-`**
4. **Responsive truncation with tooltips:**
   ```tsx
   <div className="max-w-xs truncate" title={fullText}>
     {text}
   </div>
   ```

5. **Avoid hardcoded line-clamp** without testing all languages

**Warning signs:**
- Buttons look cramped in Chinese
- Table headers wrap to 3+ lines
- Navigation items overflow sidebar
- Tooltips or dialogs have text cutoff

**Phase to address:**
Phase 3 (i18n Integration) - Design with both languages from start. Test every component in both EN and ZH.

**Confidence:** MEDIUM (based on general i18n patterns, not verified for this specific language pair)

---

### Pitfall 8: Traditional Chinese Font Stack Issues

**What goes wrong:**
Traditional Chinese characters render poorly or with wrong glyphs because:
- System fallback fonts use Simplified Chinese variants
- Font stack doesn't include proper Traditional Chinese fonts
- Font weights look inconsistent between English and Chinese
- Noto Sans / other Google Fonts don't load Chinese glyphs

**Why it happens:**
- Default Tailwind font stack is Latin-centric: `ui-sans-serif, system-ui, -apple-system, ...`
- Traditional Chinese fonts differ from Simplified (different character forms)
- Not all fonts support CJK (Chinese, Japanese, Korean) Unicode ranges
- Developers don't test on Windows (different font rendering than macOS)

**How to avoid:**
Configure font stack with proper Traditional Chinese support:

```js
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      sans: [
        'Inter',                    // English primary
        '-apple-system',            // macOS system font
        'BlinkMacSystemFont',       // macOS Chrome
        '"Segoe UI"',               // Windows
        'Roboto',                   // Android
        '"Noto Sans TC"',           // Traditional Chinese (Google Fonts)
        '"PingFang TC"',            // macOS Traditional Chinese
        '"Microsoft JhengHei"',     // Windows Traditional Chinese
        'sans-serif',
      ],
    },
  },
}
```

**Google Fonts Traditional Chinese:**
```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
```

**Warning signs:**
- Chinese characters look "wrong" or use Simplified forms
- Font weights don't work in Chinese text
- Inconsistent rendering between browsers/OS
- Chinese text noticeably different weight than English

**Phase to address:**
Phase 3 (i18n Integration) - Set up font stack before translating content.

**Confidence:** MEDIUM (based on CJK font patterns, specific Traditional Chinese font availability needs verification)

---

### Pitfall 9: Missing i18n for Dynamic Content

**What goes wrong:**
Some content is hardcoded in English and never gets translated:
- Error messages from backend API
- Date formats, number formats
- Dynamically generated strings (e.g., "Updated 3 days ago")
- Validation messages
- Enum values displayed to user

**Why it happens:**
- Developers focus on UI labels but forget content from other sources
- Backend returns English error messages
- Date/time libraries use default English locale
- String concatenation instead of i18n template strings

**How to avoid:**
1. **Translate backend error messages** or use error codes with frontend translations:
   ```tsx
   // ❌ BAD
   throw new Error('Teacher not found');

   // ✅ GOOD
   throw new ApiError('TEACHER_NOT_FOUND');

   // Frontend
   const errorMessages = {
     TEACHER_NOT_FOUND: t('errors.teacherNotFound'),
   };
   ```

2. **Use i18n library for dates:**
   ```tsx
   import { format } from 'date-fns';
   import { zhTW, enUS } from 'date-fns/locale';

   format(date, 'PPP', { locale: currentLocale === 'zh' ? zhTW : enUS });
   ```

3. **Translate enums:**
   ```tsx
   // ❌ BAD
   <td>{teacher.status}</td>  // Shows "ACTIVE" in English

   // ✅ GOOD
   <td>{t(`status.${teacher.status.toLowerCase()}`)}</td>
   ```

4. **Use i18n template strings, not concatenation:**
   ```tsx
   // ❌ BAD
   `Updated ${days} days ago`  // Word order differs in Chinese

   // ✅ GOOD
   t('updatedDaysAgo', { days })  // Allows reordering in translation
   ```

**Warning signs:**
- Some text remains English after switching to Chinese
- Dates show "January 27, 2026" instead of "2026年1月27日"
- Error messages don't change with language
- Numbers use wrong separators (1,000 vs 1.000 vs 1 000)

**Phase to address:**
Phase 4 (Content Translation) - Systematic audit of all text sources.

**Confidence:** HIGH (standard i18n practice)

---

### Pitfall 10: localStorage Sync Issues with Multi-Tab

**What goes wrong:**
User changes theme or language in one tab, but other open tabs don't update. Causes confusion and inconsistent state across tabs.

**Why it happens:**
- localStorage changes don't automatically trigger re-renders in other tabs
- Need to listen to `storage` event to detect external changes
- next-themes may or may not handle this (needs verification)

**How to avoid:**
```tsx
// Listen for storage changes in other tabs
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'theme' && e.newValue) {
      setTheme(e.newValue);
    }
    if (e.key === 'locale' && e.newValue) {
      changeLanguage(e.newValue);
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

**Note:** `storage` event only fires in OTHER tabs, not the tab that made the change.

**Warning signs:**
- User changes theme in tab A, tab B stays in old theme
- Need to refresh tabs to see updated preferences
- Inconsistent state across browser windows

**Phase to address:**
Phase 5 (Preference Persistence) - Add cross-tab sync for theme and locale.

**Confidence:** MEDIUM-HIGH (standard Web Storage API behavior, next-themes implementation needs verification)

---

## Moderate Pitfalls

### Pitfall 11: Inconsistent Dark Mode Coverage

**What goes wrong:**
90% of the app has dark mode, but some components were forgotten:
- Modals and dialogs
- Dropdown menus
- Tooltips
- Loading states
- Error states
- Empty states

Users see jarring white flashes when these components appear.

**Prevention:**
- Create a dark mode checklist of all component types
- Test every user flow in dark mode before merging
- Add dark mode to component definition of done
- Use semantic tokens (solves most cases automatically)

**Phase to address:**
Phase 2 (Component Styling) - Component audit with checklist.

---

### Pitfall 12: SVG Icons and Images Don't Respond to Theme

**What goes wrong:**
Inline SVG icons or image assets look wrong in dark mode:
- Dark icons invisible on dark background
- Logos designed for light background look bad in dark mode
- Charts and graphs use colors that don't work in both themes

**Prevention:**
- Use `currentColor` in SVG icons to inherit text color
- Provide light and dark variants of logos/images:
  ```tsx
  <img
    src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
    alt="Logo"
  />
  ```
- For charts, use theme-aware color palette:
  ```tsx
  const chartColors = theme === 'dark'
    ? ['#60a5fa', '#34d399', '#fbbf24']  // lighter colors for dark bg
    : ['#3b82f6', '#10b981', '#f59e0b']; // darker colors for light bg
  ```

**Phase to address:**
Phase 2 (Component Styling) - Handle during iconography and asset review.

---

### Pitfall 13: Recharts Theming

**What goes wrong:**
Recharts library (used for Dashboard) doesn't automatically respond to theme changes. Charts remain light-themed in dark mode with poor contrast.

**Prevention:**
- Pass theme-aware colors to chart components
- Update axis colors, grid colors, tooltip backgrounds
- Test readability of all chart types in both themes

```tsx
const chartConfig = {
  axisStroke: theme === 'dark' ? '#475569' : '#e2e8f0',
  gridStroke: theme === 'dark' ? '#334155' : '#f1f5f9',
  tooltipBg: theme === 'dark' ? '#1e293b' : '#ffffff',
};

<LineChart>
  <CartesianGrid stroke={chartConfig.gridStroke} />
  <XAxis stroke={chartConfig.axisStroke} />
  <Tooltip
    contentStyle={{
      backgroundColor: chartConfig.tooltipBg,
      border: `1px solid ${chartConfig.gridStroke}`
    }}
  />
</LineChart>
```

**Phase to address:**
Phase 2 (Component Styling) - Dashboard component updates.

**Confidence:** MEDIUM (based on typical chart library patterns)

---

### Pitfall 14: i18n Library Bundle Size

**What goes wrong:**
Including i18n library (react-i18next + i18next) adds significant bundle size, especially if all locales are bundled:
- i18next: ~40-50KB
- Language files can be large if not code-split
- Pluralization rules for all languages add weight

**Prevention:**
- Use dynamic imports for translation files:
  ```tsx
  const loadTranslations = async (locale: string) => {
    const translations = await import(`./locales/${locale}.json`);
    return translations.default;
  };
  ```
- Only bundle needed locales (EN and ZH-TW, not all 100+ languages)
- Use lightweight alternative if only 2 languages needed (consider custom solution)
- Lazy load i18n library if most users use English

**Phase to address:**
Phase 3 (i18n Integration) - Configure with bundle analysis.

**Confidence:** MEDIUM (based on general bundling patterns, specific library sizes need verification)

---

### Pitfall 15: Translation Key Maintenance Hell

**What goes wrong:**
As app grows, translation files become unmaintainable:
- 500+ keys in flat structure
- Duplicate keys
- Unused keys not removed
- Missing translations discovered at runtime

**Prevention:**
- Use nested structure:
  ```json
  {
    "teacher": {
      "list": {
        "title": "Teachers",
        "empty": "No teachers found"
      },
      "profile": {
        "title": "Teacher Profile"
      }
    }
  }
  ```
- Use TypeScript for type-safe translation keys
- Automated unused key detection
- CI check for missing translations
- Extract keys from code automatically (don't manually maintain)

**Phase to address:**
Phase 4 (Content Translation) - Set up proper structure from the start.

---

## Minor Pitfalls

### Pitfall 16: Theme Toggle Icon Animation Performance

**What goes wrong:**
Rotating sun/moon icon animation causes layout shift or feels janky.

**Prevention:**
- Use CSS transforms (not layout properties)
- Ensure icons have same dimensions
- Use absolute positioning for overlay effect
- Test animation on low-end devices

**Phase to address:**
Phase 1 (Theme Infrastructure) - Minor polish during ThemeToggle implementation.

---

### Pitfall 17: System Theme Detection Doesn't Update

**What goes wrong:**
User has theme set to "system", changes OS theme from light to dark, but app doesn't update.

**Prevention:**
next-themes handles this automatically via `matchMedia` listener. Verify it works as expected.

**Phase to address:**
Phase 1 (Theme Infrastructure) - Test during "system" mode implementation.

---

### Pitfall 18: Traditional Chinese Punctuation Spacing

**What goes wrong:**
English-style punctuation spacing looks wrong in Chinese text:
- English: "Hello, world!" (space after comma)
- Chinese: "你好，世界！" (no space after punctuation)

**Prevention:**
- Use proper Chinese punctuation in translations
- Don't apply `space-x-2` classes to Chinese text
- Use language-aware typography utilities if available

**Phase to address:**
Phase 4 (Content Translation) - Translation quality review.

**Confidence:** LOW (based on general CJK typography, needs verification by native speaker)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip FOUC prevention script | Faster initial development | Users see theme flash on every page load, poor UX | Never - takes 5 minutes to add |
| Use hardcoded colors instead of CSS variables | Faster to write styles | Extremely difficult to maintain theme consistency, breaks Shadcn/UI | Never in new components |
| Bundle all translations upfront | Simpler implementation | Slower initial load, unnecessary data for most users | Only if both languages fit in budget (<20KB) |
| Use simple object instead of i18n library | Zero dependencies, smaller bundle | No pluralization, no interpolation, hard to maintain | Only if app has <50 strings and no plans to add more languages |
| Skip Traditional Chinese font setup | Less configuration | Poor Chinese text rendering, user complaints | Never if targeting Traditional Chinese users |
| Inline theme-dependent styles | Avoid prop drilling theme context | Hard to maintain, potential hydration issues | Never - use CSS custom properties |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering entire app on theme change | Laggy theme toggle, UI freezes | Use CSS variables (no React re-render needed), memo expensive components | Immediately noticeable on low-end devices |
| Loading all translations on mount | Slow initial page load | Lazy load locale files, code-split by route | 200+ translation keys |
| Recalculating theme-dependent charts on every render | Dashboard feels slow, CPU usage spikes | Memoize chart config based on theme, use React.memo | Complex dashboards with 5+ charts |
| Running contrast checker on every render | Component feels unresponsive | Calculate contrast at build time, not runtime | Never - this should be a dev tool, not runtime logic |

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Theme Infrastructure | Forgetting Tailwind `darkMode: 'class'` config | Make this the first step, verify `dark:` classes work before proceeding |
| Phase 1: Theme Infrastructure | No FOUC prevention | Add inline script in `index.html` before any testing |
| Phase 2: Component Styling | Inconsistent dark mode coverage | Create component checklist, test every component type in dark mode |
| Phase 2: Component Styling | Contrast ratio failures | Test with WebAIM checker, automate with axe-core in CI |
| Phase 3: i18n Integration | Text expansion breaking layouts | Design with flexible layouts from the start, test with longest translations |
| Phase 3: i18n Integration | Missing Traditional Chinese fonts | Set up font stack before any translation work |
| Phase 4: Content Translation | Missing translations for dynamic content | Systematic audit of all text sources (API, validation, dates, enums) |
| Phase 5: Preference Persistence | Multi-tab sync not working | Add storage event listener, test with multiple tabs open |

---

## "Looks Done But Isn't" Checklist

- [ ] **Dark mode working:** Verify no FOUC on hard refresh (Ctrl+Shift+R)
- [ ] **Dark mode complete:** Test every modal, dropdown, tooltip, empty state, error state
- [ ] **Contrast ratios:** Run axe DevTools on all pages in dark mode, verify no violations
- [ ] **Shadcn/UI components:** All Shadcn components respond to theme (Button, Card, Dialog, etc.)
- [ ] **Charts in dark mode:** Recharts has theme-aware colors, readable in both modes
- [ ] **Chinese fonts:** Traditional Chinese characters render with correct font, not Simplified
- [ ] **Layout flexibility:** All layouts work in both EN and ZH without overflow/truncation
- [ ] **Dynamic content translated:** Dates, numbers, error messages, validation - all localized
- [ ] **Multi-tab sync:** Theme change in one tab updates all tabs
- [ ] **System theme:** "System" mode responds to OS theme changes in real-time
- [ ] **Image assets:** Logo/icons have dark mode variants where needed
- [ ] **Loading states:** Skeleton loaders and spinners work in dark mode

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| FOUC present | LOW | Add inline script to `index.html`, test |
| Missing Tailwind config | LOW | Add `darkMode: 'class'`, rebuild, test |
| Hardcoded colors everywhere | HIGH | Audit all components, replace with CSS variables, extensive testing |
| No CSS variables | MEDIUM | Define variables in `globals.css`, update Tailwind config, update Shadcn components |
| Contrast failures | MEDIUM | Adjust CSS variables for dark theme, re-test all components |
| Chinese font issues | LOW | Update Tailwind font config, add Google Fonts link |
| Text expansion breaks layout | HIGH | Refactor all fixed-width layouts to flexible, test with actual translations |
| Missing translations | MEDIUM | Extract hardcoded strings, add to locale files, test coverage |
| No multi-tab sync | LOW | Add storage event listener, test |
| Bundle too large | MEDIUM | Implement code splitting for translations, analyze with webpack-bundle-analyzer |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| FOUC | Phase 1: Theme Infrastructure | Hard refresh shows no flash |
| Tailwind dark mode config | Phase 1: Theme Infrastructure | `dark:bg-slate-900` works in browser |
| CSS custom properties | Phase 1: Theme Infrastructure | `bg-background` utility exists, theme toggle changes colors |
| Contrast ratios | Phase 2: Component Styling | Axe DevTools shows no violations |
| Hydration mismatch | Phase 1: Theme Infrastructure | No console errors on mount |
| Shadcn/UI broken | Phase 2: Component Styling | All Shadcn components respond to theme |
| Text expansion | Phase 3: i18n Integration | All layouts work in both EN and ZH |
| Chinese fonts | Phase 3: i18n Integration | Screenshot Chinese text, verify correct rendering |
| Missing i18n for dynamic content | Phase 4: Content Translation | All text translates when switching language |
| localStorage sync | Phase 5: Preference Persistence | Multi-tab test passes |
| Inconsistent coverage | Phase 2: Component Styling | Component checklist 100% complete |
| SVG/image issues | Phase 2: Component Styling | All assets visible in both themes |
| Recharts theming | Phase 2: Component Styling | Dashboard charts readable in dark mode |
| Bundle size | Phase 3: i18n Integration | Bundle analyzer shows acceptable size |
| Translation key structure | Phase 4: Content Translation | TypeScript autocomplete works for all keys |

---

## Sources

**High Confidence (Official Documentation / Standards):**
- WCAG 2.1 Color Contrast Guidelines (Level AA: 4.5:1, AAA: 7:1)
- Tailwind CSS dark mode documentation (darkMode: 'class' requirement)
- React 19 hydration behavior (suppressHydrationWarning)

**Medium Confidence (Library Patterns / Best Practices):**
- next-themes library patterns (version 0.4.6 used in project)
- Shadcn/UI theming architecture (CSS custom properties pattern)
- Recharts theming patterns (theme-aware color props)
- i18n library implementation patterns (react-i18next common practices)

**Low Confidence (Needs Verification):**
- Traditional Chinese specific text expansion ratios (needs native speaker verification)
- Traditional Chinese font rendering differences from Simplified (needs testing on target OS)
- Chinese punctuation spacing rules (needs typography expert verification)
- Specific bundle sizes for i18next library (needs measurement in this project)

**Findings from Existing Codebase Analysis:**
- Missing `darkMode: 'class'` in tailwind.config.js (verified)
- No FOUC prevention script in index.html (verified)
- next-themes installed but not fully configured (verified)
- Sporadic dark mode coverage (only 3 files use `dark:` classes)
- No CSS custom properties for theme colors (verified)
- No i18n library currently installed (verified via package.json)

---

*Pitfalls research for: Dark Mode and i18n Implementation*
*Researched: 2026-01-27*
*Project: FETMS (Foreign English Teachers Management System)*
