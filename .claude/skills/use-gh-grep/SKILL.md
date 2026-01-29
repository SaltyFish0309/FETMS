---
name: use-gh-grep
description: Searches over 1 million public GitHub repositories via the Vercel Grep MCP. Use to find real-world code examples, production architectural patterns, or to see how other developers handle specific edge cases and error handling in popular libraries.
---

# use-gh-grep

## How to invoke this skill?
When you are unsure how to do something, use `gh_grep` to search code examples from GitHub.

## What is Grep by Vercel?
Grep by Vercel is an MCP server that serves as a high-speed code search engine across a massive index of public GitHub repositories. Unlike a standard search engine, it allows for exact string matching and regular expression queries, helping AI agents find "living code" examples that go beyond static documentation.

## When to use this skill?
The AI should invoke this skill in the following scenarios:
- **Missing Documentation Examples:** When official docs are sparse and you need to see how a specific function is used in production.
- **Architectural Pattern Discovery:** To find out "What is the standard way to structure a [Redux/FastAPI/Next.js] project?" by looking at top-rated repos.
- **Error Handling Archaeology:** When debugging a cryptic error message from a third-party library to see how others have caught and handled it.
- **Migration Reference:** To see how teams have handled major version upgrades (e.g., "Find examples of migrating from Tailwind v3 to v4").
- **Regex-Based Code Discovery:** When looking for specific patterns, such as "all implementations of an auth middleware using a specific JWT library."

## Implementation Guidelines
1. **Define the Query:** Use the `searchGitHub` tool with a specific code snippet or regex pattern.
2. **Filter by Language:** Always specify the `language` parameter (e.g., `["TypeScript", "Rust"]`) to reduce noise.
3. **Analyze Snippets:** Examine the returned code context (lines before/after the match) to understand the logic flow.
4. **Source Attribution:** When suggesting a pattern found via Grep, mention that it is a "production pattern found in public repositories" for transparency.