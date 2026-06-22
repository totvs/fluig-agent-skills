---
name: scaffolding-layout
description: Gera o esqueleto de um Layout WCM do Fluig — a view FreeMarker (.ftl) que define as regiões/áreas onde os widgets são posicionados, usando o grid responsivo do Style Guide. Use quando o desenvolvedor pedir para criar/iniciar um novo layout (template de página) do Fluig a partir de um nome ou propósito.
argument-hint: nome e/ou propósito do layout a ser gerado (ex.: "layout de duas colunas para o portal")
---

# Scaffolding de Layout (WCM)

Esta skill gera o esqueleto de um Layout WCM do Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Objetivo

Produzir, com responsabilidade única, o **esqueleto de um Layout WCM** do Fluig na **estrutura oficial de pastas/arquivos**: o descritor `application.info` (`application.type=layout`), a view FreeMarker (`layout.ftl`) que estabelece a estrutura visual da página e declara os **slots/regiões** onde os widgets são encaixados, e os arquivos `.properties` de i18n — já apoiada no grid responsivo do Style Guide.

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
- [conventions.md](../../context/conventions.md) — i18n (`${i18n.getTranslation('chave')}`) para textos visíveis e demais convenções públicas de código.

## Estrutura de Saída

O layout gerado segue a estrutura oficial (fonte de verdade em `architecture.md`).
O descritor `application.info` é **obrigatório** (com `application.type=layout`);
a `layout.ftl` declara os **slots/regiões**. Use `<code>` como o código do layout
(minúsculo).

```text
<layout>/
├── pom.xml
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
            ├── css/<code>.css             # CSS do layout (opcional)
            └── images/icon.png            # ícone
```

> No `application.info`, declare `layout.file=layout.ftl` e `layout.defaultSlot`
> (slot padrão). Ponto de partida público: archetype Maven `layout-wcm`.
>
> **Em um projeto Fluig Studio**, o layout fica em `wcm/layout/<nome>` (ver a
> seção "Estrutura de um Projeto Fluig Studio" em `architecture.md`).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- `application.code` **deve ser igual** a `locale.file.base.name` — divergência quebra a i18n (regra crítica) → ver `architecture.md`.
- O layout define a **estrutura visual** e as **regiões/áreas** onde os widgets são posicionados; ele não contém a lógica dos widgets → ver `architecture.md`.
- A view do layout é escrita em **FreeMarker (`.ftl`)** e renderizada no servidor; comece importando os utilitários públicos de layout: `<#import "/wcm.ftl" as wcm/>` → ver `architecture.md`.
- Envolva o conteúdo em um **wrapper raiz com `fluig-style-guide`** (estrutura padrão `wcm-wrapper-content` → `wcm-all-content` → `wcm-content`) → ver `architecture.md` e `style-guide.md`.
- **Declare slots nomeados renderizados pela macro pública** `<@wcm.renderSlot id="SlotA" editableSlot="true" isResponsiveSlot="true" />`, cada um em um contêiner identificável (ex.: `id="slotFull1"`); o identificador do slot padrão deve casar com `layout.defaultSlot` do `application.info` → ver `architecture.md`.
- Use as **macros públicas de portal** quando aplicável (`@wcm.header`, `@wcm.menu`, `@wcm.footer`) e as verificações de modo (`pageRender.isEditMode()`/`isPreviewMode()`) → ver `architecture.md`.
- Estruture as regiões com o **grid responsivo** do Style Guide (`.container`/`.container-fluid` → `.row` → `.col-*`), em vez de medidas/posicionamento fixos → ver `style-guide.md`.
- Todo texto visível via i18n: `${i18n.getTranslation('chave')}`; nunca strings fixas → ver `conventions.md`.
- Sem CSS com **hexadecimais fixos** para cores de tema; use `var(--fs-color-*)` → ver `style-guide.md`.

## Procedimento

1. Definir o nome do layout (em Inglês) e o `<code>` (minúsculo) a partir da entrada, e identificar as regiões/slots necessários (ex.: cabeçalho, conteúdo principal, lateral, rodapé).
2. Criar a estrutura de pastas oficial (ver "Estrutura de Saída") e o descritor **`application.info`** com `application.type=layout`, `application.renderer=freemarker`, `layout.file=layout.ftl`, `layout.defaultSlot` e os dados do desenvolvedor.
3. Iniciar a **view `layout.ftl`** (em `src/main/resources/`) importando os utilitários públicos de layout (`<#import "/wcm.ftl" as wcm/>`) e montando o **wrapper raiz com `fluig-style-guide`** (`wcm-wrapper-content` → `wcm-all-content` → `wcm-content`), usando o **grid do Style Guide** (`.row`/`.col-*`) para as regiões responsivas.
4. **Declarar os slots nomeados** que receberão widgets, cada um em um contêiner identificável (ex.: `id="slotFull1"`) e renderizado pela macro pública `<@wcm.renderSlot id="SlotA" editableSlot="true" isResponsiveSlot="true" />`; garantir que o slot padrão case com `layout.defaultSlot`. Acrescentar as macros de portal (`@wcm.header`, `@wcm.menu`, `@wcm.footer`) conforme necessário.
5. Criar os arquivos **`.properties` de i18n** (base + `pt_BR`/`en_US`/`es`) e aplicar i18n em qualquer título ou texto visível do layout com `${i18n.getTranslation('chave')}`.
6. Reutilizar componentes/utilitários do Style Guide e, quando houver CSS próprio, usar `var(--fs-color-*)` para cores de tema (sem hexadecimais fixos).
7. Validar o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Esqueleto de layout pronto para evoluir, na estrutura oficial, contendo:

- O **descritor `application.info`** (`application.type=layout`) declarando `layout.file`, slot padrão e i18n.
- A **view `layout.ftl`** do layout iniciando com `<#import "/wcm.ftl" as wcm/>`, com o wrapper raiz `fluig-style-guide`, a estrutura sobre o **grid responsivo** do Style Guide e os **slots nomeados** renderizados por `@wcm.renderSlot`, identificáveis e prontos para receber widgets.
- Os arquivos **`.properties` de i18n** (base + locales) com as chaves de tradução.
- (Opcional) CSS do layout com cores de tema por `var(--fs-color-*)` e os arquivos de empacotamento (`pom.xml`, `WEB-INF`).

Tudo em conformidade com `context/architecture.md`, `context/style-guide.md` e `context/conventions.md`.

## Exemplo de Uso

Use `examples/layout/` como referência mínima da view `.ftl` de um layout que demonstra o uso do grid do Style Guide e a declaração de regiões de conteúdo. Trate-o como trecho de referência, não como projeto completo.

## Checklist de Validação

- [ ] Estrutura oficial criada, com o descritor **`application.info`** (`application.type=layout`, `layout.file=layout.ftl`, `layout.defaultSlot`).
- [ ] `application.code` **igual** a `locale.file.base.name`.
- [ ] `layout.defaultSlot` está presente entre os slots declarados na `layout.ftl`.
- [ ] Cada slot declarado tem um `<@wcm.renderSlot id="..." />` correspondente.
- [ ] Cada `slot.<Nome>=<widget>` (se houver) referencia um código de widget válido.
- [ ] Arquivos **`.properties` de i18n** (base + `pt_BR`/`en_US`/`es`).
- [ ] A `layout.ftl` importa os utilitários de layout (`<#import "/wcm.ftl" as wcm/>`) e tem wrapper raiz com `fluig-style-guide`.
- [ ] A estrutura usa o **grid do Style Guide** (`.container`/`.row`/`.col-*`), sem posicionamento/medidas fixas.
- [ ] Todo texto visível usa `${i18n.getTranslation('...')}` — sem strings fixas.
- [ ] Sem hexadecimais fixos para cores de tema (use `var(--fs-color-*)`).

## Resumo da Geração

Ao concluir, apresente um resumo curto:

- **Layout / `application.code`:** nome e código.
- **Diretório:** onde o layout foi criado.
- **Slots:** lista de slots (com destaque para o slot padrão) e slots pré-configurados, se houver.
- **Arquivos gerados:** lista.
- **Pendências manuais:** ex.: `icon.png` real, coordenadas do `pom.xml` pai, traduções `en_US`/`es` marcadas com TODO.

## Política de Fallback

- Faltando **nome**, **slots** ou **slot padrão**: solicitar antes de gerar.
- **Coordenadas Maven** do parent: inspecionar o `pom.xml` do módulo onde o layout será criado; **nunca inventar**.
- **`icon.png`**: gerar placeholder e registrar como pendência manual.
- **Traduções `en_US`/`es` ausentes**: usar PT como base e marcar `# TODO i18n` por chave.
