---
name: fluig-scaffolding-widget
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
├── pom.xml                                # quando o projeto usa Maven ou sob pedido
└── src/main/
    ├── resources/
    │   ├── application.info              # descritor (application.type=widget)
    │   ├── <code>.properties             # i18n base (chaves de getTranslation)
    │   ├── <code>_pt_BR.properties        # i18n pt-BR
    │   ├── <code>_en_US.properties        # i18n en-US
    │   ├── <code>_es.properties           # i18n es
    │   ├── view.ftl                       # view principal (elemento raiz)
    │   └── edit.ftl                        # view de edição (pode ser vazia, mas é obrigatória)
    └── webapp/
        ├── WEB-INF/{web.xml, jboss-web.xml}
        └── resources/
            ├── css/<code>.css             # CSS escopado (opcional)
            ├── images/icon.png            # ícone
            └── js/<code>.js               # SuperWidget.extend
```

> A `view.ftl` e a `edit.ftl` ficam em `src/main/resources/`; o `<code>.js` e o
> `<code>.css` em `src/main/webapp/resources/`. O `pom.xml` só é gerado quando o
> projeto usa Maven ou sob pedido. Ponto de partida público: archetype Maven
> `widget-wcm`.
>
> **Em um projeto Fluig Studio**, o widget fica em `wcm/widget/<nome>` (ver a
> seção "Estrutura de um Projeto Fluig Studio" em `architecture.md`).

### `pom.xml` (quando o projeto usa Maven ou sob pedido)

Quando for necessário gerar o `pom.xml`, use a estrutura abaixo como ponto de
partida — ajustando `groupId`/`artifactId`/`version`/`name`/`description` ao
artefato. O empacotamento é `war` e o `finalName` usa `${project.artifactId}`. A
referência canônica completa está em `architecture.md`.

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.fluig</groupId>
    <version>1.0.0</version>
    <artifactId>widget-<code></artifactId>
    <packaging>war</packaging>
    <name>Widget <Nome></name>
    <description>Widget <Nome></description>
    <build>
        <finalName>${project.artifactId}</finalName>
    </build>
</project>
```

> Dentro de um projeto existente, inspecione o `pom.xml` do módulo pai para obter
> as coordenadas reais (parent `groupId`/`artifactId`); **nunca invente**
> coordenadas.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- `application.code` **deve ser igual** a `locale.file.base.name` — divergência quebra a i18n (regra crítica) → ver `architecture.md`.
- Elemento raiz **deve** conter as 3 classes obrigatórias fixas: `fluig-style-guide`, `super-widget` e `wcm-widget-class`, além da classe específica do widget → ver `conventions.md`.
- `instanceId` **só** em atributos `id`, com **exatamente um** `_` como separador; **na `div` raiz**, a parte antes do `_` em **camelCase com inicial minúscula** (ex.: `id="myWidget_${instanceId}"`); nunca mais de um `_` na div raiz (a SuperWidget faz split por ele); proibido em `data-*` e `class` → ver `conventions.md`.
- `.instance()` chamado **sem** `instanceId` (injetado pelo framework; no JS use `this.instanceId`) → ver `conventions.md`.
- Bindings declarativos: chave sem o prefixo `data-`; `local` para elementos dentro da raiz, `global` para elementos fora (modais) → ver `conventions.md`.
- Texto visível via i18n; nunca strings fixas nem acesso a `i18n` como objeto JS → ver `conventions.md`.
- Variável raiz da SuperWidget declarada com `var` (ex.: `var MyWidget = SuperWidget.extend({...})`); o restante do JS em ES6+ (`const`/`let`, arrow functions, template literals) → ver `conventions.md`.
- Minimizar CSS próprio; priorizar os componentes do Style Guide; CSS próprio só sob pedido explícito → ver `style-guide.md`/`conventions.md`.
- CSS **escopado** à raiz, reutilizando o Style Guide; cores de tema via `var(--fs-color-*)`, sem hexadecimais fixos → ver `style-guide.md`.

### Política de fallback

- Faltando **nome** ou **propósito** essencial para gerar (nome do widget): solicitar antes de gerar.
- **Coordenadas Maven** (parent `groupId`/`artifactId` do `pom.xml`): quando dentro de um projeto existente, inspecionar o `pom.xml` do módulo onde o widget será criado; **nunca inventar** coordenadas.
- **`icon.png`**: gerar um placeholder e registrar como pendência manual.
- **Traduções `en_US`/`es` ausentes**: usar o texto PT como base e marcar `# TODO i18n` por chave, sem deixar de criar os 4 arquivos.
- Dados do desenvolvedor (`developer.*`): usar placeholders genéricos; não assumir identificadores de terceiros.
- **CSS próprio sem pedido explícito:** o padrão é reutilizar o Style Guide; se houver CSS próprio sem solicitação do desenvolvedor, registrar como **pendência a revisar**.

## Procedimento

1. Definir o nome do widget (PascalCase) a partir da entrada e derivar a classe, o `id` raiz e o `<code>` (minúsculo) usado nos arquivos.
2. Criar a estrutura de pastas oficial (ver "Estrutura de Saída") e o descritor **`application.info`** com os campos completos: `application.type=widget`, `application.renderer=freemarker`, `view.file=view.ftl`, `edit.file=edit.ftl`, `application.version=${build.version}-${build.revision}`, os recursos CSS/JS e os dados do desenvolvedor (ver a tabela completa em `architecture.md`).
3. Criar a **view de edição `edit.ftl`** (em `src/main/resources/`, irmã da `view.ftl`); pode ser vazia, mas é obrigatória e referenciada por `edit.file=edit.ftl`.
4. Criar a **view `view.ftl`** (em `src/main/resources/`) com um elemento raiz contendo `class="fluig-style-guide super-widget wcm-widget-class ..."`, `id="<nomeWidget>_${instanceId}"` (camelCase com inicial minúscula, exatamente um `_`) e `data-params="<nomeWidget>.instance({})"`. As 3 classes obrigatórias fixas são: `fluig-style-guide`, `super-widget` e `wcm-widget-class`; a classe específica do widget é adicionada a seguir.5. Marcar os elementos interativos com atributos `data-*` (ex.: `data-save`) cujas chaves serão usadas nos bindings (sem o prefixo `data-`).
6. Criar os arquivos **`.properties` de i18n** (base + `pt_BR`/`en_US`/`es`) com as chaves usadas e aplicar i18n em todo texto visível via `${i18n.getTranslation('chave')}`.
7. Criar o **arquivo JS** (`webapp/resources/js/<code>.js`) com `var <Nome> = SuperWidget.extend({ ... })` (a variável raiz usa `var` — exceção controlada; ver `conventions.md`), declarando `init()` (preparar estado, carregar dados, vincular comportamento) e `bindings: { local: { ... }, global: { ... } }`.
8. Implementar os métodos referenciados pelos bindings; dentro do JS, usar `this.instanceId` quando necessário.
9. Adicionar CSS **escopado** (`webapp/resources/css/<code>.css`) à classe raiz **apenas se necessário** (CSS próprio é exceção sob pedido explícito), reutilizando componentes/grid do Style Guide e variáveis `var(--fs-color-*)` para cores de tema.
10. Quando o projeto usa Maven ou sob pedido, gerar o `pom.xml`, inspecionando as coordenadas Maven no projeto existente (**nunca inventar** coordenadas do parent).
11. Validar o resultado com o checklist abaixo antes de entregar.

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

- [ ] Estrutura oficial criada, com o descritor **`application.info`** com os campos completos (`application.type=widget`, `view.file=view.ftl`, `edit.file=edit.ftl`, `application.version=${build.version}-${build.revision}`, recursos CSS/JS, `developer.*`, `hash` — ver `architecture.md`).
- [ ] `application.code` **igual** a `locale.file.base.name`.
- [ ] Presença da `edit.ftl` (irmã da `view.ftl`, pode ser vazia) e do campo `edit.file=edit.ftl` no descritor.
- [ ] Arquivos **`.properties` de i18n** (base + `pt_BR`/`en_US`/`es`) com as mesmas chaves usadas na view/JS.
- [ ] Presença da pasta `WEB-INF` (com `web.xml` + `jboss-web.xml`) e `context-root` = `/<application.code>` → ver `architecture.md`.
- [ ] `pom.xml` presente quando o projeto usa Maven ou sob pedido (coordenadas inspecionadas, nunca inventadas).
- [ ] Elemento raiz da view contém as **3 classes obrigatórias fixas**: `fluig-style-guide`, `super-widget` e `wcm-widget-class`, além da classe específica do widget.
- [ ] `id` da **div raiz** usa camelCase com inicial minúscula + exatamente um `_` (ex.: `myWidget_${instanceId}`). Nunca mais de um `_` na div raiz. Demais `id`s internos seguem o padrão do artefato.
- [ ] `.instance()` é chamado sem `instanceId`.
- [ ] Bindings usam a chave sem o prefixo `data-` (escopo local/global correto).
- [ ] Todo texto visível usa i18n — sem strings fixas.
- [ ] JavaScript em ES6+ (`const`/`let`, arrow functions, template literals), **exceto a variável raiz da SuperWidget** (declarada com `var`).
- [ ] CSS próprio mínimo (componentes do Style Guide como padrão; CSS próprio sem pedido explícito = pendência a revisar) e, quando houver, escopado à raiz, sem hexadecimais fixos (cores via `var(--fs-color-*)`).

## Resumo da Geração

Ao concluir, apresente um resumo curto do que foi gerado, para o desenvolvedor
saber o estado e os próximos passos:

- **Widget / `application.code`:** nome e código.
- **Diretório:** onde o widget foi criado.
- **Arquivos gerados:** lista.
- **Pendências manuais:** ex.: `icon.png` real, coordenadas do `pom.xml` pai, traduções `en_US`/`es` marcadas com TODO, CSS próprio gerado sem pedido explícito (a revisar).
- **Próximo passo:** implementar a lógica em `<code>.js` (ver as convenções em `conventions.md`).
