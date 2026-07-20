# 0001: Escolha do Framework de Aplicativo Desktop

**Status:** Aceito

## Contexto
Precisamos construir um aplicativo de edição e visualização 3D de alta performance que possa explorar todo o poder da placa de vídeo dedicada (GPU) do computador. O aplicativo será desenvolvido e executado nativamente em ambiente Linux. Queremos uma interface visual incrivelmente bonita, dinâmica e responsiva (design premium), mantendo um consumo eficiente de recursos (RAM e CPU) e fácil integração com lógicas de sistema de baixo nível.

## Decisão
Adotaremos o **Tauri** como framework para a construção do aplicativo desktop. A arquitetura se dividirá em duas partes fundamentais:
1.  **Frontend (Interface):** Construído usando **React + Vite** junto com **CSS Vanilla** para um design system premium. A renderização visual 3D (para visualização no canvas da UI) utilizará Three.js/React Three Fiber ou similar.
2.  **Backend (Lógica de Sistema):** Construído nativamente em **Rust**. O Rust será responsável por gerenciar as janelas do SO, acessar o sistema de arquivos local de forma segura e atuar como a ponte principal de comunicação nativa.

No Linux, o Tauri utilizará nativamente o *WebKitGTK* para renderizar a interface Web, sem embutir um navegador inteiro como o Electron faria.

## Consequências

*   **Positivas:**
    *   Binários extremamente pequenos e eficientes no Linux.
    *   Consumo de memória RAM drasticamente inferior ao Electron.
    *   Permite o uso de tecnologias Web maduras para entregar uma interface luxuosa.
    *   Garantia de segurança de memória e alta performance em threads no backend graças ao Rust.
*   **Negativas:**
    *   O desenvolvedor precisa lidar com comunicação via IPC (Inter-Process Communication) entre o React e o Rust.
    *   Requer a instalação prévia de dependências nativas (como `webkit2gtk-4.0` e build tools) no ambiente Linux para compilar o app.
