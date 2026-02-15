# Phase 03: i18n Infrastructure - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Build internationalization foundation for bilingual support (Traditional Chinese and English). Includes language toggle, persistence, and detection. Content translation itself is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Switcher UI & Location
- Design and placement must match the existing "Theme Switcher" implementation.
- Consistent UI pattern (likely dropdown or toggle, same location).

### Missing Translations
- Fallback to English when Traditional Chinese translation is missing.
- No visual warning (red box) needed, just show the English text.

### Date & Number Formatting
- Explicitly out of scope for this phase.
- Use default JavaScript/browser formatting behavior for now.

### Claude's Discretion
- **URL Behavior:** Choose the industry standard/best practice (e.g., path-based routing vs internal state) based on the current architecture.

</decisions>

<specifics>
## Specific Ideas

- "Design it the same way as 'Theme Switcher' does" — strong consistency requirement.

</specifics>

<deferred>
## Deferred Ideas

- Date/Number formatting logic (future phase).

</deferred>

---

*Phase: 03-i18n-infrastructure*
*Context gathered: 2026-01-29*
