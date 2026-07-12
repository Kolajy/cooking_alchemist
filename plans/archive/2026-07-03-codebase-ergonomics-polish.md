# Active Plan - Codebase Ergonomics & Refactoring Polish

Perform three key refactoring tasks to improve human readability, navigation, and module cleanliness:
1. Consolidate save-related modules into a single `web/src/game/save/` directory.
2. Replace the legacy `globalThis` runtime boot bridge with a central module-level `bundle_registry.ts`.
3. Convert `ingredient_graph.ts` into a modern ES module with a direct exported rendering function.

## Proposed Changes

### Save Consolidation
- Create [web/src/game/save/](file:///Users/kolajy/pg/cooking/web/src/game/save) folder.
- Move `persistence.ts`, `save-io.ts`, `save-repository.ts`, `save-import.ts`, `save-export.ts`, `slots.ts`, and `save-import.test.ts` into the folder.
- Update internal and external imports to match the new directory structure.
- Update web test runner target in [web/package.json](file:///Users/kolajy/pg/cooking/web/package.json).

### Dismantle globalThis Bridge
- Create [web/src/core/bundle_registry.ts](file:///Users/kolajy/pg/cooking/web/src/core/bundle_registry.ts) to hold runtime shared bundles.
- Update `load_bundle.ts` to write to the bundle registry.
- Refactor `data.ts` to read from the bundle registry instead of using window globals.

### Ingredient Graph Modularization
- Refactor [web/src/ingredient_graph.ts](file:///Users/kolajy/pg/cooking/web/src/ingredient_graph.ts) into an ES module.
- Replace `window.STARTER_ELEMENTS` etc. references with direct imports from `bundle_registry.ts`.
- Export `renderIngredientGraph` directly.
- Update [web/src/game/ui/views.ts](file:///Users/kolajy/pg/cooking/web/src/game/ui/views.ts) to import and call `renderIngredientGraph`.
- Remove side-effect import of `ingredient_graph` in `main.ts`.

---

## Verification Plan

### Automated Tests
- Run `npm test` to verify that all content, validation, and save parsing test modules succeed.
- Run `npm run build` to compile the Vite bundles and ensure no syntax or module import errors exist.
