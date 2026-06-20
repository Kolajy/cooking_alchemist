use std::collections::HashSet;

use culinary_core::{GameBundle, GameRuntime, GameSaveFile, IngredientItem};

use super::save::{load_save_file, save_path, write_save_file};

pub const METHOD_ORDER: [&str; 4] = ["combine", "separate", "force", "change"];

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum SidebarTab {
    Cabinet,
    Skills,
    Journal,
}

#[derive(Clone)]
pub struct CabinetItem {
    pub id: String,
    pub name: String,
    pub emoji: String,
    pub category: String,
    pub state_key: String,
    pub description: String,
    pub is_recent: bool,
}

#[derive(Clone)]
pub struct PendingDiscovery {
    pub item_id: String,
    pub name: String,
    pub emoji: String,
    pub description: String,
    pub blurb: String,
    pub track_id: String,
    pub exp_awarded: u32,
    pub remaining: usize,
}

#[derive(Clone)]
pub struct SkillOption {
    pub id: String,
    pub name: String,
    pub emoji: String,
    pub category: String,
    pub is_action: bool,
}

pub struct GameSession {
    pub runtime: GameRuntime,
    pub counter: Vec<String>,
    pub active_action: String,
    pub active_skill_id: Option<String>,
    pub search_term: String,
    pub state_filter_includes: HashSet<String>,
    pub state_filter_excludes: HashSet<String>,
    pub type_filter_includes: HashSet<String>,
    pub type_filter_excludes: HashSet<String>,
    pub sidebar_tab: SidebarTab,
    pub selected_counter: Option<usize>,
    pub pending_discovery: Option<PendingDiscovery>,
    pub discovery_queue: Vec<PendingDiscovery>,
    pub message: String,
    pub toast: String,
    pub notified_change_unlock: bool,
}

impl GameSession {
    pub fn new(bundle: GameBundle) -> Self {
        let mut runtime = GameRuntime::new(bundle);
        if let Some(path) = save_path() {
            if path.exists() {
                if let Ok(text) = std::fs::read_to_string(&path) {
                    let _ = runtime.apply_save_json(&text);
                }
            }
        }
        let mut session = Self {
            runtime,
            counter: vec![],
            active_action: "move".to_string(),
            active_skill_id: None,
            search_term: String::new(),
            state_filter_includes: HashSet::new(),
            state_filter_excludes: HashSet::new(),
            type_filter_includes: HashSet::new(),
            type_filter_excludes: HashSet::new(),
            sidebar_tab: SidebarTab::Cabinet,
            selected_counter: None,
            pending_discovery: None,
            discovery_queue: vec![],
            message: String::new(),
            toast: String::new(),
            notified_change_unlock: false,
        };
        session.select_method("combine", false);
        session
    }

    pub fn bundle(&self) -> &GameBundle {
        self.runtime.bundle()
    }

    pub fn discovery_log(&self) -> &[culinary_core::DiscoveryLogEntry] {
        self.runtime.discovery_log()
    }

    pub fn sound_enabled(&self) -> bool {
        self.runtime.sound_enabled()
    }

    pub fn set_sound_enabled(&mut self, enabled: bool) {
        self.runtime.set_sound_enabled(enabled);
    }

    pub fn item(&self, id: &str) -> Option<IngredientItem> {
        self.runtime.item(id).cloned()
    }

    pub fn label(&self, id: &str) -> String {
        self.item(id)
            .map(|i| format!("{} {}", i.emoji, i.name))
            .unwrap_or_else(|| id.to_string())
    }

    pub fn discovered_recipe_count(&self) -> u32 {
        self.runtime.discovered_recipe_count()
    }

    pub fn is_player_action_unlocked(&self, action_id: &str) -> bool {
        self.runtime.is_player_action_unlocked(action_id)
    }

    pub fn stats_text(&self) -> String {
        self.runtime.stats_text()
    }

    fn ingredient_state(&self, item: &IngredientItem) -> &'static str {
        self.runtime.ingredient_state(item)
    }

    pub fn cabinet_catalog(&self) -> Vec<CabinetItem> {
        let mut items: Vec<CabinetItem> = Vec::new();
        for starter in &self.bundle().starters {
            items.push(self.to_cabinet_item(starter));
        }
        for id in self.runtime.discovered() {
            if let Some(item) = self.bundle().discoverable.get(id) {
                items.push(self.to_cabinet_item(item));
            }
        }
        items
            .into_iter()
            .filter(|item| self.matches_search(item))
            .filter(|item| self.matches_state_filter(item))
            .filter(|item| self.matches_type_filter(item))
            .collect()
    }

    fn to_cabinet_item(&self, item: &IngredientItem) -> CabinetItem {
        let state_key = self.ingredient_state(item).to_string();
        CabinetItem {
            id: item.id.clone(),
            name: item.name.clone(),
            emoji: item.emoji.clone(),
            category: item.category.clone().unwrap_or_default(),
            description: item
                .description
                .clone()
                .or_else(|| item.tip.clone())
                .or_else(|| item.blurb.clone())
                .unwrap_or_default(),
            state_key,
            is_recent: self.runtime.recent().contains(&item.id),
        }
    }

    fn matches_search(&self, item: &CabinetItem) -> bool {
        let term = self.search_term.trim().to_lowercase();
        if term.is_empty() {
            return true;
        }
        item.name.to_lowercase().contains(&term)
            || item.id.to_lowercase().contains(&term)
            || item.category.to_lowercase().contains(&term)
    }

    fn matches_state_filter(&self, item: &CabinetItem) -> bool {
        if self.state_filter_excludes.contains("recent") && item.is_recent {
            return false;
        }
        if self.state_filter_excludes.contains(&item.state_key) {
            return false;
        }
        if self.state_filter_includes.contains("recent") && !item.is_recent {
            return false;
        }
        let includes: Vec<_> = self
            .state_filter_includes
            .iter()
            .filter(|k| k.as_str() != "recent")
            .collect();
        if !includes.is_empty() && !includes.iter().any(|k| *k == &item.state_key) {
            return false;
        }
        true
    }

    fn matches_type_filter(&self, item: &CabinetItem) -> bool {
        if self.type_filter_excludes.contains(&item.category) {
            return false;
        }
        if !self.type_filter_includes.is_empty() && !self.type_filter_includes.contains(&item.category) {
            return false;
        }
        true
    }

    pub fn ingredient_types(&self) -> Vec<String> {
        let mut types: HashSet<String> = HashSet::new();
        for starter in &self.bundle().starters {
            if let Some(c) = &starter.category {
                types.insert(c.clone());
            }
        }
        for id in self.runtime.discovered() {
            if let Some(item) = self.bundle().discoverable.get(id) {
                if let Some(c) = &item.category {
                    types.insert(c.clone());
                }
            }
        }
        let preferred = ["Liquids", "Produce", "Forage", "Proteins", "Pantry"];
        let mut out: Vec<String> = preferred
            .iter()
            .filter(|t| types.contains(**t))
            .map(|s| s.to_string())
            .collect();
        let mut rest: Vec<String> = types
            .into_iter()
            .filter(|t| !preferred.contains(&t.as_str()))
            .collect();
        rest.sort();
        out.extend(rest);
        out
    }

    pub fn select_method(&mut self, method_id: &str, user_initiated: bool) {
        if !self.is_player_action_unlocked(method_id) {
            self.message = self.method_lock_hint(method_id);
            return;
        }
        self.active_action = if method_id == "combine" || method_id == "separate" {
            method_id.to_string()
        } else if method_id == "force" {
            "smash".to_string()
        } else if method_id == "change" {
            "thermal".to_string()
        } else {
            method_id.to_string()
        };
        self.active_skill_id = self.default_skill_for_method(method_id);
        if user_initiated {
            self.message = format!("Mode: {method_id}");
        }
    }

    pub fn set_move_mode(&mut self) {
        self.active_action = "move".to_string();
        self.active_skill_id = None;
    }

    fn default_skill_for_method(&mut self, method_id: &str) -> Option<String> {
        let starter = self
            .bundle()
            .progression
            .player_actions
            .get(method_id)?
            .starter_skill
            .clone();
        if method_id == "combine" || method_id == "separate" {
            return None;
        }
        if let Some(starter) = starter {
            if self.runtime.progression_mut().is_unlocked(&starter) {
                return Some(starter);
            }
        }
        self.method_skill_options(method_id)
            .first()
            .map(|o| o.id.clone())
    }

    pub fn method_skill_options(&mut self, method_id: &str) -> Vec<SkillOption> {
        let Some(action) = self
            .bundle()
            .progression
            .player_actions
            .get(method_id)
            .cloned()
        else {
            return vec![];
        };
        let mut options = Vec::new();
        if method_id == "combine" || method_id == "separate" {
            options.push(SkillOption {
                id: method_id.to_string(),
                name: action.name.clone(),
                emoji: action.emoji.clone(),
                category: method_id.to_string(),
                is_action: true,
            });
            return options;
        }
        let techniques: Vec<_> = self
            .bundle()
            .progression
            .techniques
            .iter()
            .map(|(id, tier)| (id.clone(), tier.clone()))
            .collect();
        for category in &action.categories {
            for (id, tier) in &techniques {
                if tier.category == *category && self.runtime.progression_mut().is_unlocked(id) {
                    options.push(SkillOption {
                        id: id.clone(),
                        name: tier.name.clone(),
                        emoji: tier.emoji.clone(),
                        category: category.clone(),
                        is_action: false,
                    });
                }
            }
        }
        options
    }

    pub fn method_lock_hint(&self, method_id: &str) -> String {
        let Some(action) = self.bundle().progression.player_actions.get(method_id) else {
            return "Locked".to_string();
        };
        if let Some(needed) = action.unlock_criteria.as_ref().and_then(|c| c.discovered_recipes) {
            let have = self.discovered_recipe_count();
            let remaining = needed.saturating_sub(have);
            return format!(
                "{} unlocks after {} more finalized recipe(s) ({}/{})",
                action.name, remaining, have, needed
            );
        }
        "Locked — keep discovering to unlock.".to_string()
    }

    pub fn active_tool_id(&self) -> String {
        if self.active_action == "combine" || self.active_action == "separate" {
            return self.active_action.clone();
        }
        self.active_skill_id
            .clone()
            .unwrap_or_else(|| "smash".to_string())
    }

    pub fn add_to_counter(&mut self, id: &str) {
        self.counter.push(id.to_string());
        self.selected_counter = None;
    }

    pub fn clear_counter(&mut self) {
        self.counter.clear();
        self.selected_counter = None;
    }

    pub fn remove_from_counter(&mut self, index: usize) {
        if index < self.counter.len() {
            self.counter.remove(index);
            self.selected_counter = None;
        }
    }

    pub fn on_counter_click(&mut self, index: usize) {
        if self.active_action == "move" {
            self.selected_counter = if self.selected_counter == Some(index) {
                None
            } else {
                Some(index)
            };
            return;
        }
        if self.active_action == "combine" {
            if let Some(first) = self.selected_counter {
                if first != index {
                    self.try_combine(first, index);
                    return;
                }
            }
            self.selected_counter = Some(index);
            return;
        }
        self.apply_technique_at(index);
    }

    pub fn apply_action_to_counter(&mut self) -> bool {
        if self.counter.is_empty() {
            return false;
        }
        if self.active_action == "combine" {
            return self.apply_combine_all();
        }
        if self.active_action == "separate" {
            let len = self.counter.len();
            let mut applied = false;
            for i in 0..len {
                if i < self.counter.len() && self.apply_technique_at(i) {
                    applied = true;
                }
            }
            return applied;
        }
        if let Some(skill) = self.active_skill_id.clone() {
            let len = self.counter.len();
            let mut applied = false;
            for i in 0..len {
                if i < self.counter.len() {
                    self.active_skill_id = Some(skill.clone());
                    if self.apply_technique_at(i) {
                        applied = true;
                    }
                }
            }
            return applied;
        }
        false
    }

    fn apply_combine_all(&mut self) -> bool {
        let mut applied = false;
        let mut combined = true;
        while combined {
            combined = false;
            let len = self.counter.len();
            'outer: for i in 0..len {
                for j in (i + 1)..len {
                    if self.try_combine(i, j) {
                        applied = true;
                        combined = true;
                        break 'outer;
                    }
                }
            }
        }
        applied
    }

    pub fn try_combine(&mut self, a: usize, b: usize) -> bool {
        if a == b || a >= self.counter.len() || b >= self.counter.len() {
            return false;
        }
        let id_a = self.counter[a].clone();
        let id_b = self.counter[b].clone();
        let action = self.runtime.apply_combine(&id_a, &id_b);
        if !action.success {
            self.message = action.message;
            self.selected_counter = None;
            return false;
        }
        let result_id = action.output_ids.first().cloned().unwrap_or_default();
        let hi = a.max(b);
        let lo = a.min(b);
        self.counter.remove(hi);
        self.counter.remove(lo);
        self.counter.push(result_id.clone());
        self.selected_counter = None;

        for id in &action.new_discovery_ids {
            self.queue_discovery(id, "combine", 1);
        }
        if action.new_discovery_ids.is_empty() {
            self.message = format!("Combined into {}", self.label(&result_id));
            self.persist();
        }
        self.check_change_unlock();
        true
    }

    pub fn apply_technique_at(&mut self, index: usize) -> bool {
        if index >= self.counter.len() {
            return false;
        }
        let input_id = self.counter[index].clone();
        let tool_id = self.active_tool_id();
        let action = self.runtime.apply_technique(&input_id, &tool_id);

        if let Some(locked) = &action.locked_skill_id {
            self.message = format!("{locked} is locked");
            return false;
        }
        if !action.success || action.output_ids.is_empty() {
            self.message = action.message;
            return false;
        }

        self.counter.remove(index);
        for rid in &action.output_ids {
            self.counter.push(rid.clone());
        }
        self.selected_counter = None;

        for id in &action.new_discovery_ids {
            self.queue_discovery(id, &tool_id, 1);
        }
        if action.new_discovery_ids.is_empty() {
            self.message = format!("Applied {tool_id} to {}", self.label(&input_id));
            self.persist();
        }
        self.check_change_unlock();
        true
    }

    fn queue_discovery(&mut self, id: &str, track_id: &str, exp: u32) {
        if let Some(item) = self.item(id) {
            let blurb = item
                .blurb
                .clone()
                .or(item.tip.clone())
                .or(item.description.clone())
                .unwrap_or_else(|| "Keep experimenting to uncover more secrets.".to_string());
            self.discovery_queue.push(PendingDiscovery {
                item_id: id.to_string(),
                name: item.name.clone(),
                emoji: item.emoji.clone(),
                description: item.description.clone().unwrap_or_default(),
                blurb,
                track_id: track_id.to_string(),
                exp_awarded: exp,
                remaining: 0,
            });
        }
        self.pump_discovery_queue();
        self.persist();
    }

    fn pump_discovery_queue(&mut self) {
        if self.pending_discovery.is_some() {
            return;
        }
        if let Some(mut next) = self.discovery_queue.first().cloned() {
            let remaining = self.discovery_queue.len().saturating_sub(1);
            next.remaining = remaining;
            self.pending_discovery = Some(next);
            self.discovery_queue.remove(0);
        }
    }

    pub fn dismiss_discovery(&mut self) {
        self.pending_discovery = None;
        self.pump_discovery_queue();
    }

    fn check_change_unlock(&mut self) {
        if self.notified_change_unlock {
            return;
        }
        if self.is_player_action_unlocked("change") {
            self.notified_change_unlock = true;
            self.toast = "Transform unlocked — heat and cook ingredients!".to_string();
        }
    }

    pub fn track_exp_summary(&self, track_id: &str) -> (String, u32, u32, f32) {
        let max_exp = if self.bundle().progression.max_skill_exp == 0 {
            99
        } else {
            self.bundle().progression.max_skill_exp
        };
        let current = self.runtime.progression().get_xp(track_id).min(max_exp);
        let label = self
            .bundle()
            .progression
            .techniques
            .get(track_id)
            .map(|t| format!("{} {}", t.emoji, t.name))
            .or_else(|| {
                self.bundle()
                    .progression
                    .player_actions
                    .values()
                    .find(|a| a.mode.as_deref() == Some(track_id))
                    .map(|a| format!("{} {}", a.emoji, a.name))
            })
            .unwrap_or_else(|| track_id.to_string());
        let pct = (current as f32 / max_exp as f32) * 100.0;
        (label, current, max_exp, pct)
    }

    pub fn skill_groups(&mut self) -> Vec<(String, String, Vec<SkillCard>)> {
        let mut groups = Vec::new();
        for method_id in METHOD_ORDER {
            if !self.is_player_action_unlocked(method_id) {
                continue;
            }
            let Some(action) = self.bundle().progression.player_actions.get(method_id) else {
                continue;
            };
            let group_title = format!("{} {}", action.emoji, action.name);
            let mut cards = Vec::new();
            if let Some(mode) = &action.mode {
                let (label, cur, max, pct) = self.track_exp_summary(mode);
                cards.push(SkillCard {
                    title: format!("{label} Practice"),
                    detail: format!("{cur} / {max} exp"),
                    percent: pct,
                    locked: false,
                });
            }
            for opt in self.method_skill_options(method_id) {
                if opt.is_action {
                    continue;
                }
                let locked = !self.runtime.progression_mut().is_unlocked(&opt.id);
                let (cur, max, pct) = if locked {
                    (0, 99, 0.0)
                } else {
                    let (_, c, m, p) = self.track_exp_summary(&opt.id);
                    (c, m, p)
                };
                cards.push(SkillCard {
                    title: format!("{} {}", opt.emoji, opt.name),
                    detail: if locked {
                        "Locked".to_string()
                    } else {
                        format!("{cur} / {max} exp")
                    },
                    percent: pct,
                    locked,
                });
            }
            if cards.is_empty() {
                continue;
            }
            groups.push((method_id.to_string(), group_title, cards));
        }
        groups
    }

    pub fn build_save(&self) -> GameSaveFile {
        self.runtime.build_save()
    }

    pub fn persist(&self) {
        if let Some(path) = save_path() {
            let _ = write_save_file(&path, &self.build_save());
        }
    }

    pub fn load_from_file(&mut self, path: &std::path::Path) -> Result<(), String> {
        let save = load_save_file(path)?;
        self.apply_save(save)
    }

    pub fn apply_save(&mut self, save: GameSaveFile) -> Result<(), String> {
        self.runtime.apply_save(save)?;
        self.toast = "Save loaded.".to_string();
        Ok(())
    }

    pub fn reset_to_starters(&mut self) {
        self.runtime.reset_to_starters();
        self.counter.clear();
        self.select_method("combine", false);
        self.toast = "Progress reset.".to_string();
        self.persist();
    }

    pub fn export_save_dialog(&mut self) -> bool {
        let save = self.build_save();
        let date = chrono::Local::now().format("%Y-%m-%d");
        let path = rfd::FileDialog::new()
            .set_file_name(&format!("culinary-alchemy-save-{date}.json"))
            .add_filter("JSON", &["json"])
            .save_file();
        if let Some(path) = path {
            if write_save_file(&path, &save).is_ok() {
                self.toast = format!("Exported ({} discoveries)", save.discovery.discovered.len());
                return true;
            }
        }
        false
    }

    pub fn import_save_dialog(&mut self) -> bool {
        let path = rfd::FileDialog::new()
            .add_filter("JSON", &["json"])
            .pick_file();
        if let Some(path) = path {
            if let Ok(save) = load_save_file(&path) {
                let _ = self.apply_save(save);
                self.persist();
                return true;
            }
        }
        false
    }
}

#[derive(Clone)]
pub struct SkillCard {
    pub title: String,
    pub detail: String,
    pub percent: f32,
    pub locked: bool,
}
