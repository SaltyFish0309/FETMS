# Dashboard UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Completely redesign the Dashboard UI with modern typography (Poppins + Open Sans), cohesive SaaS color palette, consistent spacing, and improved data visualization patterns.

**Architecture:** Component-first approach - update design system tokens first (fonts, colors), then refactor each chart component individually, finally update the main Dashboard layout. All changes follow TDD with visual regression awareness.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Shadcn/UI, Recharts, Vitest

---

## Pre-Implementation Checklist

- [ ] Backup current Dashboard screenshots for comparison
- [ ] Ensure dev server runs without errors
- [ ] Verify test suite passes before changes

---

## Task 1: Add Google Fonts (Poppins + Open Sans)

**Files:**
- Modify: `frontend/index.html:1-15`
- Modify: `frontend/tailwind.config.js:1-12`
- Modify: `frontend/src/index.css:1-50`

**Step 1: Add Google Fonts link to index.html**

Open `frontend/index.html` and add the font import in the `<head>` section:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Step 2: Update Tailwind config with font families**

Replace `frontend/tailwind.config.js` content:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['Poppins', 'sans-serif'],
                body: ['Open Sans', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
```

**Step 3: Update CSS custom properties**

In `frontend/src/index.css`, update the `--font-sans` variable (around line 44):

```css
--font-sans: "Open Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

**Step 4: Verify fonts load**

Run: `npm run dev --prefix frontend`
Expected: Open browser DevTools > Network > Fonts shows Poppins and Open Sans loading

**Step 5: Commit**

```bash
git add frontend/index.html frontend/tailwind.config.js frontend/src/index.css
git commit -m "feat(dashboard): add Poppins and Open Sans fonts"
```

---

## Task 2: Define Design Tokens (Color Palette)

**Files:**
- Modify: `frontend/src/index.css:1-80`

**Step 1: Create design tokens reference**

Add a comment block at the top of `frontend/src/index.css` documenting the new palette:

```css
/*
 * FETMS Design System - Dashboard Color Palette
 *
 * Primary: #2563EB (blue-600) - Brand, primary actions
 * Secondary: #3B82F6 (blue-500) - Secondary elements
 * Accent: #F97316 (orange-500) - Warnings, CTAs
 * Success: #10B981 (emerald-500) - Positive indicators
 *
 * Background: #F8FAFC (slate-50) - Page background
 * Card: #FFFFFF - Card surfaces
 *
 * Text Primary: #1E293B (slate-800)
 * Text Secondary: #64748B (slate-500)
 * Text Muted: #94A3B8 (slate-400)
 *
 * Border: #E2E8F0 (slate-200)
 *
 * Chart Colors (sequential):
 * 1: #2563EB (primary blue)
 * 2: #3B82F6 (light blue)
 * 3: #10B981 (emerald)
 * 4: #F59E0B (amber)
 * 5: #8B5CF6 (violet)
 * 6: #EC4899 (pink)
 */
```

**Step 2: Update CSS variables in :root**

Replace the chart color variables in the `:root` block:

```css
--chart-1: oklch(0.546 0.245 262.881); /* #2563EB - primary blue */
--chart-2: oklch(0.623 0.214 259.815); /* #3B82F6 - light blue */
--chart-3: oklch(0.696 0.17 162.48);   /* #10B981 - emerald */
--chart-4: oklch(0.769 0.188 70.08);   /* #F59E0B - amber */
--chart-5: oklch(0.606 0.25 292.717);  /* #8B5CF6 - violet */
--chart-6: oklch(0.656 0.241 354.308); /* #EC4899 - pink */
```

**Step 3: Update primary color to blue-600**

Update the `--primary` variable to use blue instead of dark gray:

```css
--primary: oklch(0.546 0.245 262.881); /* #2563EB */
--primary-foreground: oklch(0.985 0.002 247.858); /* white text on primary */
```

**Step 4: Verify CSS loads without errors**

Run: `npm run dev --prefix frontend`
Expected: No console errors, page loads normally

**Step 5: Commit**

```bash
git add frontend/src/index.css
git commit -m "feat(dashboard): define new color design tokens"
```

---

## Task 3: Create Chart Color Constants Module

**Files:**
- Create: `frontend/src/components/dashboard/chartColors.ts`
- Test: `frontend/src/components/dashboard/__tests__/chartColors.test.ts`

**Step 1: Write the failing test**

Create `frontend/src/components/dashboard/__tests__/chartColors.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  CHART_COLORS,
  GENDER_COLORS,
  getChartColor,
  getGenderColor
} from '../chartColors'

describe('chartColors', () => {
  describe('CHART_COLORS', () => {
    it('should have exactly 6 colors', () => {
      expect(CHART_COLORS).toHaveLength(6)
    })

    it('should contain valid hex colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/
      CHART_COLORS.forEach(color => {
        expect(color).toMatch(hexRegex)
      })
    })

    it('should start with primary blue', () => {
      expect(CHART_COLORS[0]).toBe('#2563EB')
    })
  })

  describe('getChartColor', () => {
    it('should return color at index', () => {
      expect(getChartColor(0)).toBe('#2563EB')
      expect(getChartColor(2)).toBe('#10B981')
    })

    it('should wrap around when index exceeds length', () => {
      expect(getChartColor(6)).toBe('#2563EB')
      expect(getChartColor(7)).toBe('#3B82F6')
    })
  })

  describe('getGenderColor', () => {
    it('should return blue for male', () => {
      expect(getGenderColor('Male')).toBe('#3B82F6')
      expect(getGenderColor('male')).toBe('#3B82F6')
    })

    it('should return pink for female', () => {
      expect(getGenderColor('Female')).toBe('#EC4899')
      expect(getGenderColor('female')).toBe('#EC4899')
    })

    it('should return slate for unknown', () => {
      expect(getGenderColor('Other')).toBe('#64748B')
      expect(getGenderColor('')).toBe('#64748B')
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run frontend/src/components/dashboard/__tests__/chartColors.test.ts`
Expected: FAIL - Cannot find module '../chartColors'

**Step 3: Write minimal implementation**

Create `frontend/src/components/dashboard/chartColors.ts`:

```typescript
/**
 * FETMS Dashboard Chart Colors
 * Cohesive color palette for all dashboard visualizations
 */

export const CHART_COLORS = [
  '#2563EB', // Primary Blue
  '#3B82F6', // Light Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
] as const

export const GENDER_COLORS = {
  male: '#3B82F6',
  female: '#EC4899',
  other: '#64748B',
} as const

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export function getGenderColor(gender: string): string {
  const g = gender.toLowerCase()
  if (g === 'male') return GENDER_COLORS.male
  if (g === 'female') return GENDER_COLORS.female
  return GENDER_COLORS.other
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run frontend/src/components/dashboard/__tests__/chartColors.test.ts`
Expected: PASS (all 7 tests)

**Step 5: Commit**

```bash
git add frontend/src/components/dashboard/chartColors.ts frontend/src/components/dashboard/__tests__/chartColors.test.ts
git commit -m "feat(dashboard): add unified chart color module with tests"
```

---

## Task 4: Refactor KPICard Component

**Files:**
- Modify: `frontend/src/components/dashboard/KPICard.tsx:1-33`

**Step 1: Read current implementation**

The current KPICard is minimal. We need to enhance it with:
- Poppins font for value
- Gradient accent line
- Improved spacing
- Hover effects

**Step 2: Implement redesigned KPICard**

Replace `frontend/src/components/dashboard/KPICard.tsx`:

```tsx
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: number | string
  icon: LucideIcon
  iconColor?: string
  accentColor?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
}

export function KPICard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-500",
  accentColor = "from-blue-500 to-blue-600",
  trend,
  onClick
}: KPICardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Gradient accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        "bg-gradient-to-r",
        accentColor
      )} />

      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500 font-body">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-800 font-heading tracking-tight">
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-emerald-600" : "text-red-500"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </p>
            )}
          </div>
          <div className={cn(
            "p-2.5 rounded-lg bg-slate-50",
            iconColor
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 3: Verify component renders**

Run: `npm run dev --prefix frontend`
Expected: Dashboard loads, KPI cards display with gradient accent and improved typography

**Step 4: Commit**

```bash
git add frontend/src/components/dashboard/KPICard.tsx
git commit -m "refactor(dashboard): redesign KPICard with gradient accent and improved typography"
```

---

## Task 5: Update Dashboard Page - KPI Section

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx:78-123`

**Step 1: Update KPI card instances with new props**

Find the KPI cards section (around lines 78-123) and update each card:

```tsx
{/* KPI Matrix - 2x2 Grid */}
<div className="grid grid-cols-2 gap-4">
  <KPICard
    title="Total Teachers"
    value={stats?.totalTeachers ?? 0}
    icon={Users}
    iconColor="text-blue-500"
    accentColor="from-blue-500 to-blue-600"
  />
  <KPICard
    title="Partner Schools"
    value={stats?.totalSchools ?? 0}
    icon={School}
    iconColor="text-emerald-500"
    accentColor="from-emerald-500 to-emerald-600"
  />
  <KPICard
    title="In Recruitment"
    value={stats?.inRecruitment ?? 0}
    icon={Briefcase}
    iconColor="text-violet-500"
    accentColor="from-violet-500 to-violet-600"
  />
  <KPICard
    title="Actions Needed"
    value={stats?.actionsNeeded ?? 0}
    icon={AlertTriangle}
    iconColor="text-amber-500"
    accentColor="from-amber-500 to-orange-500"
  />
</div>
```

**Step 2: Remove old border-l-4 conditional styling**

Remove any `border-l-4 border-l-blue-400` or similar classes from the Card wrappers.

**Step 3: Verify renders correctly**

Run: `npm run dev --prefix frontend`
Expected: KPI cards show colorful gradient accents at top

**Step 4: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "refactor(dashboard): update KPI cards with new accent colors"
```

---

## Task 6: Refactor PipelineChart Component

**Files:**
- Modify: `frontend/src/components/dashboard/PipelineChart.tsx:1-53`

**Step 1: Import new color module**

Add import at top:
```tsx
import { CHART_COLORS, getChartColor } from './chartColors'
```

**Step 2: Update bar colors and styling**

Replace the hardcoded `#3b82f6` with `getChartColor()`:

```tsx
<Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28} animationDuration={300}>
  {data.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={entry.fill || getChartColor(index)}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => onClick && onClick(entry)}
    />
  ))}
</Bar>
```

**Step 3: Update CardTitle typography**

```tsx
<CardTitle className="text-lg font-semibold text-slate-800 font-heading">
  Recruitment Pipeline
</CardTitle>
```

**Step 4: Verify chart renders with new colors**

Run: `npm run dev --prefix frontend`
Expected: Pipeline chart bars show blue, light blue, emerald progression

**Step 5: Commit**

```bash
git add frontend/src/components/dashboard/PipelineChart.tsx
git commit -m "refactor(dashboard): update PipelineChart with unified colors"
```

---

## Task 7: Refactor DemographicsChart - Replace Donuts with Horizontal Bars

**Files:**
- Modify: `frontend/src/components/dashboard/DemographicsChart.tsx:1-180`

**Step 1: Import new color module**

Add import:
```tsx
import { getChartColor, getGenderColor } from './chartColors'
```

**Step 2: Replace PieChart with horizontal BarChart for Nationality**

The new design uses horizontal bar charts for better comparison:

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChartColor, getGenderColor } from './chartColors';

interface DemographicsChartProps {
  nationalityData: Array<{ name: string; value: number }>;
  genderData: Array<{ name: string; value: number }>;
  hiringStatusData: Array<{ name: string; value: number }>;
  onClick?: (category: string, name: string) => void;
}

export function DemographicsChart({
  nationalityData,
  genderData,
  hiringStatusData,
  onClick
}: DemographicsChartProps) {
  // Sort nationality by value descending, take top 6
  const sortedNationality = [...nationalityData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Nationality Chart - Horizontal Bars */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800 font-heading">
            Nationality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedNationality}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  animationDuration={300}
                >
                  {sortedNationality.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getChartColor(index)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onClick?.('nationality', sortedNationality[index].name)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gender Chart - Simple Stats */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800 font-heading">
            Gender Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] flex flex-col justify-center space-y-4">
            {genderData.map((item) => {
              const total = genderData.reduce((sum, g) => sum + g.value, 0);
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

              return (
                <div
                  key={item.name}
                  className="cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-colors"
                  onClick={() => onClick?.('gender', item.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getGenderColor(item.name)
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hiring Status Chart - Horizontal Bars */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800 font-heading">
            Hiring Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hiringStatusData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  width={75}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  animationDuration={300}
                >
                  {hiringStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getChartColor(index + 2)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onClick?.('hiringStatus', entry.name)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 3: Verify chart renders**

Run: `npm run dev --prefix frontend`
Expected: Demographics section shows horizontal bars and progress bars instead of donuts

**Step 4: Commit**

```bash
git add frontend/src/components/dashboard/DemographicsChart.tsx
git commit -m "refactor(dashboard): replace donut charts with horizontal bars in DemographicsChart"
```

---

## Task 8: Refactor EducationChart Component

**Files:**
- Modify: `frontend/src/components/dashboard/EducationChart.tsx:1-49`

**Step 1: Import color module**

```tsx
import { getChartColor } from './chartColors'
```

**Step 2: Update colors and typography**

Replace hardcoded `#8884d8`:

```tsx
<Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} animationDuration={300}>
  {data.map((_, index) => (
    <Cell
      key={`cell-${index}`}
      fill={getChartColor(index)}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => onClick && onClick(data[index])}
    />
  ))}
</Bar>
```

Update CardTitle:
```tsx
<CardTitle className="text-base font-semibold text-slate-800 font-heading">
  Education Level
</CardTitle>
```

**Step 3: Commit**

```bash
git add frontend/src/components/dashboard/EducationChart.tsx
git commit -m "refactor(dashboard): update EducationChart with unified colors"
```

---

## Task 9: Refactor SalaryChart Component

**Files:**
- Modify: `frontend/src/components/dashboard/SalaryChart.tsx:1-53`

**Step 1: Import color module**

```tsx
import { getChartColor } from './chartColors'
```

**Step 2: Update bar fill and typography**

Replace hardcoded `#10b981`:

```tsx
<Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32} animationDuration={300}>
  {chartData.map((_, index) => (
    <Cell
      key={`cell-${index}`}
      fill={getChartColor(2)} // Emerald for salary
      className="cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => onClick && onClick(chartData[index])}
    />
  ))}
</Bar>
```

Update CardTitle:
```tsx
<CardTitle className="text-base font-semibold text-slate-800 font-heading">
  Salary Distribution
</CardTitle>
```

**Step 3: Commit**

```bash
git add frontend/src/components/dashboard/SalaryChart.tsx
git commit -m "refactor(dashboard): update SalaryChart with unified colors"
```

---

## Task 10: Refactor SeniorityChart Component

**Files:**
- Modify: `frontend/src/components/dashboard/SeniorityChart.tsx:1-61`

**Step 1: Import color module**

```tsx
import { getChartColor } from './chartColors'
```

**Step 2: Update bar fill and typography**

Replace hardcoded `#0ea5e9`:

```tsx
<Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32} animationDuration={300}>
  {chartData.map((_, index) => (
    <Cell
      key={`cell-${index}`}
      fill={getChartColor(4)} // Violet for seniority
      className="cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => onClick && onClick(chartData[index])}
    />
  ))}
</Bar>
```

Update CardTitle:
```tsx
<CardTitle className="text-base font-semibold text-slate-800 font-heading">
  Years of Experience
</CardTitle>
```

**Step 3: Commit**

```bash
git add frontend/src/components/dashboard/SeniorityChart.tsx
git commit -m "refactor(dashboard): update SeniorityChart with unified colors"
```

---

## Task 11: Update Dashboard Page Layout - Header Section

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx:60-75`

**Step 1: Update page header typography**

Find the header section and update:

```tsx
<div className="space-y-1">
  <h1 className="text-2xl font-semibold tracking-tight text-slate-800 font-heading">
    Dashboard
  </h1>
  <p className="text-sm text-slate-500 font-body">
    Overview of teachers, schools, and recruitment metrics
  </p>
</div>
```

**Step 2: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "refactor(dashboard): update header typography"
```

---

## Task 12: Update Dashboard Page Layout - Analysis Section

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx:125-230`

**Step 1: Simplify the analysis section grid**

Replace complex flex/absolute positioning with CSS Grid:

```tsx
{/* Analysis Section */}
<Card className="border shadow-sm">
  <CardHeader className="border-b bg-slate-50/50">
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold text-slate-800 font-heading">
        Analytics Overview
      </CardTitle>
      {/* Filter badges section - keep existing logic */}
    </div>
  </CardHeader>
  <CardContent className="p-6">
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Main Charts Column - spans 2 columns on xl */}
      <div className="xl:col-span-2 space-y-6">
        {/* Pipeline Chart */}
        <PipelineChart
          data={stats?.pipelineData || []}
          onClick={handlePipelineClick}
        />

        {/* Demographics Row */}
        <DemographicsChart
          nationalityData={stats?.nationalityData || []}
          genderData={stats?.genderData || []}
          hiringStatusData={stats?.hiringStatusData || []}
          onClick={handleDemographicsClick}
        />

        {/* Professional Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EducationChart
            data={stats?.educationData || []}
            onClick={handleEducationClick}
          />
          <SalaryChart
            data={stats?.salaryData || []}
            onClick={handleSalaryClick}
          />
          <SeniorityChart
            data={stats?.seniorityData || []}
            onClick={handleSeniorityClick}
          />
        </div>
      </div>

      {/* Candidate List Sidebar */}
      <div className="xl:col-span-1">
        <CandidateList
          candidates={stats?.qualifiedCandidates || []}
        />
      </div>
    </div>
  </CardContent>
</Card>
```

**Step 2: Remove absolute positioning from CandidateList wrapper**

Delete any `xl:absolute xl:top-0 xl:right-0` classes.

**Step 3: Verify layout**

Run: `npm run dev --prefix frontend`
Expected: Clean grid layout, no overlapping elements, responsive

**Step 4: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "refactor(dashboard): simplify layout with CSS Grid"
```

---

## Task 13: Update CandidateList Styling

**Files:**
- Modify: `frontend/src/components/dashboard/CandidateList.tsx:1-108`

**Step 1: Update typography and colors**

```tsx
<CardTitle className="text-base font-semibold text-slate-800 font-heading">
  Qualified Candidates
</CardTitle>
```

Update list item hover states:
```tsx
className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
```

**Step 2: Commit**

```bash
git add frontend/src/components/dashboard/CandidateList.tsx
git commit -m "refactor(dashboard): update CandidateList typography and hover states"
```

---

## Task 14: Update ExpiryWidget Styling

**Files:**
- Modify: `frontend/src/components/dashboard/ExpiryWidget.tsx:1-122`

**Step 1: Update card title and tab styling**

```tsx
<CardTitle className="text-base font-semibold text-slate-800 font-heading">
  Action Center
</CardTitle>
```

**Step 2: Commit**

```bash
git add frontend/src/components/dashboard/ExpiryWidget.tsx
git commit -m "refactor(dashboard): update ExpiryWidget typography"
```

---

## Task 15: Final Visual QA and Cleanup

**Files:**
- All dashboard files

**Step 1: Run full test suite**

Run: `npm run test --prefix frontend`
Expected: All tests pass

**Step 2: Run build to check for TypeScript errors**

Run: `npm run build --prefix frontend`
Expected: Build succeeds with no errors

**Step 3: Manual visual inspection checklist**

- [ ] Fonts load correctly (Poppins headings, Open Sans body)
- [ ] KPI cards have gradient accents
- [ ] Chart colors are consistent (blue, emerald, violet, amber)
- [ ] No donut charts remain (replaced with horizontal bars)
- [ ] Layout is responsive at 320px, 768px, 1024px, 1440px
- [ ] Hover states work on all interactive elements
- [ ] No console errors

**Step 4: Final commit**

```bash
git add -A
git commit -m "refactor(dashboard): complete UI redesign with new design system"
```

---

## Summary of Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `frontend/index.html` | Modified | Added Google Fonts preconnect and import |
| `frontend/tailwind.config.js` | Modified | Added fontFamily tokens |
| `frontend/src/index.css` | Modified | Updated CSS variables for colors and fonts |
| `frontend/src/components/dashboard/chartColors.ts` | Created | Unified chart color constants |
| `frontend/src/components/dashboard/__tests__/chartColors.test.ts` | Created | Unit tests for color module |
| `frontend/src/components/dashboard/KPICard.tsx` | Modified | Gradient accent, improved typography |
| `frontend/src/components/dashboard/PipelineChart.tsx` | Modified | New colors, typography |
| `frontend/src/components/dashboard/DemographicsChart.tsx` | Modified | Replaced donuts with horizontal bars |
| `frontend/src/components/dashboard/EducationChart.tsx` | Modified | New colors, typography |
| `frontend/src/components/dashboard/SalaryChart.tsx` | Modified | New colors, typography |
| `frontend/src/components/dashboard/SeniorityChart.tsx` | Modified | New colors, typography |
| `frontend/src/components/dashboard/CandidateList.tsx` | Modified | Typography, hover states |
| `frontend/src/components/dashboard/ExpiryWidget.tsx` | Modified | Typography |
| `frontend/src/pages/Dashboard.tsx` | Modified | Layout, KPI props, header typography |

**Total: 14 files, 15 tasks, ~15 commits**
