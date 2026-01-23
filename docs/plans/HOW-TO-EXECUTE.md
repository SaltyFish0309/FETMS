# How to Execute the Implementation Plan

## 📋 For the Next Agent (Copy & Paste This)

```
I want to implement the global project switching feature.

Plan location: docs/plans/2026-01-23-global-project-switching.md

Please use superpowers:executing-plans to execute this plan task-by-task.

CRITICAL REQUIREMENTS:
1. Strict TDD: RED → GREEN → REFACTOR → COMMIT
2. Stop at each checkpoint to verify all tests pass locally
3. Follow the plan exactly - it provides implementation guidance
4. If same error occurs 5 times, STOP and report issue to user
5. Do not proceed to next iteration until all tests pass

Current branch: feature/global-project-switching
```

## ✅ Prerequisites Checklist

Before starting the new conversation, verify:

- [ ] You're on a clean feature branch:
  ```bash
  git checkout -b feature/global-project-switching
  ```

- [ ] Backend runs without errors:
  ```bash
  npm run server --prefix backend
  ```

- [ ] Frontend runs without errors:
  ```bash
  npm run dev --prefix frontend
  ```

- [ ] All existing tests pass:
  ```bash
  npm test --prefix backend
  npm test --prefix frontend
  ```

- [ ] Git working directory is clean:
  ```bash
  git status
  ```

## 🔄 Checkpoint Protocol

The agent will execute 5 iterations. At each checkpoint:

1. **Agent runs local tests** → Reports results
2. **Agent verifies:** All tests PASS ✅
3. **Agent commits changes** → Local commit only
4. **⏸️ Agent reports:** "Checkpoint [N] complete, all tests passing"
5. **Agent proceeds** → Next iteration automatically

**Error Retry Limit:** If the same error occurs 5 times:
- **Agent STOPS immediately**
- **Reports the error** with possible causes
- **Waits for human** to investigate and fix
- **DO NOT** continue without user intervention

## 📊 Expected Local Tests

Each checkpoint should pass these tests:

| Test Type | Command | Expected Result |
|-----------|---------|-----------------|
| Backend tests | `npm test -- run --prefix backend` | All PASS ✅ |
| Frontend tests | `npm test -- run --prefix frontend` | All PASS ✅ |
| TypeScript | `npx tsc --noEmit` | No errors |
| Lint | `npm run lint --prefix frontend` | No warnings |
| Build | `npm run build --prefix frontend` | Success |

## 🚨 Error Retry Limit

**If same error occurs 5 times:**

1. **Agent STOPS immediately**
2. **Reports error details:**
   - Error message
   - File and line number
   - Stack trace
   - Previous 4 attempts
3. **Lists possible causes:**
   - Missing dependency
   - Configuration issue
   - API breaking change
   - Test environment problem
4. **Waits for user intervention**
5. **DO NOT retry** without user confirmation

**This prevents infinite loops and wasted tokens.**

## 🤝 Multi-Agent Handoff

If you need to switch to another agent (e.g., Gemini via antigravity):

1. **Check current checkpoint** in the plan (1-5)
2. **Verify all tests pass locally**
3. **Note any ongoing issues**
4. **In new agent, provide:**
   ```
   Continue implementing the plan:
   docs/plans/2026-01-23-global-project-switching.md

   Start from: Checkpoint [N] (where N = next checkpoint number)
   Current branch: feature/global-project-switching
   Current status: [Brief summary of what's complete]

   Use superpowers:executing-plans skill.

   Before starting, verify:
   - All tests passing locally (npm test)
   - TypeScript compiles without errors
   - No outstanding error retry count issues
   ```

## 📈 Progress Tracking

| Iteration | Focus | Duration | Test Gate |
|-----------|-------|----------|-----------|
| 1 | Backend API Foundation | 2 days | Backend tests pass |
| 2 | Frontend Global State | 1 day | Frontend tests pass |
| 3 | Page Integration | 3 days | All tests pass |
| 4 | Project CRUD UI | 2 days | All tests + CRUD works |
| 5 | Testing & Verification | 1 day | **FINAL** - All pass |

## 🎯 Final Success Criteria

Before merging to master, ensure:

- [ ] All 5 checkpoints completed
- [ ] All backend tests pass locally
- [ ] All frontend tests pass locally
- [ ] TypeScript compiles (strict mode)
- [ ] ESLint passes (no warnings)
- [ ] Manual QA checklist: All items ✅
- [ ] Production build succeeds
- [ ] No console errors in browser
- [ ] Performance: Project switching < 100ms
- [ ] No error retry limit reached (< 5 retries on any error)

---

**Ready to start?** Copy the message at the top and paste it into a new Claude Code conversation!
