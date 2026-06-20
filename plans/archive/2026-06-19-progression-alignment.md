# Plan: Align Skill Progression with Culinary Discovery (Archived)

We updated the technique dependencies and unlock criteria to follow a historically and logically natural path of discovery (from early fire/novice prep to modern precision/pro chef techniques) and removed unused nodes.

## 1. Proposed Changes

### [MODIFY] [progression_config.ts](file:///Users/kolajy/pg/cooking/content/progression_config.ts)
- **Smash Category (Force Mode)**:
  - Reorder the progression path: `smash` -> `pound` -> `grind` -> `press` -> `knead` -> `emulsify`.
  - Update `dependsOn`, `leadsTo`, and prerequisites accordingly.
- **Tear & Cut Category (Separate Mode)**:
  - Remove unused intermediate nodes: `structured_tear` and `chunking`.
  - Simplify path: `tear` -> `cutting` -> `slicing` -> `dicing` -> `julienne`.
  - Update dependencies and prerequisites.

## 2. Verification Plan

### Automated Tests
- Run `npm test` and `npm run export-native` to verify.
