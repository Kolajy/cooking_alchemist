//! C ABI for iOS / Android — thin wrapper over `GameRuntime`.

use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::path::Path;
use std::sync::Mutex;

use crate::GameRuntime;

static RUNTIME: Mutex<Option<GameRuntime>> = Mutex::new(None);

#[no_mangle]
pub extern "C" fn culinary_init(assets_dir: *const c_char) -> bool {
    if assets_dir.is_null() {
        return false;
    }
    let dir = unsafe { CStr::from_ptr(assets_dir).to_str().unwrap_or("") };
    if dir.is_empty() {
        return false;
    }
    match GameRuntime::load(Path::new(dir)) {
        Ok(rt) => {
            *RUNTIME.lock().unwrap() = Some(rt);
            true
        }
        Err(_) => false,
    }
}

#[no_mangle]
pub extern "C" fn culinary_init_json(
    bundle_json: *const c_char,
    transitions_json: *const c_char,
) -> bool {
    if bundle_json.is_null() || transitions_json.is_null() {
        return false;
    }
    let bundle = unsafe { CStr::from_ptr(bundle_json).to_str().unwrap_or("") };
    let transitions = unsafe { CStr::from_ptr(transitions_json).to_str().unwrap_or("") };
    match GameRuntime::from_json(bundle, transitions) {
        Ok(rt) => {
            *RUNTIME.lock().unwrap() = Some(rt);
            true
        }
        Err(_) => false,
    }
}

#[no_mangle]
pub extern "C" fn culinary_apply_combine(
    id_a: *const c_char,
    id_b: *const c_char,
    out_id: *mut c_char,
    out_len: usize,
) -> bool {
    let (a, b) = unsafe {
        (
            CStr::from_ptr(id_a).to_str().unwrap_or(""),
            CStr::from_ptr(id_b).to_str().unwrap_or(""),
        )
    };
    let mut guard = RUNTIME.lock().unwrap();
    let Some(rt) = guard.as_mut() else {
        return false;
    };
    let result = rt.apply_combine(a, b);
    if !result.success {
        return false;
    }
    if let Some(id) = result.output_ids.first() {
        write_cstr(id, out_id, out_len);
        return true;
    }
    false
}

#[no_mangle]
pub extern "C" fn culinary_apply_technique(
    input_id: *const c_char,
    tool_id: *const c_char,
    out_id: *mut c_char,
    out_len: usize,
) -> bool {
    let (input, tool) = unsafe {
        (
            CStr::from_ptr(input_id).to_str().unwrap_or(""),
            CStr::from_ptr(tool_id).to_str().unwrap_or(""),
        )
    };
    let mut guard = RUNTIME.lock().unwrap();
    let Some(rt) = guard.as_mut() else {
        return false;
    };
    let result = rt.apply_technique(input, tool);
    if !result.success {
        return false;
    }
    if let Some(id) = result.output_ids.first() {
        write_cstr(id, out_id, out_len);
        return true;
    }
    false
}

#[no_mangle]
pub extern "C" fn culinary_export_save(out: *mut c_char, out_len: usize) -> bool {
    let guard = RUNTIME.lock().unwrap();
    let Some(rt) = guard.as_ref() else {
        return false;
    };
    if let Ok(json) = rt.build_save().to_json() {
        write_cstr(&json, out, out_len);
        return true;
    }
    false
}

#[no_mangle]
pub extern "C" fn culinary_import_save(json: *const c_char) -> bool {
    if json.is_null() {
        return false;
    }
    let text = unsafe { CStr::from_ptr(json).to_str().unwrap_or("") };
    let mut guard = RUNTIME.lock().unwrap();
    let Some(rt) = guard.as_mut() else {
        return false;
    };
    rt.apply_save_json(text).is_ok()
}

#[no_mangle]
pub extern "C" fn culinary_reset() -> bool {
    let mut guard = RUNTIME.lock().unwrap();
    let Some(rt) = guard.as_mut() else {
        return false;
    };
    rt.reset_to_starters();
    true
}

#[no_mangle]
pub extern "C" fn culinary_match_combine(
    id_a: *const c_char,
    id_b: *const c_char,
    out_id: *mut c_char,
    out_len: usize,
) -> bool {
    culinary_apply_combine(id_a, id_b, out_id, out_len)
}

#[no_mangle]
pub extern "C" fn culinary_match_technique(
    input_id: *const c_char,
    tool_id: *const c_char,
    out_id: *mut c_char,
    out_len: usize,
) -> bool {
    culinary_apply_technique(input_id, tool_id, out_id, out_len)
}

#[no_mangle]
pub extern "C" fn culinary_add_xp(skill_id: *const c_char, amount: u32) -> bool {
    let skill = unsafe { CStr::from_ptr(skill_id).to_str().unwrap_or("") };
    let mut guard = RUNTIME.lock().unwrap();
    let Some(rt) = guard.as_mut() else {
        return false;
    };
    rt.progression_mut().add_xp(skill, amount);
    true
}

fn write_cstr(value: &str, out: *mut c_char, out_len: usize) {
    if out.is_null() || out_len == 0 {
        return;
    }
    let Ok(c) = CString::new(value) else {
        return;
    };
    let bytes = c.as_bytes_with_nul();
    let copy_len = bytes.len().min(out_len);
    unsafe {
        std::ptr::copy_nonoverlapping(bytes.as_ptr(), out as *mut u8, copy_len);
        if copy_len < out_len {
            *out.add(copy_len - 1) = 0;
        } else {
            *out.add(out_len - 1) = 0;
        }
    }
}
