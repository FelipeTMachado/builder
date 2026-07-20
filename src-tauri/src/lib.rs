pub mod mesh_loader;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn load_mesh(path: String) -> Result<mesh_loader::MeshData, String> {
    mesh_loader::load_obj_file(&path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Workaround para erro de protocolo do Wayland (GNOME/Nvidia) no WebKitGTK (Erro 71)
    #[cfg(target_os = "linux")]
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, load_mesh])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
