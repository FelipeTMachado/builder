import { invoke } from '@tauri-apps/api/core';
import { open } from "@tauri-apps/plugin-dialog";
import * as THREE from 'three';
import { useState } from 'react';
import { Box, ArrowDownToLine, Move3d, Rotate3d, Scaling, Trash2, Ruler, Download, Circle, Cylinder, FolderOpen, Lock, Unlock, Printer, Eye } from "lucide-react";
import "./App.css";
import { Viewport3D } from "./components/Viewport3D";
import { useMeshStore } from "./store/useMeshStore";
import { FileBrowser } from './components/FileBrowser';

function App() {
  const { 
    loadMeshFromFile, 
    loadPrimitive, 
    updateMaterial,
    setTransformMode,
    isLoading, 
    clearScene, 
    objects,
    selectedId,
    transformMode,
    isScaleLocked,
    toggleScaleLock,
    triggerAction,
    globalWireframe
  } = useMeshStore();

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [fileBrowserFormat, setFileBrowserFormat] = useState<'obj'|'stl'|null>(null);

  const selectedObject = objects.find(o => o.id === selectedId);
  const materialProps = selectedObject?.materialProps || { color: '#000', roughness: 0.5, metalness: 0, transmission: 0, transparent: false };
  const hasObjects = objects.length > 0;

  async function handleOpenFile() {
    const selectedPath = await open({ multiple: false });
    if (selectedPath && typeof selectedPath === 'string') {
      await loadMeshFromFile(selectedPath);
    }
  }

  // Acionado ao clicar em um dos Cards
  function executeExport(format: 'obj' | 'stl') {
    if (!hasObjects) return;
    triggerAction('sync_transforms'); // Força todos os objetos a salvarem suas posições atuais
    setFileBrowserFormat(format); 
  }

  // Acionado pelo botão "Salvar Aqui" da nossa própria FileBrowser
  async function handleSaveAction(savePath: string) {
    if (!hasObjects || !fileBrowserFormat) return;
    
    const currentFormat = fileBrowserFormat; // Copia a ref local
    setFileBrowserFormat(null);
    setExportModalOpen(false);
       const exportMeshes = [];

    for (const obj of objects) {
        let geo: THREE.BufferGeometry;
        
        // Reconstrói a geometria base do objeto
        if (obj.meshData) {
           geo = new THREE.BufferGeometry();
           geo.setAttribute('position', new THREE.Float32BufferAttribute(obj.meshData.vertices, 3));
           if (obj.meshData.indices.length > 0) {
               geo.setIndex(obj.meshData.indices);
           }
           geo.computeBoundingBox();
           const center = new THREE.Vector3();
           geo.boundingBox?.getCenter(center);
           geo.translate(-center.x, -center.y, -center.z);
        } else {
           if (obj.type === 'cube') geo = new THREE.BoxGeometry(2,2,2);
           else if (obj.type === 'sphere') geo = new THREE.SphereGeometry(1.5, 32, 32);
           else geo = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
        }

        // Converte para Non-Indexed
        const nonIndexedGeo = geo.toNonIndexed();

        // Aplica transformações
        const euler = new THREE.Euler(...obj.transformData.rotation);
        const quaternion = new THREE.Quaternion().setFromEuler(euler);
        const position = new THREE.Vector3(...obj.transformData.position);
        const scale = new THREE.Vector3(...obj.transformData.scale);
        const matrix = new THREE.Matrix4().compose(position, quaternion, scale);
        
        nonIndexedGeo.applyMatrix4(matrix);

        // Z-up Correction (Rotaciona +90 graus no eixo X para que o Y do ThreeJS vire o Z do Cura)
        const zUpCorrection = new THREE.Matrix4().makeRotationX(Math.PI / 2);
        nonIndexedGeo.applyMatrix4(zUpCorrection);

        // Extrai vértices
        const arr = nonIndexedGeo.attributes.position.array;
        let verts = [];
        for (let i = 0; i < arr.length; i++) {
            verts.push(arr[i]);
        }
        
        const numVertices = verts.length / 3;
        const inds = Array.from({ length: numVertices }, (_, i) => i);
        
        exportMeshes.push({
            name: `${obj.type}_${obj.id.substring(0, 4)}`,
            vertices: verts,
            indices: inds
        });
    }

    try {
      if (currentFormat === 'obj') {
        await invoke('export_obj_multi', { path: savePath, meshes: exportMeshes });
      } else {
        await invoke('export_stl_multi', { path: savePath, meshes: exportMeshes });
      }
      alert(`Exportação 100% concluída! ${objects.length} objetos da sua mesa foram fundidos com sucesso no arquivo ${currentFormat.toUpperCase()}.`);
    } catch (e: any) {
      alert("ERRO FATAL NA EXPORTAÇÃO: " + e.toString());
    }
  }

  return (
    <div className="app-container">
      
      {/* Painel Esquerdo Fixo (Estrutural) */}
      <aside className="sidebar glass-panel">
        <h1>CERA 3D</h1>

        <div>
          <h2>Importar</h2>
          <button onClick={handleOpenFile} disabled={isLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FolderOpen size={18} />
            {isLoading ? "Processando..." : "Abrir Modelo Local"}
          </button>
        </div>

        {hasObjects && (
          <>
            <div>
              <h2>Materiais e Acabamento</h2>
              {!selectedId && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nenhum objeto selecionado.</p>}
              
              <div style={{ opacity: selectedId ? 1 : 0.4, pointerEvents: selectedId ? 'auto' : 'none' }}>
                {/* Paleta de Cores */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {['#3b82f6', '#10b981', '#f43f5e', '#eab308', '#f8fafc', '#0f172a'].map(color => (
                  <div 
                    key={color} 
                    onClick={() => updateMaterial({ color })}
                    style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: color, cursor: 'pointer',
                      border: materialProps.color === color ? '2px solid white' : '1px solid var(--panel-border)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} 
                  />
                ))}
              </div>

              {/* Botões de Física do Material */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`material-btn ${materialProps.roughness === 0.8 ? 'active' : ''}`}
                  onClick={() => updateMaterial({ roughness: 0.8, metalness: 0.1, transmission: 0, transparent: false })}
                >Fosco</button>
                <button 
                  className={`material-btn ${materialProps.metalness === 0.9 ? 'active' : ''}`}
                  onClick={() => updateMaterial({ roughness: 0.2, metalness: 0.9, transmission: 0, transparent: false })}
                >Metal</button>
                <button 
                  className={`material-btn ${materialProps.transmission === 0.9 ? 'active' : ''}`}
                  onClick={() => updateMaterial({ roughness: 0.05, metalness: 0.1, transmission: 0.9, transparent: true })}
                >Vidro</button>
              </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button 
                onClick={clearScene} 
                style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Trash2 size={16} /> Limpar Cena
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Viewport Central */}
      <main className="canvas-area">
        
        {/* Barra de Ferramentas Flutuante (Estilo AutoCAD/Blender) */}
        <div className="toolbar glass-panel">
          <button className="icon-btn" title="Adicionar Cubo" onClick={() => loadPrimitive('cube')}>
            <Box size={20} />
          </button>
          <button className="icon-btn" title="Adicionar Esfera" onClick={() => loadPrimitive('sphere')}>
            <Circle size={20} />
          </button>
          <button className="icon-btn" title="Adicionar Cilindro" onClick={() => loadPrimitive('cylinder')}>
            <Cylinder size={20} />
          </button>
          
          <div className="toolbar-divider" />

          <button 
            className={`icon-btn ${transformMode === 'translate' ? 'active' : ''}`} 
            title="Mover (Translação)"
            onClick={() => setTransformMode('translate')}
            disabled={!hasObjects || !selectedId}
          >
            <Move3d size={20} />
          </button>
          <button 
            className={`icon-btn ${transformMode === 'rotate' ? 'active' : ''}`} 
            title="Rotacionar"
            onClick={() => setTransformMode('rotate')}
            disabled={!hasObjects || !selectedId}
          >
            <Rotate3d size={20} />
          </button>
          <button 
            className={`icon-btn ${transformMode === 'scale' ? 'active' : ''}`} 
            title="Escalar"
            onClick={() => setTransformMode('scale')}
            disabled={!hasObjects || !selectedId}
          >
            <Scaling size={20} />
          </button>

          {/* Menu Contextual do Escalar: Travar Proporção */}
          {transformMode === 'scale' && hasObjects && selectedId && (
            <button 
              className={`icon-btn ${isScaleLocked ? 'active' : ''}`} 
              title={isScaleLocked ? "Escala Proporcional (Travada)" : "Escala Livre (Destravada)"}
              onClick={toggleScaleLock}
              style={{ marginLeft: '-4px', transform: 'scale(0.85)' }}
            >
              {isScaleLocked ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
          )}

          <div className="toolbar-divider" />

          <button 
            className={`icon-btn ${globalWireframe ? 'active' : ''}`}
            title="Modo Raio-X (Wireframe)"
            onClick={() => useMeshStore.setState({ globalWireframe: !globalWireframe })}
            style={{ color: globalWireframe ? '#10b981' : 'inherit' }}
          >
            <Box size={20} />
          </button>
          
          <button 
            className="icon-btn" 
            title="Acomodar Cena no Solo (Settle)"
            onClick={() => triggerAction('settle')}
            disabled={!hasObjects}
          >
            <ArrowDownToLine size={20} />
          </button>
          <button 
            className={`icon-btn ${transformMode === 'measure' ? 'active' : ''}`} 
            title="Régua de Medição"
            onClick={() => setTransformMode(transformMode === 'measure' ? null : 'measure')}
          >
            <Ruler size={20} />
          </button>
          
          <div className="toolbar-divider" />
                    <button 
              className="icon-btn primary" 
              title="Exportar Cena Completa"
              onClick={() => setExportModalOpen(true)}
              disabled={!hasObjects}
              style={{ color: '#10b981' }}
            >
              <Download size={20} />
            </button>
          </div>

        <Viewport3D />
      </main>

      {/* Modal de Exportação com UX Premium */}
      {exportModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {fileBrowserFormat ? (
            <FileBrowser 
              defaultFormat={fileBrowserFormat} 
              onCancel={() => setFileBrowserFormat(null)}
              onSave={handleSaveAction}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <h3 style={{ marginTop: 0, color: 'white', marginBottom: '8px', fontSize: '20px' }}>Exportar Modelo 3D</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                Escolha o formato em que deseja salvar a malha no seu computador.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div 
                  onClick={() => executeExport('obj')} 
                  className="export-card obj-card"
                >
                  <div className="card-icon"><Box size={28} /></div>
                  <h4>Wavefront (.OBJ)</h4>
                  <p>Ideal para edição posterior no Blender, Maya e Unity.</p>
                </div>

                <div 
                  onClick={() => executeExport('stl')} 
                  className="export-card stl-card"
                >
                  <div className="card-icon"><Printer size={28} /></div>
                  <h4>Impressão 3D (.STL)</h4>
                  <p>Geometria otimizada para Slicers como Cura e Prusa.</p>
                </div>
              </div>
              
              <button 
                onClick={() => setExportModalOpen(false)} 
                style={{ width: '100%', padding: '14px', cursor: 'pointer', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', fontWeight: 'bold', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                Cancelar Exportação
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
