use culinary_core::GameRuntime;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmGameRuntime {
    inner: GameRuntime,
}

#[wasm_bindgen]
impl WasmGameRuntime {
    #[wasm_bindgen(constructor)]
    pub fn new(bundle_json: &str, transitions_json: &str) -> Result<WasmGameRuntime, JsValue> {
        GameRuntime::from_json(bundle_json, transitions_json)
            .map(|inner| WasmGameRuntime { inner })
            .map_err(|e| JsValue::from_str(&e))
    }

    #[wasm_bindgen(js_name = matchCombine)]
    pub fn match_combine(&self, id_a: &str, id_b: &str) -> JsValue {
        let result = self.inner.match_combine(&[id_a.to_string(), id_b.to_string()]);
        serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
    }

    #[wasm_bindgen(js_name = applyCombine)]
    pub fn apply_combine(&mut self, id_a: &str, id_b: &str) -> JsValue {
        serde_wasm_bindgen::to_value(&self.inner.apply_combine(id_a, id_b)).unwrap_or(JsValue::NULL)
    }

    #[wasm_bindgen(js_name = applyTechnique)]
    pub fn apply_technique(&mut self, input_id: &str, tool_id: &str) -> JsValue {
        serde_wasm_bindgen::to_value(&self.inner.apply_technique(input_id, tool_id))
            .unwrap_or(JsValue::NULL)
    }

    #[wasm_bindgen(js_name = isPlayerActionUnlocked)]
    pub fn is_player_action_unlocked(&self, action_id: &str) -> bool {
        self.inner.is_player_action_unlocked(action_id)
    }

    #[wasm_bindgen(js_name = discoveredRecipeCount)]
    pub fn discovered_recipe_count(&self) -> u32 {
        self.inner.discovered_recipe_count()
    }

    #[wasm_bindgen(js_name = statsText)]
    pub fn stats_text(&self) -> String {
        self.inner.stats_text()
    }

    #[wasm_bindgen(js_name = playableItemIds)]
    pub fn playable_item_ids(&self) -> Vec<String> {
        self.inner.playable_item_ids()
    }

    #[wasm_bindgen(js_name = exportSave)]
    pub fn export_save(&self) -> String {
        self.inner.build_save().to_json().unwrap_or_default()
    }

    #[wasm_bindgen(js_name = importSave)]
    pub fn import_save(&mut self, json: &str) -> Result<(), JsValue> {
        self.inner
            .apply_save_json(json)
            .map_err(|e| JsValue::from_str(&e))
    }

    #[wasm_bindgen(js_name = resetToStarters)]
    pub fn reset_to_starters(&mut self) {
        self.inner.reset_to_starters();
    }
}
