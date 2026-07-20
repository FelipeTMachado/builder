import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useMeshStore } from '../store/useMeshStore';
import { LoadedMesh } from './LoadedMesh';

function MinimalistShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animação suave de rotação (Micro-animação)
  useFrame((_state, delta) => {
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
  const { objects, measurePoints } = useMeshStore();
  const hasObjects = objects.length > 0;
  
  // Cálculo de distância da régua
  const measureDistance = measurePoints.length === 2 
    ? new THREE.Vector3(...measurePoints[0]).distanceTo(new THREE.Vector3(...measurePoints[1]))
    : 0;

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: "high-performance", antialias: true }}
      onPointerMissed={() => useMeshStore.getState().selectObject(null)}
    >
      {/* Iluminação Premium baseada na paleta */}
      <ambientLight intensity={0.5} color="#3b82f6" /> {/* Luz ambiente azulada */}
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" castShadow />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#10b981" /> {/* Refletor verde */}

      {/* Chão / Mesa Profissional */}
      <group position={[0, 0, 0]}>
        {/* Grade de medição arquitetônica (cor de destaque sutil) */}
        <gridHelper args={[30, 30, '#10b981', '#334155']} position={[0, -0.01, 0]} />
        
        {/* Sombras de Contato Dinâmicas (Efeito Premium de renderizador moderno) */}
        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.6} 
          scale={30} 
          blur={1.5} 
          far={10} 
          resolution={256} 
          color="#000000" 
        />
      </group>

      {/* Controles profissionais com Damping (inércia) */}
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      
      {/* Renderiza a malha real carregada pelo usuário ou Primitiva, ou o placeholder se estiver vazio */}
      {hasObjects ? <LoadedMesh /> : <MinimalistShape />}

      {/* Renderização da Régua 3D */}
      {measurePoints.map((p, i) => (
        <mesh key={`pt-${i}`} position={p}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
      ))}
      {measurePoints.length === 2 && (
        <>
          <Line
            points={measurePoints}
            color="#f43f5e"
            lineWidth={3}
            dashed={true}
          />
          <Html position={measurePoints[1]} center style={{ pointerEvents: 'none' }}>
            <div style={{ background: '#f43f5e', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {measureDistance.toFixed(2)} cm
            </div>
          </Html>
        </>
      )}
    </Canvas>
  );
}
