---
name: fluig-scaffolding-layout
description: Gera o esqueleto de um Layout WCM do Fluig — a view FreeMarker (.ftl) que define as regiões/áreas onde os widgets são posicionados, usando o grid responsivo do Style Guide. Use quando o desenvolvedor pedir para criar/iniciar um novo layout (template de página) do Fluig a partir de um nome ou propósito.
argument-hint: 'nome e/ou propósito do layout a ser gerado (ex.: "layout de duas colunas para o portal")'
---

# Scaffolding de Layout (WCM)

Esta skill gera o esqueleto de um Layout WCM do Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Passo 0a — Estrutura

Antes de gerar, identifique a **estrutura do projeto** — ela decide o **layout de
pastas** e o empacotamento, e é independente da persona. Emita
`Estrutura: <Studio|Maven|Híbrida> (motivo)`:

- **Studio** — projeto Fluig sem `pom.xml` na raiz. O layout é gerado em
  `wcm/layout/<nome>`, sem EAR.
- **Maven** — projeto multi-módulo com `pom.xml` na raiz. O layout é um módulo
  `{artifactId}-layout[-{nome}]` `war`, registrado no POM raiz e no módulo `pack`
  (EAR). EAR e `simple.deploy` são **estruturais** aqui — valem para qualquer
  persona (ver [backend-java-maven.md](../../context/backend-java-maven.md) e
  [simple.deploy e código Java no módulo](../../context/architecture.md#o-campo-simpledeploy)).
- **Híbrida** — estrutura Studio com agregador Maven interno, sem `pom.xml` na
  raiz. Trate como Studio para o layout de pastas; gere `pom.xml` do módulo
  quando o agregador existir.

## Passo 0b — Persona

Classifique a persona do desenvolvedor seguindo a cascata em
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Se restar ambígua, pare e pergunte antes de continuar.
Emita `Persona: <Parceiro|Consultor> (motivo)` antes de gerar — a persona
determina **apenas** se a **camada Store** entra: Consultor gera sem a camada
Store; Parceiro aplica o prefixo de namespacing sobre a estrutura detectada (ver
[§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)).

## Objetivo

Produzir, com responsabilidade única, o **esqueleto de um Layout WCM** do Fluig na **estrutura oficial de pastas/arquivos**: o descritor `application.info` (`application.type=layout`), a view FreeMarker (`layout.ftl`) que reproduz a **estrutura HTML rígida de portal** e declara os **slots/regiões** onde os widgets são encaixados, e os arquivos `.properties` de i18n.

## Quando Usar

- Ao criar um **novo layout** (template de página) do Fluig a partir do zero.
- Quando o desenvolvedor fornece um nome/propósito e quer um ponto de partida correto (view com regiões) seguindo as convenções oficiais.
- Quando é preciso garantir, desde o início, uso do grid do Style Guide, i18n nos textos visíveis e ausência de cores fixas.

## Diferenças Críticas em Relação a um Widget

Layout e widget compartilham a estrutura WAR, mas o descritor e a view diferem.
Atenção a estes pontos para não confundir os dois:

| Item | Widget | Layout |
|------|--------|--------|
| `application.type` | `widget` | `layout` |
| Template principal | `view.file=view.ftl` | `layout.file=layout.ftl` |
| Slot padrão | — | `layout.defaultSlot=<Slot>` (obrigatório) |
| Slots pré-configurados | — | `slot.<Nome>=<código-widget>` (opcional) |
| Flag no construtor | `application.uiwidget` | `application.uilayout` |
| Responsivo | — | `application.responsiveLayout=true` |
| Renderização da área | conteúdo próprio | `<@wcm.renderSlot id="..." />` por slot |

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Nome do layout | Identificador em Inglês do layout (ex.: `PortalTwoColumns`) | sim |
| Propósito/estrutura | Quantas regiões/colunas e como o conteúdo se distribui | não |
| Chaves i18n | Chaves de tradução para títulos/textos visíveis do layout | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [architecture.md](../../context/architecture.md) — modelo conceitual do **Layout** (template de página que define slots/regiões para widgets; view FreeMarker renderizada no servidor) e a **estrutura oficial de pastas/arquivos** do layout (descritor `application.info`, `layout.ftl`, `.properties` de i18n).
- [style-guide.md](../../context/style-guide.md) — **grid responsivo** (`.container`/`.row`/`.col-*`), componentes e variáveis CSS de tema (`var(--fs-color-*)`) para estruturar a página.
- [conventions.md](../../context/conventions.md) — i18n para textos visíveis (`${i18n.getTranslation('chave')}` no `.ftl`; `[=i18n.getTranslation('chave')]` em eventual `.js` do layout) e demais convenções públicas de código.
- [platform-constitution.md](../../context/platform-constitution.md) — as 3 regras técnicas base (i18n em `.js`/`.ftl`, HTTP via `fetch()`, sintaxe `SuperWidget.extend`), válidas para toda persona.
- [partner-store-architecture.md](../../context/partner-store-architecture.md) e [partner-store-conventions.md](../../context/partner-store-conventions.md) — **ramo Parceiro (Store)**: módulo Maven `-layout`, EAR/`-pack`, prefixo de namespacing ([§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)) e `simple.deploy` ([simple.deploy e código Java no módulo](../../context/architecture.md#o-campo-simpledeploy)). Carregar somente quando a persona for Parceiro.

## Estrutura de Saída

O layout gerado segue a estrutura oficial (fonte de verdade em `architecture.md`).
O descritor `application.info` é **obrigatório** (com `application.type=layout`);
a `layout.ftl` declara os **slots/regiões**. Use `<code>` como o código do layout
(minúsculo).

```text
<layout>/
├── pom.xml                                # quando o projeto usa Maven ou sob pedido
└── src/main/
    ├── resources/
    │   ├── application.info              # descritor (application.type=layout)
    │   ├── <code>.properties             # i18n base
    │   ├── <code>_pt_BR.properties        # i18n pt-BR
    │   ├── <code>_en_US.properties        # i18n en-US
    │   ├── <code>_es.properties           # i18n es
    │   └── layout.ftl                     # view do layout (declara os slots)
    └── webapp/
        ├── WEB-INF/{web.xml, jboss-web.xml}
        └── resources/
            ├── css/responsive_layout.css  # CSS padrão de responsividade (obrigatório)
            ├── css/<code>.css             # CSS próprio do layout (opcional)
            └── images/icon.png            # ícone
```

> No `application.info`, declare `layout.file=layout.ftl` e `layout.defaultSlot`
> (slot padrão). Ponto de partida público: archetype Maven `layout-wcm`.
>
> **`responsive_layout.css` é padrão:** todo layout inclui um
> `responsive_layout.css` em `webapp/resources/css/`, que cuida da responsividade
> das regiões/slots (container queries + media queries; empilha colunas em telas
> estreitas, com fallback `.not-supports-container-queries`). O descritor declara
> **dois** recursos CSS, nesta ordem: `application.resource.css.1` aponta para a
> folha **global do Fluig** (`/portal/resources/css/wcm_responsive_layout.css`,
> caminho do portal) e `application.resource.css.2` para o `responsive_layout.css`
> padrão do layout. Um `<code>.css` próprio (opcional) entra como recurso
> adicional. Conteúdo de referência em `architecture.md`.
>
> A pasta `WEB-INF` traz `web.xml` e `jboss-web.xml` (com `context-root` =
> `/<application.code>`); o `pom.xml` aparece **quando o projeto usa Maven ou sob
> pedido**. Os blocos de referência desses arquivos vivem em `architecture.md`.
>
> **Estrutura Studio** (Passo 0a), o layout fica em `wcm/layout/<nome>` (ver a
> seção "Estrutura de um Projeto Fluig" em `architecture.md`), sem EAR.
>
> **Estrutura Maven (qualquer persona).** Quando o projeto é Maven multi-módulo, o
> layout é um **módulo Maven** `{artifactId}-layout[-{nome}]` `war`, não uma pasta
> `wcm/layout/`. São **estruturais** (valem para Consultor e Parceiro): `parent`
> no `pom.xml` com o `groupId` próprio do projeto (ver A-D5-17 acima — **nunca
> `com.fluig`**); `simple.deploy` no `application.info` (ver
> [simple.deploy e código Java no módulo](../../context/architecture.md#o-campo-simpledeploy)); e
> integração ao módulo `-pack` (EAR) — detalhe em
> [backend-java-maven.md](../../context/backend-java-maven.md).
>
> **Camada Store (somente se persona = Parceiro, Passo 0b).** Por cima da
> estrutura, o Parceiro acrescenta o **prefixo de namespacing** no
> `application.code` e no `artifactId` (ver
> [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)).
> O restante (estrutura rígida da `layout.ftl`, slots, i18n, CSS) é **igual** em
> todos os casos.

### `pom.xml` (quando o projeto usa Maven ou sob pedido)

Quando for necessário gerar o `pom.xml`, use a estrutura abaixo como ponto de
partida — ajustando `groupId`/`artifactId`/`version`/`name`/`description` ao
artefato. O empacotamento é `war` e o `finalName` usa `${project.artifactId}`. A
referência canônica completa está em `architecture.md`.

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId><!-- groupId do projeto; herdar do parent --></groupId>
    <version>1.0.0</version>
    <artifactId>layout-<code></artifactId>
    <packaging>war</packaging>
    <name>Layout <Nome></name>
    <description>Layout <Nome></description>
    <build>
        <finalName>${project.artifactId}</finalName>
    </build>
</project>
```

> Dentro de um projeto existente, inspecione o `pom.xml` do módulo pai para obter
> as coordenadas reais (parent `groupId`/`artifactId`); **nunca invente**
> coordenadas.
>
> ⚠️ **Parceiro — não use `com.fluig` como `groupId`.** `com.fluig` é reservado
> aos artefatos da própria plataforma; um componente de parceiro usa o **seu
> próprio `groupId`** e herda-o do POM pai do projeto (ver
> [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro) e
> [backend-java-maven.md](../../context/backend-java-maven.md) — escopos/
> dependências). Em projeto Maven multi-módulo de parceiro, o módulo `-layout`
> declara `parent` e **não** repete `groupId`/`version`.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- `application.code` **deve ser igual** a `locale.file.base.name` — divergência quebra a i18n (regra crítica) → ver `architecture.md`.
- O layout define a **estrutura visual** e as **regiões/áreas** onde os widgets são posicionados; ele não contém a lógica dos widgets → ver `architecture.md`.
- A `layout.ftl` segue uma **estrutura HTML rígida e obrigatória**: começa com `<#import "/wcm.ftl" as wcm/>` e `<#import "/layout-globals.ftl" as globals />`, e usa a hierarquia fixa `wcm-wrapper-content` → `wcm-all-content` → `wcm-content` → `${divMasterId!""}`. **Não altere** o wrapper, as classes estruturais nem a ordem dos blocos → ver "Estrutura HTML da `layout.ftl`" em `architecture.md`.
- **⚠️ O `wcm-all-content` DEVE ter `${wcmResponsiveMenuOpenClass!""}`:** gere `<div class="wcm-all-content ${wcmResponsiveMenuOpenClass!""}">`. Essa classe reposiciona o conteúdo quando o menu lateral está aberto; sem ela o conteúdo pode renderizar sob o menu. Está presente nos layouts nativos (ex.: `defaultdashboard`) → ver alerta em `architecture.md` › "Estrutura HTML da `layout.ftl`".
- **Não** coloque `fluig-style-guide` no wrapper raiz de um layout de portal — essa classe pertence ao escopo de widgets/telas standalone, não à moldura do portal → ver `architecture.md`.
- Reproduza os **blocos condicionais fixos**: pré-visualização (`pageRender.isPreviewMode()` → `@wcm.previewPageAlert`/`@wcm.deviceTogglePreview`), cabeçalho/menu fora da edição (`pageRender.isEditMode() != true` → `@wcm.header`/`@wcm.menu`), controles do construtor na edição (`@wcm.editHeader`/`@wcm.widgetsList`) e footer fora do tema responsivo (`fluigThemeCode != "responsive_theme"` → `@wcm.footer`) → ver `architecture.md`.
- **A liberdade está nos slots**, dentro de `${divMasterId!""}`: cada região é um `<div class="editable-slot slotfull <grid>" id="slotFullN">` com `<@wcm.renderSlot id="SlotX" editableSlot="true" isResponsiveSlot="true" />`. O identificador do slot padrão deve casar com `layout.defaultSlot` do `application.info` → ver `architecture.md`.
- Para o **grid das regiões**, **reutilize o padrão dos layouts NATIVOS reais** (`references/layouts/layouts-nativos-slots.md` + nativo `defaultdashboard`) — não monte classes à mão. Coluna única = `editable-slot slotfull layout-1-1`. Em 2 colunas: esquerda = `editable-slot slotfull layout-2-3left`; a coluna direita é envolvida por um **`<div id="all-slots-right">` agrupador** (id, não classe de slot; o `responsive_layout.css` o referencia por `#all-slots-right`), com os slots internos em `layout-1-1`. Nunca posicionamento fixo → ver `architecture.md` › "Grid das regiões" e o catálogo nativo.
- **Slots não-editáveis exigem `slot.<Nome>=<tipo>` no `application.info`:** quando a `layout.ftl` usa um slot especial da plataforma (menu, login, busca, alerta global, uso), o descritor **deve** mapeá-lo ao widget correspondente; slots editáveis comuns (SlotA, SlotB…) não. Lista dos slots e seus valores → ver `architecture.md`.
- **Descritores `WEB-INF/web.xml` e `jboss-web.xml`:** copie os blocos canônicos de `architecture.md` › "Empacotamento web (WEB-INF)" — **sem `<!DOCTYPE>`** (o parser XXE-safe do Fluig recusa e o deploy falha). Não escrever de memória → ver `architecture.md`.
- Todo texto visível via i18n: `${i18n.getTranslation('chave')}` no `layout.ftl`; se o layout tiver `.js` próprio, `[=i18n.getTranslation('chave')]` (entre aspas ao atribuir a variável, sem misturar as duas sintaxes no mesmo `.js`); nunca strings fixas → ver `conventions.md`.
- Inclua o **`responsive_layout.css` padrão** em `webapp/resources/css/` (responsividade das regiões/slots) e declare os dois CSS no descritor na ordem: `application.resource.css.1` = folha global do Fluig (`/portal/resources/css/wcm_responsive_layout.css`) e `application.resource.css.2` = `/resources/css/responsive_layout.css`. Distintos do `<code>.css` próprio → ver `architecture.md`.
- Sem CSS com **hexadecimais fixos** para cores de tema; use `var(--fs-color-*)` → ver `style-guide.md`.
- **Minimizar CSS próprio; priorizar os componentes do Style Guide**; CSS próprio só sob pedido explícito (o CSS do layout permanece opcional) → ver `style-guide.md`/`conventions.md`.

> **Layout standalone (exceção):** quando o layout **não** se integra à moldura do portal (ex.: telas "boards" com `navbar` própria), usa-se um wrapper raiz `<div class="fluig-style-guide ...">` sem `@wcm.header`/`@wcm.menu`/`@wcm.footer` e sem a hierarquia `wcm-wrapper-content`. Use esse formato apenas nesse caso; o padrão é a estrutura rígida de portal.

## Procedimento

1. Definir o nome do layout (em Inglês) e o `<code>` (minúsculo) a partir da entrada, e identificar as regiões/slots necessários e o arranjo do grid (ex.: largura total, duas colunas, lateral + conteúdo).
2. Criar a estrutura de pastas oficial (ver "Estrutura de Saída") e o descritor **`application.info`** com `application.type=layout`, `application.renderer=freemarker`, `layout.file=layout.ftl`, `layout.defaultSlot` e os **campos completos** do layout (incl. `application.fluig.version`, `application.category`, `application.newBuilder`, `application.responsiveLayout`, `application.icon`, recursos `css.N` e `developer.url`) — ver a tabela completa em `architecture.md`.
3. Montar a **view `layout.ftl`** (em `src/main/resources/`) **reproduzindo o esqueleto rígido** da seção "Estrutura HTML da `layout.ftl`" em `architecture.md`: os dois imports (`/wcm.ftl` e `/layout-globals.ftl`), o bloco de preview, o wrapper `wcm-wrapper-content` → `wcm-all-content` → `wcm-content` → `${divMasterId!""}` e os blocos condicionais de edição. **Não** adicione `fluig-style-guide` ao wrapper raiz de portal.
4. **Posicionar os slots** dentro de `${divMasterId!""}`: para cada região, um `<div class="editable-slot slotfull <grid>" id="slotFullN">` com `<@wcm.renderSlot id="SlotX" editableSlot="true" isResponsiveSlot="true" />`; garantir que o slot padrão case com `layout.defaultSlot`. Ajustar a classe de grid (`layout-1-1`, `layout-1-2left`/`right`, etc.) conforme o arranjo desejado.
5. Acrescentar o **footer** dentro do bloco `fluigThemeCode != "responsive_theme"` via `@wcm.footer` com o `layoutuserlabel` apropriado (chave de i18n).
6. Criar os arquivos **`.properties` de i18n** (base + `pt_BR`/`en_US`/`es`) e aplicar i18n em qualquer título ou texto visível do layout com `${i18n.getTranslation('chave')}` na `layout.ftl` (e `[=i18n.getTranslation('chave')]` em eventual `.js` do layout). **Codificação dos `.properties`:** arquivos de locale usam escape `\uXXXX` (só o base admite acento direto) → ver `conventions.md` › "Codificação dos arquivos `.properties`".
7. Criar o **`responsive_layout.css` padrão** em `webapp/resources/css/` (conteúdo de referência em `architecture.md`) e declarar os dois recursos CSS no descritor na ordem: `application.resource.css.1=/portal/resources/css/wcm_responsive_layout.css` (folha global do Fluig) e `application.resource.css.2=/resources/css/responsive_layout.css`. Se houver CSS próprio do layout (`<code>.css`), declará-lo como recurso adicional e usar `var(--fs-color-*)` para cores de tema (sem hexadecimais fixos).
7a. Criar os descritores **`webapp/WEB-INF/web.xml`** e **`webapp/WEB-INF/jboss-web.xml`** copiando **exatamente** os blocos canônicos de `architecture.md` › "Empacotamento web (WEB-INF)" (`context-root = /<application.code>`; **sem `<!DOCTYPE>`**, que quebra o deploy). Não escrever de memória → ver `architecture.md`.
8. Quando o projeto usa **Maven** (ou sob pedido), criar o `pom.xml` na raiz da estrutura (bloco de referência em `architecture.md`); inspecionar as coordenadas Maven (`groupId`, `artifactId` e o `parent`) no projeto existente e **nunca inventá-las**.
9. Validar o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Esqueleto de layout pronto para evoluir, na estrutura oficial, contendo:

- O **descritor `application.info`** (`application.type=layout`) declarando `layout.file`, slot padrão e i18n.
- A **view `layout.ftl`** reproduzindo a **estrutura HTML rígida** (imports `/wcm.ftl` e `/layout-globals.ftl`, bloco de preview, hierarquia `wcm-wrapper-content` → `wcm-all-content` → `wcm-content` → `${divMasterId!""}`, blocos condicionais de edição e footer), com os **slots nomeados** renderizados por `@wcm.renderSlot` dentro do contêiner-mestre.
- Os arquivos **`.properties` de i18n** (base + locales) com as chaves de tradução.
- O **`responsive_layout.css` padrão** em `webapp/resources/css/`, declarado no descritor.
- (Opcional) CSS próprio do layout (`<code>.css`) com cores de tema por `var(--fs-color-*)` e os arquivos de empacotamento (`pom.xml`, `WEB-INF`).

Tudo em conformidade com `context/architecture.md`, `context/style-guide.md` e `context/conventions.md`.

## Exemplo de Uso

Use `examples/layout/` como referência mínima da view `.ftl` de um layout que demonstra a **estrutura HTML rígida** de portal (imports, wrapper `wcm-wrapper-content`, blocos condicionais e slots renderizados por `@wcm.renderSlot`). Trate-o como trecho de referência, não como projeto completo.

## Política de Fallback

- Faltando **nome**, **slots** ou **slot padrão**: solicitar antes de gerar.
- **Coordenadas Maven** do parent: inspecionar o `pom.xml` do módulo onde o layout será criado; **nunca inventar**.
- **`icon.png`**: gerar placeholder e registrar como pendência manual.
- **Traduções `en_US`/`es` ausentes**: usar PT como base e marcar `# TODO i18n` por chave.

## Checklist de Validação

- [ ] Estrutura oficial criada, com o descritor **`application.info`** (`application.type=layout`, `layout.file=layout.ftl`, `layout.defaultSlot`).
- [ ] `application.code` **igual** a `locale.file.base.name`.
- [ ] A `layout.ftl` começa com `<#import "/wcm.ftl" as wcm/>` e `<#import "/layout-globals.ftl" as globals />`.
- [ ] Wrapper raiz é `wcm-wrapper-content` com a hierarquia fixa `wcm-all-content` → `wcm-content` → `${divMasterId!""}` (sem `fluig-style-guide` no root, salvo layout standalone).
- [ ] O `wcm-all-content` inclui **`${wcmResponsiveMenuOpenClass!""}`** (`<div class="wcm-all-content ${wcmResponsiveMenuOpenClass!""}">`) — reposiciona o conteúdo com o menu lateral aberto; presente nos layouts nativos.
- [ ] Blocos condicionais presentes: preview (`isPreviewMode`), header/menu fora da edição, `@wcm.editHeader`/`@wcm.widgetsList` na edição e footer fora do tema responsivo.
- [ ] `layout.defaultSlot` está presente entre os slots declarados na `layout.ftl`.
- [ ] Cada slot é um `<div class="editable-slot slotfull <grid>" id="slotFullN">` com `<@wcm.renderSlot id="..." />` correspondente.
- [ ] Slots **não-editáveis** usados na `layout.ftl` têm o `slot.<Nome>=<tipo>` correspondente no descritor, referenciando um código de widget válido → ver `architecture.md`.
- [ ] Arquivos **`.properties` de i18n** (base + `pt_BR`/`en_US`/`es`).
- [ ] **Codificação dos `.properties` de locale:** caracteres acentuados/não-ASCII escapados em `\uXXXX` (só o arquivo base admite acento direto) → ver `conventions.md`.
- [ ] **`responsive_layout.css` padrão** presente em `webapp/resources/css/`; descritor declara `application.resource.css.1` = folha global do Fluig (`/portal/resources/css/wcm_responsive_layout.css`) e `application.resource.css.2` = `/resources/css/responsive_layout.css`.
- [ ] Grid das regiões via classes de layout (`layout-1-1`, `layout-1-2left`/`right`, `layout-1-3`), sem posicionamento/medidas fixas.
- [ ] Todo texto visível usa i18n (`${i18n.getTranslation('...')}` no `.ftl`; `[=i18n.getTranslation('...')]` em `.js` do layout) — sem strings fixas.
- [ ] Sem hexadecimais fixos para cores de tema (use `var(--fs-color-*)`).
- [ ] `WEB-INF` presente (`web.xml` + `jboss-web.xml`) com `context-root` = `/<application.code>`.
- [ ] **Descritores WEB-INF sem `<!DOCTYPE>`** e idênticos aos blocos canônicos de `architecture.md` → ver `architecture.md` › "Empacotamento web (WEB-INF)".
- [ ] CSS próprio mínimo (Style Guide como padrão); CSS próprio sem pedido explícito = **pendência a revisar**.
- [ ] Descritor de layout com **campos completos** (incl. `application.newBuilder`, `application.responsiveLayout`) — ver `architecture.md`.
- [ ] `pom.xml` presente **quando o projeto usa Maven ou sob pedido**.
- [ ] **Se Parceiro:** módulo Maven `{artifactId}-layout[-{nome}]` com `parent` (groupId próprio, **nunca `com.fluig`**), prefixo de namespacing no `application.code`/`artifactId`, `simple.deploy` no descritor e integração ao `-pack` (EAR) — ver `partner-store-conventions.md` [simple.deploy e código Java no módulo](../../context/architecture.md#o-campo-simpledeploy)/ [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro) e `backend-java-maven.md`.

## Resumo da Geração

Ao concluir, apresente um resumo curto:

- **Layout / `application.code`:** nome e código.
- **Diretório:** onde o layout foi criado.
- **Slots:** lista de slots (com destaque para o slot padrão) e slots pré-configurados, se houver.
- **Arquivos gerados:** lista.
- **Pendências manuais:** ex.: `icon.png` real, coordenadas do `pom.xml` pai, traduções `en_US`/`es` marcadas com TODO, **CSS próprio criado sem pedido explícito (revisar)**.
- **CSS próprio sem pedido explícito**: registrar como **pendência a revisar** (Style Guide é o padrão; CSS próprio é exceção sob pedido).
