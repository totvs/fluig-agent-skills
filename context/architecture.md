# Arquitetura dos Artefatos de Customização Fluig

> Fonte única de verdade do pacote para o **modelo conceitual dos artefatos que o
> desenvolvedor externo constrói**, seus **pontos de extensão públicos** e o
> **ciclo de vida/execução visível ao código de customização**. As skills
> referenciam este arquivo em vez de duplicar seu conteúdo. Para convenções de
> código, i18n e segurança, veja [conventions.md](conventions.md). Para
> componentes, grid e variáveis CSS do Style Guide, veja
> [style-guide.md](style-guide.md). Para versões das tecnologias públicas, veja
> [technologies.md](technologies.md).

## Visão Geral

Este documento descreve **o que é** cada artefato de customização do Fluig sob a
ótica de quem o escreve: o desenvolvedor externo. O foco é o que o desenvolvedor
**autora** e os **pontos de extensão públicos** onde seu código se conecta à
plataforma — não a construção interna do produto.

A ideia central: o desenvolvedor não modifica o núcleo do Fluig. Em vez disso,
ele produz artefatos (widgets, layouts, forms, datasets e eventos de processo)
que a plataforma **carrega, renderiza e invoca** em momentos bem definidos. Cada
artefato expõe um pequeno contrato — um método de inicialização, um conjunto de
funções nomeadas ou hooks de evento — que o desenvolvedor implementa. A
plataforma cuida do resto.

Dois ambientes de execução são visíveis ao código de customização:

| Ambiente | Artefatos | O que o dev escreve |
|----------|-----------|---------------------|
| Cliente (navegador) | Widget, Custom Element, Layout (view), Form (view) | JavaScript ES6+ e templates FreeMarker (`.ftl`) |
| Servidor (runtime de scripting) | Dataset, Evento de processo (BPM) | Funções JavaScript invocadas pela plataforma em pontos definidos |

## Estrutura de um Projeto Fluig Studio

Na prática, o desenvolvedor externo costuma trabalhar dentro de um **projeto do
Fluig Studio** (a IDE oficial para customização do Fluig). Esse projeto agrupa
todos os tipos de artefato em uma estrutura de pastas previsível, em que **cada
pasta corresponde a um tipo de artefato**. Conhecer esse mapeamento é essencial
para saber **onde criar** cada artefato dentro de um projeto existente.

```text
ProjetoFluig/
├── datasets/                 # datasets customizados (JS server-side)
├── events/                   # eventos globais (global events, JS server-side)
├── forms/                    # formulários eletrônicos
│   └── events/               # eventos/handlers dos formulários
├── mechanisms/               # mecanismos de atribuição customizados (workflow)
├── reports/                  # relatórios
├── wcm/
│   ├── layout/               # layouts WCM
│   └── widget/               # widgets WCM
├── workflow/
│   ├── diagrams/             # diagramas de processo (BPM)
│   ├── literals/             # literais/textos do processo (i18n)
│   └── scripts/              # scripts de eventos de processo
└── .project                  # descritor do projeto Fluig Studio
```

Mapeamento entre artefato e pasta do projeto:

| Artefato | Pasta no projeto Fluig Studio |
|----------|-------------------------------|
| Dataset | `datasets/` |
| Evento global | `events/` |
| Form | `forms/` (e `forms/events/` para os eventos do formulário) |
| Mecanismo de atribuição | `mechanisms/` |
| Relatório | `reports/` |
| Layout WCM | `wcm/layout/` |
| Widget WCM | `wcm/widget/` |
| Evento de processo (BPM) | `workflow/scripts/` (diagramas em `workflow/diagrams/`, literais em `workflow/literals/`) |

> **Onde criar cada artefato:** ao gerar um artefato dentro de um projeto Fluig
> Studio existente, posicione-o na pasta correspondente acima. Widgets e layouts
> mantêm sua estrutura interna (descritor `application.info`, `view.ftl`/`layout.ftl`,
> i18n e recursos) dentro de `wcm/widget/<nome>` e `wcm/layout/<nome>`,
> respectivamente. Datasets, eventos globais e scripts de eventos de processo são
> arquivos JavaScript server-side colocados em `datasets/`, `events/` e
> `workflow/scripts/`.

## Widget (SuperWidget)

Componente client-side renderizado dentro de uma página/layout. É instanciado a
partir de um elemento raiz no template, que deve conter a classe
`fluig-style-guide` (regra detalhada em [conventions.md](conventions.md)).

Pontos de extensão e ciclo de vida visíveis ao código:

- **Definição**: o desenvolvedor estende `SuperWidget` (`SuperWidget.extend({...})`).
- **Inicialização (`init()`)**: método de ciclo de vida onde o widget prepara
  estado, carrega dados e vincula eventos. É o ponto de entrada que a plataforma
  invoca ao montar o widget.
- **Instanciação (`.instance()`)**: declarada no template via `data-params`. O
  `instanceId` é **injetado automaticamente** pelo framework — não é passado como
  parâmetro (dentro do JS, use `this.instanceId`).
- **Bindings declarativos**: eventos de DOM são associados a métodos por meio de
  `bindings` (escopo `local` para elementos dentro do widget; `global` para
  elementos fora do escopo, como modais).
- **View**: a marcação do widget é definida em FreeMarker (`.ftl`), renderizada
  no servidor; quando o widget é removido do DOM, eventual lógica de limpeza
  pode ser executada num hook de encerramento, quando suportado.

As regras de código (classe raiz, uso de `instanceId`, bindings sem o prefixo
`data-`) são fonte de verdade de [conventions.md](conventions.md) — não as
duplique.

### Estrutura de pastas e arquivos do Widget

Um widget é empacotado como um módulo web com uma estrutura previsível. O
**descritor `application.info`** é obrigatório: é ele que declara o artefato como
widget, define o renderer FreeMarker, a view e os recursos (CSS/JS). Os textos
visíveis ficam em arquivos `.properties` de i18n (um base + um por locale).

```text
<widget>/
├── pom.xml
└── src/main/
    ├── resources/
    │   ├── application.info              # descritor do widget (obrigatório)
    │   ├── <code>.properties             # i18n base (chaves de getTranslation)
    │   ├── <code>_pt_BR.properties        # i18n pt-BR
    │   ├── <code>_en_US.properties        # i18n en-US
    │   ├── <code>_es.properties           # i18n es
    │   └── view.ftl                       # view principal (renderer freemarker)
    └── webapp/
        ├── WEB-INF/
        │   ├── web.xml
        │   └── jboss-web.xml
        └── resources/
            ├── css/<code>.css             # CSS escopado
            ├── images/icon.png            # ícone do widget
            └── js/<code>.js               # SuperWidget.extend
```

Campos essenciais do `application.info` de um widget:

| Chave | Valor / Papel |
|-------|---------------|
| `application.type` | `widget` |
| `application.code` | Código único do widget |
| `application.title` / `application.description` | Título e descrição (admitem i18n) |
| `application.renderer` | `freemarker` |
| `application.icon` | `icon.png` |
| `view.file` | `view.ftl` (view principal) |
| `application.resource.css.N` | Caminho do CSS (`/resources/css/<code>.css`) |
| `application.resource.js.N` | Caminho do JS (`/resources/js/<code>.js`) |
| `locale.file.base.name` | Nome base dos arquivos `.properties` de i18n |
| `developer.code` / `developer.name` | Identificação do desenvolvedor |

> A `view.ftl` fica em `src/main/resources/`, enquanto o `<code>.js` e o
> `<code>.css` ficam em `src/main/webapp/resources/`. O ponto de partida público
> para gerar essa estrutura é o **archetype Maven `widget-wcm`** (ver
> [technologies.md](technologies.md)).

## Custom Element (Web Component)

Componente client-side moderno baseado no padrão de Custom Elements da Web. É a
abordagem recomendada para UI nova e coexiste com os widgets legados na mesma
página.

Pontos de extensão e ciclo de vida visíveis ao código:

- **Definição e registro**: classe que estende `HTMLElement`, registrada via
  `customElements.define('minha-tag', MinhaClasse)`.
- **Ciclo de vida (`connectedCallback`)**: método padrão invocado pelo navegador
  quando o elemento é inserido no DOM — ponto de entrada para inicializar o
  componente (análogo ao `init()` do widget).
- **Sem Shadow DOM**: os componentes operam no DOM global (sem `attachShadow`),
  para integração consistente com o restante da página.
- **Comunicação entre componentes**: feita por **eventos globais / `CustomEvent`**
  no DOM — um componente dispara um evento e outros reagem a ele —, mantendo o
  baixo acoplamento entre artefatos client-side.

Convenções de nomenclatura de arquivo, classe e tag são fonte de verdade de
[conventions.md](conventions.md). As regras de **uso de eventos**
(`CustomEvent`/`dispatchEvent` e `WCMAPI.fireEvent`/`addListener`) também são
fonte de verdade de [conventions.md](conventions.md) — não as duplique.

## Layout (WCM)

Template de página que define as **regiões/áreas** onde widgets são posicionados.
O layout não contém a lógica dos widgets; ele estabelece a estrutura visual e os
pontos de ancoragem em que o conteúdo (widgets) é encaixado.

Pontos de extensão e execução visíveis ao código:

- **View em FreeMarker (`.ftl`)**: o desenvolvedor escreve a marcação do layout,
  renderizada no servidor.
- **Regiões de conteúdo**: o layout declara áreas que recebem widgets, permitindo
  que diferentes páginas reutilizem a mesma estrutura.
- Aproveita o grid e os componentes do Style Guide (ver
  [style-guide.md](style-guide.md)).

### Estrutura de pastas e arquivos do Layout

Como o widget, o layout é um módulo web com **descritor `application.info`**
(aqui com `application.type=layout`) e arquivos `.properties` de i18n. A
diferença central está na **view**: o layout declara **slots/regiões** que
recebem widgets, em vez de lógica própria.

```text
<layout>/
├── pom.xml
└── src/main/
    ├── resources/
    │   ├── application.info              # descritor do layout (obrigatório)
    │   ├── <code>.properties             # i18n base
    │   ├── <code>_pt_BR.properties        # i18n pt-BR
    │   ├── <code>_en_US.properties        # i18n en-US
    │   ├── <code>_es.properties           # i18n es
    │   └── layout.ftl                     # view do layout (declara os slots)
    └── webapp/
        ├── WEB-INF/
        │   ├── web.xml
        │   └── jboss-web.xml
        └── resources/
            ├── css/<code>.css             # CSS do layout (opcional)
            └── images/icon.png            # ícone do layout
```

Campos essenciais do `application.info` de um layout:

| Chave | Valor / Papel |
|-------|---------------|
| `application.type` | `layout` |
| `application.code` | Código único do layout |
| `application.title` / `application.description` | Título e descrição (admitem i18n) |
| `application.renderer` | `freemarker` |
| `layout.file` | `layout.ftl` (view do layout) |
| `layout.defaultSlot` | Slot padrão que recebe conteúdo |
| `application.resource.css.N` | Caminho do CSS (opcional) |
| `locale.file.base.name` | Nome base dos arquivos `.properties` de i18n |
| `developer.code` / `developer.name` | Identificação do desenvolvedor |

As **regiões/slots** são declaradas na `layout.ftl`. A view de layout segue uma
estrutura interna característica que o desenvolvedor reproduz:

- **Import dos utilitários de layout**: a `layout.ftl` começa importando o
  namespace público de macros de layout — `<#import "/wcm.ftl" as wcm/>` — que
  fornece as macros de montagem da página (`@wcm.header`, `@wcm.menu`,
  `@wcm.renderSlot`, `@wcm.footer`, etc.).
- **Wrapper raiz com `fluig-style-guide`**: o conteúdo é envolvido por uma
  estrutura padrão de contêineres (`wcm-wrapper-content` → `wcm-all-content` →
  `wcm-content`), e o wrapper recebe a classe `fluig-style-guide` para ativar o
  escopo do Style Guide.
- **Slots nomeados renderizados por macro**: cada região é um contêiner
  identificável (ex.: `id="slotFull1"`, classe `editable-slot slotfull
  layout-1-1`) cujo conteúdo é renderizado pela macro pública
  `<@wcm.renderSlot id="SlotA" editableSlot="true" isResponsiveSlot="true" />`.
  O identificador do slot (ex.: `SlotA`, `SlotB`, `SlotC`) é o que a plataforma
  usa para encaixar os widgets; o slot padrão deve casar com
  `layout.defaultSlot` no `application.info`. Para casos de baixo nível, a
  plataforma também expõe o objeto `pageRender` (ex.:
  `pageRender.getInstancesIds("SlotA")` / `pageRender.renderInstanceNoDecorator(id)`)
  e verificações de modo de página (`pageRender.isEditMode()`,
  `pageRender.isPreviewMode()`).

O ponto de partida público para gerar essa estrutura é o **archetype Maven
`layout-wcm`** (ver [technologies.md](technologies.md)). A referência mínima de
uma `layout.ftl` está em `examples/layout/`.

## Form (Formulário eletrônico)

Formulário eletrônico autorado pelo desenvolvedor para captura de dados. Além dos
campos, o desenvolvedor pode anexar **lógica client-side** que reage ao ciclo de
vida do formulário e aos eventos de seus campos.

Pontos de extensão visíveis ao código:

- **Handlers de eventos do formulário**: funções que o desenvolvedor implementa
  para reagir a momentos do ciclo de vida do formulário (ex.: carga e validação).
- **Eventos de campo**: hooks de validação e reação a mudanças em campos
  específicos, permitindo regras de preenchimento e consistência.

Descreva apenas os pontos de extensão públicos do formulário; as APIs específicas
só devem ser usadas quando confirmadas como públicas e oficiais.

## Dataset

Customização server-side que **expõe ou consulta dados** por meio da API pública
de Dataset. É consumido por outros artefatos (widgets, forms) que precisam de
dados estruturados.

Pontos de extensão e contexto de execução visíveis ao código:

- **Funções nomeadas**: o desenvolvedor implementa funções JavaScript que a
  plataforma invoca em pontos definidos para resolver/consultar o dataset.
- **Execução server-side**: o código roda no runtime público de scripting do
  servidor (ver [technologies.md](technologies.md)) e interage **somente** com a
  API pública de Dataset — sem acesso a componentes internos do servidor.
- **Consumo**: o resultado é consumido por widgets/forms na camada cliente.

## Evento de processo (BPM)

Funções JavaScript server-side disparadas pela plataforma em **pontos definidos
do ciclo de vida de um processo/workflow**. São pontos de extensão onde o
desenvolvedor injeta regras de negócio sem alterar o motor de processos.

Pontos de extensão e contexto de execução visíveis ao código:

- **Handlers em pontos de extensão**: o desenvolvedor implementa funções
  associadas a momentos do fluxo (ex.: transições e etapas do processo), que a
  plataforma invoca automaticamente.
- **Execução server-side**: roda no runtime público de scripting do servidor (ver
  [technologies.md](technologies.md)), usando apenas a API pública de eventos de
  processo.

## Como os artefatos se integram

Todos os artefatos executam **dentro** da plataforma Fluig, que os carrega e os
aciona nos pontos de extensão acima:

- **Artefatos cliente** (widgets, Custom Elements, views de layout/form) são
  renderizados no navegador e, quando precisam de dados, chamam endpoints
  internos do Fluig **através das APIs públicas de cliente** (`FLUIGC.ajax`,
  `WCMAPI`), que cuidam da sessão/autenticação — ver
  [conventions.md](conventions.md), seção de chamadas REST.
- **Artefatos server-side** (datasets, eventos de processo) executam no runtime
  público de scripting e interagem apenas com as APIs públicas de seu contexto.
- A comunicação **entre artefatos cliente** ocorre por eventos globais /
  `CustomEvent` no DOM; a comunicação **cliente → dados** ocorre via datasets e
  endpoints expostos publicamente. As regras de **uso de eventos**
  (`CustomEvent`/`dispatchEvent` e `WCMAPI.fireEvent`/`addListener`) são fonte de
  verdade de [conventions.md](conventions.md) — não as duplique.

O desenvolvedor enxerga a plataforma como um host que oferece pontos de extensão
estáveis: ele preenche os contratos (métodos de ciclo de vida, funções nomeadas,
hooks de evento) e a plataforma orquestra a execução.

## Referências Cruzadas

- Para "como fazer" (gerar cada artefato, modernizar e revisar), ver as skills em
  `skills/` (ex.: `scaffolding-widget`, `scaffolding-layout`, `scaffolding-form`,
  `scaffolding-dataset`, `scaffolding-process-event`).
- Para convenções de código, i18n, segurança e chamadas REST públicas:
  [conventions.md](conventions.md).
- Para componentes, grid, ícones e variáveis CSS do Style Guide:
  [style-guide.md](style-guide.md).
- Para linguagens, bibliotecas client-side, FreeMarker e runtime de scripting
  server-side: [technologies.md](technologies.md).
