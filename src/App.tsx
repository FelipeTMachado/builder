import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function testTauriConnection() {
    // Teste de comunicação React -> Rust
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="app-container">
      {/* Topbar central estilo Glass */}
      <header className="topbar glass-panel">
        <h1>CERA 3D</h1>
      </header>

      {/* Menu lateral estilo Glass */}
      <aside className="sidebar glass-panel">
        <h2>Teste de Hibridez</h2>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            testTauriConnection();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Digite algo..."
            autoComplete="off"
          />
          <button type="submit">Enviar pro Rust</button>
        </form>

        {greetMsg && (
          <div className="result-msg">
            {greetMsg}
          </div>
        )}
      </aside>

      {/* Espaço central reservado para o Motor 3D (Three.js) */}
      <main className="canvas-area">
        <p style={{ color: 'var(--text-secondary)', opacity: 0.5, letterSpacing: '2px' }}>
          [ VIEWPORT 3D ]
        </p>
      </main>
    </div>
  );
}

export default App;
