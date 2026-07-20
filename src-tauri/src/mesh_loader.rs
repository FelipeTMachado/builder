use serde::Serialize;
use std::path::Path;

#[derive(Serialize, Clone, Debug)]
pub struct MeshData {
    pub vertices: Vec<f32>,
    pub normals: Vec<f32>,
    pub indices: Vec<u32>,
}

/// Carrega um arquivo .obj e o converte para nossa estrutura intermediária `MeshData`.
/// Essa estrutura é ideal para ser enviada para o Frontend (React Three Fiber) via Tauri IPC.
pub fn load_obj_file<P: AsRef<Path>>(path: P) -> Result<MeshData, String> {
    let load_options = tobj::LoadOptions {
        single_index: true,
        triangulate: true,
        ignore_points: true,
        ignore_lines: true,
    };

    let (models, _materials) = tobj::load_obj(path.as_ref(), &load_options)
        .map_err(|e| format!("Falha ao ler arquivo OBJ: {}", e))?;

    if models.is_empty() {
        return Err("O arquivo não contém nenhum modelo 3D válido".to_string());
    }

    // Para simplificar na Sprint 2, pegaremos apenas o primeiro modelo do arquivo.
    let mesh = &models[0].mesh;

    Ok(MeshData {
        vertices: mesh.positions.clone(),
        normals: mesh.normals.clone(),
        indices: mesh.indices.clone(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_load_valid_obj() {
        // Obter caminho para o arquivo de fixture de teste
        let mut path = env::current_dir().unwrap();
        path.push("fixtures");
        path.push("cube.obj");

        let result = load_obj_file(&path);
        
        assert!(result.is_ok(), "A leitura do arquivo .obj válido falhou");
        
        let mesh_data = result.unwrap();
        
        // Um cubo tem 8 vértices * 3 coordenadas (x,y,z) = 24 floats
        assert_eq!(mesh_data.vertices.len(), 24);
        
        // Cada face quadrada tem 2 triângulos (6 índices). 6 faces = 36 índices.
        assert_eq!(mesh_data.indices.len(), 36);
    }

    #[test]
    fn test_load_invalid_file() {
        let result = load_obj_file("caminho_falso.obj");
        assert!(result.is_err(), "Deveria retornar erro para arquivo inexistente");
    }
}
