# TDD Execution Workflow

Execute tasks using strict Test-Driven Development with CI checkpoints and clean session handoff.

## When to Use This Skill

Use this skill when:
- Implementing new features
- Fixing bugs
- Refactoring code
- Adding any code that needs tests

## Workflow Steps

### 1. Pre-Implementation Checks

**CRITICAL: Create a feature branch if not already on one**
- Never work on `main` or `master` directly
- Command: `git checkout -b feature/<descriptive-name>`
- Verify current branch: `git branch --show-current`

**Read and understand the requirements**
- Read the task description or plan completely
- Identify acceptance criteria
- Note any edge cases or special considerations

### 2. Write Tests FIRST

**NEVER write implementation code before tests**

Test checklist:
- [ ] Write a failing test for the smallest testable behavior
- [ ] Run the test suite to confirm it fails as expected
- [ ] Verify the failure message makes sense

**Test Environment Reminders** (to avoid recurring failures):
- ✅ `window.matchMedia` is already mocked in `frontend/src/test-setup.ts`
- ✅ i18n is already configured with all namespaces
- ✅ ResizeObserver and IntersectionObserver are mocked
- ⚠️ Use **i18n translation keys** in test assertions, NOT hardcoded strings
  - ❌ `expect(screen.getByText('Personal Information'))`
  - ✅ `expect(screen.getByText(t('groups.personalInfo')))`
- ⚠️ JSDOM does NOT support computed styles
  - ❌ Testing `getComputedStyle(element).display`
  - ✅ Testing class names or data attributes
- ⚠️ CSS modules: Use className patterns or data-testid, not specific styles

### 3. Implement Minimum Code

Write the **minimum** code needed to make the test pass:
- No premature optimization
- No extra features
- No "nice to have" additions
- Focus: Make this ONE test green

Run the test to verify it passes:
```bash
# Frontend
cd frontend && npm test -- --run path/to/test.file.tsx

# Backend
cd backend && npm test -- --run path/to/test.file.ts
```

### 4. Run Full CI Pipeline

After each logical unit of work (feature complete, bug fixed, refactor done):

```bash
# Frontend
cd frontend
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
npm test -- --run    # All tests

# Backend
cd backend
npx tsc --noEmit     # TypeScript check
npm test -- --run    # All tests
```

**Do NOT proceed to the next task if CI fails**
- Fix TypeScript errors
- Fix lint warnings
- Fix failing tests
- Run CI again until green

### 5. Commit Changes

Only commit when CI is green:

```bash
git add <specific-files>  # Add specific changed files
git status                # Review what will be committed
git commit -m "[TYPE] Description

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

Commit types: `[FEAT]`, `[FIX]`, `[TEST]`, `[REFACTOR]`, `[DOCS]`, `[CHORE]`

### 6. Document Progress

For multi-task work or before session ends, document progress for seamless handoff:

**Update task tracking** (if using TodoWrite or similar):
- Mark completed subtasks
- Note any blockers or issues
- List what's ready for the next phase

**Create a handoff note** if needed:
```markdown
## Progress Update

### Completed
- [x] Feature X implementation (tests passing, CI green)
- [x] Feature Y implementation (tests passing, CI green)

### In Progress
- [ ] Feature Z (tests written, implementation 50% done)

### Next Steps
1. Complete Feature Z implementation
2. Run integration tests
3. Update documentation

### Notes
- Edge case discovered in Feature Y: <description>
- Dependency on Task #5 completing first
```

## Red-Green-Refactor Cycle

Repeat this cycle for each behavior:

1. 🔴 **RED**: Write a failing test
2. 🟢 **GREEN**: Write minimal code to pass
3. 🔵 **REFACTOR**: Clean up code (if needed)
4. ✅ **CI**: Verify full pipeline is green
5. 💾 **COMMIT**: Save progress

## Common Pitfalls to Avoid

❌ **Starting implementation without tests**
- Always write the test first, even if it feels slower

❌ **Writing tests after implementation**
- This leads to tests that just confirm what the code does, not what it should do

❌ **Skipping CI checks**
- Broken builds accumulate and become harder to fix later

❌ **Using hardcoded strings in test assertions**
- Use i18n keys: tests should fail if translations are missing

❌ **Testing CSS computed styles in JSDOM**
- Test class names, data attributes, or DOM structure instead

❌ **Committing directly to main/master**
- Always use feature branches for code changes

❌ **Large, unfocused commits**
- Commit frequently: one logical unit of work per commit

## Success Criteria

A task is complete when:
- ✅ All tests are written and passing
- ✅ Full CI pipeline is green (typecheck + lint + tests)
- ✅ Code is committed with proper message format
- ✅ Progress is documented for handoff
- ✅ No test environment issues (matchMedia, i18n, etc.)

## Example Session Flow

```
1. Verify/create feature branch
2. Read task: "Add email validation to teacher form"
3. Write test: "should show error for invalid email format"
4. Run test → RED (fails as expected)
5. Implement: Add email validation logic
6. Run test → GREEN (passes)
7. Run full CI → GREEN (all checks pass)
8. Commit: "[FEAT] Add email validation to teacher form"
9. Update progress doc: Mark task complete
10. Ready for next task or session handoff
```

## Integration with Hooks

This project has hooks configured to help enforce TDD:
- **postEdit**: Runs typecheck after file edits
- **preCommit**: Runs lint and tests before commits

If a hook blocks your commit, it's catching an issue that needs fixing before proceeding.

## Resources

- Main test setup: `frontend/src/test-setup.ts` (all mocks configured here)
- Frontend tests: `frontend/src/**/__tests__/**`
- Backend tests: `backend/src/**/__tests__/**`
- CI pipeline commands in `CLAUDE.md`
