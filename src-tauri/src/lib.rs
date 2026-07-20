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

use serde::Deserialize;

#[derive(Deserialize)]
pub struct ExportMesh {
    pub name: String,
    pub vertices: Vec<f32>,
    pub indices: Vec<u32>,
}

#[tauri::command]
fn export_obj_multi(path: String, meshes: Vec<ExportMesh>) -> Result<(), String> {
    use std::io::Write;
    let mut file = std::fs::File::create(path).map_err(|e| e.to_string())?;
    
    let mut vertex_offset = 1;
    
    for (idx, mesh) in meshes.iter().enumerate() {
        let object_name = if mesh.name.is_empty() { format!("Mesh_{}", idx) } else { mesh.name.clone() };
        writeln!(file, "o {}", object_name).map_err(|e| e.to_string())?;
        
        let vertices = &mesh.vertices;
        let indices = &mesh.indices;
        
        for i in (0..vertices.len()).step_by(3) {
            writeln!(file, "v {:.6} {:.6} {:.6}", vertices[i], vertices[i+1], vertices[i+2]).map_err(|e| e.to_string())?;
        }
        
        for i in (0..indices.len()).step_by(3) {
            writeln!(file, "f {} {} {}", indices[i] + vertex_offset, indices[i+1] + vertex_offset, indices[i+2] + vertex_offset).map_err(|e| e.to_string())?;
        }
        
        vertex_offset += (vertices.len() / 3) as u32;
    }
    
    Ok(())
}

#[tauri::command]
fn export_stl_multi(path: String, meshes: Vec<ExportMesh>) -> Result<(), String> {
    use std::io::Write;
    let mut file = std::fs::File::create(path).map_err(|e| e.to_string())?;
    
    for (idx, mesh) in meshes.iter().enumerate() {
        let solid_name = if mesh.name.is_empty() { format!("Mesh_{}", idx) } else { mesh.name.clone() };
        writeln!(file, "solid {}", solid_name).map_err(|e| e.to_string())?;
        
        let vertices = &mesh.vertices;
        let indices = &mesh.indices;
        
        for i in (0..indices.len()).step_by(3) {
            let v1_idx = (indices[i] * 3) as usize;
            let v2_idx = (indices[i+1] * 3) as usize;
            let v3_idx = (indices[i+2] * 3) as usize;
            
            let v1 = [vertices[v1_idx], vertices[v1_idx+1], vertices[v1_idx+2]];
            let v2 = [vertices[v2_idx], vertices[v2_idx+1], vertices[v2_idx+2]];
            let v3 = [vertices[v3_idx], vertices[v3_idx+1], vertices[v3_idx+2]];
            
            let u = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
            let v = [v3[0]-v1[0], v3[1]-v1[1], v3[2]-v1[2]];
            
            let nx = u[1]*v[2] - u[2]*v[1];
            let ny = u[2]*v[0] - u[0]*v[2];
            let nz = u[0]*v[1] - u[1]*v[0];
            
            let length = (nx*nx + ny*ny + nz*nz).sqrt();
            let (nx, ny, nz) = if length > 0.0 { (nx/length, ny/length, nz/length) } else { (0.0, 0.0, 0.0) };
            
            writeln!(file, "  facet normal {:.6} {:.6} {:.6}", nx, ny, nz).unwrap();
            writeln!(file, "    outer loop").unwrap();
            writeln!(file, "      vertex {:.6} {:.6} {:.6}", v1[0], v1[1], v1[2]).unwrap();
            writeln!(file, "      vertex {:.6} {:.6} {:.6}", v2[0], v2[1], v2[2]).unwrap();
            writeln!(file, "      vertex {:.6} {:.6} {:.6}", v3[0], v3[1], v3[2]).unwrap();
            writeln!(file, "    endloop").unwrap();
            writeln!(file, "  endfacet").unwrap();
        }
        
        writeln!(file, "endsolid {}", solid_name).unwrap();
    }
    
    Ok(())
}

use serde::Serialize;
use std::fs;

#[derive(Serialize)]
struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
}

#[tauri::command]
fn get_home_dir() -> Result<String, String> {
    std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn list_directory(path: String) -> Result<Vec<FileNode>, String> {
    let mut entries = Vec::new();
    let paths = fs::read_dir(&path).map_err(|e| e.to_string())?;
    
    for entry in paths {
        if let Ok(entry) = entry {
            let path_buf = entry.path();
            let is_dir = path_buf.is_dir();
            let name = entry.file_name().to_string_lossy().to_string();
            let full_path = path_buf.to_string_lossy().to_string();
            
            // Oculta pastas do sistema iniciadas com . no Linux
            if !name.starts_with(".") {
                entries.push(FileNode { name, path: full_path, is_dir });
            }
        }
    }
    
    // Pastas primeiro, ordem alfabética depois
    entries.sort_by(|a, b| {
        b.is_dir.cmp(&a.is_dir).then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    
    Ok(entries)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Restaurando workaround forçado para placas NVIDIA (Erro 71 / GBM falha)
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            load_mesh, 
            export_obj_multi,
            export_stl_multi,
            get_home_dir,
            list_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
