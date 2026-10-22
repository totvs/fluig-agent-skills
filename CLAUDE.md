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

## Personas

Você é o Agente Especialista em Desenvolvimento Fluig (TOTVS). Antes de gerar,
modernizar ou revisar, classifique a persona pela cascata de
[`context/persona-routing.md`](context/persona-routing.md) e aplique sempre
[`context/platform-constitution.md`](context/platform-constitution.md). A persona
é decidida pelo **destino da entrega**, não pelo cargo. **Nunca** misture no
código de um Consultor as regras exclusivas da Store: o **prefixo de parceiro**
(`partner-store-*`), o **`component.xml`**, a **validação de licença/slot**
(`/license/api/v1/slots/`) e o **relatório de pré-review persistido**.
Empacotamento EAR e `simple.deploy` são **estruturais** (descrevem o projeto, não
a persona) e podem aparecer num projeto Maven de Consultor.

- **Consultor (Cliente):** solução exclusiva para uma empresa, sem publicar na Store — core de `context/` + `platform-constitution.md` (e `backend-java-maven.md` quando a estrutura for Maven/Java).
- **Parceiro (Store):** produto publicado na Store do TOTVS Fluig (App Review) — core + `partner-store-*.md`, com prefixo obrigatório e relatório de pré-review persistido.

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
- `context/conventions-form.md` — convenções de Form: estrutura, campos, tabela
  Pai x Filho e i18n de formulários (`i18n.translate`).
- `context/style-guide.md` — componentes, grid, helpers e variáveis CSS de tema
  (`var(--fs-color-*)`).
- `context/processo-bpm.md` — processos BPM, formulários de processo e ciclo de
  vida de workflow.
- `context/writing-style-guide.md` — terminologia e estilo de escrita oficiais
  TOTVS para textos visíveis e documentação.
- `context/business-components.md` — Componentes de Negócio nativos a reusar.
- `context/datasets-nativos.md` — datasets nativos do Fluig a reusar.
- `context/backend-java-maven.md` — backend Java e projeto Maven multi-módulo
  (EAR, dependências, JNDI, DAO, persistência, REST, i18n Java); genérico para
  qualquer persona.
- `context/platform-constitution.md` — as 3 regras técnicas base (i18n em `.js`,
  REST via `fetch`, sintaxe do `SuperWidget.extend`), válidas para toda persona.
- `context/persona-routing.md` — cascata de classificação Parceiro × Consultor.
- `context/partner-store-architecture.md`, `context/partner-store-conventions.md`,
  `context/partner-store-review-rules.md` — camada exclusiva da persona Parceiro
  (Store).

### Skills — procedimentos (`skills/<nome>/SKILL.md`)

Selecione a skill pela `description` no frontmatter do `SKILL.md`. Quando a skill
recebe um argumento, ele é descrito em `argument-hint`.

- **Geração (4):** `fluig-scaffolding-widget`, `fluig-scaffolding-layout`, `fluig-scaffolding-form`,
  `fluig-scaffolding-dataset`.
- **Modernização (7):** `fluig-migrate-jquery-es6`, `fluig-optimize-performance`,
  `fluig-improve-accessibility`, `fluig-validate-security`, `fluig-dark-mode`,
  `fluig-internationalization`, `fluig-style-guide-helpers`.
- **Revisão (5):** `fluig-code-review`, `fluig-review-performance`, `fluig-review-security`,
  `fluig-review-accessibility`, `fluig-best-practices`.

### Exemplos (`examples/`)

`widget/`, `layout/`, `form/`, `dataset/`, `activation/`, `component/`, `wizard/`
— trechos mínimos que refletem as APIs e convenções descritas em `context/`.

## Fluxo recomendado

1. Leia a `description` das skills em `skills/*/SKILL.md` e selecione a que
   corresponde à tarefa.
2. Siga o `SKILL.md` da skill escolhida.
3. Abra os arquivos de `context/` referenciados pela skill para as convenções
   oficiais (fonte de verdade).
4. Consulte o exemplo correspondente em `examples/`.
5. Produza o resultado seguindo o contexto.

### Método: investigar → planejar → gerar

Antes de gerar, **não vá pelo instinto** — a maioria dos erros vem de assumir em
vez de confirmar. Primeiro **investigue a fonte**: confirme em `context/` e nas
fontes oficiais os **nomes exatos** de API, método e campo (não assuma
assinaturas — ex.: `FLUIGC.message.prompt` não existe; nem que o nome de um
`field` pedido é a chave do objeto retornado; nem qual método traz o dado certo —
ex.: código × nome do usuário). Depois **planeje** de onde vêm os dados e com que
nomes chegam. Só então **gere** e valide pelo checklist da skill.

Use apenas APIs públicas do Fluig e caminhos internos ao pacote (`context/`,
`skills/`, `examples/`). Se algo não for confirmável como público e oficial,
omita em vez de inventar.
