use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::achievements::AchievementEngine;
use crate::combination::CombinationEngine;
use crate::progression::ProgressionEngine;
use crate::save::{
    AchievementUnlock, AchievementsSaveData, DiscoverySaveData, GameSaveFile, SAVE_GAME_ID,
    SAVE_VERSION, SaveSettings,
};
use crate::types::{DiscoveryLogEntry, GameBundle, IngredientItem, MatchResult};

pub const MAX_RECENT_DISCOVERIES: usize = 5;

/// Result of applying a combine or technique action through the shared runtime.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ActionResult {
    pub success: bool,
    pub output_ids: Vec<String>,
    pub new_discovery_ids: Vec<String>,
    pub xp_awards: Vec<(String, u32)>,
    pub newly_unlocked_skills: Vec<String>,
    pub new_achievement_ids: Vec<String>,
    pub locked_skill_id: Option<String>,
    pub message: String,
}

/// Cross-platform game state + logic. UI layers (counter layout, filters) stay platform-specific.
pub struct GameRuntime {
    pub bundle: GameBundle,
    pub progression: ProgressionEngine,
    pub achievements: AchievementEngine,
    discovered: HashSet<String>,
    recent: Vec<String>,
    highlights: HashSet<String>,
    discovery_log: Vec<DiscoveryLogEntry>,
    achievement_unlocks: HashMap<String, u64>,
    achievement_flags: HashSet<String>,
    sound_enabled: bool,
}

impl GameRuntime {
    pub fn new(bundle: GameBundle) -> Self {
        let discovered: HashSet<String> = bundle.starters.iter().map(|i| i.id.clone()).collect();
        let progression = ProgressionEngine::new(bundle.progression.clone(), None);
        let achievements = AchievementEngine::from_bundle(&bundle);
        Self {
            bundle,
            progression,
            achievements,
            discovered,
            recent: vec![],
            highlights: HashSet::new(),
            discovery_log: vec![],
            achievement_unlocks: HashMap::new(),
            achievement_flags: HashSet::new(),
            sound_enabled: true,
        }
    }

    pub fn load(dir: &std::path::Path) -> Result<Self, String> {
        Ok(Self::new(GameBundle::load(dir)?))
    }

    pub fn from_json(bundle_json: &str, transitions_json: &str) -> Result<Self, String> {
        Ok(Self::new(GameBundle::from_json(bundle_json, transitions_json)?))
    }

    pub fn bundle(&self) -> &GameBundle {
        &self.bundle
    }

    pub fn progression(&self) -> &ProgressionEngine {
        &self.progression
    }

    pub fn progression_mut(&mut self) -> &mut ProgressionEngine {
        &mut self.progression
    }

    pub fn discovered(&self) -> &HashSet<String> {
        &self.discovered
    }

    pub fn recent(&self) -> &[String] {
        &self.recent
    }

    pub fn discovery_log(&self) -> &[DiscoveryLogEntry] {
        &self.discovery_log
    }

    pub fn achievement_unlocks(&self) -> &HashMap<String, u64> {
        &self.achievement_unlocks
    }

    pub fn achievement_flags(&self) -> &HashSet<String> {
        &self.achievement_flags
    }

    pub fn set_achievement_flag(&mut self, flag: &str) -> Vec<String> {
        if !self.achievement_flags.insert(flag.to_string()) {
            return vec![];
        }
        self.check_achievements()
    }

    fn check_achievements(&mut self) -> Vec<String> {
        let unlocked_set: HashSet<String> = self.achievement_unlocks.keys().cloned().collect();
        let pending = self.achievements.pending_unlocks(
            &self.bundle,
            &mut self.progression,
            &self.discovered,
            self.discovery_log.len(),
            &self.achievement_flags,
            &unlocked_set,
        );
        if pending.is_empty() {
            return pending;
        }
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);
        for id in &pending {
            self.achievement_unlocks.insert(id.clone(), now);
        }
        pending
    }

    pub fn sound_enabled(&self) -> bool {
        self.sound_enabled
    }

    pub fn set_sound_enabled(&mut self, enabled: bool) {
        self.sound_enabled = enabled;
    }

    pub fn item(&self, id: &str) -> Option<&IngredientItem> {
        self.bundle.item(id)
    }

    pub fn discoverable_count(&self) -> usize {
        self.bundle.discoverable.len()
    }

    pub fn discovered_recipe_count(&self) -> u32 {
        self.discovered
            .iter()
            .filter(|id| self.bundle.discoverable.get(*id).is_some_and(|i| i.is_recipe()))
            .count() as u32
    }

    pub fn stats_text(&self) -> String {
        let total = self.bundle.discoverable.len();
        let count = self
            .discovered
            .iter()
            .filter(|id| self.bundle.discoverable.contains_key(*id))
            .count();
        format!("{count} / {total} discovered")
    }

    pub fn is_player_action_unlocked(&self, action_id: &str) -> bool {
        let Some(action) = self.bundle.progression.player_actions.get(action_id) else {
            return true;
        };
        let Some(criteria) = &action.unlock_criteria else {
            return true;
        };
        if let Some(needed) = criteria.discovered_recipes {
            return self.discovered_recipe_count() >= needed;
        }
        true
    }

    pub fn ingredient_state(&self, item: &IngredientItem) -> &'static str {
        let origin = item.origin.as_deref().unwrap_or("processed");
        if origin == "primitive" {
            return "primal";
        }
        if origin == "raw" {
            return "raw";
        }
        if item.is_recipe() && self.discovered.contains(&item.id) {
            return "recipe";
        }
        if self.bundle.discoverable.contains_key(&item.id) && self.discovered.contains(&item.id) {
            return "prepared";
        }
        if origin == "processed" {
            return "prepared";
        }
        "primal"
    }

    /// All pantry item ids the player can place, in stable order.
    pub fn playable_item_ids(&self) -> Vec<String> {
        let mut ids: Vec<String> = self.bundle.starters.iter().map(|i| i.id.clone()).collect();
        for id in &self.discovered {
            if self.bundle.discoverable.contains_key(id) && !ids.contains(id) {
                ids.push(id.clone());
            }
        }
        ids.sort();
        ids
    }

    pub fn match_combine(&self, input_ids: &[String]) -> MatchResult {
        let engine = CombinationEngine::new(&self.bundle.discoverable, &self.bundle.index);
        engine.match_combine(input_ids)
    }

    pub fn match_technique(&mut self, input_id: &str, tool_id: &str) -> MatchResult {
        let engine = CombinationEngine::new(&self.bundle.discoverable, &self.bundle.index);
        let discovered = self.discovered.clone();
        engine.match_technique(input_id, tool_id, &mut self.progression, &discovered)
    }

    pub fn apply_combine(&mut self, id_a: &str, id_b: &str) -> ActionResult {
        let result = self.match_combine(&[id_a.to_string(), id_b.to_string()]);
        if !result.success {
            return ActionResult {
                success: false,
                message: "Those ingredients do not combine.".to_string(),
                ..Default::default()
            };
        }
        let result_id = match result.result_id {
            Some(id) => id,
            None => return ActionResult::default(),
        };
        let is_new = !self.discovered.contains(&result_id);
        let mut xp_awards = vec![("combine".to_string(), 1)];
        let mut newly_unlocked = self.progression.add_xp("combine", 1);
        if is_new {
            newly_unlocked.extend(self.progression.add_xp("separate", 1).into_iter());
            xp_awards.push(("separate".to_string(), 1));
            self.register_discovery(&result_id);
        }
        self.achievement_flags.insert("combine_success".to_string());
        let new_achievement_ids = self.check_achievements();
        ActionResult {
            success: true,
            output_ids: vec![result_id.clone()],
            new_discovery_ids: if is_new { vec![result_id] } else { vec![] },
            xp_awards,
            newly_unlocked_skills: newly_unlocked,
            new_achievement_ids,
            message: String::new(),
            ..Default::default()
        }
    }

    pub fn apply_technique(&mut self, input_id: &str, tool_id: &str) -> ActionResult {
        let result = self.match_technique(input_id, tool_id);
        if let Some(locked) = &result.locked_skill_id {
            return ActionResult {
                success: false,
                locked_skill_id: Some(locked.clone()),
                message: format!("{locked} is locked"),
                ..Default::default()
            };
        }
        if !result.success || result.result_ids.is_empty() {
            return ActionResult {
                success: false,
                message: format!("{tool_id} does not work on {input_id}"),
                ..Default::default()
            };
        }

        let new_ids: Vec<String> = result
            .result_ids
            .iter()
            .filter(|id| !self.discovered.contains(*id))
            .cloned()
            .collect();

        let mut xp_awards = Vec::new();
        let mut newly_unlocked = Vec::new();
        if tool_id != "combine" && tool_id != "separate" {
            newly_unlocked = self.progression.add_xp(tool_id, 1);
            xp_awards.push((tool_id.to_string(), 1));
        }
        if !new_ids.is_empty() {
            newly_unlocked.extend(self.progression.add_xp("separate", 1));
            xp_awards.push(("separate".to_string(), 1));
            for id in &new_ids {
                self.register_discovery(id);
            }
        }

        let new_achievement_ids = self.check_achievements();
        ActionResult {
            success: true,
            output_ids: result.result_ids,
            new_discovery_ids: new_ids,
            xp_awards,
            newly_unlocked_skills: newly_unlocked,
            new_achievement_ids,
            message: String::new(),
            ..Default::default()
        }
    }

    fn register_discovery(&mut self, id: &str) {
        self.discovered.insert(id.to_string());
        self.recent.retain(|r| r != id);
        self.recent.insert(0, id.to_string());
        self.recent.truncate(MAX_RECENT_DISCOVERIES);
        self.highlights.insert(id.to_string());
        if self.bundle.primitive_ids.contains(id) {
            return;
        }
        if self.discovery_log.iter().any(|e| e.id == id) {
            return;
        }
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);
        self.discovery_log.push(DiscoveryLogEntry {
            id: id.to_string(),
            discovered_at: now,
        });
        self.discovery_log.sort_by(|a, b| b.discovered_at.cmp(&a.discovered_at));
    }

    pub fn build_save(&self) -> GameSaveFile {
        GameSaveFile {
            version: SAVE_VERSION,
            game: SAVE_GAME_ID.to_string(),
            exported_at: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_millis() as u64)
                .unwrap_or(0),
            discovery: DiscoverySaveData {
                discovered: self.discovered.iter().cloned().collect(),
                recent: self.recent.clone(),
                highlights: self.highlights.iter().cloned().collect(),
                discovery_log: self.discovery_log.clone(),
            },
            progression: self.progression.state().clone(),
            achievements: AchievementsSaveData {
                unlocked: self
                    .achievement_unlocks
                    .iter()
                    .map(|(id, unlocked_at)| AchievementUnlock {
                        id: id.clone(),
                        unlocked_at: *unlocked_at,
                    })
                    .collect(),
                flags: self.achievement_flags.iter().cloned().collect(),
            },
            settings: SaveSettings {
                sound_enabled: self.sound_enabled,
            },
        }
    }

    pub fn apply_save(&mut self, save: GameSaveFile) -> Result<(), String> {
        self.discovered = save.discovery.discovered.into_iter().collect();
        for starter in &self.bundle.starters {
            self.discovered.insert(starter.id.clone());
        }
        self.recent = save.discovery.recent;
        self.highlights = save.discovery.highlights.into_iter().collect();
        self.discovery_log = save.discovery.discovery_log;
        self.progression.load_state(save.progression);
        self.achievement_unlocks = save
            .achievements
            .unlocked
            .into_iter()
            .map(|entry| (entry.id, entry.unlocked_at))
            .collect();
        self.achievement_flags = save.achievements.flags.into_iter().collect();
        self.sound_enabled = save.settings.sound_enabled;
        Ok(())
    }

    pub fn apply_save_json(&mut self, json: &str) -> Result<(), String> {
        self.apply_save(GameSaveFile::from_json(json)?)
    }

    pub fn reset_to_starters(&mut self) {
        self.discovered = self.bundle.starters.iter().map(|i| i.id.clone()).collect();
        self.recent.clear();
        self.highlights.clear();
        self.discovery_log.clear();
        self.achievement_unlocks.clear();
        self.achievement_flags.clear();
        self.progression = ProgressionEngine::new(self.bundle.progression.clone(), None);
        self.sound_enabled = true;
    }
}
