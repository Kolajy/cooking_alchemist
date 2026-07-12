# Archived Plan - Add Jules Task for Repository Cleanup

Create a new Google Labs Jules task/session to automatically clean up the project of obsolete code and unused files.

## Target Files/Scope
- Create a new Jules task session via the `jules new` CLI command.
- Define a comprehensive task prompt targeting:
  - Unused script files in the root (e.g., `test_btn.py`, `test_focus.js`).
  - Redundant config files (e.g., duplicate `steam_appid.txt` in the root).
  - Unused imports, dead code, or redundant helpers.

## Execution Steps
1. Write the active plan.
2. Execute the `jules new` command with the cleanup task description.
3. Verify that the task is successfully registered in the remote Jules session list.
4. Archive this plan and document it in the index of `plans/README.md`.

## Result
- Successfully identified why `jules new` got stuck (due to missing `--repo` flag and blocking standard input `stdin` read when run autonomously).
- Discovered correct flags and stdin redirection (`< /dev/null`) to run it without getting stuck.
- Successfully kicked off the cleanup task: Session ID `2795386594715681777` created.
- Updated `AGENTS.md` with guidelines on how to run Jules tasks autonomously without getting stuck.
