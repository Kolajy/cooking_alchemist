use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IngredientItem {
    pub id: String,
    pub name: String,
    pub emoji: String,
    #[serde(default)]
    pub item_type: Option<String>,
    #[serde(rename = "type", default)]
    pub type_field: Option<String>,
    #[serde(default)]
    pub origin: Option<String>,
    #[serde(default)]
    pub category: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub blurb: Option<String>,
    #[serde(default)]
    pub tip: Option<String>,
    #[serde(default)]
    pub xp_awarded: Option<u32>,
}

impl IngredientItem {
    pub fn is_recipe(&self) -> bool {
        self.type_field.as_deref() == Some("recipe") || self.item_type.as_deref() == Some("recipe")
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechniqueTier {
    pub name: String,
    pub emoji: String,
    pub category: String,
    #[serde(rename = "dependsOn", default)]
    pub depends_on: Vec<String>,
    #[serde(default)]
    pub actions: Vec<String>,
    #[serde(rename = "unlockCriteria", default)]
    pub unlock_criteria: Option<UnlockCriteria>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnlockCriteria {
    #[serde(default)]
    pub prerequisites: HashMap<String, u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerAction {
    pub name: String,
    pub emoji: String,
    #[serde(default)]
    pub mode: Option<String>,
    #[serde(default)]
    pub categories: Vec<String>,
    #[serde(rename = "starterSkill", default)]
    pub starter_skill: Option<String>,
    #[serde(rename = "unlockCriteria", default)]
    pub unlock_criteria: Option<PlayerActionUnlockCriteria>,
    #[serde(default)]
    pub desc: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerActionUnlockCriteria {
    #[serde(rename = "discoveredRecipes", default)]
    pub discovered_recipes: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressionConfig {
    pub techniques: HashMap<String, TechniqueTier>,
    #[serde(rename = "playerActions", default)]
    pub player_actions: HashMap<String, PlayerAction>,
    #[serde(rename = "maxSkillExp", default)]
    pub max_skill_exp: u32,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ProgressionState {
    #[serde(default)]
    pub xp: HashMap<String, u32>,
    #[serde(rename = "milestonesReached", default)]
    pub milestones_reached: Vec<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveryLogEntry {
    pub id: String,
    #[serde(rename = "discoveredAt", default)]
    pub discovered_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawTransition {
    pub id: String,
    pub kind: String,
    #[serde(default)]
    pub tools: Vec<String>,
    pub input: Option<String>,
    #[serde(default)]
    pub inputs: Vec<String>,
    #[serde(default)]
    pub outputs: Vec<String>,
    #[serde(rename = "onePerAction", default)]
    pub one_per_action: bool,
    #[serde(rename = "resultItemId")]
    pub result_item_id: String,
}

#[derive(Debug, Clone)]
pub struct TechniqueTransition {
    pub tools: Vec<String>,
    pub input: String,
    pub outputs: Vec<String>,
    pub one_per_action: bool,
    pub result_item_id: String,
}

#[derive(Debug, Clone)]
pub struct CombineTransition {
    pub inputs: Vec<String>,
    pub result_item_id: String,
}

#[derive(Debug, Clone)]
pub struct TransitionIndex {
    pub by_technique: HashMap<String, HashMap<String, TechniqueTransition>>,
    pub by_combine: HashMap<String, CombineTransition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchResult {
    pub success: bool,
    pub result_id: Option<String>,
    pub result_ids: Vec<String>,
    pub locked_skill_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AchievementDefinition {
    pub id: String,
    pub name: String,
    pub emoji: String,
    pub description: String,
    pub hint: String,
    pub category: String,
    #[serde(rename = "steamId", default)]
    pub steam_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum AchievementRule {
    RawDiscoveries { min: u32 },
    RecipeDiscoveries { min: u32 },
    NonPrimitiveDiscoveries { min: u32 },
    MapComplete,
    SkillUnlocked {
        #[serde(rename = "skillId")]
        skill_id: String,
    },
    ActionUnlocked {
        #[serde(rename = "actionId")]
        action_id: String,
    },
    TotalXp { min: u32 },
    SkillXp {
        #[serde(rename = "skillId")]
        skill_id: String,
        min: u32,
    },
    Flag { flag: String },
    JournalEntries { min: u32 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameBundleFile {
    pub version: u32,
    pub starters: Vec<IngredientItem>,
    #[serde(default)]
    pub unlockables: Vec<IngredientItem>,
    pub discoverable: HashMap<String, IngredientItem>,
    pub progression: ProgressionConfig,
    #[serde(default)]
    pub achievements: Vec<AchievementDefinition>,
    #[serde(rename = "achievementRules", default)]
    pub achievement_rules: HashMap<String, AchievementRule>,
}

#[derive(Debug, Clone)]
pub struct GameBundle {
    pub starters: Vec<IngredientItem>,
    pub unlockables: Vec<IngredientItem>,
    pub discoverable: HashMap<String, IngredientItem>,
    pub progression: ProgressionConfig,
    pub achievements: Vec<AchievementDefinition>,
    pub achievement_rules: HashMap<String, AchievementRule>,
    pub index: TransitionIndex,
    pub primitive_ids: HashSet<String>,
}
