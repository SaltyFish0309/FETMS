# Phase 4: Content Translation - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Translate all user-facing content to Traditional Chinese. This includes UI elements, navigation, validation messages, and system enums. Infrastructure (i18next) is already in place; this phase focuses on the content itself.

</domain>

<decisions>
## Implementation Decisions

### Tone & Formality
- **Voice:** Modern Professional (standard SaaS style, not overly bureaucratic).
- **Addressing User:** Avoid pronouns where possible (no "你" or "您"). Focus on the action/object.
- **Error Style:** Helpful and actionable (e.g., "Please check the date format") rather than abrupt.
- **Button Labels:** Explicit Verb + Noun (e.g., "Save Profile", "Add Teacher").

### Terminology & Glossary
- **Teacher:** "Foreign English Teacher" (English) / "外籍英語教師" (Chinese).
- **Acronyms:** Use full Chinese term only (e.g., "居留證" for ARC).
- **School:** Use "服務學校" (Service School).
- **App Name:** Show both languages: "FETMS 外籍英語教師管理系統".

### Fallback Behavior
- **Missing Translation:** Show English text seamlessly (no visible "[EN]" tags).
- **Loading State:** Use skeleton loaders while translations fetch.
- **Network Failure:** Show toast notification, then degrade gracefully to English.

### Dynamic Formatting
- **Dates:** Western Year format (2026年) — do NOT use ROC/Minguo year.
- **Names:** Display in database order (do not auto-swap First/Last based on language).
- **Numbers:** Standard numerals (1,234), avoid Chinese units like "萬".

### Claude's Discretion
- Exact wording of generic UI strings (Save, Cancel, Edit).
- Placement of loading skeletons.

</decisions>

<specifics>
## Specific Ideas

- "Change the English label to 'Foreign English Teacher' to match the Chinese '外籍英語教師'"

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-content-translation*
*Context gathered: 2026-01-29*
