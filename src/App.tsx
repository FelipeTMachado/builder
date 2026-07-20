import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";
import { Viewport3D } from "./components/Viewport3D";
import { useMeshStore } from "./store/useMeshStore";

function App() {
  const { 
    loadMeshFromFile, 
    loadPrimitive, 
    updateMaterial, 
    isLoading, 
    error, 
    clearMesh, 
    meshData, 
    primitiveType,
    materialProps 
  } = useMeshStore();

  async function handleOpenFile() {
    const selectedPath = await open({
      multiple: false,
    });

    if (selectedPath && typeof selectedPath === 'string') {
      await loadMeshFromFile(selectedPath);
    }
  }

  const hasObject = meshData !== null || primitiveType !== null;

  return (
    <div className="app-container">
      <header className="topbar glass-panel">
        <h1>CERA 3D</h1>
      </header>

      <aside className="sidebar glass-panel" style={{ overflowY: 'auto' }}>
        <h2>Adicionar Malha</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          <button onClick={handleOpenFile} disabled={isLoading}>
            {isLoading ? "Lendo do disco..." : "Importar .OBJ"}
          </button>
          
          {/* Botões de Primitivas Nativas */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => loadPrimitive('cube')}>Cubo</button>
            <button onClick={() => loadPrimitive('sphere')}>Esfera</button>
            <button onClick={() => loadPrimitive('cylinder')}>Cilindro</button>
          </div>
        </div>

        {/* Sistema de Pintura só aparece se houver algo na cena */}
        {hasObject && (
          <>
            <h2>Pintura e Material</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              
              {/* Paleta Premium Base */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', padding: '8px 0' }}>
                {['#3b82f6', '#10b981', '#f43f5e', '#eab308', '#f8fafc', '#0f172a'].map(color => (
                  <div 
                    key={color} 
                    onClick={() => updateMaterial({ color })}
                    style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', 
                      backgroundColor: color, cursor: 'pointer',
                      border: materialProps.color === color ? '2px solid white' : '1px solid var(--panel-border)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                ))}
              </div>

              {/* Acabamentos Físicos */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  style={{ opacity: materialProps.roughness === 0.8 ? 1 : 0.4 }}
                  onClick={() => updateMaterial({ roughness: 0.8, metalness: 0.1, transmission: 0, transparent: false })}
                >
                  Fosco
                </button>
                <button 
                  style={{ opacity: materialProps.metalness === 0.9 ? 1 : 0.4 }}
                  onClick={() => updateMaterial({ roughness: 0.2, metalness: 0.9, transmission: 0, transparent: false })}
                >
                  Metálico
                </button>
                <button 
                  style={{ opacity: materialProps.transmission === 0.9 ? 1 : 0.4 }}
                  onClick={() => updateMaterial({ roughness: 0.05, metalness: 0.1, transmission: 0.9, transparent: true })}
                >
                  Vidro
                </button>
              </div>
            </div>

            <button 
              onClick={clearMesh} 
              style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', marginTop: 'auto' }}
            >
              Limpar Cena
            </button>
          </>
        )}

        {error && (
          <div className="result-msg" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            Erro: {error}
          </div>
        )}
      </aside>

      <main className="canvas-area">
        <Viewport3D />
      </main>
    </div>
  );
}

export default App;
