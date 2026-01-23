# How to Execute the Implementation Plan

## 📋 For the Next Agent (Copy & Paste This)

```
I want to implement the global project switching feature.

Plan location: docs/plans/2026-01-23-global-project-switching.md

Please use superpowers:executing-plans to execute this plan task-by-task.

CRITICAL REQUIREMENTS:
1. Strict TDD: RED → GREEN → REFACTOR → COMMIT
2. Stop at each checkpoint to verify GitHub Actions CI is GREEN ✅
3. Follow the plan exactly - it provides implementation guidance
4. Report test coverage at each checkpoint
5. Do not proceed to next iteration until CI passes

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
2. **Agent commits changes** → Pushes to GitHub
3. **⏸️ Agent PAUSES** → Asks you to verify CI
4. **You verify GitHub Actions:**
   - Go to: https://github.com/[your-repo]/actions
   - Check latest run: All jobs should be GREEN ✅
5. **You confirm to agent:** "CI is green, continue to next iteration"
6. **Agent proceeds** → Next iteration

## 📊 Expected CI Jobs

Each checkpoint should pass these jobs:

| Job | What it checks |
|-----|---------------|
| `lint` | ESLint (no warnings) |
| `typecheck` | TypeScript compilation |
| `test-backend` | Backend tests + coverage (> 80%) |
| `test-frontend` | Frontend tests + coverage (> 70%) |
| `build` | Production build succeeds |

## 🚨 If CI Fails

If any job fails:

1. **Agent will see the error** → Analyze the failure
2. **Fix the issue** → May require code changes
3. **Re-run tests locally** → Verify fix
4. **Commit fix** → Push again
5. **Verify CI** → Must be GREEN before continuing

**Do not skip CI verification.** This ensures production readiness at each stage.

## 🤝 Multi-Agent Handoff

If you need to switch to another agent (e.g., Gemini via antigravity):

1. **Check current checkpoint** in the plan (1-5)
2. **Verify all checklist items** are ✅
3. **Ensure CI is GREEN**
4. **In new agent, provide:**
   ```
   Continue implementing the plan:
   docs/plans/2026-01-23-global-project-switching.md

   Start from: Checkpoint [N] (where N = next checkpoint number)
   Current branch: feature/global-project-switching
   Current status: [Brief summary of what's complete]

   Use superpowers:executing-plans skill.

   Before starting, verify:
   - GitHub Actions CI is GREEN
   - All tests passing locally
   - TypeScript compiles without errors
   ```

## 📈 Progress Tracking

| Iteration | Focus | Duration | CI Gate |
|-----------|-------|----------|---------|
| 1 | Backend API Foundation | 2 days | Backend tests + TypeScript |
| 2 | Frontend Global State | 1 day | Frontend tests + Build |
| 3 | Page Integration | 3 days | All tests + Manual QA |
| 4 | Project CRUD UI | 2 days | All tests + CRUD flows |
| 5 | Testing & Verification | 1 day | **FINAL** - All gates |

## 🎯 Final Success Criteria

Before merging to master, ensure:

- [ ] All 5 checkpoints completed
- [ ] GitHub Actions: All jobs GREEN
- [ ] Backend coverage: > 80%
- [ ] Frontend coverage: > 70%
- [ ] Manual QA checklist: All items ✅
- [ ] Production build succeeds
- [ ] No console errors in browser
- [ ] Performance: Project switching < 100ms

---

**Ready to start?** Copy the message at the top and paste it into a new Claude Code conversation!
