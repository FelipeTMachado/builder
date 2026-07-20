import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { useMeshStore, SceneObject } from '../store/useMeshStore';

const SingleObject = ({ obj, isSelected }: { obj: SceneObject, isSelected: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { updateTransformData, selectObject, transformMode } = useMeshStore();

  const geometry = useMemo(() => {
    if (!obj.meshData) return null;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(obj.meshData.vertices, 3));
    
    if (obj.meshData.normals && obj.meshData.normals.length > 0) {
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(obj.meshData.normals, 3));
    } else {
      geo.computeVertexNormals();
    }
    
    geo.setIndex(obj.meshData.indices);
    geo.computeBoundingBox();
    const center = new THREE.Vector3();
    geo.boundingBox?.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);

    return geo;
  }, [obj.meshData]);

  const objectElement = (
    <group 
      ref={meshRef}
      position={obj.transformData.position}
      rotation={obj.transformData.rotation}
      scale={obj.transformData.scale}
    >
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          selectObject(obj.id);
        }}
      >
        {/* Geometria Dinâmica (Mesh importada ou Primitiva criada) */}
        {geometry && <primitive object={geometry} attach="geometry" />}
        {!geometry && obj.type === 'cube' && <boxGeometry args={[2, 2, 2]} />}
        {!geometry && obj.type === 'sphere' && <sphereGeometry args={[1.5, 32, 32]} />}
        {!geometry && obj.type === 'cylinder' && <cylinderGeometry args={[1.5, 1.5, 3, 32]} />}

        {/* Material Físico Premium */}
        <meshPhysicalMaterial 
          color={obj.materialProps.color} 
          side={THREE.DoubleSide} 
          flatShading={geometry ? true : false} 
          roughness={obj.materialProps.roughness}
          metalness={obj.materialProps.metalness}
          transmission={obj.materialProps.transmission}
          transparent={obj.materialProps.transparent}
          ior={1.5}
          thickness={1.0}
        />
      </mesh>
    </group>
  );

  return (
    <>
      {objectElement}
      
      {/* Acopla o Gizmo de transformação DIRETAMENTE no objeto alvo (sem criar wrappers) */}
      {isSelected && transformMode && (
        <TransformControls 
          object={meshRef}
          mode={transformMode}
          onDraggingChanged={(e) => {
            // e.value é true quando começa a arrastar, e false quando o usuário solta o objeto
            if (!e?.value && meshRef.current) {
              const { position, rotation, scale } = meshRef.current;
              updateTransformData(obj.id, {
                position: [position.x, position.y, position.z],
                rotation: [rotation.x, rotation.y, rotation.z],
                scale: [scale.x, scale.y, scale.z]
              });
            }
          }}
        />
      )}
    </>
  );
};

export function LoadedMesh() {
  const { objects, selectedId } = useMeshStore();

  return (
    <>
      {objects.map(obj => (
        <SingleObject key={obj.id} obj={obj} isSelected={obj.id === selectedId} />
      ))}
    </>
  );
}
