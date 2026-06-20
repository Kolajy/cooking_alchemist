use crate::progression::ProgressionEngine;
use crate::types::*;
use std::collections::HashMap;
use std::collections::HashSet;

pub struct CombinationEngine<'a> {
    pub items: &'a HashMap<String, IngredientItem>,
    pub index: &'a TransitionIndex,
}

impl<'a> CombinationEngine<'a> {
    pub fn new(items: &'a HashMap<String, IngredientItem>, index: &'a TransitionIndex) -> Self {
        Self { items, index }
    }

    fn combine_key(input_ids: &[String]) -> String {
        let mut sorted = input_ids.to_vec();
        sorted.sort();
        sorted.join(",")
    }

    pub fn match_combine(&self, input_ids: &[String]) -> MatchResult {
        let key = Self::combine_key(input_ids);
        let Some(transition) = self.index.by_combine.get(&key) else {
            return MatchResult {
                success: false,
                result_id: None,
                result_ids: vec![],
                locked_skill_id: None,
            };
        };

        MatchResult {
            success: true,
            result_id: Some(transition.result_item_id.clone()),
            result_ids: vec![transition.result_item_id.clone()],
            locked_skill_id: None,
        }
    }

    pub fn match_technique(
        &self,
        input_id: &str,
        active_skill_id: &str,
        progression: &mut ProgressionEngine,
        discovered: &HashSet<String>,
    ) -> MatchResult {
        let is_action = progression.is_action_mode(active_skill_id);
        let has_skill = progression.tiers.contains_key(active_skill_id);

        if !has_skill && !is_action {
            return MatchResult::fail();
        }

        if has_skill && !progression.is_unlocked(active_skill_id) {
            return MatchResult {
                success: false,
                result_id: None,
                result_ids: vec![],
                locked_skill_id: Some(active_skill_id.to_string()),
            };
        }

        let available: Vec<String> = if is_action {
            vec![active_skill_id.to_string()]
        } else {
            progression
                .tiers
                .get(active_skill_id)
                .map(|s| s.actions.clone())
                .unwrap_or_default()
        };

        for action in &available {
            let Some(by_input) = self.index.by_technique.get(action) else {
                continue;
            };
            let Some(transition) = by_input.get(input_id) else {
                continue;
            };

            let mut output_ids = if transition.outputs.is_empty() {
                vec![transition.result_item_id.clone()]
            } else {
                transition.outputs.clone()
            };

            if transition.one_per_action && output_ids.len() > 1 {
                let undiscovered: Vec<String> = output_ids
                    .iter()
                    .filter(|id| !discovered.contains(*id))
                    .cloned()
                    .collect();
                if undiscovered.is_empty() {
                    return MatchResult::fail();
                }
                output_ids = vec![undiscovered[0].clone()];
            }

            let valid: Vec<String> = output_ids
                .into_iter()
                .filter(|id| self.items.contains_key(id))
                .collect();

            if valid.is_empty() {
                return MatchResult::fail();
            }

            return MatchResult {
                success: true,
                result_id: Some(valid[0].clone()),
                result_ids: valid,
                locked_skill_id: None,
            };
        }

        MatchResult::fail()
    }
}

impl MatchResult {
    fn fail() -> Self {
        Self {
            success: false,
            result_id: None,
            result_ids: vec![],
            locked_skill_id: None,
        }
    }
}
