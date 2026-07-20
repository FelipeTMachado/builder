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

interface TransformData {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SceneObject {
  id: string;
  type: 'mesh' | 'cube' | 'sphere' | 'cylinder';
  meshData?: MeshData;
  materialProps: MaterialProps;
  transformData: TransformData;
}

interface MeshState {
  objects: SceneObject[];
  selectedId: string | null;
  globalWireframe: boolean;
  transformMode: 'translate' | 'rotate' | 'scale' | 'measure' | null;
  isScaleLocked: boolean;
  measurePoints: [number, number, number][];
  actionTrigger: string | null;
  isLoading: boolean;
  error: string | null;
  
  loadMeshFromFile: (filePath: string) => Promise<void>;
  loadPrimitive: (type: 'cube' | 'sphere' | 'cylinder') => void;
  updateMaterial: (props: Partial<MaterialProps>) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale' | 'measure' | null) => void;
  updateTransformData: (id: string, data: Partial<TransformData>) => void;
  toggleScaleLock: () => void;
  selectObject: (id: string | null) => void;
  addMeasurePoint: (point: [number, number, number]) => void;
  triggerAction: (action: string) => void;
  clearAction: () => void;
  clearScene: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

const defaultMaterial: MaterialProps = {
  color: "#3b82f6",
  roughness: 0.4,
  metalness: 0.1,
  transmission: 0,
  transparent: false
};

const defaultTransform: TransformData = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1]
};

export const useMeshStore = create<MeshState>((set) => ({
  objects: [],
  selectedId: null,
  globalWireframe: false,
  transformMode: 'translate',
  isScaleLocked: true,
  measurePoints: [],
  actionTrigger: null,
  isLoading: false,
  error: null,
  
  loadMeshFromFile: async (filePath: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await invoke<MeshData>('load_mesh', { path: filePath });
      const newObj: SceneObject = {
        id: generateId(),
        type: 'mesh',
        meshData: data,
        materialProps: { ...defaultMaterial },
        transformData: { ...defaultTransform }
      };
      set((state) => ({ 
        objects: [...state.objects, newObj], 
        selectedId: newObj.id,
        isLoading: false 
      }));
    } catch (err: any) {
      console.error(err);
      set({ error: err.toString(), isLoading: false });
    }
  },

  loadPrimitive: (type) => {
    const newObj: SceneObject = {
      id: generateId(),
      type: type,
      materialProps: { ...defaultMaterial },
      transformData: { ...defaultTransform }
    };
    set((state) => ({ 
      objects: [...state.objects, newObj],
      selectedId: newObj.id,
      error: null 
    }));
  },

  updateMaterial: (props) => {
    set((state) => ({
      objects: state.objects.map(obj => 
        obj.id === state.selectedId 
          ? { ...obj, materialProps: { ...obj.materialProps, ...props } }
          : obj
      )
    }));
  },

  setTransformMode: (mode) => {
    set({ transformMode: mode });
  },

  updateTransformData: (id, data) => {
    set((state) => ({
      objects: state.objects.map(obj => 
        obj.id === id 
          ? { ...obj, transformData: { ...obj.transformData, ...data } }
          : obj
      )
    }));
  },

  toggleScaleLock: () => set((state) => ({ isScaleLocked: !state.isScaleLocked })),

  selectObject: (id) => {
    set({ selectedId: id });
  },

  addMeasurePoint: (point) => {
    set((state) => {
      // Mantém no máximo 2 pontos para formar a régua
      const newPoints = [...state.measurePoints, point];
      if (newPoints.length > 2) newPoints.shift();
      return { measurePoints: newPoints };
    });
  },

  triggerAction: (action) => {
    set({ actionTrigger: action });
    setTimeout(() => set({ actionTrigger: null }), 100);
  },
  clearAction: () => set({ actionTrigger: null }),
  
  clearScene: () => set({ 
    objects: [],
    selectedId: null,
    error: null,
    measurePoints: [],
    actionTrigger: null
  })
}));
