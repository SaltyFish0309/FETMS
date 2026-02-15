# User Preferences Enhancement Design

**Date**: 2026-01-30
**Author**: Claude Code
**Status**: Design Phase

## 1. Background

Previous development left technical debt in the preferences system. This design addresses production-readiness issues identified by the user:

### Issues Identified
1. ~~Language sync across tabs~~ - **RESOLVED, SKIPPED**
2. Animation preference cannot override OS-level `prefers-reduced-motion` setting
3. Display density only affects container spacing, not internal UI elements
4. i18n incomplete: FilterSheet group labels not translated
5. i18n incomplete: Column Visibility group labels not translated
6. i18n bug: School Profile shows raw translation keys for hiring status

## 2. Design Goals

### Functional Requirements
- User preferences must **completely override** OS-level settings
- Display density must affect **all UI elements** uniformly
- All UI text must support **full i18n** (English/Traditional Chinese)
- Translation keys must follow **consistent naming conventions**

### Non-Functional Requirements
- Maintain **TDD workflow** (Red-Green-Refactor)
- Execute **full CI** at each checkpoint (lint, type-check, test, build)
- Optimize **token efficiency** through MCP tools and skill usage
- **Zero regression** on existing features

## 3. Technical Design

### 3.1 Animation Override System

**Problem**: OS `prefers-reduced-motion: reduce` cannot be overridden by user preference.

**Solution**: Use CSS specificity hierarchy with data attributes.

```css
/* Priority 1: Default state */
.element {
  animation: slide 0.3s ease;
  transition: all 0.2s;
}

/* Priority 2: Respect OS setting */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

/* Priority 3: User override (highest) */
[data-reduced-motion="false"] * {
  animation-duration: revert !important;
  transition-duration: revert !important;
}

[data-reduced-motion="true"] * {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
}
```

**Implementation**:
- Modify `frontend/src/index.css` with override rules
- No changes needed in `PreferencesContext.tsx` (already sets `data-reduced-motion`)

### 3.2 Comprehensive Display Density

**Problem**: Density only affects `data-density` attribute but no corresponding CSS variables.

**Solution**: CSS custom properties system with three tiers.

```css
/* frontend/src/index.css */
:root {
  /* Compact (default) */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  --spacing-lg: 1rem;
  --line-height: 1.4;
  --table-row-height: 2.5rem;
  --button-padding-y: 0.375rem;
  --button-padding-x: 0.75rem;
  --input-height: 2.25rem;
  --card-padding: 0.75rem;
  --form-gap: 0.75rem;
}

[data-density="comfortable"] {
  --spacing-xs: 0.375rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --line-height: 1.6;
  --table-row-height: 3rem;
  --button-padding-y: 0.5rem;
  --button-padding-x: 1rem;
  --input-height: 2.5rem;
  --card-padding: 1rem;
  --form-gap: 1rem;
}

[data-density="spacious"] {
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --line-height: 1.8;
  --table-row-height: 3.5rem;
  --button-padding-y: 0.75rem;
  --button-padding-x: 1.5rem;
  --input-height: 2.75rem;
  --card-padding: 1.5rem;
  --form-gap: 1.5rem;
}
```

**Implementation**:
- Update `table.tsx`, `button.tsx`, `card.tsx`, `input.tsx` to use CSS variables
- Apply to: table rows, text line-height, form gaps, button padding, input heights

### 3.3 i18n Group Labels Refactor

**Problem**: `columnDefinitions.ts` has hardcoded group labels (mixed Chinese/English).

```typescript
// Current (BAD)
export const GROUP_LABELS: GroupLabel[] = [
  { id: 'personalInfo', label: '個人基本資訊', ... },
  { id: 'education', label: 'Education', ... },
];
```

**Solution**: Use translation keys.

```typescript
// New (GOOD)
export const GROUP_LABELS: GroupLabel[] = [
  { id: 'personalInfo', labelKey: 'groups.personalInfo', ... },
  { id: 'education', labelKey: 'groups.education', ... },
  { id: 'legalDocs', labelKey: 'groups.legalDocs', ... },
  { id: 'employment', labelKey: 'groups.employment', ... },
];
```

**Translation files** (`frontend/public/locales/{en,zh-TW}/teachers.json`):

```json
{
  "groups": {
    "personalInfo": "Personal Information",
    "education": "Education",
    "legalDocs": "Legal Documents",
    "employment": "Employment"
  }
}
```

**Component updates**:
- `FilterSheet.tsx`: Use `t(group.labelKey)` instead of `group.label`
- `DataTableViewOptions.tsx`: Use `t(group.labelKey)` instead of `group.label`

### 3.4 Column Labels i18n

**Problem**: All column labels in `columnDefinitions.ts` are hardcoded English strings.

**Solution**: Similar to group labels, use translation keys.

```typescript
// Example
{ id: 'hiringStatus', labelKey: 'columns.hiringStatus', ... }
```

This requires updating ~50 columns. All existing column labels already have translations in `teachers.json`.

### 3.5 Status Translation Key Fix

**Problem**: Mismatch between conversion logic and translation keys.

- Database values: `"Newly Hired"`, `"Re-Hired"` (title case, space/hyphen)
- Conversion produces: `enums.status.newly_hired`, `enums.status.re_hired`
- Translation keys are: `enums.status["newly hired"]`, `enums.status["re-hired"]`

**Solution**: Standardize translation keys to use underscores.

**Update translation files**:

```json
{
  "enums": {
    "status": {
      "newly_hired": "Newly Hired",
      "re_hired": "Re-Hired"
    }
  }
}
```

**Keep conversion logic** in `SchoolProfile.tsx`:
```typescript
.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
```

## 4. Task Breakdown

### Task 1: Animation Override (Estimated: 2 hours)
- Write failing test for animation override
- Add CSS override rules to `index.css`
- Verify with both OS settings (reduce/no-preference)

### Task 2: Display Density Variables (Estimated: 4 hours)
- Define CSS variables for all three densities
- Update UI components to use variables
- Write tests for density switching

### Task 3: Group Labels i18n (Estimated: 2 hours)
- Add `groups` section to translation files
- Update `GROUP_LABELS` to use `labelKey`
- Update `FilterSheet` and `DataTableViewOptions`

### Task 4: Column Labels i18n (Estimated: 3 hours)
- Update all 50+ columns to use `labelKey`
- Create helper function for label translation
- Update all consumers of column labels

### Task 5: Status Translation Fix (Estimated: 1 hour)
- Update translation files (underscore keys)
- Test SchoolProfile status display
- Verify in both languages

### Task 6: Integration Testing (Estimated: 3 hours)
- Write integration tests for cross-component interactions
- Write E2E tests for complete user flows
- Full regression testing

**Total Estimated: 15 hours**

## 5. Testing Strategy

### 5.1 Test Pyramid

```
        E2E (6 scenarios)
       /              \
  Integration (12 tests)
    /                    \
Component (30 tests)
  /                          \
Unit (20 tests)
```

### 5.2 TDD Workflow

**Red-Green-Refactor** for each task:
1. Write failing test
2. Minimal implementation to pass
3. Refactor while keeping tests green

### 5.3 Test Coverage by Type

**Unit Tests**:
- `preferencesService.test.ts` - Load/save/validate preferences
- CSS variable calculation tests

**Component Tests**:
- `FilterSheet.test.tsx` - Group label translations
- `DataTableViewOptions.test.tsx` - Column visibility translations
- `SchoolProfile.test.tsx` - Status translation display

**Integration Tests** (Checkpoint 4 only):
- Language switch → All translations update
- Density switch → All UI elements respond
- Animation toggle → System override works

**E2E Tests** (Checkpoint 4 only):
- User flow: Switch language → Adjust density → Toggle animation
- Visual regression: 3 densities × 2 languages = 6 combinations

### 5.4 Checkpoint CI Execution

| Checkpoint | Tasks | Test Scope | CI Commands |
|-----------|-------|------------|-------------|
| CP1 | Task 1-2 | Unit + Component (new) | Lint, Type, Test, Build |
| CP2 | Task 3-4 | Unit + Component (new) | Lint, Type, Test, Build |
| CP3 | Task 5 | Unit + Component (new) | Lint, Type, Test, Build |
| CP4 | Task 6 | **All** + Integration + E2E | Lint, Type, Test, Build |

**Full CI Script**:
```bash
# 1. Lint
npm run lint --prefix frontend
npm run lint --prefix backend

# 2. Type Check
npx tsc --noEmit --project frontend/tsconfig.json
npx tsc --noEmit --project backend/tsconfig.json

# 3. Tests
npm run test --prefix frontend
npm run test --prefix backend

# 4. Build
npm run build --prefix frontend
npm run build --prefix backend
```

## 6. Skills Integration

### Planning Phase
- ✅ `/superpowers:using-superpowers` - Skill discovery
- ✅ `/superpowers:brainstorming` - Requirements analysis

### Implementation Preparation
- `/superpowers:writing-plans` - Detailed implementation plan
- `/superpowers:using-git-worktrees` - Isolated development branch

### Development
- `/superpowers:test-driven-development` - Strict TDD workflow
- `/testing-patterns` - Jest/Vitest patterns
- `/frontend-dev-guidelines` - React/TypeScript standards
- `/react-best-practices` - Performance optimization
- `/react-ui-patterns` - UI state management
- `/typescript-expert` - Type-level problems
- `/clean-code` - Code quality standards
- `/ui-ux-pro-max` - Density adjustment UX design

### MCP Tools
- `/use-context-7` - Query i18next, CSS documentation
- `/use-gh-grep` - Find real-world i18n implementation examples

### Debugging & Validation
- `/superpowers:systematic-debugging` - Bug investigation
- `/superpowers:verification-before-completion` - Pre-completion validation
- `/superpowers:requesting-code-review` - Post-checkpoint review

## 7. Risk Assessment

### Risk 1: CSS Specificity Conflicts
- **Impact**: `!important` may conflict with Tailwind/Shadcn styles
- **Likelihood**: Medium
- **Mitigation**: Centralize overrides in `preferences.css`, test thoroughly

### Risk 2: i18n Refactor Breaking Changes
- **Impact**: Missing translation updates may leave untranslated UI
- **Likelihood**: Low (comprehensive Grep search)
- **Mitigation**: Use Grep to find all `GROUP_LABELS` references

### Risk 3: Translation Key Format Change
- **Impact**: Changing `"re-hired"` → `"re_hired"` may break other components
- **Likelihood**: Low (isolated to status enum)
- **Mitigation**: Global search for `enums.status` usage

### Risk 4: Visual Regression
- **Impact**: Density changes may break layouts
- **Likelihood**: Medium
- **Mitigation**: Visual regression tests, manual QA on all pages

## 8. Token Efficiency Strategy

1. **MCP Tool Usage**: Query once, reuse results
   - Context7: Cache i18next/CSS best practices
   - gh-grep: Save example patterns

2. **Batched Implementation**: Reduce context bloat
   - Complete tasks 1-2 → Commit → Clear context
   - Complete tasks 3-4 → Commit → Clear context

3. **Skill Standardization**: Pre-defined patterns
   - Skills provide templates, avoiding reinvention

## 9. Success Criteria

- [ ] All 6 tasks completed and passing tests
- [ ] Full CI passes at each checkpoint
- [ ] Zero regression on existing features
- [ ] All UI text translates correctly (EN/ZH-TW)
- [ ] Animation preference overrides OS setting
- [ ] Density affects all UI elements uniformly
- [ ] Code review approved

## 10. Next Steps

1. ✅ Write this design document
2. ✅ Commit design document
3. ⬜ Create git worktree for isolated development
4. ⬜ Write detailed implementation plan
5. ⬜ Begin Task 1 (Animation Override) with TDD

---

**Design Approved By**: [Pending User Approval]
