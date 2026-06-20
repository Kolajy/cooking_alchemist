import type { RawTransition, TransitionIndex } from "../types";
import type { RawTransition as ExportedTransition } from "./types";

function combineKey(inputIds: string[]): string {
  return [...inputIds].sort().join(",");
}

/** Build the same transition index native clients use, from exported transitions.json. */
export function buildIndexFromExported(raw: ExportedTransition[]): TransitionIndex {
  const byTechnique: TransitionIndex["byTechnique"] = {};
  const byCombine: TransitionIndex["byCombine"] = {};

  for (const t of raw) {
    if (t.kind === "technique" && t.input) {
      const transition = {
        id: t.id,
        kind: "technique" as const,
        tools: t.tools,
        input: t.input,
        outputs: t.outputs.length ? t.outputs : [t.resultItemId],
        onePerAction: t.onePerAction,
        resultItemId: t.resultItemId,
        recipe: { input: t.input, tools: t.tools, outputs: t.outputs }
      };
      for (const tool of t.tools) {
        if (!byTechnique[tool]) byTechnique[tool] = {};
        byTechnique[tool][t.input] = transition;
      }
    } else if (t.kind === "combine" && t.inputs.length > 0) {
      const key = combineKey(t.inputs);
      byCombine[key] = {
        id: t.id,
        kind: "combine",
        inputs: [...t.inputs],
        outputs: [t.resultItemId],
        resultItemId: t.resultItemId,
        recipe: { inputs: t.inputs }
      };
    }
  }

  const techniqueTransitions = Object.values(byTechnique).flatMap(m => Object.values(m));
  const combineTransitions = Object.values(byCombine);

  return {
    techniqueTransitions,
    combineTransitions,
    byTechnique,
    byCombine,
    affectableByTechnique: {},
    all: [...techniqueTransitions, ...combineTransitions] as RawTransition[],
    graphEdges: [],
    getTechniqueTransition(toolId: string, inputId: string) {
      return byTechnique[toolId]?.[inputId] || null;
    },
    getCombineTransition(inputIds: string[]) {
      return byCombine[combineKey(inputIds)] || null;
    },
    getAffectableInputs(toolId: string) {
      return byTechnique[toolId] ? Object.keys(byTechnique[toolId]) : [];
    },
    listTechniqueTransitions(toolId: string) {
      const byInput = byTechnique[toolId];
      if (!byInput) return [];
      return Object.values(byInput);
    },
    getTechniqueItemMap() {
      const map: Record<string, string[]> = {};
      for (const [tool, byInput] of Object.entries(byTechnique)) {
        map[tool] = Object.keys(byInput).sort();
      }
      return map;
    },
    toGraphEdges() {
      return [];
    }
  };
}
