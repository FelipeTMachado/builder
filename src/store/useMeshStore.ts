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
  baseSize: [number, number, number];
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
  globalUnit: 'mm' | 'cm';
  
  setGlobalUnit: (unit: 'mm' | 'cm') => void;
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
  globalUnit: 'mm',
  
  setGlobalUnit: (unit) => set({ globalUnit: unit }),

  loadMeshFromFile: async (filePath: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await invoke<MeshData>('load_mesh', { path: filePath });
      // Calcula o bounding box base real da malha para usarmos nas dimensões reais
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      for (let i = 0; i < data.vertices.length; i += 3) {
         const x = data.vertices[i], y = data.vertices[i+1], z = data.vertices[i+2];
         if (x < minX) minX = x; if (x > maxX) maxX = x;
         if (y < minY) minY = y; if (y > maxY) maxY = y;
         if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
      }
      const sizeX = maxX - minX;
      const sizeY = maxY - minY;
      const sizeZ = maxZ - minZ;

      const newObj: SceneObject = {
        id: generateId(),
        type: 'mesh',
        meshData: data,
        materialProps: { ...defaultMaterial },
        transformData: { ...defaultTransform },
        baseSize: [sizeX, sizeY, sizeZ]
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
    let size: [number, number, number] = [1, 1, 1];
    if (type === 'cube') size = [2, 2, 2];
    if (type === 'sphere') size = [3, 3, 3];
    if (type === 'cylinder') size = [3, 3, 3];

    const newObj: SceneObject = {
      id: generateId(),
      type: type,
      materialProps: { ...defaultMaterial },
      transformData: { ...defaultTransform },
      baseSize: size
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
