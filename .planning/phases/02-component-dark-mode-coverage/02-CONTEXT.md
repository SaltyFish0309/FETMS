# Phase 2: Component Dark Mode Coverage - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply dark theme styling systematically across all application components to ensure visual consistency and WCAG AA accessibility in dark mode. This phase takes the infrastructure from Phase 1 and applies it to every UI element, interaction state, and data visualization in the app.

</domain>

<decisions>
## Implementation Decisions

### Visual hierarchy and contrast
- **Surface layers:** Medium contrast (clear but soft) — GitHub-style noticeable difference between page background, cards, and modals without stark separation
- **Borders:** Subtle borders everywhere — thin, low-opacity borders on cards, inputs, tables for gentle definition
- **Text hierarchy:** Claude's discretion — choose opacity levels based on WCAG standards and readability
- **Navigation:** Slightly elevated — header/nav one shade lighter than page background for subtle distinction

### Chart and data visualization
- **Chart colors:** Match current palette — keep existing light mode colors but adjust brightness for dark backgrounds
- **Grid lines/axes:** Claude's discretion — balance readability with visual hierarchy
- **Tooltips/legends:** Claude's discretion — choose for best readability and consistency
- **KPI cards:** Claude's discretion — balance emphasis with visual consistency

### Interactive element states
- **Hover states:** Claude's discretion — balance discoverability with visual polish
- **Focus indicators:** High contrast/always visible — bright ring for WCAG AAA accessibility priority
- **Disabled states:** Moderately reduced — noticeable reduction but still readable
- **Form inputs:** Claude's discretion — follow existing Shadcn/UI patterns

### Tables and data display
- **Row styling:** Hover-only distinction — clean rows until interaction, no zebra striping
- **Table headers:** Darker/distinct background — clear separation from data rows
- **Sorting indicators:** Always visible — sort arrows shown on sortable columns for clear affordance
- **Empty states:** Claude's discretion — choose appropriate pattern per context

### Claude's Discretion
- Text opacity hierarchy (WCAG-compliant)
- Chart grid lines and axes styling
- Chart tooltip and legend presentation
- KPI card emphasis treatment
- Hover state intensity
- Form input background treatment (filled vs outlined)
- Empty state patterns (illustration vs text)

</decisions>

<specifics>
## Specific Ideas

- Navigation should feel like GitHub's dark mode — header slightly elevated but not jarring
- Surface contrast similar to GitHub's approach — clear layers without Material Design's heavy elevation
- Focus rings must be accessibility-first (WCAG AAA) — bright and unmistakable for keyboard users
- Tables should be clean until interaction — hovering reveals active row
- Table headers need clear distinction — not just bold text

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-component-dark-mode-coverage*
*Context gathered: 2026-01-28*
