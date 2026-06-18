/**
 * Generate human-readable content reference docs from content/ authoring.
 * Output: docs/generated/*.md
 *
 * Run: npm run docs:generate
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import "../content/data/index";
import { PROGRESSION_CONFIG } from "../content/progression_config";
import { buildTransitionIndex } from "../content/data/transitions/index";
import starters from "../content/data/ingredients/starters";
import unlockables from "../content/data/ingredients/unlockables";
import discoverableRecipes from "../content/data/recipes/index";
import type { IngredientItem, TechniqueTier, TransitionIndex } from "../content/types";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const outDir = join(root, "docs", "generated");

mkdirSync(outDir, { recursive: true });

const discoverable = discoverableRecipes as Record<string, IngredientItem>;
const transitionIndex = buildTransitionIndex(discoverable);
const generatedAt = new Date().toISOString().slice(0, 10);

const allItems = new Map<string, IngredientItem>();
for (const item of starters) allItems.set(item.id, item);
for (const item of unlockables as IngredientItem[]) allItems.set(item.id, item);
for (const [id, item] of Object.entries(discoverable)) allItems.set(id, { ...item, id });

function itemLabel(id: string): string {
  const item = allItems.get(id);
  if (!item) return `\`${id}\``;
  return `${item.emoji} ${item.name} (\`${id}\`)`;
}

function formatPrereqs(prereqs: Record<string, number> | undefined): string {
  if (!prereqs || Object.keys(prereqs).length === 0) return "—";
  return Object.entries(prereqs)
    .map(([skill, xp]) => `${skill} ≥ ${xp}`)
    .join(", ");
}

function header(title: string): string {
  return [
    `# ${title}`,
    "",
    `> **Auto-generated** from \`content/\` on ${generatedAt}. Do not edit by hand.`,
    `> Regenerate with \`npm run docs:generate\` after content changes.`,
    ""
  ].join("\n");
}

function writeDoc(filename: string, body: string): void {
  const path = join(outDir, filename);
  writeFileSync(path, body);
  console.log(`→ ${path.replace(root + "/", "")}`);
}

// --- INGREDIENTS ---

function renderIngredients(): string {
  const lines: string[] = [header("Culinary Alchemy — Ingredients")];

  lines.push("## Summary", "");
  lines.push(`| Registry | Count |`);
  lines.push(`|----------|------:|`);
  lines.push(`| Starters (primal) | ${starters.length} |`);
  lines.push(`| Unlockables | ${(unlockables as IngredientItem[]).length} |`);
  lines.push(`| Discoverable | ${Object.keys(discoverable).length} |`);
  const recipeCount = Object.values(discoverable).filter(i => i.type === "recipe").length;
  lines.push(`| Finalized recipes | ${recipeCount} |`);
  lines.push("");

  lines.push("## Starters", "");
  lines.push("Available at game start. All have `origin: primitive`.", "");
  lines.push("| ID | | Name | Category | Description |");
  lines.push("|----|---|------|----------|-------------|");
  for (const item of starters) {
    lines.push(
      `| \`${item.id}\` | ${item.emoji} | ${item.name} | ${item.category ?? "—"} | ${item.description ?? "—"} |`
    );
  }
  lines.push("");

  const unlockableList = unlockables as IngredientItem[];
  lines.push("## Unlockables", "");
  if (unlockableList.length === 0) {
    lines.push("*No milestone-gated primitives configured yet.*", "");
  } else {
    lines.push("| ID | | Name | Category | Description |");
    lines.push("|----|---|------|----------|-------------|");
    for (const item of unlockableList) {
      lines.push(
        `| \`${item.id}\` | ${item.emoji} | ${item.name} | ${item.category ?? "—"} | ${item.description ?? "—"} |`
      );
    }
    lines.push("");
  }

  const byCategory = new Map<string, IngredientItem[]>();
  for (const item of Object.values(discoverable)) {
    const cat = item.category ?? "Uncategorized";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(item);
  }

  lines.push("## Discoverable items", "");
  lines.push("Grouped by cabinet category. `origin` is `raw`, `processed`, or omitted for finalized recipes.", "");
  for (const cat of [...byCategory.keys()].sort()) {
    lines.push(`### ${cat}`, "");
    lines.push("| ID | | Name | Origin | Type | Description |");
    lines.push("|----|---|------|--------|------|-------------|");
    const items = byCategory.get(cat)!.sort((a, b) => a.id.localeCompare(b.id));
    for (const item of items) {
      lines.push(
        `| \`${item.id}\` | ${item.emoji} | ${item.name} | ${item.origin ?? "—"} | ${item.type ?? "ingredient"} | ${item.description ?? "—"} |`
      );
    }
    lines.push("");
  }

  lines.push("## Finalized recipes", "");
  lines.push("Items with `type: recipe` — appear in the recipe book and count toward Transform unlock.", "");
  const recipes = Object.values(discoverable)
    .filter(i => i.type === "recipe")
    .sort((a, b) => a.id.localeCompare(b.id));
  if (recipes.length === 0) {
    lines.push("*None yet.*", "");
  } else {
    for (const item of recipes) {
      lines.push(`### ${item.emoji} ${item.name} (\`${item.id}\`)`, "");
      if (item.description) lines.push(item.description, "");
      if (item.blurb) lines.push(`> ${item.blurb}`, "");
      lines.push("");
    }
  }

  return lines.join("\n");
}

// --- TECHNIQUES ---

function renderSkillRow(skillId: string, skill: TechniqueTier & { category: string }): string[] {
  const unlock =
    skill.unlockCriteria?.prerequisites
      ? formatPrereqs(skill.unlockCriteria.prerequisites)
      : skill.unlockCriteria?.discoveredRecipes
        ? `${skill.unlockCriteria.discoveredRecipes} recipes discovered`
        : skill.dependsOn.length === 0
          ? "Unlocked at start"
          : `After ${skill.dependsOn.join(", ")}`;

  const actions = skill.actions?.length ? skill.actions.map(a => `\`${a}\``).join(", ") : "—";
  const leads = skill.leadsTo?.length ? skill.leadsTo.map(id => `\`${id}\``).join(", ") : "—";

  return [
    `#### ${skill.emoji} ${skill.name} (\`${skillId}\`)`,
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| Category | ${skill.category} |`,
    `| Toolbar actions | ${actions} |`,
    `| Depends on | ${skill.dependsOn?.map(d => `\`${d}\``).join(", ") || "—"} |`,
    `| Leads to | ${leads} |`,
    `| Unlock | ${unlock} |`,
    "",
    skill.desc ? `${skill.desc}` : "",
    ""
  ];
}

function renderTechniques(): string {
  const lines: string[] = [header("Culinary Alchemy — Techniques & Progression")];

  lines.push("## Player toolbar actions", "");
  lines.push("Four top-level methods shown on the counter. Sub-skills come from linked technique categories.", "");
  lines.push("| ID | | Name | Mode / categories | Unlock | Description |");
  lines.push("|----|---|------|-------------------|--------|-------------|");
  for (const [id, action] of Object.entries(PROGRESSION_CONFIG.playerActions)) {
    const cats = action.categories?.map(c => `\`${c}\``).join(", ") ?? "—";
    const mode = action.mode ? `\`${action.mode}\`` : cats;
    const starter = action.starterSkill ? ` (default: \`${action.starterSkill}\`)` : "";
    const unlock = action.unlockCriteria?.discoveredRecipes
      ? `${action.unlockCriteria.discoveredRecipes} recipes discovered`
      : "Always available";
    lines.push(
      `| \`${id}\` | ${action.emoji} | ${action.name} | ${mode}${starter} | ${unlock} | ${action.desc ?? "—"} |`
    );
  }
  lines.push("");

  lines.push("## Technique categories", "");
  lines.push(`Max XP per skill track: **${PROGRESSION_CONFIG.maxSkillExp}**`, "");

  for (const [categoryId, category] of Object.entries(PROGRESSION_CONFIG.techniqueCategories)) {
    lines.push(`### ${category.label} (\`${categoryId}\`)`, "");
    const skillIds = Object.keys(category.techniques);
    for (const skillId of skillIds) {
      const skill = PROGRESSION_CONFIG.techniques[skillId];
      if (skill) lines.push(...renderSkillRow(skillId, skill));
    }
  }

  lines.push("## Action IDs used in recipes", "");
  lines.push("Union of all `actions` arrays across skills — these are the tool ids referenced in recipe transitions.", "");
  const actionIds = new Set<string>();
  for (const skill of Object.values(PROGRESSION_CONFIG.techniques)) {
    for (const action of skill.actions ?? []) actionIds.add(action);
  }
  actionIds.add("separate");
  actionIds.add("combine");
  lines.push([...actionIds].sort().map(id => `\`${id}\``).join(" · "), "");
  lines.push("");

  const usedInContent = collectToolsFromTransitions(transitionIndex);
  const unused = [...actionIds].filter(id => !usedInContent.has(id)).sort();
  const usedOnly = [...usedInContent].filter(id => !actionIds.has(id)).sort();

  lines.push("### Coverage in current content", "");
  lines.push(`| Status | Action IDs |`);
  lines.push(`|--------|------------|`);
  lines.push(`| Used in at least one transition | ${[...usedInContent].sort().map(id => `\`${id}\``).join(", ") || "—"} |`);
  if (unused.length) {
    lines.push(`| Defined in progression, not yet in recipes | ${unused.map(id => `\`${id}\``).join(", ")} |`);
  }
  if (usedOnly.length) {
    lines.push(`| In recipes but not a named skill action | ${usedOnly.map(id => `\`${id}\``).join(", ")} |`);
  }
  lines.push("");

  return lines.join("\n");
}

function collectToolsFromTransitions(index: TransitionIndex): Set<string> {
  const tools = new Set<string>();
  for (const t of index.techniqueTransitions) {
    for (const tool of t.tools) tools.add(tool);
  }
  return tools;
}

// --- TRANSITIONS ---

function renderTransitions(): string {
  const lines: string[] = [header("Culinary Alchemy — Transitions")];

  lines.push("## Summary", "");
  lines.push(`| Kind | Count |`);
  lines.push(`|------|------:|`);
  lines.push(`| Technique | ${transitionIndex.techniqueTransitions.length} |`);
  lines.push(`| Combine | ${transitionIndex.combineTransitions.length} |`);
  lines.push("");

  lines.push("## Technique transitions", "");
  lines.push("Grouped by primary tool. `onePerAction` separation chains yield one undiscovered output per use.", "");

  const byTool = new Map<string, typeof transitionIndex.techniqueTransitions>();
  for (const t of transitionIndex.techniqueTransitions) {
    const tool = t.tools[0] ?? "unknown";
    if (!byTool.has(tool)) byTool.set(tool, []);
    byTool.get(tool)!.push(t);
  }

  for (const tool of [...byTool.keys()].sort()) {
    const transitions = byTool.get(tool)!;
    lines.push(`### \`${tool}\` (${transitions.length})`, "");
    lines.push("| Input | Output(s) | All tools | One per action | Tip |");
    lines.push("|-------|-----------|-----------|----------------|-----|");
    for (const t of transitions.sort((a, b) => a.input.localeCompare(b.input))) {
      const outputs = t.outputs.map(id => itemLabel(id)).join("<br>");
      const tools = t.tools.map(id => `\`${id}\``).join(", ");
      const tip = t.recipe.tip ?? "—";
      lines.push(
        `| ${itemLabel(t.input)} | ${outputs} | ${tools} | ${t.onePerAction ? "yes" : "no"} | ${tip} |`
      );
    }
    lines.push("");
  }

  lines.push("## Combine transitions", "");
  lines.push("Input order is commutative — keys are sorted ingredient ids.", "");
  lines.push("| Inputs | Output | Description |");
  lines.push("|--------|--------|-------------|");
  for (const t of [...transitionIndex.combineTransitions].sort((a, b) =>
    a.inputs.join(",").localeCompare(b.inputs.join(","))
  )) {
    const inputs = t.inputs.map(id => itemLabel(id)).join(" + ");
    const output = itemLabel(t.outputs[0] ?? t.resultItemId);
    const desc = t.recipe.description ?? "—";
    lines.push(`| ${inputs} | ${output} | ${desc} |`);
  }
  lines.push("");

  lines.push("## Vertical slice chains", "");
  lines.push("End-to-end paths currently playable:", "");
  lines.push("```");
  lines.push("tubers --separate--> potato --smash--> mashed_potato");
  lines.push("apple --char--> charred_apple");
  lines.push("seeds + water --combine--> sprouted_seeds");
  lines.push("mashed_potato + charred_apple --combine--> hearth_mash (recipe)");
  lines.push("strawberry + spring_water --combine--> berry_brew (recipe)");
  lines.push("```");
  lines.push("");

  return lines.join("\n");
}

function renderIndex(): string {
  const recipeCount = Object.values(discoverable).filter(i => i.type === "recipe").length;
  const skillCount = Object.keys(PROGRESSION_CONFIG.techniques).length;

  return [
    header("Culinary Alchemy — Content Reference"),
    "Human-readable catalogs of **ingredients**, **techniques**, and **transitions** exported from the shared `content/` package.",
    "",
    "## Generated files",
    "",
    "| Document | Contents |",
    "|----------|----------|",
    "| [INGREDIENTS.md](./INGREDIENTS.md) | Starters, unlockables, discoverable items, finalized recipes |",
    "| [TECHNIQUES.md](./TECHNIQUES.md) | Toolbar actions, skill trees, unlock criteria, action coverage |",
    "| [TRANSITIONS.md](./TRANSITIONS.md) | Technique and combine transitions with inputs/outputs |",
    "",
    "## Snapshot",
    "",
    `| Metric | Value |`,
    `|--------|------:|`,
    `| Starters | ${starters.length} |`,
    `| Discoverable items | ${Object.keys(discoverable).length} |`,
    `| Finalized recipes | ${recipeCount} |`,
    `| Technique skills | ${skillCount} |`,
    `| Technique transitions | ${transitionIndex.techniqueTransitions.length} |`,
    `| Combine transitions | ${transitionIndex.combineTransitions.length} |`,
    "",
    "## Regenerating",
    "",
    "```bash",
    "npm run docs:generate",
    "```",
    "",
    "Run after editing `content/data/` or `content/progression_config.ts`. Optionally run as part of `npm run export-native`.",
    "",
    "## Related docs",
    "",
    "- [DATA_SCHEMA.md](../DATA_SCHEMA.md) — type definitions and save formats",
    "- [RECIPES_REFERENCE.md](../RECIPES_REFERENCE.md) — historical recipe inspiration (not shipped content)",
    "- [content/README.md](../../content/README.md) — authoring workflow",
    ""
  ].join("\n");
}

writeDoc("CONTENT_REFERENCE.md", renderIndex());
writeDoc("INGREDIENTS.md", renderIngredients());
writeDoc("TECHNIQUES.md", renderTechniques());
writeDoc("TRANSITIONS.md", renderTransitions());

console.log("Content reference docs generated.");
