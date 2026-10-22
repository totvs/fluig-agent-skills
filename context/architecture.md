# Arquitetura dos Artefatos de Customização Fluig

> Fonte única de verdade do pacote para o **modelo conceitual dos artefatos que o
> desenvolvedor externo constrói**, seus **pontos de extensão públicos** e o
> **ciclo de vida/execução visível ao código de customização**. As skills
> referenciam este arquivo em vez de duplicar seu conteúdo. Para convenções de
> código, i18n e segurança, veja [conventions.md](conventions.md). Para
> componentes, grid e variáveis CSS do Style Guide, veja
> [style-guide.md](style-guide.md). Para versões das tecnologias públicas, veja
> [technologies.md](technologies.md).

> **Parceiro (Store):** para o modelo de **projeto Maven multi-módulo** do
> parceiro (modules, EAR, integração), veja
> [partner-store-architecture.md](partner-store-architecture.md).

## Visão Geral

Este documento descreve **o que é** cada artefato de customização do Fluig sob a
ótica de quem o escreve: o desenvolvedor externo. O foco é o que o desenvolvedor
**autora** e os **pontos de extensão públicos** onde seu código se conecta à
plataforma — não a construção interna da plataforma.

A ideia central: o desenvolvedor não modifica o núcleo do Fluig. Em vez disso,
ele produz artefatos (widgets, layouts, forms e datasets)
que a plataforma **carrega, renderiza e invoca** em momentos bem definidos. Cada
artefato expõe um pequeno contrato — um método de inicialização, um conjunto de
funções nomeadas ou hooks de evento — que o desenvolvedor implementa. A
plataforma cuida do resto.

Dois ambientes de execução são visíveis ao código de customização:

| Ambiente | Artefatos | O que o dev escreve |
|----------|-----------|---------------------|
| Cliente (navegador) | Widget, Custom Element, Layout (view), Form (view) | JavaScript ES6+ e templates FreeMarker (`.ftl`) |
| Servidor (runtime de scripting Rhino) | Dataset | Funções JavaScript (base ES5, motor Rhino) invocadas pela plataforma em pontos definidos; admite interop com Java |

## Estrutura de um Projeto Fluig

Um **projeto Fluig** agrupa todos os tipos de artefato em uma estrutura de pastas
previsível, em que **cada pasta corresponde a um tipo de artefato**. Conhecer esse
mapeamento é essencial para saber **onde criar** cada artefato dentro de um projeto
existente.

```text
ProjetoFluig/
├── datasets/                 # datasets customizados (JS server-side)
├── diagrams/                 # processos de workflow (diagramas)
│   └── literals/             # arquivos de tradução do processo (i18n de processos)
├── events/                   # eventos globais (global events, JS server-side)
├── forms/                    # formulários eletrônicos
│   └── events/               # eventos/handlers dos formulários
├── mechanisms/               # mecanismos de atribuição customizados (workflow)
├── reports/                  # relatórios
├── wcm/
│   ├── layout/               # layouts WCM
│   └── widget/               # widgets WCM
└── .project                  # descritor do projeto
```

Mapeamento entre artefato e pasta do projeto:

| Artefato | Pasta no projeto Fluig |
|----------|-------------------------------|
| Dataset | `datasets/` |
| Processo (workflow) | `diagrams/` (e `diagrams/literals/` para as traduções do processo) |
| Evento global | `events/` |
| Form | `forms/` (e `forms/events/` para os eventos do formulário) |
| Mecanismo de atribuição | `mechanisms/` |
| Relatório | `reports/` |
| Layout WCM | `wcm/layout/` |
| Widget WCM | `wcm/widget/` |

> **i18n de processos (`diagrams/literals/`):** os arquivos de tradução do
> processo (por atividade/fluxo e dados gerais) seguem as regras de
> [conventions.md](conventions.md), seção "Internacionalização (i18n) — Processos
> (Workflow)". Não duplique essa regra aqui.

> **Eventos de Processo e Atividade de Serviço:** além da i18n do diagrama, os
> eventos server-side do processo (`beforeTaskSave`, `validateForm`,
> `displayFields`, `beforeStateEntry`) e a Atividade de Serviço (servicetask)
> para integrações pesadas são fonte de verdade de
> [processo-bpm.md](processo-bpm.md). Não duplicados aqui.

> **Onde criar cada artefato:** ao gerar um artefato dentro de um projeto Fluig
> existente, posicione-o na pasta correspondente acima. Widgets e layouts
> mantêm sua estrutura interna (descritor `application.info`, `view.ftl`/`layout.ftl`,
> i18n e recursos) dentro de `wcm/widget/<nome>` e `wcm/layout/<nome>`,
> respectivamente. Datasets e eventos globais são arquivos JavaScript server-side
> colocados em `datasets/` e `events/`.

## Detecção de estrutura do projeto

Um projeto de customização Fluig pode estar organizado de formas diferentes no
disco. Reconhecer a estrutura ajuda a saber **onde criar** artefatos e **como o
projeto é empacotado** — mas **a estrutura não define a persona** (para onde a
entrega vai). A classificação da persona segue a cascata de
[persona-routing.md](persona-routing.md); a estrutura é apenas um dos sinais
estruturais, nunca o critério de decisão.

Três estruturas aparecem na prática:

| Estrutura | Como reconhecer | Observações |
|-----------|-----------------|-------------|
| **Studio** | Pastas por tipo de artefato soltas na raiz (`wcm/widget/`, `wcm/layout/`, `forms/`, `datasets/`, `diagrams/`), **sem** `pom.xml` na raiz | Export/upload pela ferramenta de desenvolvimento; cada pasta corresponde a um tipo de artefato (ver "Estrutura de um Projeto Fluig" acima) |
| **Maven multi-módulo** | `pom.xml` na raiz com `<packaging>pom</packaging>` e `<modules>`; cada artefato é um módulo Maven; build gera um EAR no módulo pack | Modelo descrito em [backend-java-maven.md](backend-java-maven.md) |
| **Híbrida** | Estrutura Studio **sem `pom.xml` na raiz**, mas com um agregador Maven interno (ex.: um `pom.xml` em `wcm/widget/`) | O caso típico é um kit de intranet: não há POM na raiz nem empacotamento EAR no topo; o agregador fica aninhado |

> **A estrutura não é critério de persona.** Sinais estruturais como EAR,
> `<packaging>ear</packaging>`, POM multi-módulo, Nexus, `AppDS`, `simple.deploy`
> e o security-domain TOTVSTech **descrevem o empacotamento** — aparecem tanto em
> entregas para uma única empresa quanto em produtos de Store. Eles **não** devem
> ser usados para inferir se o desenvolvimento é de Consultor ou Parceiro.

> **O `simple.deploy` é estrutural.** O campo `simple.deploy` do `application.info`
> sinaliza, de forma genérica, se o módulo tem código Java a deployar (valor
> conforme a presença de Java no módulo). Ele descreve o módulo, não a persona.

> **Parceiro (Store):** os marcadores que **de fato** identificam publicação na
> Store (presença de `component.xml` e consumo da API de validação de licença/slot)
> e o roteamento completo por destino são tratados em
> [persona-routing.md](persona-routing.md) e na camada de Store
> [partner-store-architecture.md](partner-store-architecture.md).

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
    │   ├── view.ftl                       # view principal (renderer freemarker)
    │   └── edit.ftl                        # view de edição (mesma div raiz da view; obrigatório)
    └── webapp/
        ├── WEB-INF/
        │   ├── web.xml
        │   └── jboss-web.xml
        └── resources/
            ├── css/<code>.css             # CSS escopado
            ├── images/icon.png            # ícone do widget
            └── js/<code>.js               # SuperWidget.extend
```

Campos do `application.info` de um widget (tabela completa):

| Chave | Valor / Papel |
|-------|---------------|
| `application.type` | `widget` |
| `application.code` | Código único do widget — **apenas letras, números e `_`** (sem espaço, hífen, acento ou ponto). Convenção recomendada: **minúsculas**, usando `_` como separador quando necessário (ex.: `mywidget`, `my_widget_app`). **Igual a** `locale.file.base.name`. |
| `application.title` / `application.description` | Título e descrição (admitem i18n) |
| `application.fluig.version` | Versão da plataforma Fluig alvo |
| `application.category` | Categoria do widget (ex.: `SYSTEM`, `APPLICATION`, `Social`) |
| `application.renderer` | `freemarker` |
| `application.mobileapp` | Disponibilidade do widget em app mobile |
| `application.uiwidget` | `true` quando o widget aparece no construtor de páginas (default `false`) |
| `view.file` | `view.ftl` (view principal) |
| `edit.file` | `edit.ftl` (view de edição; obrigatória — tem a **mesma div raiz** da `view.ftl`, não vazia) |
| `application.resource.css.N` | Caminho do CSS (`/resources/css/<code>.css`) |
| `application.resource.js.N` | Caminho do JS (`/resources/js/<code>.js`) |
| `application.resource.component.N` | Componente de negócio do Style Guide usado (ex.: `datatable`, `treeview`) |
| `locale.file.base.name` | Nome base dos arquivos `.properties` de i18n — **igual a** `application.code` |
| `developer.code` / `developer.name` / `developer.url` | Identificação do desenvolvedor |

> **`edit.file` obrigatório:** o descritor referencia a view de edição via
> `edit.file=edit.ftl`. O arquivo `edit.ftl` precisa existir (mesmo vazio).

> **Regra crítica:** `application.code` **deve ser igual** a
> `locale.file.base.name`. Divergência entre os dois quebra a resolução de i18n
> do artefato.

> A `view.ftl` fica em `src/main/resources/`, enquanto o `<code>.js` e o
> `<code>.css` ficam em `src/main/webapp/resources/`. O ponto de partida público
> para gerar essa estrutura é o **archetype Maven `widget-wcm`** (ver
> [technologies.md](technologies.md)).

### Widget de Recursos (compartilhamento de JS/CSS/imagens)

Um padrão comum para compartilhar JS/CSS/imagens **globais** entre vários
widgets é criar um widget "vazio" (sem UI própria relevante), dedicado só a
hospedar esses recursos. Os widgets consumidores declaram, no **próprio**
`application.info`, um `application.resource.js.N` (ou `css.N`) apontando para
o caminho do *outro* widget — reaproveitando a tabela de campos de
`application.info` já descrita acima, sem recriá-la:

```text
application.resource.js.2=/<widget-utils>/resources/js/arquivo.js
```

Onde `<widget-utils>` é o `application.code` do widget que hospeda o recurso
compartilhado.

**Alternativa — injeção via Layout:** em vez de um Widget de Recursos, o
layout também pode injetar JS/CSS global apontando, no seu próprio
`layout.ftl`, para arquivos na sua própria pasta `resources/` (mesma pasta de
recursos do layout, já documentada em "Estrutura de pastas e arquivos do
Layout").

> **Regra crítica:** scripts/CSS injetados via `.ftl` do Layout **não**
> carregam no app móvel "My Fluig" nem na visualização isolada em iframe,
> porque o layout web não é renderizado nesses contextos. Quando o widget
> precisa funcionar em mobile, prefira o padrão **Widget de Recursos** (via
> `application.info`) em vez de injeção via Layout.

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
  renderizada no servidor, seguindo uma **estrutura HTML rígida** (ver "Estrutura
  HTML da `layout.ftl`"); a liberdade está no arranjo dos slots, não no wrapper.
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
            ├── css/responsive_layout.css  # CSS padrão de responsividade dos slots (obrigatório)
            ├── css/<code>.css             # CSS próprio do layout (opcional)
            └── images/icon.png            # ícone do layout
```

> **`responsive_layout.css` (padrão):** todo layout é criado com um
> `responsive_layout.css` em `webapp/resources/css/`. Ele garante a
> responsividade das regiões/slots (via container queries e media queries),
> empilhando as colunas (`layout-2-3left`/`all-slots-right`) em telas estreitas,
> tanto em edição (`#edicaoPagina`) quanto em visualização (`#visualizacaoPagina`),
> com fallback para ambientes sem suporte a container queries
> (`.not-supports-container-queries`). É declarado no descritor via
> `application.resource.css.N` e **não** se confunde com o CSS próprio do layout
> (`<code>.css`, opcional). O conteúdo de referência está logo abaixo.

> **CSS de layout no descritor (ordem):** o layout declara dois recursos CSS no
> `application.info`, nesta ordem:
> 1. `application.resource.css.1=/portal/resources/css/wcm_responsive_layout.css`
>    — folha **global do Fluig** (caminho do portal), base de responsividade dos
>    layouts; o caminho é fixo e não pertence ao pacote do layout.
> 2. `application.resource.css.2=/resources/css/responsive_layout.css` — o
>    `responsive_layout.css` **padrão do próprio layout** (empacotado em
>    `webapp/resources/css/`).
> Um eventual CSS próprio do layout (`<code>.css`) entra como recurso adicional
> (`application.resource.css.3`, etc.).

Conteúdo de referência do `responsive_layout.css`:

```css
#edicaoPagina {
    container-type: inline-size!important;
    container-name: wcm-master-wrapper!important;
}

@container wcm-master-wrapper (max-width: 991px) {
    #edicaoPagina .layout-2-3left,
    #edicaoPagina #all-slots-right {
        width: 100% !important;
    }
    .wcm-all-content > #wcm-content {
        padding-right: 0 !important;
    }
}

@media (max-width: 991px) {
    #visualizacaoPagina .layout-2-3left,
    #visualizacaoPagina #all-slots-right,
    .not-supports-container-queries #edicaoPagina .layout-2-3left,
    .not-supports-container-queries #edicaoPagina #all-slots-right {
        width: 100% !important;
    }
    .wcm-all-content > #wcm-content {
        padding-right: 0 !important;
    }
}
```

Campos do `application.info` de um layout (tabela completa):

| Chave | Valor / Papel |
|-------|---------------|
| `application.type` | `layout` |
| `application.code` | Código único do layout (minúsculo, sem espaços) — **igual a** `locale.file.base.name` |
| `application.title` / `application.description` | Título e descrição (admitem i18n) |
| `application.fluig.version` | Versão da plataforma Fluig alvo |
| `application.category` | Categoria do layout (ex.: `SYSTEM`, `APPLICATION`) |
| `application.renderer` | `freemarker` |
| `layout.file` | `layout.ftl` (view do layout) |
| `layout.defaultSlot` | Slot padrão que recebe conteúdo (deve existir entre os slots da `layout.ftl`) |
| `slot.<NomeDoSlot>` | (Opcional) widget pré-configurado para um slot (ex.: `slot.SlotMenu=menu`) |
| `application.icon` | `icon.png` |
| `application.responsiveLayout` | `true` para layout responsivo |
| `application.newBuilder` | Flag do novo construtor de páginas |
| `application.resource.css.N` | Caminhos do CSS — `css.1` aponta para a folha global do Fluig (`/portal/resources/css/wcm_responsive_layout.css`) e `css.2` para o `responsive_layout.css` padrão do layout (e o `<code>.css` próprio como recurso adicional, se houver) |
| `locale.file.base.name` | Nome base dos arquivos `.properties` de i18n — **igual a** `application.code` |
| `developer.code` / `developer.name` / `developer.url` | Identificação do desenvolvedor |

> **Regra crítica:** `application.code` **deve ser igual** a
> `locale.file.base.name` (mesma regra do widget). O `layout.defaultSlot` precisa
> coincidir com um dos slots declarados na `layout.ftl`.

> **Diferenças em relação ao widget:** o layout usa `layout.file` (não
> `view.file`), exige `layout.defaultSlot`, usa a flag `application.uilayout` (em
> vez de `application.uiwidget`) para aparecer no construtor de páginas e admite
> `application.responsiveLayout`, `application.newBuilder` e `slot.<Nome>` para
> pré-configurar widgets em slots.

### Estrutura HTML da `layout.ftl` (rígida)

A `layout.ftl` de um **layout de portal** segue uma **estrutura HTML rígida e
obrigatória**: a hierarquia de contêineres, as classes e os pontos de extensão são
fixos e **não devem ser alterados**. O desenvolvedor só tem liberdade para arranjar
os **slots** dentro do contêiner mais interno (`${divMasterId!""}`) — quantos slots,
seus identificadores e o grid de cada região. Mudar o wrapper, as classes
estruturais ou a ordem dos blocos condicionais quebra a renderização da página.

Esqueleto canônico de um layout de portal (reproduza-o como está, variando apenas
os slots internos):

```ftl
<#import "/wcm.ftl" as wcm/>

<#-- Variáveis globais dos layouts -->
<#import "/layout-globals.ftl" as globals />

<#-- Bloco de pré-visualização da página (modo preview) -->
<#if pageRender.isPreviewMode() = true>
    <@wcm.previewPageAlert />
    <@wcm.deviceTogglePreview />
</#if>

<#-- Wrapper raiz OBRIGATÓRIO (classes de estado preenchidas pela plataforma) -->
<div class="wcm-wrapper-content ${wcmLayoutEditClass!""} ${pageAuthTypeClass!""}">

    <#-- Cabeçalho e menu do portal: somente fora do modo de edição -->
    <#if pageRender.isEditMode() != true>
        <@wcm.header authenticated=pageRender.isUserLogged()?c />
        <@wcm.menu />
    </#if>

    <div class="wcm-all-content ${wcmResponsiveMenuOpenClass!""}">

        <div id="wcm-content" class="clearfix wcm-background">

            <#-- Controles do construtor de páginas: somente no modo de edição -->
            <#if pageRender.isEditMode() = true>
                <@wcm.editHeader />
                <@wcm.widgetsList />
            </#if>

            <div id="${divMasterId!""}">

                <!-- Slot A (região editável) -->
                <div class="editable-slot slotfull layout-1-1" id="slotFull1">
                    <@wcm.renderSlot id="SlotA" editableSlot="true" isResponsiveSlot="true" />
                </div>

                <#-- Acrescente outras regiões/slots aqui, variando id e grid -->

                <#-- Footer omitido no tema responsivo -->
                <#if fluigThemeCode != "responsive_theme">
                    <@wcm.footer layoutuserlabel="<code>.user" />
                </#if>
            </div>
        </div>
    </div>
</div>
```

Elementos **fixos** dessa estrutura (não alterar):

| Elemento | Papel | Observação |
|----------|-------|------------|
| `<#import "/wcm.ftl" as wcm/>` | Importa as macros públicas de layout | Sempre a primeira linha |
| `<#import "/layout-globals.ftl" as globals />` | Variáveis globais dos layouts | Logo após o `wcm.ftl` |
| Bloco `isPreviewMode()` | `@wcm.previewPageAlert` + `@wcm.deviceTogglePreview` | Pré-visualização da página |
| `div.wcm-wrapper-content` | **Wrapper raiz obrigatório** | Recebe `${wcmLayoutEditClass!""}` e `${pageAuthTypeClass!""}` |
| Bloco `isEditMode() != true` | `@wcm.header` + `@wcm.menu` | Cabeçalho/menu só fora da edição |
| `div.wcm-all-content` | Contêiner de conteúdo | **DEVE** receber `${wcmResponsiveMenuOpenClass!""}` (ver alerta abaixo) |
| `div#wcm-content.clearfix.wcm-background` | Área de conteúdo | Classes fixas |
| Bloco `isEditMode() = true` | `@wcm.editHeader` + `@wcm.widgetsList` | Controles do construtor, só na edição |
| `div#${divMasterId!""}` | Contêiner-mestre dos slots | É **aqui** que os slots variam |
| Bloco `fluigThemeCode != "responsive_theme"` | `@wcm.footer` | Footer omitido no tema responsivo |

> ⚠️ **Inclua a classe `${wcmResponsiveMenuOpenClass!""}` no `wcm-all-content`.**
> Gere sempre `<div class="wcm-all-content ${wcmResponsiveMenuOpenClass!""}">`. Essa
> classe reposiciona o conteúdo quando o **menu lateral** está aberto; sem ela o
> conteúdo da página pode renderizar sob o menu. Ela está presente nos layouts
> **nativos** da plataforma — use-os como referência e mantenha a classe no
> wrapper de conteúdo.

O que o desenvolvedor **pode** variar:

- **Slots**: cada região é um `<div class="editable-slot slotfull <grid>" id="slotFullN">`
  com um `<@wcm.renderSlot id="SlotX" editableSlot="true" isResponsiveSlot="true" />`.
- **Identificadores de slot** (`SlotA`, `SlotB`, ...): o slot padrão deve casar com
  `layout.defaultSlot` no `application.info`.
- **Grid das regiões**: classes de posicionamento do slot (valores da TDN
  *Layouts*): `layout-1-3` (esquerda, 32%), `layout-2-3`
  (esquerda, 65%), `layout-1-2left` (esquerda, 50%), `layout-1-1` (largura total,
  100%), `layout-1-2right` (direita, 50%), `layout-1-3right` (direita, 32%), além
  dos agrupamentos `all-slots-left`/`all-slots-right`.
  > **Reutilize o padrão dos layouts nativos da plataforma** (ver
  > [references/layouts/layouts-nativos-slots.md](references/layouts/layouts-nativos-slots.md)),
  > em vez de montar classes à mão. Estrutura de **2 colunas** conforme o nativo:
  > - **Coluna esquerda (65%):** `<div class="editable-slot slotfull layout-2-3left">`.
  > - **Coluna direita:** envolva os slots da direita em um **`<div id="all-slots-right">`**
  >   (o `all-slots-right` é o **id de um `<div> agrupador`**, _não_ uma classe no
  >   slot; é o que o `responsive_layout.css` referencia via `#all-slots-right`).
  >   Os slots **dentro** dele usam `layout-1-1`. Ex.:
  >   ```html
  >   <div id="all-slots-right">
  >     <div class="editable-slot slotfull layout-1-1" id="divSlot2">
  >       <@wcm.renderSlot id="SlotB" editableSlot="true" isResponsiveSlot="true" />
  >     </div>
  >   </div>
  >   ```
  > - **Coluna única (100%):** `<div class="editable-slot slotfull layout-1-1">`.
  >
  > Obs.: para 2 colunas, os layouts nativos usam `layout-2-3left` na coluna
  > esquerda em conjunto com o agrupador `#all-slots-right` na direita — reutilize
  > essa combinação nativa como referência.

> **Slots não-editáveis exigem `slot.<Nome>=<tipo>` no `application.info`** (TDN
> *Layouts*). A plataforma tem 5 slots especiais que, quando
> usados na `layout.ftl`, **precisam** ser mapeados ao widget correspondente no
> descritor: `slot.SlotMenu=menu`, `slot.SlotLogin=sociallogin`,
> `slot.SlotInstantSearch` (busca), `slot.SlotGlobalAlert=alertpopover` e
> `slot.SlotUsePolicy=usepolicy`. É a forma de inserir conteúdo num slot
> não-editável. Os slots editáveis comuns (SlotA, SlotB…) **não** usam essa
> propriedade. Atributos do slot: `editableSlot` (editável no construtor),
> `decorator` (exibe o título das widgets; default `false`) e `isResponsiveSlot`
> (visual responsivo novo).

> **Atributos do `@wcm.renderSlot`:** `editableSlot="true"` torna o slot editável no
> construtor; `decorator="true"` aplica a decoração padrão de slot; e
> `isResponsiveSlot="true"` habilita o comportamento responsivo. Para casos de baixo
> nível, a plataforma também expõe o objeto `pageRender` (ex.:
> `pageRender.getInstancesIds("SlotA")` / `pageRender.renderInstanceNoDecorator(id)`).

> **Layouts standalone (exceção):** layouts que **não** são de portal (ex.: telas
> "boards" com navegação própria) usam um wrapper raiz `<div class="fluig-style-guide ...">`
> com `navbar` própria, **sem** `@wcm.header`/`@wcm.menu`/`@wcm.footer` e sem a
> hierarquia `wcm-wrapper-content`. Nesse caso, o `fluig-style-guide` é necessário no
> root para ativar o Style Guide. Use esse formato **apenas** quando o layout não se
> integra à moldura do portal; o padrão é o esqueleto rígido acima.

O ponto de partida público para gerar essa estrutura é o **archetype Maven
`layout-wcm`** (ver [technologies.md](technologies.md)). A referência mínima de
uma `layout.ftl` está em `examples/layout/`.

### Regras de Validação do `application.info`

As regras abaixo aplicam-se a **todos** os arquivos `application.info` (widget e
layout).

> **Parceiro (Store):** campos e regras adicionais do `application.info`
> exigidos pela Store (incluindo `simple.deploy`) estão em
> [partner-store-architecture.md](partner-store-architecture.md), seção "Regras de
> `application.info` exigidas pela Store".

| Campo | Regra de validação |
|-------|-------------------|
| `application.code` | Obrigatório. Sem hífens, lowercase, sem espaços. DEVE ser igual a `locale.file.base.name`. |
| `application.type` | Obrigatório. Valores: `widget`, `layout`. |
| `application.category` | Obrigatório. Exemplos: `SYSTEM`, `APPLICATION`, `AGILITY`, `Social`. |
| `application.uiwidget` | Flag booleana (`true`/`false`) do **widget**: se `true`, o widget fica disponível no **construtor de páginas**. DEVE existir com valor explícito (a Store exige a flag; ver `partner-store-review-rules.md`). |
| `application.uilayout` | Flag booleana (`true`/`false`) do **widget**: se `true`, o widget fica disponível para uso **dentro de layouts**. DEVE existir com valor explícito. **Não confundir** com o descritor de um artefato `application.type=layout` (que não usa estas flags). |
| `developer.code` | Obrigatório. Código identificador do desenvolvedor/parceiro. |
| `developer.name` | Obrigatório. Nome do desenvolvedor/parceiro. |
| `developer.url` | Obrigatório. URL do desenvolvedor/parceiro. |
| `application.resource.css.N` | Declarar todos os CSS (caminhos relativos a `webapp/`). |
| `application.resource.js.N` | Declarar todos os JS (caminhos relativos a `webapp/`). |
| `locale.file.base.name` | DEVE ser exatamente igual a `application.code`. |
| Codificação | Arquivo em **UTF-8** **e** caracteres especiais (ç, á, é…) escapados em `\uXXXX` (padrão Java Properties) — não "UTF-8 OU `\uXXXX`", são os dois juntos (fonte oficial: TDN i18n). Detalhe e exceção do arquivo base em `conventions.md` › "Codificação dos arquivos `.properties`". |

### Integridade dos recursos e chaves (review)

Verificações de integridade aplicadas ao `application.info` durante a revisão. A
ausência de propriedade só deve ser acusada após **ler o arquivo real por inteiro**
e buscar a string exata.

| Verificação | Regra | Severidade quando violada |
|-------------|-------|---------------------------|
| `application.icon` presente | DEVE existir com valor **não vazio** e **não composto apenas por espaços** | Violação de `application.info` (ícone personalizado é recomendado) |
| Sequência de recursos por tipo | `application.resource.js.N` / `application.resource.css.N` DEVEM ter índice `N` **não repetido** dentro do mesmo tipo | Média |
| Tipo declarado = extensão real | Recurso declarado como `js` DEVE apontar para arquivo `.js`; declarado como `css` DEVE apontar para `.css` | Média |
| Existência física do recurso | Todo recurso declarado DEVE existir fisicamente na pasta `resources/` do módulo | Alta |
| Chaves duplicadas | O `application.info` NÃO pode conter a mesma chave declarada mais de uma vez | Média |
| `developer.code` sem nome de máquina | O valor NÃO pode conter nome de máquina local (padrões `DESKTOP-*`, `LAPTOP-*`) — indica exportação de ambiente de desenvolvimento | Média |
| `application.code` × `locale.file.base.name` | Os dois valores DEVEM coincidir (quebra i18n quando divergem) | Alta |
| `application.uiwidget` explícito | DEVE existir com valor explícito (`true`/`false`) e coerente com a documentação | Alta |

> **Parceiro (Store):** no modelo parceiro (projetos multi-módulo Maven/EAR),
> campos e regras extras se aplicam ao `application.info` — `simple.deploy`,
> `context-root` por tipo de módulo, declaração de URLs externas, `slot.*` para
> layouts, e verificações adicionais de review (`application.icon`
> recomendado/ícone personalizado, `simple.deploy` coerente, `application.uiwidget`
> documentado). Consulte [partner-store-architecture.md](partner-store-architecture.md),
> seção "Regras de `application.info` exigidas pela Store", e
> [Context-root por tipo de módulo](backend-java-maven.md#context-root-por-tipo-de-módulo) para as regras
> completas específicas do modelo parceiro.

## Remapeamento de slots

Ao substituir um layout nativo por um layout customizado, os nomes de slots do
layout antigo podem não existir no novo layout. É preciso validar a
correspondência **antes** de aplicar:

| Situação | Ação necessária |
|----------|-----------------|
| Slot antigo existe no novo layout (mesmo nome) | Nenhuma — mapeamento direto |
| Slot antigo NÃO existe no novo layout | **Remapear** — propor correspondência antes de aplicar |

Procedimento:

1. Listar slots do layout antigo (usados nas páginas do `pages.xml`).
2. Listar slots do novo layout (declarados na `layout.ftl` e no `application.info`).
3. Validar que os nomes coincidem.
4. Se houver divergência, **alertar o desenvolvedor** e propor mapeamento (ex.:
   `SlotB` → `SlotContent`).
5. Só aplicar após confirmação.

> **Anti-pattern:** aplicar layout novo sem validar slots — resulta em widgets
> "perdidos" que não aparecem na interface.

## O campo `simple.deploy`

O campo `simple.deploy` do `application.info` indica se o módulo tem código Java a
deployar. O valor depende da presença de Java no módulo:

| Valor | Quando | Exemplos de módulo |
|-------|--------|--------------------|
| `simple.deploy=true` | O módulo **não** possui Java — só recursos web | widget, layout e form estáticos |
| `simple.deploy=false` | O módulo **possui** Java | módulos com classes/serviços Java |

> O `simple.deploy` **descreve o módulo, não a persona** — aparece tanto em
> entregas para uma única empresa quanto em produtos de Store (ver
> [Detecção de estrutura do projeto](#detecção-de-estrutura-do-projeto)).

## Chaves de identidade do artefato publicado

Certas chaves não são apenas nomes: são a **identidade** com que a plataforma liga
uma atualização ao artefato já instalado. Trocar o **valor** de uma dessas chaves
não atualiza o artefato existente — a plataforma passa a tratá-lo como um artefato
**novo/distinto** (ex.: mudar o `application.code` de uma widget cria uma widget
nova em vez de atualizar a atual).

| Chave | Onde vive | Efeito de trocar o valor após publicação |
|-------|-----------|-------------------------------------------|
| `application.code` | `application.info` de widget/layout | Cria artefato novo em vez de atualizar o existente |
| `groupId` / `artifactId` | POM (coordenada Maven do módulo/EAR) | Muda a identidade do artefato distribuído |

> **Coerência dependente:** quando a chave de identidade **muda legitimamente na
> criação** (scaffolding), os valores acoplados mudam juntos — ex.:
> `locale.file.base.name` = `application.code` e o `context-root` =
> `/<application.code>`. A imutabilidade vale para o **conjunto**, não só para a
> chave isolada.

> **Parceiro (Store):** o `<code>` do `component.xml` é outra chave de identidade
> (imutável após publicação na Store), e a governança de versão semântica dos
> descritores é regra de Store — ver
> [partner-store-conventions.md](partner-store-conventions.md).

## Empacotamento web (WEB-INF)

Tanto o widget quanto o layout são empacotados como módulos web e, por isso,
contêm a pasta `src/main/webapp/WEB-INF/` com dois descritores: `web.xml` e
`jboss-web.xml`. Os blocos abaixo são o **conteúdo de referência** desses
arquivos — idênticos para widget e layout — e servem de fonte de verdade para as
skills e referências (que apenas os mencionam por caminho relativo, sem duplicar
o conteúdo).

O `jboss-web.xml` define o `context-root` (caminho de contexto da aplicação) e
desabilita o cross-context (`disable-cross-context=false`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jboss-web>
    <context-root>/<application.code></context-root>
    <disable-cross-context>false</disable-cross-context>
</jboss-web>
```

O `web.xml` declara a aplicação web na versão `3.0` da especificação Java EE, com
o namespace e o `schemaLocation` correspondentes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
     version="3.0">
</web-app>
```

> ⚠️ **Nenhum dos dois descritores pode conter `<!DOCTYPE>`.** O parser XML do
> Fluig roda com proteção contra XXE (`disallow-doctype-decl`), então qualquer
> declaração `<!DOCTYPE>` em `web.xml`/`jboss-web.xml` **quebra o deploy do
> artefato inteiro** com `wcmapplicationcenter.unableToParseFile`. Reproduza os
> blocos acima **como estão** (sem DOCTYPE) — não escreva esses XML de memória.

> **Regra `context-root`:** o `context-root` declarado no `jboss-web.xml`
> corresponde a `/<application.code>` — ou seja, a barra (`/`) seguida do código
> do artefato (`application.code`). Isso vale igualmente para widget e layout.

## Empacotamento Maven (`pom.xml`)

Quando o projeto é construído com Maven, tanto o widget quanto o layout possuem um
`pom.xml` na raiz da estrutura. O bloco abaixo é o **conteúdo de referência** desse
descritor de build — apresentado como **referência canônica** (não como um exemplo
concreto a ser copiado) e servindo de fonte de verdade para as skills e referências
(que apenas o mencionam por caminho relativo, sem duplicar o conteúdo).

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.fluig</groupId>
    <version>1.0.0</version>
    <artifactId>widget-example</artifactId>
    <packaging>war</packaging>
    <name>Widget Example</name>
    <description>Widget Example</description>
    <build>
        <finalName>${project.artifactId}</finalName>
    </build>
</project>
```

Papel de cada elemento do bloco de referência:

| Elemento | Papel |
|----------|-------|
| `modelVersion` | Versão do modelo do POM (`4.0.0`) |
| `groupId` | Grupo das coordenadas Maven do artefato |
| `version` | Versão do artefato |
| `artifactId` | Identificador do artefato (base do `finalName`) |
| `packaging` | `war` — vale tanto para widget quanto para layout |
| `name` / `description` | Nome e descrição do módulo Maven |
| `build` → `finalName` | Nome final do pacote, declarado como `${project.artifactId}` |

> **Regra `packaging=war`:** o empacotamento do `pom.xml` é `war` tanto para widget
> quanto para layout, coerente com o fato de ambos serem módulos web (ver
> "Empacotamento web (WEB-INF)").

> **Parceiro (Store):** a separação de responsabilidades entre
> `yuicompressor-maven-plugin` (somente CSS, com `excludes=**/*.js`) e
> `closure-compiler-maven-plugin` (somente JS, com suporte a ES6), além do alerta
> de build do POM pai (Closure quebra sem `.js` no diretório fonte → `skip=true`
> no pai, `skip=false` nos filhos com JS), é fonte de verdade de
> [backend-java-maven.md](backend-java-maven.md), seção "Separação de
> responsabilidades na minificação (CSS × JS)". Não duplicar aqui.

> **Coordenadas Maven nunca inventadas:** as coordenadas Maven (`groupId`,
> `artifactId` e, quando houver, o `parent`) devem ser **inspecionadas no projeto**
> existente e nunca inventadas. Na ausência dessa informação, aplica-se a política
> de fallback das skills (não fabricar coordenadas; solicitar ou inspecionar).

## Form (Formulário eletrônico)

Formulário eletrônico autorado pelo desenvolvedor para captura de dados. Além dos
campos, o desenvolvedor pode anexar lógica em **dois contextos de execução
distintos**, que não devem ser confundidos:

- **Eventos de formulário (server-side, Rhino/ES5):** os eventos de ciclo de vida
  que recebem `FormController` — `beforeProcessing`, `displayFields`,
  `enableFields`, `inputFields`, `validateForm`, `afterSaveNew`, `afterProcessing`
  (`setEnable` está depreciado) — rodam no **runtime público de scripting do
  servidor (motor Rhino, base ES5)**, o mesmo contexto dos datasets. Portanto usam
  a sintaxe/limitações do Rhino (ex.: `var`, `function`, sem `const`/arrow/template
  literal) e as APIs server-side do formulário (`form.getValue`/`form.setValue`,
  etc.). **Não** existem `WCMAPI`, `DOMPurify`, `document` nem outras APIs de
  navegador nesse contexto. A lista canônica (evento × contexto × assinatura) é
  fonte de verdade de [conventions-form.md](conventions-form.md) (seção "Eventos de
  Formulário"); ver também [technologies.md](technologies.md).
- **Eventos de formulário client-side (navegador):** `beforeMovementOptions` e
  `beforeSendValidate` rodam no **navegador** e devem ficar num `.js` vinculado ao
  HTML do formulário (ES6+ permitido, APIs de DOM/`WCMAPI`/`DOMPurify` disponíveis).
  Contexto separado dos eventos server-side acima.

Pontos de extensão visíveis ao código:

- **View/markup do formulário**: documento HTML com os campos, envolvido por um
  contêiner `fluig-style-guide` e um `<form>` nomeado. A ordem de scripts/estilos
  e a obrigatoriedade do atributo `name` nos campos são fonte de verdade de
  [conventions.md](conventions.md) (seção "Convenções de Form").
- **Handlers de eventos do formulário** (server-side, Rhino/ES5): funções que o
  desenvolvedor implementa para reagir a momentos do ciclo de vida do formulário
  (ex.: carga e validação) — executadas no servidor, não no navegador.
- **Eventos de campo** (server-side, Rhino/ES5): hooks de validação e reação a
  mudanças em campos específicos, permitindo regras de preenchimento e
  consistência.
- **Campo pesquisa (zoom)** (client-side, navegador): um `<input type="zoom">`
  que seleciona um registro de um dataset, com funções sobrescrevíveis
  `setSelectedZoomItem`/`removedZoomItem`/`reloadZoomFilterValues` que rodam **no
  navegador** (não no Rhino) — detalhe e regras em
  [conventions-form.md](conventions-form.md), seção "Campo Pesquisa (zoom)".

### Form com Tabela Pai x Filho

Quando o Form usa tabela Pai x Filho, o ponto de extensão continua sendo o HTML
do formulário, com uma regra adicional: a tabela e identificada por
`<table tablename="...">` e o Fluig usa a linha-base do `<tbody>` como template
para gerar as linhas dinâmicas.

Comportamentos relevantes para agentes de IA:

- **Índice automation por sufixo**: os campos da linha gerada recebem sufixo no
  formato `___<indice>` (ex.: `campo___1`, `campo___2`).
- **Adição/Remoção de filhos**: `wdkAddChild("<tablename>")` adiciona linha e
  `fnWdkRemoveChild(element)` remove da interface (par assimétrico — remover tem o
  prefixo `fn`; não existe `wdkRemoveChild` sem ele).
- **Versionamento nativo**: ao salvar, o Fluig cria nova versão do registro e
  preserva histórico; IDs removidos nao sao reaproveitados.
- **Consumo de dados**: leitura via dataset do formulário com constraints por
  `documentid` + `tablename` (+ `metadata#active=true`) para recuperar os
  registros da tabela filha.

## Dataset

Customização server-side que **expõe ou consulta dados** por meio da API pública
de Dataset. É consumido por outros artefatos (widgets, forms) que precisam de
dados estruturados.

Pontos de extensão e contexto de execução visíveis ao código:

- **Funções nomeadas**: o desenvolvedor implementa funções JavaScript que a
  plataforma invoca em pontos definidos para resolver/consultar o dataset.
- **Execução server-side**: o código roda no runtime público de scripting do
  servidor (motor **Rhino**, base **ES5** — ver [technologies.md](technologies.md))
  e interage **somente** com a API pública de Dataset — sem acesso a componentes
  internos do servidor. A sintaxe segue o padrão rígido do Rhino (não é ES6+) e
  admite interop com Java.
- **Leitura dos parâmetros (`constraints`)**: os filtros passados pelo chamador
  chegam no parâmetro `constraints` (array de objetos `Constraint`). Conforme a
  doc oficial (TDN "Construção do Dataset Avançado"), cada item
  é lido pelas **propriedades** `fieldName`, `initialValue`, `finalValue` e
  `constraintType` — ex.: `constraints[i].fieldName`, `constraints[i].initialValue`,
  e o tipo comparado direto com o enum (`constraints[i].constraintType == ConstraintType.MUST`).
  É comum isolar isso em uma função auxiliar (ex.: `obterParametro(constraints, campo)`).
  *(No Rhino, os valores podem vir como `java.lang.String` — normalize com `String(...)`
  antes de comparar com `===`.)*
  > ⚠️ **Constraints de CONTROLE não são filtro de dado.** A plataforma injeta
  > constraints próprias que **não** correspondem a colunas do dataset — a mais
  > comum é **`sqlLimit`** (limite de registros; é o `resultLimit` do `data-zoom`,
  > padrão **300**, repassado ao dataset avançado como constraint `sqlLimit`; pode
  > vir também `sqlOffset`/`sqlOrderBy`). Se o código tratar **toda** constraint
  > como filtro de coluna, ele vai procurar um campo `sqlLimit` em cada registro,
  > não achar e **descartar todos os registros** (o zoom/datatable fica vazio).
  > Portanto, ao filtrar: **(a)** ignore constraints de controle (`sqlLimit`,
  > `sqlOffset`, ...) — se quiser, aplique `sqlLimit` como `.slice(0, n)` no fim; e
  > **(b)** ignore constraint cujo `fieldName` **não é** coluna do dataset (campo
  > inexistente não deve eliminar o registro). Só então aplique os filtros de
  > coluna reais. Isso vale para **qualquer** dataset customizado consumido por
  > campo zoom ou `FLUIGC.datatable`.
  > ⚠️ **Honre o `likeSearch`.** A constraint tem a propriedade **`likeSearch`**:
  > quando **`true`**, o filtro é **parcial (LIKE)** — compare por "contém"
  > (`valorRegistro.toLowerCase().indexOf(valor.toLowerCase()) !== -1`), **não** por
  > igualdade. É assim que o **campo zoom** busca enquanto o usuário digita (ex.:
  > digitar "Merc" deve casar "Mercado Central"). Se o dataset só fizer igualdade
  > exata, a busca do zoom só retorna com o **valor inteiro** digitado — efetivamente
  > quebrada. Quando `likeSearch` é `false`/ausente: igualdade exata (se
  > `initialValue == finalValue`) ou faixa/BETWEEN (se diferentes).
- **Quem aplica o filtro depende do tipo de dataset** (⚠️ ponto crítico de
  expectativa do consumidor): a função do dataset recebe `fields`, `constraints`
  e `sortFields`, mas **só os honra se o próprio código do dataset os tratar**.
  - **Datasets internos/nativos** (os datasets prontos da plataforma — ex.:
    `colleague`, `catalogItemDataset` etc.; ver TDN *Datasets internos*): aplicam
    `fields`/`constraints`/`sortFields` **nativamente**, sem o desenvolvedor
    codificar nada. **Todos** os internos já fazem isso de fábrica.
  - **Dataset avançado** (codificado à mão, com dados externos — outro dataset,
    serviço REST — ou valores fixos): **não aceita constraints na origem**; o
    filtro/ordenação/seleção de colunas **deve ser implementado no código** do
    dataset (lendo os parâmetros e manipulando o resultado). Se o código **ignora**
    esses parâmetros (ex.: um `createDataset(fields, constraints, sortFields)` que
    monta linhas fixas e não os usa), então enviar filtro/ordenação pelo consumidor
    **não tem efeito** — volta tudo igual.
  - **Implicação para o consumidor (widget/front, via `DatasetFactory` ou API
    REST):** passar `fields`/`constraints`/`orderby` só filtra de fato se o
    dataset consultado estiver implementado para aplicá-los. Fonte: TDN
    *Construção do Dataset Avançado*.
- **Consumo de serviço externo (REST)**: como não há `fetch` no runtime, o acesso
  a um sistema externo é feito pelo **Cadastro de Serviços** via
  `fluigAPI.getAuthorizeClientService()` + `invoke(JSON.stringify(data))`, lendo a
  resposta com `vo.getResult()` (ver [technologies.md](technologies.md)).
- **Erro como dado de retorno**: em vez de deixar uma exceção escapar, o padrão é
  capturar o erro e **retornar um dataset com uma coluna/linha de erro** (ex.: uma
  coluna `ERROR`), para que o consumidor receba um resultado previsível.
- **Consumo**: o resultado é consumido por widgets/forms na camada cliente.

### API pública de Dataset — assinaturas (`DatasetFactory`)

Esta é a **fonte de verdade das assinaturas** do `DatasetFactory`. As assinaturas
refletem a biblioteca pública oficial (`vcXMLRPC.js`, carregada no cliente como
`/webdesk/vcXMLRPC.js`) e valem igualmente para o `DatasetFactory` exposto no
scripting server-side (datasets), com **uma única diferença**: no servidor a
execução é sempre **síncrona** — o parâmetro `callback`, exclusivo do cliente, não
se aplica. **Não invente parâmetros, nomes ou ordem**; use exatamente as
assinaturas abaixo.

#### `DatasetFactory.getDataset(name, fields, constraints, order, callback)`

Consulta um dataset e retorna o conjunto de dados.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `name` | `String` | sim | Nome/código do dataset consultado (ex.: `'colleague'`, `'branches'`). |
| `fields` | `Array<String>` \| `null` | não | Colunas a retornar. `null` retorna todas as colunas. |
| `constraints` | `Array<SearchConstraint>` \| `null` | não | Filtros criados com `DatasetFactory.createConstraint(...)`. `null`/`[]` = sem filtro. |
| `order` | `Array<String>` \| `null` | não | Campos de ordenação (ex.: `['name']`, `['state', 'name']`). |
| `callback` | `Object { success, error }` | não | **Somente no cliente**, onde é **obrigatório**: torna a chamada **assíncrona** — o resultado chega em `callback.success(content)` e falhas em `callback.error(jqXHR, textStatus, errorThrown)`. Omitir o `callback` no cliente (modo síncrono) é **PROIBIDO** (bloqueia a thread principal). No **servidor** (runtime Rhino), a execução é sempre síncrona e o `callback` não se aplica (nunca passe `callback`). |

**Formato do `callback`** (exclusivo do cliente): é um **objeto** com duas
funções — **não** uma função solta:

```javascript
{
  success: function (content) { /* content.values / content.columns */ },
  error:   function (jqXHR, textStatus, errorThrown) { /* trata a falha */ }
}
```

- `success(content)` — chamada em caso de sucesso; recebe o mesmo objeto de
  conteúdo devolvido no modo síncrono.
- `error(jqXHR, textStatus, errorThrown)` — chamada em caso de falha, com os três
  argumentos padrão de erro de requisição (nessa ordem).

**Retorno** (valor síncrono ou argumento de `callback.success`): o objeto de
conteúdo do dataset. ⚠️ **A forma de LER o retorno difere por contexto:**
- **No cliente** (resultado em `callback.success(content)`): JSON com os registros
  em **`.values`** (array de **objetos** — `content.values[i].coluna`) e as colunas
  em **`.columns`**.
- **No servidor (Rhino)**: o retorno é um objeto Java (`DatasetVO`) — leia com
  **`result.getValue(i, "nomeColuna")`** iterando por **`result.rowsCount`**.
  **Não** use `result.values[i].coluna` no servidor: ali `result.values` é um array
  de arrays Java (`java.lang.Object[]`), sem propriedades nomeadas, e
  `row.coluna` lança `InternalError: Java class "[Ljava.lang.Object;" has no public
  instance field or method named "..."`.

```javascript
// Cliente — ✅ ÚNICO padrão permitido: assíncrono (com callback), resultado em success
var constraints = [DatasetFactory.createConstraint('active', 'true', 'true', ConstraintType.MUST)];
DatasetFactory.getDataset('branches', ['code', 'name'], constraints, ['name'], {
  success: function (content) { /* content.values */ },
  error: function (jqXHR, textStatus, errorThrown) { /* trata falha */ }
});

// Cliente — ❌ PROIBIDO: chamada síncrona (sem callback) — bloqueia a thread e trava a UI
// var result = DatasetFactory.getDataset('branches', ['code', 'name', 'state'], constraints, ['name']);

// Servidor (dataset, runtime Rhino) — sempre síncrono, sem callback (correto neste contexto)
var branches = DatasetFactory.getDataset('branches', fields, constraints, sortFields);
// Leitura no SERVIDOR: getValue(linha, "coluna") + rowsCount (NÃO branches.values[i].coluna)
for (var i = 0; i < branches.rowsCount; i++) {
  var code = branches.getValue(i, 'code');
  var name = branches.getValue(i, 'name');
}
```

> 🚨 **No cliente, a consulta síncrona (sem `callback`) é ESTRITAMENTE PROIBIDA.**
> A execução síncrona só é válida no **runtime server-side (Rhino)** dos datasets,
> onde o parâmetro `callback` não se aplica. No frontend, informe **sempre** os
> callbacks `success`/`error` (e encapsule em `Promise` para usar `async/await` —
> ver [conventions.md](conventions.md), seção "Consulta a datasets no cliente").

#### `DatasetFactory.createConstraint(field, initialValue, finalValue, type, likeSearch)`

Cria um filtro (`SearchConstraint`) para o array `constraints` de `getDataset`.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `field` | `String` | sim | Nome do campo a filtrar. |
| `initialValue` | `String` | sim | Valor do filtro; em faixa (range), é o limite **inicial**. `null` é convertido internamente para o sentinela `"___NULL___VALUE___"`. |
| `finalValue` | `String` | sim | Limite **final** da faixa. Para igualdade simples, repita o `initialValue`. |
| `type` | `Number` (`ConstraintType`) | sim | Operador lógico: `ConstraintType.MUST` (1), `ConstraintType.SHOULD` (2) ou `ConstraintType.MUST_NOT` (3). |
| `likeSearch` | `boolean` | não | `true` faz busca **parcial** (LIKE); omitido/`false` faz comparação **exata**. |

**Retorno:** um objeto `Constraint`/`SearchConstraint`. No servidor (dataset
avançado), seus valores são lidos pelas **propriedades** `fieldName`,
`initialValue`, `finalValue` e `constraintType` — conforme os exemplos da doc
oficial (TDN "Construção do Dataset Avançado"), ex.:
`constraints[0].constraintType == ConstraintType.MUST`. *(Os valores podem vir
como `java.lang.String` no Rhino — normalize com `String(...)` antes de comparar.)*

```javascript
// Igualdade exata (initialValue == finalValue, sem likeSearch)
DatasetFactory.createConstraint('state', 'SP', 'SP', ConstraintType.MUST);

// Faixa de valores / BETWEEN (initialValue != finalValue)
DatasetFactory.createConstraint('admissionDate', '2024-01-01', '2024-12-31', ConstraintType.MUST);

// Busca parcial (LIKE) com likeSearch = true
DatasetFactory.createConstraint('name', 'Fil', 'Fil', ConstraintType.MUST, true);
```

#### `ConstraintType`

| Constante | Valor | Semântica |
|-----------|-------|-----------|
| `ConstraintType.MUST` | `1` | Filtro obrigatório (equivale a AND / "deve conter"). |
| `ConstraintType.SHOULD` | `2` | Filtro opcional (equivale a OR / "deveria conter"). |
| `ConstraintType.MUST_NOT` | `3` | Negação (equivale a NOT / "não deve conter"). |

#### Métodos correlatos (mesma biblioteca)

| Assinatura | Uso |
|------------|-----|
| `DatasetFactory.getAvailableDatasets(callback)` | Lista os datasets disponíveis. `callback` opcional (assíncrono no cliente; síncrono quando omitido). |
| `DatasetFactory.getDatasetValues(datasetId, filter, callback)` | Consulta valores de um dataset. `datasetId` **numérico** usa o dataset de card (`cardDatasetValues`); `datasetId` **string** usa o dataset padrão (`standardDatasetValues`). `filter` é um objeto (`{}` quando ausente); `callback` opcional. |

## Como os artefatos se integram

Todos os artefatos executam **dentro** da plataforma Fluig, que os carrega e os
aciona nos pontos de extensão acima:

- **Artefatos cliente** (widgets, Custom Elements, views de layout/form) são
  renderizados no navegador e, quando precisam de dados, consomem endpoints via
  **`fetch()` com `async/await` e `try/catch`**. Para endpoints internos do Fluig,
  a URL é montada com `${WCMAPI.getServerURL()}/api/...`, o que envia o token de
  sessão automaticamente — ver [conventions.md](conventions.md), seção de chamadas
  REST.
- **Artefatos server-side** (datasets) executam no runtime
  público de scripting e interagem apenas com as APIs públicas de seu contexto.
- A comunicação **entre artefatos cliente** ocorre por eventos globais /
  `CustomEvent` no DOM; a comunicação **cliente → dados** ocorre via datasets e
  endpoints expostos publicamente. As regras de **uso de eventos**
  (`CustomEvent`/`dispatchEvent` e `WCMAPI.fireEvent`/`addListener`) são fonte de
  verdade de [conventions.md](conventions.md) — não as duplique.

O desenvolvedor enxerga a plataforma como um host que oferece pontos de extensão
estáveis: ele preenche os contratos (métodos de ciclo de vida, funções nomeadas,
hooks de evento) e a plataforma orquestra a execução.

## Fluig como Servidor (referência)

> **Para referência — fora do escopo de geração deste pacote.** As skills deste
> pacote produzem artefatos que consomem a plataforma (widgets, datasets, forms);
> elas não geram o código do lado do sistema externo que chama o Fluig. Este
> bloco é contexto conceitual para quem avalia ou orienta esse tipo de
> integração — não um alvo de geração de código.

Quando **outro sistema** precisa chamar para dentro do Fluig (direção inversa
à documentada no restante deste pacote), o Fluig expõe: a **API pública
oficial** (https://api.fluig.com/latest/index.html, com notas de release para
mudanças/depreciações), os **webservices** em `<seu-fluig>/services` e a própria
**Dataset Handle REST API** (ver "Consumo de
Datasets no Front-End" em [conventions.md](conventions.md)) consumida de fora
do Fluig, com o mesmo contrato de parâmetros.

**Usuário Integrador.** Integrações máquina-a-máquina que chamam para dentro
do Fluig devem autenticar com um **Usuário Integrador**: uma conta de serviço
dedicada à integração, e não o login/senha pessoal de um usuário real. Usar a
credencial de uma pessoa acopla a integração ao ciclo de vida dela (férias,
desligamento, troca de senha, auditoria de acesso) e dificulta revogar ou
rastrear o acesso automatizado sem afetar o usuário humano.

**Autenticação (OAuth 1.0) e a direção da credencial.** O mecanismo padrão
para essa direção é o **OAuth 1.0**, com o modelo Consumer Key / Consumer
Secret / Token já conhecido da plataforma. É importante não confundir esse
fluxo com o já documentado `Keyring.provision()`/`Keyring.getKeys()`: aquele
é o **componente Fluig chamando para fora** para recuperar sua própria
credencial armazenada no cofre da plataforma; o que se descreve aqui é o
espelho — um **terceiro chamando para dentro** do Fluig, autenticado via
OAuth 1.0 como Usuário Integrador.

A mesma regra de não depender de endpoint não documentado em
api.fluig.com (ver [conventions.md](conventions.md#chamadas-rest-e-integrações)
e [platform-constitution.md](platform-constitution.md#2-integrações-http))
vale igualmente nesse sentido inverso — o sistema externo só pode chamar
endpoints públicos e documentados do Fluig.

## Referências Cruzadas

- Para "como fazer" (gerar cada artefato, modernizar e revisar), ver as skills em
  `skills/` (ex.: `fluig-scaffolding-widget`, `fluig-scaffolding-layout`, `fluig-scaffolding-form`,
  `fluig-scaffolding-dataset`).
- Para convenções de código, i18n, segurança e chamadas REST públicas:
  [conventions.md](conventions.md).
- Para componentes, grid, ícones e variáveis CSS do Style Guide:
  [style-guide.md](style-guide.md).
- Para linguagens, bibliotecas client-side, FreeMarker e runtime de scripting
  server-side: [technologies.md](technologies.md).
