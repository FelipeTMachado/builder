# Mapeamento de Funcionalidades - Microsoft 3D Builder

Este documento mapeia as principais funcionalidades do Microsoft 3D Builder, um aplicativo focado em visualização, edição simples e preparação de modelos 3D para impressão.

## 1. Ferramentas Essenciais de Modelagem e Edição

*   **Manipulação de Objetos:** Inserir, redimensionar, rotacionar, mudar a escala, espelhar (flip) e mover objetos 3D no espaço de trabalho.
*   **Agrupamento (Group/Ungroup):** Capacidade de selecionar múltiplos objetos e agrupá-los para manipulá-los como um só, bem como desagrupar peças compostas.
*   **Edição Avançada:**
    *   **Dividir (Split):** Cortar modelos em partes menores.
    *   **Mesclar (Merge/Intersect/Subtract):** Operações booleanas para juntar múltiplos objetos em um único sólido, intersecionar ou subtrair formas.
    *   **Suavizar (Smooth):** Arredondar as arestas e superfícies de modelos poligonais.
    *   **Gravar (Emboss):** Adicionar texto ou formas em alto relevo (ou baixo relevo) sobre a superfície dos modelos.
    *   **Pintar e Materiais:** Adicionar cores às faces do modelo e aplicar texturas ou propriedades de material (Fosco, Brilhante, Translúcido, Metálico) para destacar peças.
    *   **Ocar (Hollow):** Esvaziar o interior de um modelo sólido para economizar material de impressão e reduzir o peso da peça.
    *   **Simplificar (Simplify):** Reduzir a quantidade de polígonos (triângulos) de um modelo, diminuindo drasticamente o tamanho do arquivo, muito útil para modelos pesados ou scans 3D.
*   **Criação via Formas Primitivas:** Construção de novos modelos do zero utilizando formas geométricas básicas (cubos, cones, cilindros, esferas, pirâmides, etc.).
*   **Ferramentas de Medição (Measure):** Réguas dedicadas para medir as proporções e distâncias exatas entre pontos do objeto.

## 2. Ferramentas de Importação e Captura

*   **Conversão de 2D para 3D:** Capacidade de importar imagens 2D (BMP, JPG, PNG, TGA) e extrudá-las para criar objetos 3D com base na imagem.
*   **Captura via Webcam/Kinect:** Utilizar a câmera do dispositivo para escanear ou capturar imagens e transformá-las em modelos 3D.
*   **Biblioteca Integrada:** Acesso a uma biblioteca nativa com modelos 3D prontos para uso (brinquedos, utilidades, miniaturas, etc.) que podem ser inseridos no projeto.

## 3. Preparação para Impressão 3D

*   **Reparo e Otimização Automática:** Excelente capacidade de corrigir e reparar modelos com falhas na malha geométrica, tornando-os "watertight" (sólidos sem buracos), essencial para fatiadores.
*   **Ferramenta "Acomodar" (Settle):** Utiliza gravidade simulada para deixar o objeto cair na mesa de impressão, de forma a encontrar o melhor ponto de equilíbrio plano.
*   **Verificação de Tamanho e Escala:** Ferramentas para medir e garantir que o modelo caberá no volume de impressão da máquina.
*   **Impressão Direta:** Integração com o Windows para mandar imprimir diretamente para impressoras 3D suportadas ou enviar para serviços de impressão online.

## 4. Suporte a Arquivos

*   **Importação:** Lê os formatos de arquivos 3D mais populares da indústria, como `.3mf`, `.stl`, `.obj`, `.ply`, `.wrl` (VRML), `.gltf` e `.glb`.
*   **Exportação:** Salva e exporta arquivos prontos para uso em outros softwares ou impressoras, suportando principalmente os formatos modernos `.3mf` e os tradicionais `.stl`, `.ply` e `.obj`.

## 5. Interface e Visualização

*   **Design Amigável ao Toque:** A interface enxuta e amigável foi projetada para ter suporte nativo e eficiente a telas touchscreen e uso com canetas (Stylus).
*   **Modos de Renderização de Malha:** Oferece opções muito úteis de visualização avançada, incluindo "Raio-X" (transparência da peça), modo Wireframe (visualização da malha poligonal/aramado) e configuração de sombras na cena.
