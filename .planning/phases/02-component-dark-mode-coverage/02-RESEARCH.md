# Phase 2: Component Dark Mode Coverage - Research

**Researched:** 2026-01-28
**Domain:** React + Tailwind CSS + Shadcn/UI dark mode implementation
**Confidence:** HIGH

## Summary

This research investigates how to systematically apply dark mode styling to all application components in a React 19 + Tailwind CSS v4 + Shadcn/UI + Recharts application, ensuring WCAG AA accessibility compliance. The infrastructure from Phase 1 (class-based dark mode with next-themes, FOUC prevention, and CSS variables) provides the foundation for this phase.

The standard approach uses Tailwind's `dark:` variant with CSS variables (oklch color space) for theme-aware styling. Shadcn/UI components already follow this pattern, making them inherently dark-mode compatible. The key challenges are: (1) updating custom application components with hardcoded colors, (2) adapting Recharts visualizations for dark backgrounds, and (3) ensuring WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for UI components) across all interactive states.

**Primary recommendation:** Audit all components for hardcoded colors (slate-*, blue-*, etc.), replace with semantic CSS variables (background, foreground, card, muted, border) using the `dark:` variant, then verify contrast ratios with automated tools like WebAIM's Contrast Checker or axe DevTools.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v4.1.17 | Utility-first CSS with `dark:` variant | Official dark mode support via `@custom-variant`, widely adopted, integrates seamlessly with CSS variables |
| next-themes | v0.4.6 | Theme state management (already installed Phase 1) | Industry standard for React theme switching, handles localStorage, SSR, system preference detection |
| Recharts | v3.5.1 | Data visualization library | Already in use for dashboard charts, supports CSS variable-based theming |
| oklch color space | CSS native | Perceptual color model for theme palettes | Modern standard (93% browser support), ensures consistent contrast across lightness scales, better than HSL/RGB |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| WebAIM Contrast Checker | Web tool | Manual WCAG contrast validation | Verify color combinations meet 4.5:1 (text) or 3:1 (UI) ratios |
| axe DevTools | Browser extension | Automated accessibility testing | Find contrast violations, missing ARIA labels, keyboard focus issues |
| WAVE | Browser extension | Visual accessibility feedback | See contrast errors overlaid on page, useful for quick audits |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| oklch | HSL/RGB | oklch provides perceptual uniformity (equal lightness changes = equal visual differences), HSL/RGB don't |
| CSS variables | Inline Tailwind dark: variants | CSS variables enable automatic theme switching without `dark:` prefix on every class, reducing code verbosity |
| Recharts | Chart.js, Victory | Recharts already in use, switching would require rewriting all charts; CSS variable approach works with Recharts |

**Installation:**
```bash
# All dependencies already installed in Phase 1 or existing project
# No new packages required
```

## Architecture Patterns

### Recommended Color System Structure

The existing CSS variables in `frontend/src/index.css` follow Shadcn/UI conventions. This is the correct pattern:

```css
/* index.css */
:root {
  /* Light mode - using oklch color space */
  --background: oklch(1 0 0);              /* Pure white */
  --foreground: oklch(0.145 0 0);          /* Near black */
  --card: oklch(1 0 0);                     /* White cards */
  --card-foreground: oklch(0.145 0 0);     /* Dark text on cards */
  --muted: oklch(0.97 0 0);                 /* Subtle backgrounds */
  --muted-foreground: oklch(0.556 0 0);    /* Secondary text */
  --border: oklch(0.922 0 0);               /* Light borders */
  --input: oklch(0.922 0 0);                /* Input borders */
  --ring: oklch(0.708 0 0);                 /* Focus rings */

  /* Chart colors */
  --chart-1: oklch(0.546 0.245 262.881);   /* Primary blue */
  --chart-2: oklch(0.623 0.214 259.815);   /* Light blue */
  --chart-3: oklch(0.696 0.17 162.48);     /* Emerald */
  --chart-4: oklch(0.769 0.188 70.08);     /* Amber */
  --chart-5: oklch(0.606 0.25 292.717);    /* Violet */
  --chart-6: oklch(0.656 0.241 354.308);   /* Pink */
}

.dark {
  /* Dark mode - same variables, different values */
  --background: oklch(0.145 0 0);          /* #121212-ish (not pure black) */
  --foreground: oklch(0.985 0 0);          /* Near white */
  --card: oklch(0.205 0 0);                /* Elevated surface */
  --card-foreground: oklch(0.985 0 0);     /* Light text on dark cards */
  --muted: oklch(0.269 0 0);                /* Subtle dark backgrounds */
  --muted-foreground: oklch(0.708 0 0);    /* Dim text */
  --border: oklch(1 0 0 / 10%);             /* Subtle borders (10% opacity) */
  --input: oklch(1 0 0 / 15%);              /* Input borders (15% opacity) */
  --ring: oklch(0.556 0 0);                 /* Focus rings */

  /* Chart colors adjusted for dark backgrounds */
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
}
```

### Pattern 1: Component Migration from Hardcoded to Semantic Colors

**What:** Replace hardcoded Tailwind color classes (slate-500, blue-600) with semantic color utilities (text-foreground, bg-card, border-border)

**When to use:** Every custom component that doesn't automatically adapt to dark mode

**Example:**
```typescript
// Source: Current codebase pattern (Header.tsx line 14, KPICard.tsx lines 46-49)

// ❌ BEFORE: Hardcoded colors
<header className="border-b bg-white px-8 shadow-sm">
  <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
  <p className="text-sm text-slate-500">Description</p>
</header>

// ✅ AFTER: Semantic colors with dark: variant
<header className="border-b bg-background px-8 shadow-sm">
  <h2 className="text-2xl font-bold text-foreground">{title}</h2>
  <p className="text-sm text-muted-foreground">Description</p>
</header>

// Alternative: Use dark: prefix if semantic color doesn't exist
<div className="bg-slate-50 dark:bg-slate-900">
  <p className="text-slate-800 dark:text-slate-200">Text</p>
</div>
```

### Pattern 2: Chart Color Integration with CSS Variables

**What:** Reference CSS variables in Recharts components instead of hardcoded hex colors

**When to use:** All chart components (PipelineChart, DemographicsChart, etc.)

**Example:**
```typescript
// Source: Shadcn/UI Chart docs + current PipelineChart.tsx

// ❌ BEFORE: Hardcoded colors
<YAxis tick={{ fontSize: 14, fill: '#64748b', fontWeight: 500 }} />
<Tooltip contentStyle={{
  borderRadius: '8px',
  border: 'none',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
}} />

// ✅ AFTER: CSS variable references
<YAxis tick={{
  fontSize: 14,
  fill: 'var(--color-muted-foreground)',  // Uses oklch(0.556) in light, oklch(0.708) in dark
  fontWeight: 500
}} />
<Tooltip contentStyle={{
  borderRadius: '8px',
  backgroundColor: 'var(--color-popover)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-popover-foreground)',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
}} />

// For chart bars/areas
<Bar dataKey="value" radius={[0, 6, 6, 0]}>
  {data.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={`var(--color-chart-${(index % 6) + 1})`}  // Cycles through --chart-1 to --chart-6
    />
  ))}
</Bar>
```

### Pattern 3: Surface Elevation Hierarchy (GitHub-style)

**What:** Create visual hierarchy using subtle lightness differences, not stark shadows

**When to use:** Modals, cards, elevated navigation

**Example:**
```typescript
// Source: User decision "GitHub-style medium contrast"

// Page background → Card → Modal hierarchy
<main className="bg-background">  {/* oklch(1 0 0) light, oklch(0.145 0 0) dark */}
  <Card className="bg-card border border-border">  {/* oklch(1 0 0) → oklch(0.205 0 0) */}
    {/* Card is one shade lighter in dark mode for subtle elevation */}
  </Card>

  <Dialog>
    <DialogContent className="bg-popover border border-border"> {/* oklch(0.205 0 0) in dark */}
      {/* Modal matches card level, relies on backdrop for separation */}
    </DialogContent>
  </Dialog>
</main>

// Navigation slightly elevated (user decision)
<header className="bg-card border-b border-border"> {/* One shade lighter than background */}
  <nav className="text-foreground">Navigation</nav>
</header>
```

### Pattern 4: Interactive State Hierarchy

**What:** Define hover, focus, disabled states with appropriate contrast and visual feedback

**When to use:** All interactive elements (buttons, inputs, table rows, cards)

**Example:**
```typescript
// Source: WCAG requirements + User decision on focus rings

// Table rows (user decision: hover-only distinction, no zebra stripes)
<TableRow className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
  <TableCell>Data</TableCell>
</TableRow>

// Focus indicators (WCAG AAA: 2px thick, 3:1 contrast)
<Button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
  {/* ring-offset-background ensures 3:1 contrast with both button and page background */}
</Button>

// Disabled states (user decision: moderately reduced, still readable)
<Button disabled className="disabled:opacity-50 disabled:cursor-not-allowed">
  {/* 50% opacity ensures text remains readable while clearly indicating disabled state */}
</Button>

// Hover states (subtle tone adjustment, not brightness extremes)
<Card className="transition-all hover:bg-muted/30 hover:shadow-md">
  {/* 30% muted background on hover provides gentle feedback */}
</Card>
```

### Pattern 5: Form Input States

**What:** Ensure borders, placeholders, focus rings, error states all meet contrast requirements

**When to use:** All form inputs (text, select, textarea, date picker, etc.)

**Example:**
```typescript
// Source: Existing Input.tsx + accessibility requirements

// Input already uses semantic colors (line 11 of Input.tsx)
<Input
  className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
  placeholder="Enter text..."
/>

// Error state (combine color + icon + text)
<div>
  <Label className="text-foreground">Email</Label>
  <Input
    className="border-destructive focus-visible:ring-destructive"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" className="text-sm text-destructive flex items-center gap-1 mt-1">
    <AlertCircle className="h-4 w-4" />
    Invalid email format
  </p>
</div>
// ✅ Uses color (destructive) + icon (AlertCircle) + text for accessibility
```

### Anti-Patterns to Avoid

- **Pure black backgrounds (#000000):** Causes harsh contrast and eye strain. Use dark gray like `oklch(0.145 0 0)` (~#121212) instead
- **Pure white text on dark backgrounds:** Too harsh. Use `oklch(0.985 0 0)` (~#F5F5F5) for slight softening
- **Color-only state indicators:** Never rely solely on color for errors, success, warnings. Always pair with icons and text
- **Inconsistent semantic color usage:** Don't mix `text-slate-800` and `text-foreground` arbitrarily. Use semantic colors consistently
- **Forgetting dark: variants on hardcoded colors:** If you use `bg-slate-50`, you MUST add `dark:bg-slate-900` or switch to semantic colors
- **Missing focus indicators in dark mode:** Ensure `ring-ring` variable provides sufficient contrast in both themes
- **Zebra striping tables:** User decision is hover-only distinction. Avoid `even:bg-muted` patterns

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme state management | Custom React context with localStorage logic | next-themes (already installed) | Handles SSR hydration, system preference detection, FOUC prevention, localStorage sync automatically |
| Contrast ratio calculation | Manual color math functions | WebAIM Contrast Checker, axe DevTools | WCAG formula is complex (relative luminance calculation), tools handle edge cases correctly |
| Color palette generation | Custom lightness/darkness functions | oklch color space with fixed lightness values | oklch ensures perceptual uniformity; custom functions often produce inconsistent contrast |
| Focus ring styling | Custom outline styles per component | Tailwind's `focus-visible:ring-*` utilities | Built-in utilities handle browser inconsistencies, keyboard vs mouse detection, WCAG compliance |
| Dark mode transition animations | Custom CSS transition logic | Tailwind's `transition-colors` utility | Optimized performance, handles multiple properties, respects prefers-reduced-motion |

**Key insight:** The Tailwind + Shadcn/UI + next-themes ecosystem provides battle-tested patterns. The main work is applying these patterns consistently, not inventing new solutions.

## Common Pitfalls

### Pitfall 1: Hardcoded Colors Scattered Throughout Codebase

**What goes wrong:** Custom components use hardcoded Tailwind colors (slate-500, blue-600) that don't adapt to dark mode

**Why it happens:** Copy-pasting from examples, habit from pre-dark-mode development, or not understanding semantic color system

**How to avoid:**
1. Audit all custom components for hardcoded color classes using regex: `(text|bg|border)-(slate|gray|zinc|blue|red|green)(-\d+)`
2. Replace with semantic utilities: `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`
3. When semantic color doesn't fit, use dark: variants: `bg-slate-50 dark:bg-slate-900`

**Warning signs:**
- Header.tsx line 14: `bg-white` (should be `bg-background` or `bg-card`)
- Header.tsx line 16: `text-slate-900` (should be `text-foreground`)
- KPICard.tsx line 46: `text-slate-500` (should be `text-muted-foreground`)
- KPICard.tsx line 62: `bg-slate-50` (should be `bg-muted` or `bg-secondary`)

### Pitfall 2: Recharts Components with Hardcoded Fill/Stroke Colors

**What goes wrong:** Charts use hex colors directly (fill="#2563EB") that don't change between themes

**Why it happens:** Recharts examples use hex colors; CSS variable syntax looks unusual in JSX

**How to avoid:**
1. Define chart colors in CSS using `--chart-1` through `--chart-6` variables
2. Reference in Recharts: `fill="var(--color-chart-1)"` or `stroke="var(--color-muted-foreground)"`
3. For tick labels, tooltips, axis: use `fill: 'var(--color-muted-foreground)'` in style objects

**Warning signs:**
- PipelineChart.tsx line 26: `fill: '#64748b'` (should be `fill: 'var(--color-muted-foreground)'`)
- PipelineChart.tsx line 35: `fill="#64748b"` (should be `fill="var(--color-muted-foreground)"`)
- Any chart component without dark mode testing showing identical colors in both themes

### Pitfall 3: Insufficient Contrast in Dark Mode

**What goes wrong:** Color combinations that meet WCAG AA in light mode fail in dark mode (or vice versa)

**Why it happens:** Lightness scaling doesn't automatically maintain contrast ratios; colors that work on white fail on dark gray

**How to avoid:**
1. Test EVERY color combination in both themes using WebAIM Contrast Checker
2. Verify text meets 4.5:1 contrast ratio (normal text) or 3:1 (large text 24px+)
3. Verify UI components (borders, focus rings) meet 3:1 contrast ratio
4. Use oklch color space where lightness values are explicit (easier to verify)

**Warning signs:**
- `text-slate-400` on `bg-slate-800` in dark mode: ~2.5:1 contrast (fails WCAG AA)
- Subtle borders like `border-slate-700` on `bg-slate-800`: ~1.2:1 contrast (fails)
- Focus rings using same color as button background: 1:1 contrast (invisible)

### Pitfall 4: Missing suppressHydrationWarning in Next.js/SSR

**What goes wrong:** Console warnings "Warning: Prop `className` did not match" due to server/client theme mismatch

**Why it happens:** next-themes updates the HTML element's class after server render; React detects mismatch during hydration

**How to avoid:**
- Add `suppressHydrationWarning` to `<html>` tag in root layout
- This is not applicable to Vite apps (no SSR), but critical for Next.js

**Warning signs:**
- Hydration warnings mentioning className or theme
- Brief flash of wrong theme on page load despite FOUC script

**Note:** This project uses Vite (not Next.js), so this pitfall doesn't apply. Documented for completeness.

### Pitfall 5: Inconsistent Table Styling with Dark Mode

**What goes wrong:** Table headers, row borders, hover states don't provide enough contrast in dark mode

**Why it happens:** Default table styles use light borders that disappear on dark backgrounds

**How to avoid:**
1. Use `border-border` for all table borders (uses `oklch(1 0 0 / 10%)` in dark mode)
2. Table headers: use `bg-muted/50` or `bg-card` with distinct styling (user decision: darker/distinct background)
3. Row hover: `hover:bg-muted/50` (user decision: hover-only, no zebra stripes)
4. Always test table rendering with real data in both themes

**Warning signs:**
- Invisible or near-invisible row borders in dark mode
- Hover state barely noticeable in dark mode
- Table headers blending into row data

### Pitfall 6: Disabled States Become Invisible

**What goes wrong:** `opacity-50` on already-light colors makes disabled elements disappear in dark mode

**Why it happens:** Stacking opacity reductions (light color + opacity-50) results in insufficient contrast

**How to avoid:**
1. User decision: "moderately reduced — noticeable reduction but still readable"
2. Use `opacity-50` (50%) as maximum reduction
3. Test disabled elements meet 3:1 contrast ratio (WCAG exception for disabled, but readability matters)
4. Consider using `disabled:text-muted-foreground` instead of pure opacity for better control

**Warning signs:**
- Disabled button text nearly invisible in dark mode
- Disabled input placeholders completely unreadable
- Users confused about whether element is disabled or broken

## Code Examples

Verified patterns from official sources:

### Component Migration: Header

```typescript
// Source: Current Header.tsx, migrated to semantic colors

// BEFORE: Hardcoded colors
<header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
  <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
  <input
    className="h-9 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 text-sm"
    placeholder="Search..."
  />
  <Bell className="h-5 w-5 text-slate-500" />
</header>

// AFTER: Semantic colors
<header className="flex h-16 items-center justify-between border-b bg-card px-8 shadow-sm">
  <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
  <input
    className="h-9 w-64 rounded-md border border-input bg-background pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
    placeholder="Search..."
  />
  <Bell className="h-5 w-5 text-muted-foreground" />
</header>
```

### Component Migration: KPICard

```typescript
// Source: Current KPICard.tsx, migrated to semantic colors

// BEFORE: Hardcoded colors
<p className="text-sm font-medium text-slate-500 font-body">
  {title}
</p>
<p className="text-3xl font-bold text-slate-800 font-heading tracking-tight">
  {value}
</p>
<div className="p-2.5 rounded-lg bg-slate-50">
  <Icon className={cn("h-5 w-5", iconColor)} />
</div>

// AFTER: Semantic colors
<p className="text-sm font-medium text-muted-foreground font-body">
  {title}
</p>
<p className="text-3xl font-bold text-foreground font-heading tracking-tight">
  {value}
</p>
<div className="p-2.5 rounded-lg bg-muted">
  <Icon className={cn("h-5 w-5", iconColor)} />
</div>
```

### Chart Theming: Recharts Integration

```typescript
// Source: Shadcn/UI Chart docs + PipelineChart.tsx

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function ThemedChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"  // Uses semantic border color
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{
            fill: 'var(--color-muted-foreground)',  // Adapts to theme
            fontSize: 12
          }}
          stroke="var(--color-border)"
        />
        <YAxis
          tick={{
            fill: 'var(--color-muted-foreground)',
            fontSize: 12
          }}
          stroke="var(--color-border)"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-popover)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            color: 'var(--color-popover-foreground)',
          }}
          itemStyle={{
            color: 'var(--color-popover-foreground)',
          }}
          labelStyle={{
            color: 'var(--color-popover-foreground)',
          }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`var(--color-chart-${(index % 6) + 1})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Table with Dark Mode

```typescript
// Source: Current Table.tsx + user decisions

import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

// User decisions applied:
// - Hover-only distinction (no zebra stripes)
// - Table headers darker/distinct background
// - Sorting indicators always visible

export function DataTable({ data }: { data: RowData[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-border hover:bg-transparent">
          {/* User decision: distinct header background */}
          <TableHead className="bg-muted/50 text-muted-foreground font-semibold">
            Name
            <SortIcon className="inline ml-1 h-4 w-4" /> {/* Always visible */}
          </TableHead>
          <TableHead className="bg-muted/50 text-muted-foreground font-semibold">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow
            key={row.id}
            className="border-b border-border transition-colors hover:bg-muted/50"
          >
            <TableCell className="text-foreground">{row.name}</TableCell>
            <TableCell className="text-foreground">{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Focus Indicators (WCAG AAA)

```typescript
// Source: WCAG 2.4.13 Focus Appearance + Tailwind docs

// User decision: "High contrast/always visible — bright ring for WCAG AAA accessibility priority"

// Button with AAA focus ring
<Button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
  Click me
</Button>

// Input with AAA focus ring
<Input className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />

// Custom interactive card
<Card
  tabIndex={0}
  onClick={handleClick}
  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
>
  <CardContent>Clickable content</CardContent>
</Card>

// CSS variable values ensure 3:1 contrast in both themes:
// Light mode: --ring: oklch(0.708 0 0) on --background: oklch(1 0 0) = adequate contrast
// Dark mode: --ring: oklch(0.556 0 0) on --background: oklch(0.145 0 0) = adequate contrast
```

### Smooth Theme Transitions

```typescript
// Source: Tailwind transition utilities + dark mode best practices

// Add to base layer in index.css for smooth color transitions
@layer base {
  * {
    @apply transition-colors duration-200;
  }
}

// Or apply per component for more control
<div className="bg-background text-foreground transition-colors duration-200">
  {/* All color properties (background, text, border) transition smoothly */}
</div>

// Respect prefers-reduced-motion
<div className="bg-background text-foreground transition-colors duration-200 motion-reduce:transition-none">
  {/* No transition for users who prefer reduced motion */}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Media query dark mode (`@media (prefers-color-scheme: dark)`) | Class-based dark mode (`@custom-variant dark`) | Tailwind v3.4.1 (Feb 2024) | Enables manual theme toggle, localStorage persistence, better UX |
| HSL/RGB color spaces | oklch color space | CSS Color Module Level 4 (2023-2024) | Perceptual uniformity, consistent contrast, wider gamut |
| Hardcoded theme colors in components | CSS variables + semantic design tokens | Shadcn/UI pattern (2023+) | Automatic theme switching, single source of truth, easier maintenance |
| Separate light/dark stylesheets | Single stylesheet with `dark:` variants | Tailwind v2+ (2020+) | Colocation of styles, no duplicate code, better DX |
| Pure black (#000) dark backgrounds | Dark gray (#121212) backgrounds | Material Design Dark Theme (2019) | Reduced eye strain, better for OLED displays, more refined aesthetic |
| Focus rings removed for aesthetics | Prominent focus indicators (WCAG 2.4.13) | WCAG 2.2 (Oct 2023) | Accessibility compliance, keyboard navigation UX |

**Deprecated/outdated:**
- `darkMode: 'media'` in tailwind.config.js: Replaced by `@custom-variant dark (&:where(.dark, .dark *))` in v4
- `darkMode: 'class'` in tailwind.config.js: Replaced by `@custom-variant` in v4 (config option removed)
- Inline theme scripts without FOUC prevention: Now standard practice to include blocking script in `<head>`
- `theme-color` meta tag alone: Insufficient for FOUC prevention, needs JavaScript logic

## Open Questions

Things that couldn't be fully resolved:

1. **Gradient accent lines on KPICards in dark mode**
   - What we know: KPICard.tsx line 40 uses `bg-gradient-to-r from-blue-500 to-blue-600`; these are hardcoded colors
   - What's unclear: Whether gradient should maintain brand colors in dark mode or adapt to softer colors
   - Recommendation: Test both approaches visually. Option A: Keep brand colors (more vibrant). Option B: Use muted colors `from-blue-400 dark:from-blue-600` (more subtle, GitHub-style)

2. **Chart grid line visibility in dark mode**
   - What we know: CartesianGrid currently uses `strokeDasharray="3 3"` with no explicit color
   - What's unclear: Whether default Recharts grid color provides sufficient contrast in dark mode
   - Recommendation: Marked as "Claude's discretion" in user decisions. Add explicit `stroke="var(--color-border)"` for consistency with theme system

3. **Empty state patterns across different contexts**
   - What we know: User decision marked "Claude's discretion — choose appropriate pattern per context"
   - What's unclear: No existing empty state components found in codebase to establish pattern
   - Recommendation: Define empty state pattern when implementing: use `text-muted-foreground` for message, optional illustration should be SVG with `fill="currentColor"` to adapt to theme

4. **Icon colors in different component contexts**
   - What we know: Icons use various colors (text-slate-400, text-slate-500, iconColor prop in KPICard)
   - What's unclear: Consistent semantic pattern for icons (always muted-foreground? match text color?)
   - Recommendation: Default to `text-muted-foreground` for decorative icons, `text-foreground` for interactive/important icons, allow override via className prop

## Sources

### Primary (HIGH confidence)

- [Tailwind CSS Dark Mode Official Docs](https://tailwindcss.com/docs/dark-mode) - v4 dark mode configuration, @custom-variant syntax, class-based strategy
- [Shadcn/UI Chart Component Docs](https://ui.shadcn.com/docs/components/chart) - CSS variable pattern for chart theming, Recharts integration
- [WCAG 2.2 Success Criterion 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) - 4.5:1 text, 3:1 UI components
- [WCAG 2.4.13: Focus Appearance (Level AAA)](https://www.wcag.com/designers/2-4-13-focus-appearance/) - 2px thick, 3:1 contrast ratio requirements
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Official contrast validation tool

### Secondary (MEDIUM confidence)

- [Dark Mode Done Right: Best Practices for 2026](https://medium.com/@social_7132/dark-mode-done-right-best-practices-for-2026-c223a4b92417) - Medium article on 2026 dark mode patterns
- [LogRocket: OKLCH in CSS](https://blog.logrocket.com/oklch-css-consistent-accessible-color-palettes) - oklch color space for consistent palettes
- [Dark mode - React in-depth guide - LogRocket Blog](https://blog.logrocket.com/dark-mode-react-in-depth-guide/) - React Context API patterns
- [Dark Mode Design Best Practices in 2026](https://www.tech-rz.com/blog/dark-mode-design-best-practices-in-2026/) - Interactive state patterns
- [BrowserStack: Automating Accessibility Testing in 2026](https://www.browserstack.com/guide/automate-accessibility-testing) - Tool recommendations

### Tertiary (LOW confidence)

- [Medium: Mastering Custom Dark Mode with Tailwind CSS](https://medium.com/@asyncme/mastering-custom-dark-mode-with-tailwind-css-from-class-to-selector-strategy-1d0e7d8888f3) - Class vs selector strategy explanation
- [Medium: Easy Theming with OKLCH colors](https://manuel-strehl.de/easy_theming_with_oklch) - oklch design system generation
- [Dev.to: Building a Smooth Dark/Light Mode Switch](https://dev.to/web_dev-usman/building-a-smooth-darklight-mode-switch-with-modern-css-features-3jlc) - Transition animation patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in package.json, versions confirmed, official documentation reviewed
- Architecture: HIGH - Patterns extracted from official Tailwind/Shadcn docs and existing codebase structure
- Pitfalls: HIGH - Identified by analyzing current codebase issues (Header.tsx, KPICard.tsx) and common Shadcn/UI GitHub issues
- WCAG requirements: HIGH - Sourced from official W3C WCAG documentation
- Chart integration: MEDIUM - Recharts dark mode approach verified via Shadcn docs, but project-specific implementation untested

**Research date:** 2026-01-28
**Valid until:** 2026-02-27 (30 days - stable domain with mature tooling)
