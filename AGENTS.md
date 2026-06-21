# AGENTS — fluig-agent-skills

Guia de navegação para **agentes de IA genéricos** (Kiro, ChatGPT, Gemini CLI e
similares) que consomem este pacote para ajudar desenvolvedores externos a
**criar, modernizar e revisar** customizações da plataforma **Fluig**.

Este arquivo explica **como localizar e aplicar** o contexto e as skills do
pacote. Todo o conteúdo é **público e oficial**; o pacote é autocontido e
referencia apenas seus próprios diretórios (`context/`, `skills/`, `examples/`).

## Contexto × Skills

O pacote separa dois papéis complementares:

- **Contexto (`context/`)** — responde **"o que é"**. Conhecimento permanente
  sobre a plataforma e a **fonte única de verdade** do pacote. Consulte-o para
  convenções, tecnologias, arquitetura e regras de Style Guide.
- **Skills (`skills/`)** — respondem **"como fazer"**. Procedimentos
  especializados para uma tarefa específica. Cada skill **referencia** o
  contexto em vez de duplicá-lo.

Os **exemplos (`examples/`)** são referências concretas mínimas — trechos de
código curtos por tipo de artefato.

## Como descobrir e selecionar uma skill

- Cada skill é um **diretório** sob `skills/` contendo um arquivo `SKILL.md`.
- O `SKILL.md` começa com um **frontmatter YAML**. O campo `description`
  descreve **o que a skill faz e quando usá-la** — use-o para selecionar a skill
  certa para a tarefa do desenvolvedor.
- Quando uma skill recebe um argumento (ex.: um trecho de código alvo), o
  frontmatter declara `argument-hint` com a descrição do que fornecer.
- O corpo do `SKILL.md` traz as seções de execução: objetivo, quando usar,
  entradas esperadas, regras aplicáveis, saída esperada e exemplo de uso.

Skills disponíveis, agrupadas por intenção:

- **Geração:** `scaffolding-widget`, `scaffolding-layout`, `scaffolding-form`,
  `scaffolding-dataset`, `scaffolding-process-event`.
- **Modernização:** `migrate-jquery-es6`, `optimize-performance`,
  `improve-accessibility`, `validate-security`, `dark-mode`,
  `internationalization`, `style-guide-helpers`.
- **Revisão:** `code-review`, `review-performance`, `review-security`,
  `review-accessibility`, `fluig-best-practices`.

## Como as skills usam o contexto

- As skills tratam os arquivos de `context/` como **fonte de verdade** e os
  referenciam por **caminho relativo** (a partir do diretório da skill).
- Uma skill mantém apenas um **resumo executivo** da convenção; o detalhe
  permanece no arquivo de contexto correspondente. Para obter a regra completa,
  abra o arquivo de `context/` indicado pela skill.
- Os arquivos de contexto são:
  - `context/architecture.md` — artefatos, pontos de extensão e estrutura de pastas.
  - `context/technologies.md` — tecnologias públicas de customização.
  - `context/conventions.md` — padrões de código, i18n, segurança e REST público.
  - `context/style-guide.md` — componentes, grid, helpers e variáveis CSS de tema.

## Fluxo de uso para um agente

1. **Entenda a tarefa** do desenvolvedor (criar, modernizar ou revisar) e o tipo
   de artefato envolvido (widget, layout, form, dataset, evento de processo).
2. **Selecione a skill** lendo as `description` em `skills/*/SKILL.md` e escolha
   a que corresponde à tarefa.
3. **Leia o `SKILL.md`** completo: siga as regras e forneça o `argument-hint`
   quando aplicável.
4. **Abra o contexto referenciado** pela skill em `context/` para obter as
   convenções e regras oficiais como fonte de verdade.
5. **Consulte o exemplo** correspondente em `examples/` como referência concreta.
6. **Produza o resultado** (código gerado, modernizado ou relatório de revisão)
   seguindo as convenções do contexto.

## Limites

- Use somente APIs públicas do Fluig (ex.: `SuperWidget`, `WCMAPI`, `FLUIGC`,
  API pública de Dataset, eventos de processo BPM, `DOMPurify`,
  `i18n.getTranslation`, Fluig Style Guide e suas variáveis CSS).
- Refira-se apenas a caminhos **dentro do pacote** (`context/`, `skills/`,
  `examples/`). Não invente APIs, convenções ou estruturas: se algo não for
  confirmável como público e oficial, omita.
