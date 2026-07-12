# Archived Plan - Exclude node_modules and Git History checks from general scoping

Add strict rules to `AGENTS.md` to prevent agents from scanning `node_modules/` and checking git history/logs casually.

## Execution Steps
1. Update `AGENTS.md` under the "Token Optimization & Project Scoping Rules" section.
2. Archive the plan and update `plans/README.md`.

## Result
- Added rules to `AGENTS.md`:
  - `- **Dependency Exclusions**: NEVER search, grep, list, or read files under `node_modules/` or `.git/` directories.`
  - `- **Git History Scoping**: NEVER run git history/log commands (e.g. `git log`, `git reflog`) casually. Only run git history commands when explicitly required to debug a commit/versioning issue.`
