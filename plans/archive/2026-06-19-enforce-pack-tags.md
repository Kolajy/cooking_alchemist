# Plan: Enforce Ingredient Pack Tags

We need to ensure all ingredients (starters, unlockables, and discoverable recipes/ingredients) have a valid `pack` property populated (e.g., `"base"` for base elements, or the appropriate pack ID like `"japanese"` for expansion packs), and that these are correctly exported in the game bundle and validated.

## Proposed Changes

### Build Pipeline & Exporter

#### [MODIFY] [export_native_bundle.ts](file:///Users/kolajy/pg/cooking/scripts/export_native_bundle.ts)
Update the exported bundle variables to use the normalized elements from `globalThis` (`globalThis.STARTER_ELEMENTS`, `globalThis.UNLOCKABLE_ELEMENTS`, `globalThis.DISCOVERABLE_ITEMS`) instead of direct raw file imports. This ensures that properties and default `pack: "base"` fields attached during initialization are correctly written to the exported `game_bundle.json`.

---

### Content Validation

#### [MODIFY] [validate_content.ts](file:///Users/kolajy/pg/cooking/web/src/engine/validate_content.ts)
Add a verification check inside the `validateContent` function to verify that:
1. All elements in `globalThis.STARTER_ELEMENTS` have a `pack` property.
2. All elements in `globalThis.UNLOCKABLE_ELEMENTS` have a `pack` property.
3. All elements in the passed-in `discoverableItems` map have a `pack` property.

Ensure the test suite halts and logs an error if any ingredient lacks a pack property.

## Verification Plan

### Automated Tests
- Run `npm run test` inside the `web` directory to trigger the content validation checks.
- Run `npm run test:packs` inside the `web` directory to verify cultural pack isolation and dependency rules.
- Re-run `npm run export-native` to generate updated bundles and verify `"pack": "base"` is successfully exported.
