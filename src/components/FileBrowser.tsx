import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Folder, File, ArrowLeft } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
}

export function FileBrowser({ onSave, onCancel, defaultFormat }: { onSave: (path: string) => void, onCancel: () => void, defaultFormat: 'obj'|'stl' }) {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<FileNode[]>([]);
  const [fileName, setFileName] = useState('modelo_exportado');

  useEffect(() => {
    invoke<string>('get_home_dir').then(home => {
      loadDirectory(home);
    }).catch(console.error);
  }, []);

  const loadDirectory = async (path: string) => {
    try {
      const result = await invoke<FileNode[]>('list_directory', { path });
      setFiles(result);
      setCurrentPath(path);
    } catch (err) {
      console.error(err);
    }
  };

  const goUp = () => {
    const parts = currentPath.split('/');
    if (parts.length > 1) {
      parts.pop();
      const newPath = parts.join('/') || '/';
      loadDirectory(newPath);
    }
  };

  const handleSave = () => {
    let finalName = fileName;
    if (!finalName.toLowerCase().endsWith(`.${defaultFormat}`)) {
      finalName += `.${defaultFormat}`;
    }
    // No Linux/Mac as barras são '/', no Windows podem ser '\\'. O Tauri vai lidar com isso se juntarmos com '/'.
    onSave(`${currentPath}/${finalName}`);
  };

  return (
    <div className="glass-panel" style={{ width: '650px', height: '450px', display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
      {/* HEADER: GNOME Style */}
      <div style={{ padding: '16px', background: 'rgba(30, 41, 59, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={goUp} className="icon-btn" style={{ padding: '8px' }} title="Subir um diretório">
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '14px', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {currentPath}
        </div>
      </div>

      {/* FILE LIST */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {files.map(f => (
          <div 
            key={f.path} 
            onClick={() => f.is_dir ? loadDirectory(f.path) : null}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
              cursor: f.is_dir ? 'pointer' : 'default',
              borderRadius: '8px',
              opacity: f.is_dir ? 1 : 0.4,
              transition: 'background 0.1s'
            }}
            onMouseOver={(e) => { if(f.is_dir) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {f.is_dir ? <Folder size={20} color="#3b82f6" /> : <File size={20} color="#64748b" />}
            <span style={{ fontSize: '15px', color: '#e2e8f0', userSelect: 'none' }}>{f.name}</span>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ padding: '16px', background: 'rgba(30, 41, 59, 0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input 
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid #334155', color: 'white', padding: '12px 16px', borderRadius: '8px', outline: 'none', fontSize: '15px' }}
          placeholder="Digite o nome do arquivo..."
        />
        <div style={{ color: '#94a3b8', background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold' }}>
          .{defaultFormat}
        </div>
        
        <div style={{ flex: 1 }}></div>

        <button 
          onClick={onCancel} 
          style={{ padding: '12px 20px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Cancelar
        </button>
        <button 
          onClick={handleSave} 
          style={{ padding: '12px 20px', background: '#10b981', border: '1px solid #059669', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
          onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
        >
          Salvar Aqui
        </button>
      </div>
    </div>
  );
}
