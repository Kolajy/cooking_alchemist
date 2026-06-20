use culinary_core::{CombinationEngine, GameBundle, ProgressionEngine};
use std::collections::HashSet;
use std::path::PathBuf;

fn assets_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("assets")
}

#[test]
fn engine_matches_typescript_cli_tests() {
    let bundle = GameBundle::load(&assets_dir()).expect("load assets");
    assert_eq!(bundle.discoverable.len(), 66);

    let mut progression = ProgressionEngine::new(bundle.progression.clone(), None);
    let engine = CombinationEngine::new(&bundle.discoverable, &bundle.index);

    assert!(bundle.index.by_technique.contains_key("separate"));
    assert!(bundle
        .index
        .by_technique
        .get("separate")
        .unwrap()
        .contains_key("berries"));

    assert_eq!(progression.get_xp("smash"), 0);
    assert!(progression.is_unlocked("smash"));
    assert!(!progression.is_unlocked("pound"));
    assert!(!progression.is_unlocked("hand_mix"));
    assert!(!progression.is_unlocked("peel"));

    let no_smash = engine.match_technique("tubers", "smash", &mut progression, &HashSet::new());
    assert!(!no_smash.success);

    let smash_potato = engine.match_technique("potato", "smash", &mut progression, &HashSet::new());
    assert!(smash_potato.success);
    assert_eq!(smash_potato.result_id.as_deref(), Some("mashed_potato"));

    let char_apple = engine.match_technique("apple", "char", &mut progression, &HashSet::new());
    assert!(char_apple.success);
    assert_eq!(char_apple.result_id.as_deref(), Some("charred_apple"));

    let xp1 = progression.add_xp("smash", 1);
    assert_eq!(progression.get_xp("smash"), 1);
    assert!(xp1.is_empty());

    let xp2 = progression.add_xp("smash", 2);
    assert_eq!(progression.get_xp("smash"), 3);
    assert_eq!(xp2, vec!["pound"]);
    assert!(progression.is_unlocked("pound"));

    let merge = engine.match_combine(&["seeds".into(), "water".into()]);
    assert!(merge.success);
    assert_eq!(merge.result_id.as_deref(), Some("sprouted_seeds"));

    let berry_brew = engine.match_combine(&["strawberry".into(), "spring_water".into()]);
    assert!(berry_brew.success);
    assert!(bundle.discoverable["berry_brew"].is_recipe());

    progression.add_xp("combine", 3);
    assert!(progression.is_unlocked("hand_mix"));

    progression.add_xp("separate", 2);
    assert!(progression.is_unlocked("peel"));

    let berry1 = engine.match_technique(
        "berries",
        "separate",
        &mut progression,
        &HashSet::new(),
    );
    assert!(berry1.success);
    assert_eq!(berry1.result_ids.len(), 1);
    assert_eq!(berry1.result_id.as_deref(), Some("strawberry"));

    let mut discovered = HashSet::from(["strawberry".to_string()]);
    let berry2 = engine.match_technique("berries", "separate", &mut progression, &discovered);
    assert_eq!(berry2.result_id.as_deref(), Some("raspberry"));

    discovered.extend(["raspberry", "blueberry", "blackberry"].map(String::from));
    let berry_exhausted =
        engine.match_technique("berries", "separate", &mut progression, &discovered);
    assert!(!berry_exhausted.success);

    let fruit1 = engine.match_technique("fruits", "separate", &mut progression, &HashSet::new());
    assert!(fruit1.success);
    assert_eq!(fruit1.result_id.as_deref(), Some("apple"));

    let mut fruits_discovered = HashSet::from(["apple".to_string()]);
    let fruit2 = engine.match_technique("fruits", "separate", &mut progression, &fruits_discovered);
    assert_eq!(fruit2.result_id.as_deref(), Some("banana"));

    fruits_discovered.extend(
        [
            "banana", "orange", "grape", "pear", "watermelon", "mango", "pineapple", "lemon",
            "peach",
        ]
        .map(String::from),
    );
    let fruit_exhausted =
        engine.match_technique("fruits", "separate", &mut progression, &fruits_discovered);
    assert!(!fruit_exhausted.success);

    let water = engine.match_technique("water", "separate", &mut progression, &HashSet::new());
    assert!(water.success);
    assert_eq!(water.result_id.as_deref(), Some("spring_water"));

    let roots = engine.match_technique("roots", "separate", &mut progression, &HashSet::new());
    assert!(roots.success);
    assert_eq!(roots.result_id.as_deref(), Some("carrot"));
}

#[test]
fn runtime_unlocks_achievements_from_shared_rules() {
    use culinary_core::GameRuntime;

    let bundle = GameBundle::load(&assets_dir()).expect("load assets");
    assert_eq!(bundle.achievements.len(), 18);
    assert!(bundle.achievement_rules.contains_key("first_combine"));

    let mut rt = GameRuntime::new(bundle);
    let result = rt.apply_combine("seeds", "water");
    assert!(result.success);
    assert!(
        result.new_achievement_ids.contains(&"first_combine".to_string()),
        "combine_success flag should unlock first_combine"
    );
    assert!(rt.achievement_unlocks().contains_key("first_combine"));
}
