# CERA 3D

CERA 3D é um software desktop para modelagem geométrica e visualização 3D, focado em suporte a manipulação, reparo e preparação de malhas tridimensionais.

## Arquitetura do Sistema

O projeto utiliza uma arquitetura híbrida projetada para delegar a interface gráfica, a comunicação com o sistema operacional e os cálculos matemáticos a tecnologias específicas.

*   **Frontend:** Construído em React e TypeScript (via Vite). A renderização gráfica é realizada no contexto WebGL através do motor Three.js (React Three Fiber).
*   **Gerenciamento de Estado:** A biblioteca Zustand opera o controle de estado global, estabelecendo o desacoplamento entre os modais de interface e as atualizações de vértices no canvas 3D.
*   **Backend (I/O Nativo):** Escrito em Rust utilizando o framework Tauri. Executa o gerenciamento da janela nativa e as rotinas de I/O de disco em baixo nível, enviando os pacotes binários processados para o frontend através de chamadas IPC assíncronas.
*   **Processamento Geométrico:** Módulo focado nas rotinas de alto custo computacional (como operações booleanas de malhas). A implementação técnica usará bibliotecas C++ comunicando-se com a camada Rust por meio de FFI (Foreign Function Interface).

## Funcionalidades Implementadas

*   **Renderizador WebGL:** Renderização base em PBR (Physically Based Rendering) com manipulação de câmera em controles de órbita.
*   **Carregamento de Discos Físicos:** Rotina isolada em Rust (`tobj`) que realiza a extração e conversão de buffers a partir de arquivos `.obj` do disco do usuário.
*   **Integração com SO:** Caixas de diálogo nativas de arquivos do sistema (Windows/Linux/Mac).
*   **Geração de Geometrias Primitivas:** Instanciação dinâmica de parâmetros geométricos no Three.js para formas primitivas (Cubos, Cilindros, Esferas).
*   **Sistema de Materiais:** Alteração de propriedades físicas em tempo real baseada nos parâmetros do Zustand (cor base, índice de metalicidade, rugosidade de superfície e transmissão de luz).

## Estrutura de Documentação

A engenharia do sistema obedece a um planejamento orientado a testes na base do motor. O diretório `/docs` centraliza o escopo:
*   `docs/FEATURES.md` - Escopo de requisitos funcioais.
*   `docs/ROADMAP.md` - Planejamento cronológico, abordagens TDD e divisões em Sprints.
*   `docs/adr/` - Registros de Decisão Arquitetural (ADR).

## Ambiente de Desenvolvimento

O repositório requer Node.js e a toolchain completa do Cargo (Rust) instalados no sistema local.

1. Instalação das dependências base da interface:
   ```bash
   npm install
   ```
2. Compilação do binário Rust e start do servidor com Hot-Reload:
   ```bash
   npm run tauri dev
   ```

*Nota (Distribuições Linux): Um fix técnico específico que neutraliza a falha de renderização de buffers DMA em sistemas operando com Wayland e drivers fechados da NVIDIA (`WEBKIT_DISABLE_DMABUF_RENDERER=1`) está pré-configurado no entrypoint `lib.rs`.*
