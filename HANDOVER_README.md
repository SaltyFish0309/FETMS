# HANDOVER_README.md

## Project Status: "Compliance Gap"

This project is currently being handed over. **The codebase does NOT yet fully match the strictly defined standards in `AGENTS.md`.**

### Your Mission
Your primary goal is not just to "continue coding," but to **refactor and elevate** the existing prototype into the Enterprise-Grade system defined in `AGENTS.md`.

### Immediate Actions Required
1.  **Read `AGENTS.md`**: It is the absolute authority.
2.  **Gap Analysis**:
    - **Testing**: The `AGENTS.md` mandates TDD (Vitest), but the project currently lacks these dependencies. **Step 1 is to install full testing infrastructure.**
    - **Architecture**: Review the Backend. Does it strictly follow Service-Layer separation? If not, refactor Controllers to move logic to Services.
    - **Database**: Review Mongoose models. Ensure indexes and soft-deletes are present.
3.  **Proceed**: Only start adding features once the foundation satisfies `AGENTS.md`.

**To Start:**
1.  **Initialize Git**: `git init` (if this is a fresh copy/v4).
2.  `npm install` (root, frontend, backend).
3.  `npm run dev`.

