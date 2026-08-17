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

> **Onde criar cada artefato:** ao gerar um artefato dentro de um projeto Fluig
> Studio existente, posicione-o na pasta correspondente acima. Widgets e layouts
> mantêm sua estrutura interna (descritor `application.info`, `view.ftl`/`layout.ftl`,
> i18n e recursos) dentro de `wcm/widget/<nome>` e `wcm/layout/<nome>`,
> respectivamente. Datasets e eventos globais são arquivos JavaScript server-side
> colocados em `datasets/` e `events/`.

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
    │   └── edit.ftl                        # view de edição (pode ser vazio, mas é obrigatório)
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
| `application.code` | Código único do widget (minúsculo, sem espaços) — **igual a** `locale.file.base.name` |
| `application.title` / `application.description` | Título e descrição (admitem i18n) |
| `application.fluig.version` | Versão da plataforma Fluig alvo |
| `application.category` | Categoria do widget (ex.: `SYSTEM`, `APPLICATION`, `Social`) |
| `application.renderer` | `freemarker` |
| `application.mobileapp` | Disponibilidade do widget em app mobile |
| `application.version` | `${build.version}-${build.revision}` |
| `application.uiwidget` | `true` quando o widget aparece no construtor de páginas (default `false`) |
| `view.file` | `view.ftl` (view principal) |
| `edit.file` | `edit.ftl` (view de edição; pode ser vazia, mas é obrigatória) |
| `application.resource.css.N` | Caminho do CSS (`/resources/css/<code>.css`) |
| `application.resource.js.N` | Caminho do JS (`/resources/js/<code>.js`) |
| `application.resource.component.N` | Componente de negócio do Style Guide usado (ex.: `datatable`, `treeview`) |
| `locale.file.base.name` | Nome base dos arquivos `.properties` de i18n — **igual a** `application.code` |
| `developer.code` / `developer.name` / `developer.url` | Identificação do desenvolvedor |

> **Versão e build:** `application.version` é declarada como
> `${build.version}-${build.revision}`, resolvida pelo build a partir das
> propriedades do projeto.

> **`edit.file` obrigatório:** o descritor referencia a view de edição via
> `edit.file=edit.ftl`. O arquivo `edit.ftl` precisa existir (mesmo vazio).

> **Regra crítica:** `application.code` **deve ser igual** a
> `locale.file.base.name`. Divergência entre os dois quebra a resolução de i18n
> do artefato.

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
| `div.wcm-all-content` | Contêiner de conteúdo | Recebe `${wcmResponsiveMenuOpenClass!""}` |
| `div#wcm-content.clearfix.wcm-background` | Área de conteúdo | Classes fixas |
| Bloco `isEditMode() = true` | `@wcm.editHeader` + `@wcm.widgetsList` | Controles do construtor, só na edição |
| `div#${divMasterId!""}` | Contêiner-mestre dos slots | É **aqui** que os slots variam |
| Bloco `fluigThemeCode != "responsive_theme"` | `@wcm.footer` | Footer omitido no tema responsivo |

O que o desenvolvedor **pode** variar:

- **Slots**: cada região é um `<div class="editable-slot slotfull <grid>" id="slotFullN">`
  com um `<@wcm.renderSlot id="SlotX" editableSlot="true" isResponsiveSlot="true" />`.
- **Identificadores de slot** (`SlotA`, `SlotB`, ...): o slot padrão deve casar com
  `layout.defaultSlot` no `application.info`.
- **Grid das regiões**: classes como `layout-1-1` (largura total), `layout-1-2left`/
  `layout-1-2right` (duas colunas), `layout-1-3` (três colunas) ou agrupamentos
  `all-slots-left`/`all-slots-right`.

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
    <artifactId>widget-football-career</artifactId>
    <packaging>war</packaging>
    <name>Widget Football Career</name>
    <description>Widget Football Career</description>
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

> **Coordenadas Maven nunca inventadas:** as coordenadas Maven (`groupId`,
> `artifactId` e, quando houver, o `parent`) devem ser **inspecionadas no projeto**
> existente e nunca inventadas. Na ausência dessa informação, aplica-se a política
> de fallback das skills (não fabricar coordenadas; solicitar ou inspecionar).

## Form (Formulário eletrônico)

Formulário eletrônico autorado pelo desenvolvedor para captura de dados. Além dos
campos, o desenvolvedor pode anexar **lógica client-side** que reage ao ciclo de
vida do formulário e aos eventos de seus campos.

Pontos de extensão visíveis ao código:

- **View/markup do formulário**: documento HTML com os campos, envolvido por um
  contêiner `fluig-style-guide` e um `<form>` nomeado. A ordem de scripts/estilos
  e a obrigatoriedade do atributo `name` nos campos são fonte de verdade de
  [conventions.md](conventions.md) (seção "Convenções de Form").
- **Handlers de eventos do formulário**: funções que o desenvolvedor implementa
  para reagir a momentos do ciclo de vida do formulário (ex.: carga e validação).
- **Eventos de campo**: hooks de validação e reação a mudanças em campos
  específicos, permitindo regras de preenchimento e consistência.

### Form com Tabela Pai x Filho

Quando o Form usa tabela Pai x Filho, o ponto de extensão continua sendo o HTML
do formulário, com uma regra adicional: a tabela e identificada por
`<table tablename="...">` e o Fluig usa a linha-base do `<tbody>` como template
para gerar as linhas dinâmicas.

Comportamentos relevantes para agentes de IA:

- **Índice automation por sufixo**: os campos da linha gerada recebem sufixo no
  formato `___<indice>` (ex.: `campo___1`, `campo___2`).
- **Adição/Remoção de filhos**: `wdkAddChild("<tablename>")` adiciona linha e
  `wdkRemoveChild(element)` remove da interface.
- **Versionamento nativo**: ao salvar, o Fluig cria nova versão do registro e
  preserva histórico; IDs removidos nao sao reaproveitados.
- **Consumo de dados**: leitura via dataset do formulário com constraints por
  `documentid` + `tablename` (+ `metadata#active=true`) para recuperar os
  registros da tabela filha.

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
  servidor (motor **Rhino**, base **ES5** — ver [technologies.md](technologies.md))
  e interage **somente** com a API pública de Dataset — sem acesso a componentes
  internos do servidor. A sintaxe segue o padrão rígido do Rhino (não é ES6+) e
  admite interop com Java.
- **Leitura dos parâmetros (`constraints`)**: os filtros passados pelo chamador
  chegam no parâmetro `constraints`. Para obter o valor de um filtro, percorra o
  array e compare `constraint.getFieldName()` com o campo desejado, lendo o valor
  com `constraint.getInitialValue()` (use os **métodos**, não propriedades). É
  comum isolar isso em uma função auxiliar (ex.: `obterParametro(constraints, campo)`).
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
| `callback` | `Object { success, error }` | não | **Somente no cliente.** Quando informado, a chamada é **assíncrona**: o resultado chega em `callback.success(content)` e falhas em `callback.error(jqXHR, textStatus, errorThrown)`. Quando **omitido**, a chamada é **síncrona** e o resultado é retornado pela função. No **servidor**, sempre síncrono (nunca passe `callback`). |

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
conteúdo do dataset, com os registros em `.values` (array de linhas) e as colunas
em `.columns`.

```javascript
// Cliente — síncrono (sem callback): retorna o conteúdo diretamente
var constraints = [DatasetFactory.createConstraint('active', 'true', 'true', ConstraintType.MUST)];
var result = DatasetFactory.getDataset('branches', ['code', 'name', 'state'], constraints, ['name']);
var rows = (result && result.values) || [];

// Cliente — assíncrono (com callback): resultado chega em success
DatasetFactory.getDataset('branches', ['code', 'name'], constraints, ['name'], {
  success: function (content) { /* content.values */ },
  error: function (jqXHR, textStatus, errorThrown) { /* trata falha */ }
});

// Servidor (dataset) — sempre síncrono, sem callback
var branches = DatasetFactory.getDataset('branches', fields, constraints, sortFields);
```

#### `DatasetFactory.createConstraint(field, initialValue, finalValue, type, likeSearch)`

Cria um filtro (`SearchConstraint`) para o array `constraints` de `getDataset`.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `field` | `String` | sim | Nome do campo a filtrar. |
| `initialValue` | `String` | sim | Valor do filtro; em faixa (range), é o limite **inicial**. `null` é convertido internamente para o sentinela `"___NULL___VALUE___"`. |
| `finalValue` | `String` | sim | Limite **final** da faixa. Para igualdade simples, repita o `initialValue`. |
| `type` | `Number` (`ConstraintType`) | sim | Operador lógico: `ConstraintType.MUST` (1), `ConstraintType.SHOULD` (2) ou `ConstraintType.MUST_NOT` (3). |
| `likeSearch` | `boolean` | não | `true` faz busca **parcial** (LIKE); omitido/`false` faz comparação **exata**. |

**Retorno:** um objeto `SearchConstraint`. No servidor, seus valores são lidos
pelos **métodos** `getFieldName()`, `getInitialValue()` e `getFinalValue()` (use
os métodos, **não** as propriedades).

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
  renderizados no navegador e, quando precisam de dados, chamam endpoints
  internos do Fluig **através das APIs públicas de cliente** (`FLUIGC.ajax`,
  `WCMAPI`), que cuidam da sessão/autenticação — ver
  [conventions.md](conventions.md), seção de chamadas REST.
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
