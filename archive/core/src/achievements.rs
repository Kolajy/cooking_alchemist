use std::collections::{HashMap, HashSet};

use crate::progression::ProgressionEngine;
use crate::types::{AchievementDefinition, AchievementRule, GameBundle};

pub struct AchievementEngine {
    definitions: Vec<AchievementDefinition>,
    rules: HashMap<String, AchievementRule>,
}

impl AchievementEngine {
    pub fn new(definitions: Vec<AchievementDefinition>, rules: HashMap<String, AchievementRule>) -> Self {
        Self { definitions, rules }
    }

    pub fn from_bundle(bundle: &GameBundle) -> Self {
        Self::new(bundle.achievements.clone(), bundle.achievement_rules.clone())
    }

    pub fn definitions(&self) -> &[AchievementDefinition] {
        &self.definitions
    }

    pub fn pending_unlocks(
        &self,
        bundle: &GameBundle,
        progression: &mut ProgressionEngine,
        discovered: &HashSet<String>,
        discovery_log_len: usize,
        flags: &HashSet<String>,
        unlocked: &HashSet<String>,
    ) -> Vec<String> {
        let mut pending = Vec::new();
        for def in &self.definitions {
            if unlocked.contains(&def.id) {
                continue;
            }
            let Some(rule) = self.rules.get(&def.id) else {
                continue;
            };
            if Self::evaluate_rule(
                rule,
                bundle,
                progression,
                discovered,
                discovery_log_len,
                flags,
            ) {
                pending.push(def.id.clone());
            }
        }
        pending
    }

    fn evaluate_rule(
        rule: &AchievementRule,
        bundle: &GameBundle,
        progression: &mut ProgressionEngine,
        discovered: &HashSet<String>,
        discovery_log_len: usize,
        flags: &HashSet<String>,
    ) -> bool {
        match rule {
            AchievementRule::RawDiscoveries { min } => {
                Self::count_raw(bundle, discovered) >= *min
            }
            AchievementRule::RecipeDiscoveries { min } => {
                Self::count_recipes(bundle, discovered) >= *min
            }
            AchievementRule::NonPrimitiveDiscoveries { min } => {
                Self::count_non_primitive(bundle, discovered) >= *min
            }
            AchievementRule::MapComplete => {
                let total = bundle.discoverable.len();
                let count = discovered
                    .iter()
                    .filter(|id| bundle.discoverable.contains_key(*id))
                    .count();
                total > 0 && count >= total
            }
            AchievementRule::SkillUnlocked { skill_id } => progression.is_unlocked(skill_id),
            AchievementRule::ActionUnlocked { action_id } => {
                Self::is_player_action_unlocked(bundle, progression, discovered, action_id)
            }
            AchievementRule::TotalXp { min } => progression.total_xp() >= *min,
            AchievementRule::SkillXp { skill_id, min } => progression.get_xp(skill_id) >= *min,
            AchievementRule::Flag { flag } => flags.contains(flag),
            AchievementRule::JournalEntries { min } => discovery_log_len >= *min as usize,
        }
    }

    fn count_raw(bundle: &GameBundle, discovered: &HashSet<String>) -> u32 {
        discovered
            .iter()
            .filter(|id| {
                bundle
                    .discoverable
                    .get(*id)
                    .is_some_and(|item| item.origin.as_deref() == Some("raw"))
            })
            .count() as u32
    }

    fn count_recipes(bundle: &GameBundle, discovered: &HashSet<String>) -> u32 {
        discovered
            .iter()
            .filter(|id| {
                bundle
                    .discoverable
                    .get(*id)
                    .is_some_and(|item| item.is_recipe())
            })
            .count() as u32
    }

    fn count_non_primitive(bundle: &GameBundle, discovered: &HashSet<String>) -> u32 {
        discovered
            .iter()
            .filter(|id| {
                !bundle.primitive_ids.contains(*id) && bundle.discoverable.contains_key(*id)
            })
            .count() as u32
    }

    fn is_player_action_unlocked(
        bundle: &GameBundle,
        progression: &mut ProgressionEngine,
        discovered: &HashSet<String>,
        action_id: &str,
    ) -> bool {
        let Some(action) = bundle.progression.player_actions.get(action_id) else {
            return true;
        };
        let Some(criteria) = &action.unlock_criteria else {
            return true;
        };
        if let Some(needed) = criteria.discovered_recipes {
            let count = discovered
                .iter()
                .filter(|id| {
                    bundle
                        .discoverable
                        .get(*id)
                        .is_some_and(|item| item.is_recipe())
                })
                .count() as u32;
            return count >= needed;
        }
        let _ = progression;
        true
    }
}
