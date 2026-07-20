import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { useMeshStore, SceneObject } from '../store/useMeshStore';

const SingleObject = ({ obj, isSelected }: { obj: SceneObject, isSelected: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);
  const transformRef = useRef<any>(null);
  
  // Pré-inicializa com a escala salva para nunca multiplicar por zero
  const startScaleRef = useRef(new THREE.Vector3(...obj.transformData.scale));
  
  const { updateTransformData, selectObject, transformMode, isScaleLocked, actionTrigger, clearAction, addMeasurePoint, globalWireframe } = useMeshStore();

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

  // Algoritmo "Settle" (Tarefa 18): Acomoda a malha baseando-se na sua Bounding Box real após as transformações.
  useEffect(() => {
    // Settle agora afeta TODOS os objetos da mesa instantaneamente (não apenas o selecionado)
    if (actionTrigger === 'settle' && meshRef.current) {
      // Atualiza a matriz do mundo para garantir precisão antes do cálculo
      meshRef.current.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const lowestY = box.min.y;
      
      // O offset necessário para o ponto mais baixo encostar no 0
      const offset = 0 - lowestY;
      
      const { position, rotation, scale } = meshRef.current;
      updateTransformData(obj.id, {
        position: [position.x, position.y + offset, position.z],
        rotation: [rotation.x, rotation.y, rotation.z],
        scale: [scale.x, scale.y, scale.z]
      });
    } else if (actionTrigger === 'sync_transforms' && meshRef.current) {
      const { position, rotation, scale } = meshRef.current;
      updateTransformData(obj.id, {
        position: [position.x, position.y, position.z],
        rotation: [rotation.x, rotation.y, rotation.z],
        scale: [scale.x, scale.y, scale.z]
      });
    }
  }, [actionTrigger, obj.id, updateTransformData]);

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
        onPointerDown={(e) => {
          if (transformMode === 'measure') {
            e.stopPropagation();
            addMeasurePoint(e.point.toArray());
          }
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
          wireframe={globalWireframe}
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
      {isSelected && transformMode && transformMode !== 'measure' && (
        <TransformControls 
          ref={transformRef}
          object={meshRef as any}
          mode={transformMode}
          onChange={() => {
            // Sincronização Proporcional de Escala (Mantendo Aspect Ratio)
            if (transformMode === 'scale' && isScaleLocked && meshRef.current && transformRef.current) {
              const axis = transformRef.current.axis;
              
              if (axis && axis !== 'XYZ') {
                const scale = meshRef.current.scale;
                const start = startScaleRef.current;
                
                // Evita divisão por zero
                if (start.x === 0 || start.y === 0 || start.z === 0) return;
                
                // Calcula o multiplicador pegando o primeiro eixo relevante sendo puxado (mesmo se for diagonal como 'XY')
                let multiplier = 1;
                if (axis.includes('X')) multiplier = scale.x / start.x;
                else if (axis.includes('Y')) multiplier = scale.y / start.y;
                else if (axis.includes('Z')) multiplier = scale.z / start.z;
                
                // Aplica o multiplicador nos 3 eixos simultaneamente
                scale.set(
                  start.x * multiplier,
                  start.y * multiplier,
                  start.z * multiplier
                );
              }
            }
          }}
          onDraggingChanged={(e: any) => {
            // Captura robusta do estado de Drag, independente da versão do Drei/Three
            const isDragging = typeof e === 'boolean' ? e : (e?.value ?? transformRef.current?.dragging);
            
            if (isDragging && meshRef.current) {
              // Quando começa a arrastar, tira a fotografia da escala atual real
              startScaleRef.current.copy(meshRef.current.scale);
            } else if (!isDragging && meshRef.current) {
              // Quando solta, salva os dados no estado global do Zustand
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
