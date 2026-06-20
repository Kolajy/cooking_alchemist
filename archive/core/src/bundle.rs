use crate::types::*;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::Path;

fn combine_key(input_ids: &[String]) -> String {
    let mut sorted = input_ids.to_vec();
    sorted.sort();
    sorted.join(",")
}

fn build_index(raw: &[RawTransition]) -> TransitionIndex {
    let mut by_technique: HashMap<String, HashMap<String, TechniqueTransition>> = HashMap::new();
    let mut by_combine: HashMap<String, CombineTransition> = HashMap::new();

    for t in raw {
        if t.kind == "technique" {
            let input = match &t.input {
                Some(i) => i.clone(),
                None => continue,
            };
            let transition = TechniqueTransition {
                tools: t.tools.clone(),
                input: input.clone(),
                outputs: t.outputs.clone(),
                one_per_action: t.one_per_action,
                result_item_id: t.result_item_id.clone(),
            };
            for tool in &t.tools {
                by_technique
                    .entry(tool.clone())
                    .or_default()
                    .insert(input.clone(), transition.clone());
            }
        } else if t.kind == "combine" && !t.inputs.is_empty() {
            let key = combine_key(&t.inputs);
            by_combine.insert(
                key,
                CombineTransition {
                    inputs: t.inputs.clone(),
                    result_item_id: t.result_item_id.clone(),
                },
            );
        }
    }

    TransitionIndex {
        by_technique,
        by_combine,
    }
}

impl GameBundle {
    pub fn load(dir: &Path) -> Result<Self, String> {
        let bundle_path = dir.join("game_bundle.json");
        let transitions_path = dir.join("transitions.json");

        let bundle_text = fs::read_to_string(&bundle_path)
            .map_err(|e| format!("read {}: {e}", bundle_path.display()))?;
        let transitions_text = fs::read_to_string(&transitions_path)
            .map_err(|e| format!("read {}: {e}", transitions_path.display()))?;

        Self::from_json(&bundle_text, &transitions_text)
    }

    /// Load from JSON strings — used by WASM, FFI, and web fetch.
    pub fn from_json(bundle_json: &str, transitions_json: &str) -> Result<Self, String> {
        let file: GameBundleFile = serde_json::from_str(bundle_json)
            .map_err(|e| format!("parse game_bundle.json: {e}"))?;
        let raw: Vec<RawTransition> = serde_json::from_str(transitions_json)
            .map_err(|e| format!("parse transitions.json: {e}"))?;

        let mut primitive_ids: HashSet<String> = file.starters.iter().map(|i| i.id.clone()).collect();
        for u in &file.unlockables {
            primitive_ids.insert(u.id.clone());
        }

        Ok(Self {
            starters: file.starters,
            unlockables: file.unlockables,
            discoverable: file.discoverable,
            progression: file.progression,
            achievements: file.achievements,
            achievement_rules: file.achievement_rules,
            index: build_index(&raw),
            primitive_ids,
        })
    }

    pub fn item(&self, id: &str) -> Option<&IngredientItem> {
        self.discoverable.get(id).or_else(|| {
            self.starters
                .iter()
                .find(|i| i.id == id)
                .or_else(|| self.unlockables.iter().find(|i| i.id == id))
        })
    }
}
