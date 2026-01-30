# Phase 5: Preferences System - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can customize font size, display density, and reduced motion preferences with persistence across sessions. This phase builds on top of existing theme (light/dark/system) and language (English/Traditional Chinese) preferences to provide comprehensive user control over display comfort and accessibility.

Scope includes:
- Font size control (Small/Medium/Large)
- Display density control (Compact/Comfortable/Spacious)
- Reduced motion preference toggle
- Persistence mechanism
- Multi-tab synchronization
- Settings UI reorganization

</domain>

<decisions>
## Implementation Decisions

### Storage & persistence strategy
- **localStorage only** (browser-local, no cross-device sync)
- **Show warning toast if corrupted data detected**, then reset to defaults
- User explicitly chose localStorage approach for simplicity and speed - database sync deferred

### Settings UI organization
- **Single scrollable page with sections** (no tabs or accordions)
- **Description text only** below each control (no live previews)
- **Global reset button** that resets ALL preferences to defaults with confirmation

### Preference application scope
- All preferences apply **immediately** through React context (no page refresh required)
- User chose silent sync across tabs - changes apply instantly without notifications

### Multi-tab sync & reactivity
- **Apply immediately (silent sync)** - other tabs update without user notification
- Preference changes propagate instantly to all open tabs
- User explicitly wants seamless cross-tab experience

### Claude's Discretion
- Schema migration approach (version-based vs merge-with-defaults)
- Storage key structure (single key vs multiple keys)
- Typography scaling method (CSS custom properties, Tailwind classes, or root font-size)
- Spacing density implementation (uniform scaling vs targeted components vs CSS custom properties)
- Reduced motion scope (all animations, decorative only, or duration reduction)
- Cross-tab sync mechanism (storage events vs BroadcastChannel)
- Settings page reactivity to external changes
- Race condition handling for rapid multi-tab changes
- Section grouping strategy (by user intent vs feature domain)

</decisions>

<specifics>
## Specific Ideas

- localStorage approach prioritizes simplicity and performance over cross-device sync
- Single scrollable Settings page follows the principle of "everything visible without navigation"
- Silent multi-tab sync creates seamless experience - user shouldn't notice the synchronization happening
- Warning toast for corrupted data respects user's right to know when something went wrong

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope. Database sync for cross-device preferences could be a future enhancement phase if needed.

</deferred>

---

*Phase: 05-preferences-system*
*Context gathered: 2026-01-29*
