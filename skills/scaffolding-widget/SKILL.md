---
name: scaffolding-widget
description: Gera o esqueleto de um Widget WCM do Fluig usando SuperWidget.extend (view FreeMarker + JS com init() e bindings), aplicando as convenções oficiais de customização. Use quando o desenvolvedor pedir para criar/iniciar um novo widget client-side do Fluig a partir de um nome ou descrição de propósito.
argument-hint: nome e/ou propósito do widget a ser gerado (ex.: "widget de notificações")
---

# Scaffolding de Widget (SuperWidget)

Esta skill gera o esqueleto de um Widget WCM do Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Objetivo

Produzir, com responsabilidade única, o **esqueleto de um Widget WCM** do Fluig na **estrutura oficial de pastas/arquivos**: o descritor `application.info`, a view FreeMarker (`view.ftl`) com o elemento raiz correto, os arquivos `.properties` de i18n e o arquivo JavaScript com `SuperWidget.extend`, `init()` e `bindings`, já em conformidade com as convenções públicas e o Style Guide.

## Quando Usar

- Ao criar um **novo widget** client-side do Fluig a partir do zero.
- Quando o desenvolvedor fornece um nome/propósito e quer um ponto de partida correto (view + JS) seguindo as convenções oficiais.
- Quando é preciso garantir, desde o início, `fluig-style-guide` na raiz, uso correto de `instanceId` e bindings declarativos.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Nome do widget | Identificador em Inglês (PascalCase) usado na classe e no `id` (ex.: `Notifications`) | sim |
| Propósito | O que o widget faz (orienta init, bindings e textos i18n) | não |
| Chaves i18n | Chaves de tradução para os textos visíveis | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — convenções de Widget (`fluig-style-guide`, `instanceId`, `.instance()`, bindings local/global), i18n, segurança, CSS escopado e ES6+. Inclui também as **convenções de Custom Elements** (arquivos `[name].[category].js`, membros privados `#`, topo do módulo só com `import`, CSS escopado/agrupado por tag e variáveis CSS para números mágicos), aplicáveis quando o widget incorpora Web Components.
- [style-guide.md](../../context/style-guide.md) — componentes/helpers (`FLUIGC`), grid e variáveis CSS de tema (`var(--fs-color-*)`) para o markup e o estilo do widget.
- [architecture.md](../../context/architecture.md) — modelo conceitual do Widget, seu ciclo de vida (`init()`, `.instance()`, bindings) e a **estrutura oficial de pastas/arquivos** do widget (descritor `application.info`, `view.ftl`, `.properties` de i18n, JS/CSS).

## Estrutura de Saída

O widget gerado segue a estrutura oficial (fonte de verdade em `architecture.md`).
O descritor `application.info` é **obrigatório** — sem ele a plataforma não
reconhece o widget. Use `<code>` como o código do widget (minúsculo).

```text
<widget>/
├── pom.xml
└── src/main/
    ├── resources/
    │   ├── application.info              # descritor (application.type=widget)
    │   ├── <code>.properties             # i18n base (chaves de getTranslation)
    │   ├── <code>_pt_BR.properties        # i18n pt-BR
    │   ├── <code>_en_US.properties        # i18n en-US
    │   ├── <code>_es.properties           # i18n es
    │   └── view.ftl                       # view principal (elemento raiz)
    └── webapp/
        ├── WEB-INF/{web.xml, jboss-web.xml}
        └── resources/
            ├── css/<code>.css             # CSS escopado (opcional)
            ├── images/icon.png            # ícone
            └── js/<code>.js               # SuperWidget.extend
```

> A `view.ftl` fica em `src/main/resources/`; o `<code>.js` e o `<code>.css` em
> `src/main/webapp/resources/`. Ponto de partida público: archetype Maven
> `widget-wcm`.
>
> **Em um projeto Fluig Studio**, o widget fica em `wcm/widget/<nome>` (ver a
> seção "Estrutura de um Projeto Fluig Studio" em `architecture.md`).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- Elemento raiz **deve** conter a classe `fluig-style-guide` → ver `conventions.md`.
- `instanceId` **só** em atributos `id`, com separador `_` (ex.: `id="MyWidget_${instanceId}"`); proibido em `data-*` e `class` → ver `conventions.md`.
- `.instance()` chamado **sem** `instanceId` (injetado pelo framework; no JS use `this.instanceId`) → ver `conventions.md`.
- Bindings declarativos: chave sem o prefixo `data-`; `local` para elementos dentro da raiz, `global` para elementos fora (modais) → ver `conventions.md`.
- Texto visível via i18n: `${i18n.getTranslation('chave')}`; nunca strings fixas nem acesso a `i18n` como objeto JS → ver `conventions.md`.
- JavaScript em **ES6+** (`const`/`let`, arrow functions, template literals); evitar `var` → ver `conventions.md`.
- CSS **escopado** à raiz, reutilizando o Style Guide; cores de tema via `var(--fs-color-*)`, sem hexadecimais fixos → ver `style-guide.md`.

## Procedimento

1. Definir o nome do widget (PascalCase) a partir da entrada e derivar a classe, o `id` raiz e o `<code>` (minúsculo) usado nos arquivos.
2. Criar a estrutura de pastas oficial (ver "Estrutura de Saída") e o descritor **`application.info`** com `application.type=widget`, `application.renderer=freemarker`, `view.file=view.ftl`, os recursos CSS/JS e os dados do desenvolvedor.
3. Criar a **view `view.ftl`** (em `src/main/resources/`) com um elemento raiz contendo `class="fluig-style-guide ..."`, `id="<Nome>_${instanceId}"` e `data-params="<Nome>.instance({})"`.
4. Marcar os elementos interativos com atributos `data-*` (ex.: `data-save`) cujas chaves serão usadas nos bindings (sem o prefixo `data-`).
5. Criar os arquivos **`.properties` de i18n** (base + `pt_BR`/`en_US`/`es`) com as chaves usadas e aplicar i18n em todo texto visível via `${i18n.getTranslation('chave')}`.
6. Criar o **arquivo JS** (`webapp/resources/js/<code>.js`) com `SuperWidget.extend({ ... })`, declarando `init()` (preparar estado, carregar dados, vincular comportamento) e `bindings: { local: { ... }, global: { ... } }`.
7. Implementar os métodos referenciados pelos bindings; dentro do JS, usar `this.instanceId` quando necessário.
8. Adicionar CSS **escopado** (`webapp/resources/css/<code>.css`) à classe raiz, reutilizando componentes/grid do Style Guide e variáveis `var(--fs-color-*)` para cores de tema.
9. Validar o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Esqueleto de widget pronto para evoluir, na estrutura oficial, contendo:

- O **descritor `application.info`** (`application.type=widget`) declarando view, recursos e i18n.
- A **view `view.ftl`** com elemento raiz `fluig-style-guide`, `id` com `instanceId` e `data-params` para `instance()`.
- Os arquivos **`.properties` de i18n** (base + locales) com as chaves de tradução.
- O **arquivo JavaScript** do widget com `SuperWidget.extend`, `init()`, `bindings` e métodos correspondentes, em ES6+.
- (Opcional) CSS escopado reutilizando o Style Guide e os arquivos de empacotamento (`pom.xml`, `WEB-INF`).

Tudo em conformidade com `context/architecture.md`, `context/conventions.md` e `context/style-guide.md`.

## Exemplo de Uso

Use `examples/widget/` como referência mínima (view `.ftl` + arquivo `*.widget.js`) que demonstra o elemento raiz `fluig-style-guide`, `instance()` sem `instanceId`, bindings e i18n. Trate-o como trecho de referência, não como projeto completo.

## Checklist de Validação

- [ ] Estrutura oficial criada, com o descritor **`application.info`** (`application.type=widget`, `view.file=view.ftl`, recursos CSS/JS).
- [ ] Arquivos **`.properties` de i18n** (base + `pt_BR`/`en_US`/`es`) com as chaves usadas na view/JS.
- [ ] Elemento raiz da view contém a classe `fluig-style-guide`.
- [ ] `instanceId` aparece **apenas** em atributos `id`, com separador `_`.
- [ ] `.instance()` é chamado sem `instanceId`.
- [ ] Bindings usam a chave sem o prefixo `data-` (escopo local/global correto).
- [ ] Todo texto visível usa `${i18n.getTranslation('...')}` — sem strings fixas.
- [ ] JavaScript em ES6+ (sem `var`; `const`/`let`, arrow functions, template literals).
- [ ] CSS escopado à raiz, sem hexadecimais fixos (cores via `var(--fs-color-*)`).
