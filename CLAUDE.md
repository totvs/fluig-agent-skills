# CLAUDE — fluig-agent-skills

Guia de navegação para o **Claude Code** usar este pacote ao ajudar
desenvolvedores externos a **criar, modernizar e revisar** customizações da
plataforma **Fluig**.

Este arquivo é um **roteador fino**: ele aponta para os arquivos canônicos **do
pacote** (`context/`, `skills/`, `examples/`) sem duplicar o conteúdo deles.
Para entender qualquer regra, abra o arquivo indicado — ele é a fonte de verdade.

## Contexto × Skills

- **Contexto (`context/`)** — responde **"o que é"**. Conhecimento permanente e
  **fonte única de verdade** do pacote.
- **Skills (`skills/`)** — respondem **"como fazer"**. Procedimentos
  especializados que **referenciam** o contexto em vez de copiá-lo.
- **Exemplos (`examples/`)** — referências concretas mínimas por tipo de artefato.

## Onde olhar

### Contexto — fonte de verdade (`context/`)

- `context/architecture.md` — modelo conceitual dos artefatos (widget, layout,
  form, dataset), pontos de extensão públicos, ciclo de vida
  visível ao código e estrutura oficial de pastas/arquivos (inclui o projeto
  Fluig Studio).
- `context/technologies.md` — tecnologias públicas: ES6+, bibliotecas
  client-side (jQuery, Kendo UI, Bootstrap), Fluig Style Guide e runtime de
  scripting server-side.
- `context/conventions.md` — padrões de código, convenções de widget, i18n,
  segurança via APIs públicas e chamadas REST públicas.
- `context/style-guide.md` — componentes, grid, helpers e variáveis CSS de tema
  (`var(--fs-color-*)`).

### Skills — procedimentos (`skills/<nome>/SKILL.md`)

Selecione a skill pela `description` no frontmatter do `SKILL.md`. Quando a skill
recebe um argumento, ele é descrito em `argument-hint`.

- **Geração:** `fluig-scaffolding-widget`, `fluig-scaffolding-layout`, `fluig-scaffolding-form`,
  `fluig-scaffolding-dataset`.
- **Modernização:** `fluig-migrate-jquery-es6`, `fluig-optimize-performance`,
  `fluig-improve-accessibility`, `fluig-validate-security`, `fluig-dark-mode`,
  `fluig-internationalization`, `fluig-style-guide-helpers`.
- **Revisão:** `fluig-code-review`, `fluig-review-performance`, `fluig-review-security`,
  `fluig-review-accessibility`, `fluig-best-practices`.

### Exemplos (`examples/`)

`widget/`, `layout/`, `form/`, `dataset/` — trechos mínimos
que refletem as APIs e convenções descritas em `context/`.

## Fluxo recomendado

1. Leia a `description` das skills em `skills/*/SKILL.md` e selecione a que
   corresponde à tarefa.
2. Siga o `SKILL.md` da skill escolhida.
3. Abra os arquivos de `context/` referenciados pela skill para as convenções
   oficiais (fonte de verdade).
4. Consulte o exemplo correspondente em `examples/`.
5. Produza o resultado seguindo o contexto.

Use apenas APIs públicas do Fluig e caminhos internos ao pacote (`context/`,
`skills/`, `examples/`). Se algo não for confirmável como público e oficial,
omita em vez de inventar.
