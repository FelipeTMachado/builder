import { open } from "@tauri-apps/plugin-dialog";
import { Move3d, Rotate3d, Scaling, Box, Circle, Cylinder, Trash2, FolderOpen } from "lucide-react";
import "./App.css";
import { Viewport3D } from "./components/Viewport3D";
import { useMeshStore } from "./store/useMeshStore";

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
    transformMode
  } = useMeshStore();

  const selectedObject = objects.find(o => o.id === selectedId);
  const materialProps = selectedObject?.materialProps || { color: '#000', roughness: 0.5, metalness: 0, transmission: 0, transparent: false };
  const hasObjects = objects.length > 0;

  async function handleOpenFile() {
    const selectedPath = await open({ multiple: false });
    if (selectedPath && typeof selectedPath === 'string') {
      await loadMeshFromFile(selectedPath);
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
        </div>

        <Viewport3D />
      </main>

    </div>
  );
}

export default App;
