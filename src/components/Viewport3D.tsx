import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useMeshStore } from '../store/useMeshStore';
import { LoadedMesh } from './LoadedMesh';

function MinimalistShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animação suave de rotação (Micro-animação)
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* Usando um icosaedro para um visual estético remetendo a low-poly art */}
      <icosahedronGeometry args={[1.5, 0]} />
      {/* Material combinando com nosso verde e azul, gerando efeito neon discreto */}
      <meshStandardMaterial 
        color="#10b981" 
        wireframe={true} 
      />
    </mesh>
  );
}

export function Viewport3D() {
  const hasObject = useMeshStore((state) => state.meshData !== null || state.primitiveType !== null);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Iluminação Premium baseada na paleta */}
      <ambientLight intensity={0.5} color="#3b82f6" /> {/* Luz ambiente azulada */}
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#10b981" /> {/* Refletor verde */}

      {/* Controles profissionais com Damping (inércia) */}
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      
      {/* Renderiza a malha real carregada pelo usuário ou Primitiva, ou o placeholder se estiver vazio */}
      {hasObject ? <LoadedMesh /> : <MinimalistShape />}
    </Canvas>
  );
}
