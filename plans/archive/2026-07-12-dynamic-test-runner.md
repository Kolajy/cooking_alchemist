# Archived Plan - Resolve package.json Merge Conflicts with Dynamic Test Runner

Create a dynamic test runner script to scan and execute test files automatically. This eliminates the need for agents to modify the `test` script list in `web/package.json` every time a new test is added, resolving persistent merge conflicts.

## Target Files
- Create [web/scripts/run_tests.ts](file:///Users/kolajy/pg/games/cooking/web/scripts/run_tests.ts)
- Modify [web/package.json](file:///Users/kolajy/pg/games/cooking/web/package.json)

## Execution Steps
1. Create a script that recursively searches the `src/` directory for any test files matching `.test.ts`, engine validation files (`validate_*.ts`), or engine test scripts (`cli_test.ts`).
2. Run each file sequentially using `execSync` with output logging.
3. Exit with a non-zero code if any test fails.
4. Replace the long sequential command chain in `web/package.json` with a single command calling the new runner: `tsx scripts/run_tests.ts`.
5. Verify test suite execution via `npm run test`.
6. Archive this plan and document it in the index of `plans/README.md`.

## Result
- Successfully created and verified the dynamic test runner.
- Replaced the hardcoded test list in `web/package.json`, preventing git merge conflicts for future test additions.
