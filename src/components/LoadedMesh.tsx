import { useMemo } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { useMeshStore } from '../store/useMeshStore';

export function LoadedMesh() {
  const { meshData, primitiveType, materialProps, transformMode } = useMeshStore();

  const geometry = useMemo(() => {
    if (!meshData) return null;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(meshData.vertices, 3));
    
    if (meshData.normals && meshData.normals.length > 0) {
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.normals, 3));
    } else {
      geo.computeVertexNormals();
    }
    
    geo.setIndex(meshData.indices);
    geo.computeBoundingBox();
    const center = new THREE.Vector3();
    geo.boundingBox?.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);

    return geo;
  }, [meshData]);

  if (!geometry && !primitiveType) return null;

  const objectElement = (
    <mesh>
      {/* Geometria Dinâmica */}
      {geometry && <primitive object={geometry} attach="geometry" />}
      {!geometry && primitiveType === 'cube' && <boxGeometry args={[2, 2, 2]} />}
      {!geometry && primitiveType === 'sphere' && <sphereGeometry args={[1.5, 32, 32]} />}
      {!geometry && primitiveType === 'cylinder' && <cylinderGeometry args={[1.5, 1.5, 3, 32]} />}

      {/* Material Físico Premium */}
      <meshPhysicalMaterial 
        color={materialProps.color} 
        side={THREE.DoubleSide} 
        flatShading={geometry ? true : false} 
        roughness={materialProps.roughness}
        metalness={materialProps.metalness}
        transmission={materialProps.transmission}
        transparent={materialProps.transparent}
        ior={1.5}
        thickness={1.0}
      />
    </mesh>
  );

  // Se um modo de transformação estiver ativo, encapsula o objeto no Gizmo do Three.js
  if (transformMode) {
    return (
      <TransformControls mode={transformMode}>
        {objectElement}
      </TransformControls>
    );
  }

  // Caso contrário, renderiza o objeto livremente sem controles espaciais
  return objectElement;
}
