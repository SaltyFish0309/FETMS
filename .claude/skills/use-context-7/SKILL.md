---
name: use-context-7
description: Provides up-to-date documentation and code examples for 50,000+ libraries via the Context 7 MCP server. Use when internal knowledge of a library is likely outdated, version-specific syntax is needed, or to prevent API hallucinations.
---

# use-context-7

## How to invoke this skill?
When you need to search docs, use `context7` tools.

## What is Context 7?
Context 7 (by Upstash) is a real-time documentation index that bridges the gap between an LLM's training cutoff and the current state of software. It provides authoritative API references, types, and official code snippets for over 50,000 libraries, ensuring the agent uses the latest stable releases rather than deprecated patterns.

## When to use this skill?
The AI should invoke this skill in the following scenarios:
- **Fast-Moving Tech:** When using frameworks with frequent breaking changes (e.g., Next.js, LangChain, or OpenAI SDKs).
- **Version-Specific Requests:** When a user explicitly mentions a version (e.g., "React 19" or "Tailwind v4").
- **Hallucination Prevention:** Before generating complex boilerplate or configuration for external services (e.g., Stripe, Supabase).
- **Unknown APIs:** When the agent's internal confidence for a library's method signature is low.

## Implementation Guidelines
1. **Identify Library:** Use `resolve-library-id` to find the correct package identifier.
2. **Fetch Context:** Use `query-docs` with the specific topic (e.g., "middleware" or "hooks") to get relevant snippets.
3. **Grounding:** Always prioritize the retrieved documentation over internal weights when generating code.