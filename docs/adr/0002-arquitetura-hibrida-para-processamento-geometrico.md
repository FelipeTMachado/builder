# 0002: Arquitetura Híbrida para Processamento Geométrico 3D

**Status:** Aceito

## Contexto
O aplicativo precisa realizar operações geométricas avançadas, inspiradas no extinto 3D Builder. Funcionalidades como Operações Booleanas CSG (Mesclar, Subtrair, Intersecionar), Reparar Malhas ("Watertight"), Ocar (Hollow) e Simplificar (Decimate) exigem matemática computacional extremamente complexa. Desenvolver esses algoritmos "do zero" na mão (seja em Rust ou JavaScript) consumiria anos de desenvolvimento e resultaria em problemas de imprecisão com cálculos de ponto flutuante.

## Decisão
Implementaremos uma **Arquitetura Híbrida (Rust + C++)** utilizando **FFI (Foreign Function Interface)**.
1. O motor principal e maestro da aplicação permanece em **Rust** (conforme ADR 0001).
2. O processamento matemático pesado será delegado a um módulo construído em **C++**.
3. Neste módulo C++, utilizaremos bibliotecas consagradas da indústria, como **CGAL** (Computational Geometry Algorithms Library) para operações complexas, reparo e CSG, ou bibliotecas como **libigl** e **OpenMesh**.
4. A comunicação entre o backend central (Rust) e o motor geométrico (C++) se dará via bindings FFI (usando pacotes ecossistema Rust como `cxx` ou `bindgen`).

## Consequências

*   **Positivas:**
    *   Aproveitaremos décadas de pesquisa, desenvolvimento e otimização da indústria matemática C++, garantindo resultados de nível profissional sem precisar reinventar a roda.
    *   Isolamento do código perigoso (C++ manual) dentro de uma "caixa preta", onde o Rust chama funções simples enviando e recebendo buffers de memória da malha.
*   **Negativas:**
    *   **Complexidade de Build:** O setup do projeto será mais complexo. Precisaremos configurar uma *pipeline* de build que consiga compilar código C++ (via CMake/Make) e depois unificá-lo de forma transparente ao fluxo de compilação padrão do Rust (`cargo build`) no Linux.
    *   A travessia de dados grandes (arrays de polígonos) através do FFI precisa ser cuidadosamente planejada para passar apenas ponteiros na memória, a fim de evitar cópias pesadas que matariam a performance.
