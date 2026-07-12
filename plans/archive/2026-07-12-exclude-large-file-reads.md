# Archived Plan - Large File Read Exclusions in AGENTS.md

Add strict rules to `AGENTS.md` to prevent agents from casually reading large files (such as `package-lock.json`, `transitions.json`, `game_bundle.json`, or other files > 50KB).

## Execution Steps
1. Update `AGENTS.md` under the "Token Optimization & Project Scoping Rules" section.
2. Archive the plan and update `plans/README.md`.

## Result
- Added the following rule to `AGENTS.md`:
  - `- **Large File Exclusions**: NEVER read or view large files (e.g., `package-lock.json`, `transitions.json`, `game_bundle.json`, or any file > 50KB) casually. Only read or view them if a specific user request or code change explicitly requires it, and always prefer reading specific line ranges or using CLI tools (like `grep` or `jq`) instead of reading the entire file.`
