use crate::types::*;
use std::collections::{HashMap, HashSet};

pub struct ProgressionEngine {
    pub config: ProgressionConfig,
    pub tiers: HashMap<String, TechniqueTier>,
    pub state: ProgressionState,
    action_modes: HashSet<String>,
    unlock_cache: HashMap<String, bool>,
}

impl ProgressionEngine {
    pub fn new(config: ProgressionConfig, initial: Option<ProgressionState>) -> Self {
        let mut state = initial.unwrap_or_default();
        let action_modes: HashSet<String> = config
            .player_actions
            .values()
            .filter_map(|a| a.mode.clone())
            .collect();

        for id in config.techniques.keys() {
            state.xp.entry(id.clone()).or_insert(0);
        }
        for mode in &action_modes {
            state.xp.entry(mode.clone()).or_insert(0);
        }

        let tiers = config.techniques.clone();
        Self {
            config,
            tiers,
            state,
            action_modes,
            unlock_cache: HashMap::new(),
        }
    }

    fn clear_cache(&mut self) {
        self.unlock_cache.clear();
    }

    pub fn get_xp(&self, skill_id: &str) -> u32 {
        *self.state.xp.get(skill_id).unwrap_or(&0)
    }

    pub fn total_xp(&self) -> u32 {
        self.state.xp.values().sum()
    }

    pub fn is_action_mode(&self, skill_id: &str) -> bool {
        self.action_modes.contains(skill_id)
    }

    pub fn is_unlocked(&mut self, skill_id: &str) -> bool {
        if let Some(&cached) = self.unlock_cache.get(skill_id) {
            return cached;
        }

        let Some(skill) = self.tiers.get(skill_id) else {
            self.unlock_cache.insert(skill_id.to_string(), false);
            return false;
        };

        if let Some(criteria) = &skill.unlock_criteria {
            for (parent, &needed) in &criteria.prerequisites {
                if self.get_xp(parent) < needed {
                    self.unlock_cache.insert(skill_id.to_string(), false);
                    return false;
                }
            }
        }

        let depends = skill.depends_on.clone();
        let unlocked = depends.is_empty() || depends.iter().all(|p| self.is_unlocked(p));

        self.unlock_cache.insert(skill_id.to_string(), unlocked);
        unlocked
    }

    pub fn add_xp(&mut self, skill_id: &str, amount: u32) -> Vec<String> {
        let max_exp = if self.config.max_skill_exp == 0 {
            99
        } else {
            self.config.max_skill_exp
        };

        let tier_ids: Vec<String> = self.tiers.keys().cloned().collect();
        let previously_locked: Vec<String> = tier_ids
            .into_iter()
            .filter(|id| !self.is_unlocked(id))
            .collect();

        let entry = self.state.xp.entry(skill_id.to_string()).or_insert(0);
        *entry = (*entry + amount).min(max_exp);
        self.clear_cache();

        previously_locked
            .into_iter()
            .filter(|id| self.is_unlocked(id))
            .collect()
    }

    pub fn get_tool_category(&self, tool_id: &str) -> Option<&str> {
        self.tiers.get(tool_id).map(|t| t.category.as_str())
    }

    pub fn state(&self) -> &ProgressionState {
        &self.state
    }

    pub fn state_mut(&mut self) -> &mut ProgressionState {
        &mut self.state
    }

    pub fn load_state(&mut self, state: ProgressionState) {
        self.state = state;
        for id in self.tiers.keys() {
            self.state.xp.entry(id.clone()).or_insert(0);
        }
        for mode in &self.action_modes {
            self.state.xp.entry(mode.clone()).or_insert(0);
        }
        self.clear_cache();
    }
}
