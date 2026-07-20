# Estratégia de Desenvolvimento e Roadmap

Este documento define o guia mestre para o desenvolvimento do nosso Web 3D Builder híbrido.

## 1. Fluxo de Trabalho e Metodologia (TDD Bottom-Up)

Adotaremos **TDD (Test-Driven Development)** de forma estrita para evitar regressões nas complexas lógicas matemáticas de geometria 3D. O fluxo será sempre *Bottom-Up* (de baixo para cima), garantindo que as fundações mais críticas estejam provadas antes de ligarmos a interface gráfica.

*   **1º Passo (Camada C++ - O Motor):** Criar testes puramente matemáticos usando Google Test ou Catch2. Exemplo: passar dados binários de uma malha mockada e afirmar que a malha de saída tem menos polígonos.
*   **2º Passo (Camada Rust - O Maestro):** Usar o `cargo test` para testar as chamadas seguras da ponte FFI, garantindo que o Rust gerencia falhas de memória, conversões de dados, abertura de arquivos no SO e roteamento correto dos retornos do C++.
*   **3º Passo (Camada React - A Interface):** Usar o `Vitest` para validar regras da UI (estado no Zustand, exibição de modais, chamadas IPC pro Tauri). *Nota:* O canvas WebGL/Three.js não terá testes unitários de pixel perfeitos devido à volatilidade de motores de renderização, focaremos em testar o estado lógico da cena.

## 2. Roadmap em Sprints

### Sprint 1: Fundação e Proof of Concept (O Setup Híbrido)
**Objetivo:** Provar a comunicação contínua entre as três linguagens.
*   [ ] **01.** Inicialização do projeto: Tauri (Rust), Vite (React).
*   [ ] **02.** Configuração inicial do sistema de design premium (CSS Vanilla, UI Minimalista em Glassmorphism, paleta de cores misturando tons de azul escuro e verde vibrante conforme o mockup aprovado).
*   [ ] **03.** Configuração do ambiente de compilação para código C++ (CMake) integrado ao fluxo do `cargo`.
*   [ ] **04.** Configuração do *Foreign Function Interface* (FFI) (bindgen/cxx).
*   [ ] **05. Teste de conceito (Hello World Híbrido):** React envia um comando (ex: somar) -> Tauri (Rust) recebe e roteia -> C++ calcula e responde -> React exibe.

### Sprint 2: O Visualizador (The Viewer)
**Objetivo:** Carregar e renderizar malhas tridimensionais no frontend.
*   [ ] **06.** Implementação do Three.js e React Three Fiber no frontend.
*   [ ] **07.** TDD (Rust): Leitura de arquivos `.stl`/`.obj` pelo sistema de arquivos local nativo (sem depender das APIs de browser).
*   [ ] **08.** TDD (UI): Lógica de estado Zustand para armazenar os vértices e normais da malha carregada.
*   [ ] **09.** Interface de seleção e carregamento de malha.
*   [ ] **10.** Controles de câmera na viewport 3D e iluminação base de alta qualidade.
*   [ ] **11. Criação de Primitivas:** Adição de cubos, esferas e cilindros nativos diretamente pelo menu.
*   [ ] **12. Sistema de Pintura e Materiais:** Alteração de cor e suporte a propriedades visuais básicas (Fosco, Metálico, Translúcido).

### Sprint 3: Manipulação Espacial Básica
**Objetivo:** Interação do usuário para alterar parâmetros espaciais da malha.
*   [ ] **13.** TDD (UI): Botões de transformação de estado (Mover, Rotacionar, Escalar).
*   [ ] **14. Agrupamento (Group/Ungroup):** Lógica no estado global para travar e destravar a manipulação de múltiplos objetos simultaneamente.
*   [ ] **15.** Implementação de Gizmos de controle e transformação 3D no React Three Fiber.
*   [ ] **16.** Gerenciamento unificado da matriz de transformação no Zustand.
*   [ ] **17. Régua de Medição:** Ferramenta interativa para medir a distância real entre dois pontos no espaço 3D.
*   [ ] **18. Acomodar (Settle):** Algoritmo para alinhar a base mais plana e estável do objeto diretamente ao solo.
*   [ ] **19.** TDD (Rust): Função para compilar as transformações e salvar/exportar o modelo atualizado de volta para o disco rígido.

### Sprint 4: O Motor C++ em Ação (Geometria Pesada)
**Objetivo:** Introduzir operações geométricas puras consumindo alto processamento em backend.
*   [ ] **20.** TDD (C++): Algoritmo geométrico de "Esvaziamento" (Hollow / Ocar) ou "Cálculo de Volume".
*   [ ] **21.** TDD (Rust): Binding da nova função matemática para uso seguro.
*   [ ] **22.** UI: Criação do painel lateral de ferramentas avançadas e controle de barras de carregamento para lógicas pesadas.
*   [ ] **23.** TDD (C++): Ferramenta **Dividir/Cortar**, particionando a malha ao meio utilizando um plano interativo.
*   [ ] **24.** Integração fim a fim visualizando a malha transformada no canvas.

### Sprint 5: Refino Matemático e UX Premium
**Objetivo:** Entregar funcionalidades "Killer" com um design e sensação espetaculares.
*   [ ] **25.** TDD (C++): Reparo inteligente de malhas com falhas (Garantia de Watertight mesh).
*   [ ] **26.** TDD (C++): Operações booleanas (Mesclar e Subtrair polígonos sólidos).
*   [ ] **27. Gravação em Relevo (Emboss):** Gerar textos ou ícones 3D mesclados sobre a superfície de um objeto.
*   [ ] **28. Conversão de Imagem (2D para 3D):** Processamento para gerar uma malha em alto-relevo baseada numa imagem (PNG/JPG).
*   [ ] **29.** Implementação de modos de visualização profissionais na Viewport WebGL (Raio-X, Wireframe e Shading).
*   [ ] **30.** Polimento extremo da UI com micro-animações, design "glassmorphism", alertas não-intrusivos e transições premium.
