import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface MeshData {
  vertices: number[];
  normals: number[];
  indices: number[];
}

interface MaterialProps {
  color: string;
  roughness: number;
  metalness: number;
  transmission: number;
  transparent: boolean;
}

interface MeshState {
  meshData: MeshData | null;
  primitiveType: 'cube' | 'sphere' | 'cylinder' | null;
  materialProps: MaterialProps;
  isLoading: boolean;
  error: string | null;
  
  loadMeshFromFile: (filePath: string) => Promise<void>;
  loadPrimitive: (type: 'cube' | 'sphere' | 'cylinder') => void;
  updateMaterial: (props: Partial<MaterialProps>) => void;
  clearMesh: () => void;
}

const defaultMaterial: MaterialProps = {
  color: "#3b82f6", // Azul
  roughness: 0.4,
  metalness: 0.1,
  transmission: 0,
  transparent: false
};

export const useMeshStore = create<MeshState>((set) => ({
  meshData: null,
  primitiveType: null,
  materialProps: { ...defaultMaterial },
  isLoading: false,
  error: null,
  
  loadMeshFromFile: async (filePath: string) => {
    set({ isLoading: true, error: null, primitiveType: null });
    try {
      const data = await invoke<MeshData>('load_mesh', { path: filePath });
      set({ meshData: data, isLoading: false });
    } catch (err: any) {
      console.error(err);
      set({ error: err.toString(), isLoading: false });
    }
  },

  loadPrimitive: (type) => {
    set({ primitiveType: type, meshData: null, error: null });
  },

  updateMaterial: (props) => {
    set((state) => ({
      materialProps: { ...state.materialProps, ...props }
    }));
  },
  
  clearMesh: () => set({ 
    meshData: null, 
    primitiveType: null, 
    error: null, 
    materialProps: { ...defaultMaterial } 
  })
}));
