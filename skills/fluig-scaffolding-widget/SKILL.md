---
name: fluig-scaffolding-widget
description: Gera o esqueleto de um Widget WCM do Fluig usando SuperWidget.extend (view FreeMarker + JS com init() e bindings), aplicando as convenções oficiais de customização. Use quando o desenvolvedor pedir para criar/iniciar um novo widget client-side do Fluig a partir de um nome ou descrição de propósito.
argument-hint: 'nome e/ou propósito do widget a ser gerado (ex.: "widget de notificações")'
---

# Scaffolding de Widget (SuperWidget)

Esta skill gera o esqueleto de um Widget WCM do Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Passo 0a — Estrutura

Antes de gerar, identifique a **estrutura do projeto** — ela decide o **layout de
pastas** e o empacotamento, e é independente da persona. Emita
`Estrutura: <Studio|Maven|Híbrida> (motivo)`:

- **Studio** — projeto Fluig sem `pom.xml` na raiz (`wcm/`, `forms/`, `datasets/`,
  `workflow/`). O widget é gerado em `wcm/widget/<nome>`, sem EAR.
- **Maven** — projeto multi-módulo com `pom.xml` na raiz. O widget é um módulo
  `war` registrado no POM raiz e no módulo `pack` (EAR). EAR, `finalName` e
  `simple.deploy` são **estruturais** aqui — valem para qualquer persona (ver
  [backend-java-maven.md](../../context/backend-java-maven.md)).
- **Híbrida** — estrutura Studio com um agregador Maven interno (ex.:
  `wcm/widget/pom.xml`), sem `pom.xml` na raiz. Trate como Studio para o layout de
  pastas; gere `pom.xml` do módulo quando o agregador existir.

## Passo 0b — Persona

Classifique a persona do desenvolvedor seguindo a cascata em
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Se restar ambígua, pare e pergunte antes de continuar.
Emita `Persona: <Parceiro|Consultor> (motivo)` antes de gerar — a persona
determina **apenas** se a **camada Store** entra (prefixo de namespacing,
`component.xml`, `application.info` exigido pela Store, versionamento), não a
estrutura de pastas (essa é do Passo 0a): Consultor gera sem a camada Store;
Parceiro aplica o prefixo de namespacing e a camada `partner-store-*` sobre a
estrutura detectada.

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

### Core (sempre)

- [conventions.md](../../context/conventions.md) — convenções de Widget (`fluig-style-guide`, `instanceId`, `.instance()`, bindings local/global), i18n, segurança, CSS escopado e ES6+. Inclui também as **convenções de Custom Elements** (arquivos `[name].[category].js`, membros privados `#`, topo do módulo só com `import`, CSS escopado/agrupado por tag e variáveis CSS para números mágicos), aplicáveis quando o widget incorpora Web Components.
- [style-guide.md](../../context/style-guide.md) — componentes/helpers (`FLUIGC`), grid e variáveis CSS de tema (`var(--fs-color-*)`) para o markup e o estilo do widget.
- [architecture.md](../../context/architecture.md) — modelo conceitual do Widget, seu ciclo de vida (`init()`, `.instance()`, bindings) e a **estrutura oficial de pastas/arquivos** do widget (descritor `application.info`, `view.ftl`, `.properties` de i18n, JS/CSS); seção "Estrutura de um Projeto Fluig" para a estrutura Studio, e o campo `simple.deploy`.
- [backend-java-maven.md](../../context/backend-java-maven.md) — **quando a estrutura é Maven** (Passo 0a): módulo `war`, empacotamento EAR, `finalName`, ordenação canônica no POM raiz e integração ao módulo `pack`. É estrutural e vale para qualquer persona (Consultor ou Parceiro).
- [platform-constitution.md](../../context/platform-constitution.md) — regras invioláveis de i18n (`${i18n.getTranslation(...)}` em `.js` e `.ftl`) e HTTP (`fetch`).
- [business-components.md](../../context/business-components.md) — Componentes de Negócio nativos (`ECMBC`, `SOCIALBC`, `WCMBC`, `LMSBC`) a reusar em vez de reimplementar funcionalidades de negócio (seleção de usuário/grupo/papéis, busca de documento, recorte de imagem).
- `conventions.md`, seções **"Modais em Widgets"** (`FLUIGC.modal`, as 4 variações de `content`, binding do botão de ação sempre em `bindings.global`), **"Passagem de Dados em Widgets"** (`edit.ftl`→`view.ftl`, preferências, modal com dados de outra widget, eventos), **"Templating com Mustache"** (interpolação, iteração `{{#lista}}`, seções invertidas `{{^condicao}}`) e **"Datatable em Widgets"** (`FLUIGC.datatable`, ações por linha com `bindings.local`, busca, reordenação com persistência, paginação manual) — carregar quando o pedido envolve modal, troca de dados entre widgets/`edit.ftl`/`view.ftl`, templates HTML repetidos ou tabela de dados.
- `style-guide.md`, seção **"Datatable (`FLUIGC.datatable`)"** — API completa de `settings`/métodos/eventos do componente.

### Parceiro (somente se persona = Parceiro)

- [partner-store-architecture.md](../../context/partner-store-architecture.md) — camada Store sobre a estrutura: `component.xml`, módulo de configuração e descritores exigidos pela Store (a estrutura Maven genérica — módulo `war`, EAR, ordenação no POM raiz, `finalName` — fica no Core, em `backend-java-maven.md`).
- [partner-store-conventions.md](../../context/partner-store-conventions.md) [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro) — prefixo de namespacing aglutinado em `application.code` e nos `.properties`. O campo `simple.deploy` é estrutural (ver [simple.deploy e código Java no módulo](../../context/architecture.md#o-campo-simpledeploy)), não exclusivo da Store.

## Estrutura de Saída

O **layout de pastas** depende da **estrutura** (Passo 0a: Studio ou Maven); a
**camada Store** (prefixo de namespacing, `component.xml`, versionamento) depende
da **persona** (Passo 0b). A estrutura interna do widget (descritor
`application.info`, `view.ftl`, `.properties` de i18n, JS/CSS) é a mesma em todos
os casos — fonte de verdade em `architecture.md`. O descritor `application.info` é
**obrigatório** — sem ele a plataforma não reconhece o widget. Use `<code>` como o
código do widget (minúsculo).

As duas formas de layout abaixo (Studio e Maven) são **estruturais** e valem para
qualquer persona. A diferença de persona entra depois, no "Ramo Parceiro": só o
Parceiro acrescenta a camada Store sobre a estrutura escolhida.

### Estrutura Studio — projeto Fluig

Layout de projeto Fluig sem `pom.xml` na raiz. Sem empacotamento EAR. `pom.xml`
do módulo só quando há um agregador Maven (estrutura Híbrida) ou sob pedido.

```text
wcm/widget/<nome>/
├── pom.xml                                # só se o projeto já usar Maven, ou sob pedido
└── src/main/
    ├── resources/
    │   ├── application.info              # descritor (application.type=widget)
    │   ├── <code>.properties             # i18n base (chaves de getTranslation)
    │   ├── <code>_pt_BR.properties        # i18n pt-BR
    │   ├── <code>_en_US.properties        # i18n en-US
    │   ├── <code>_es.properties           # i18n es
    │   ├── view.ftl                       # view principal (elemento raiz)
    │   └── edit.ftl                        # view de edição (mesma div raiz da view; obrigatória)
    └── webapp/
        ├── WEB-INF/{web.xml, jboss-web.xml}
        └── resources/
            ├── css/<code>.css             # CSS escopado (opcional)
            ├── images/icon.png            # ícone
            └── js/<code>.js               # SuperWidget.extend
```

> A `view.ftl` e a `edit.ftl` ficam em `src/main/resources/`; o `<code>.js` e o
> `<code>.css` em `src/main/webapp/resources/`. O widget fica em
> `wcm/widget/<nome>` (ver "Estrutura de um Projeto Fluig" em
> `architecture.md`).

### Estrutura Maven — módulo multi-módulo

Layout de projeto Maven multi-módulo (`pom.xml` na raiz). O widget é um novo
módulo `{artifactId}-widget` (ou `{artifactId}-widget-{nome}` quando há mais de um
widget) `war`, registrado no POM raiz e no módulo `pack` (EAR). Empacotamento EAR,
`finalName` e `simple.deploy` são **estruturais** — valem para qualquer persona
(fonte de verdade em `backend-java-maven.md`). O prefixo de namespacing **não**
entra aqui; ele é do ramo Parceiro (abaixo).

```text
{artifactId}-widget/                       # ou {artifactId}-widget-{nome}
├── pom.xml                                # packaging war, finalName=${project.artifactId}
└── src/main/
    ├── resources/
    │   ├── application.info              # application.type=widget; simple.deploy=true|false
    │   ├── <code>.properties             # application.code = <code>
    │   ├── <code>_pt_BR.properties
    │   ├── <code>_en_US.properties
    │   ├── <code>_es.properties
    │   ├── view.ftl
    │   └── edit.ftl
    └── webapp/
        ├── WEB-INF/{web.xml, jboss-web.xml}
        └── resources/
            ├── css/<code>.css             # opcional
            ├── images/icon.png
            └── js/<code>.js
```

> O módulo herda do POM raiz via `<parent>` (`<version>${revision}</version>`),
> packaging `war` e `finalName=${project.artifactId}`. **`simple.deploy`** é
> obrigatório no `application.info`: `true` quando o módulo não tem código Java,
> `false` quando tem (`architecture.md` [simple.deploy e código Java no módulo](../../context/architecture.md#o-campo-simpledeploy)). O módulo é registrado no POM raiz
> (`<modules>`, na ordem canônica — widgets antes de config, config antes de
> entity/service/rest/wizard, pack sempre último) e, no módulo `pack`, como
> `<dependency>` + `<webModule>` com `<contextRoot>/{application.code}</contextRoot>`
> no `maven-ear-plugin` (ver `backend-java-maven.md`). Nada disso depende da
> persona.

### Ramo Parceiro — camada Store (somente se persona = Parceiro)

Somente quando a persona é Parceiro, acrescente a camada Store sobre a estrutura
detectada (Studio ou Maven): o prefixo de namespacing aglutinado em
`application.code` e nos 4 `.properties`, e os descritores exigidos pela Store.
Fonte de verdade em `partner-store-conventions.md` e `partner-store-architecture.md`.

```text
# sobre a Estrutura Maven, o módulo e os descritores ganham o prefixo:
{artifactId}-widget/
└── src/main/
    ├── resources/
    │   ├── application.info              # application.code = <prefixoparceiro><code>
    │   ├── <prefixoparceiro><code>.properties
    │   ├── <prefixoparceiro><code>_pt_BR.properties
    │   ├── <prefixoparceiro><code>_en_US.properties
    │   └── <prefixoparceiro><code>_es.properties
    └── webapp/resources/
        ├── css/<prefixoparceiro><code>.css
        └── js/<prefixoparceiro><code>.js
```

> **`application.code` leva o prefixo do parceiro** (`<prefixoparceiro>`
> aglutinado, minúsculo, sem separador — ver `partner-store-conventions.md` [§ 6.2](../../context/partner-store-conventions.md#62-aplicação-por-tipo-de-artefato));
> os 4 `.properties` seguem o mesmo nome base. A camada Store (prefixo,
> `component.xml`, `application.info` exigido pela Store, versionamento) é
> exclusiva do Parceiro — o Consultor nunca a aplica.

### `pom.xml` do módulo (quando a estrutura é Maven ou sob pedido)

Quando for necessário gerar o `pom.xml` do widget, use a
estrutura abaixo como ponto de partida — ajustando
`groupId`/`artifactId`/`version`/`name`/`description` ao artefato. O
empacotamento é `war` e o `finalName` usa `${project.artifactId}`. A referência
canônica completa está em `architecture.md`.

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId><!-- groupId real do projeto; herdar do parent — NUNCA com.fluig --></groupId>
    <version><!-- versão real do projeto; herdar do parent (ex.: ${revision}) --></version>
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
> coordenadas. **No ramo Parceiro**, o `pom.xml` do módulo herda do POM raiz via
> `<parent>` (`<version>${revision}</version>`) — ver "Herança de POM nos
> Módulos" em `backend-java-maven.md`; não gerar coordenadas `com.fluig`/`1.0.0`
> fixas como no exemplo acima.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- `application.code` **deve ser igual** a `locale.file.base.name` — divergência quebra a i18n (regra crítica) → ver `architecture.md`.
- Elemento raiz **deve** conter as 3 classes obrigatórias fixas: `super-widget`, `wcm-widget-class` e `fluig-style-guide`, além da classe específica do widget (ordem não importa) → ver `conventions.md`.
- `instanceId` **só** em atributos `id`, com **exatamente um** `_` como separador; **na `div` raiz**, a parte antes do `_` é o **mesmo nome da variável/classe JS em PascalCase** (ex.: `id="MyWidget_${instanceId}"`, com `var MyWidget = SuperWidget.extend(...)`); nunca mais de um `_` na div raiz (a SuperWidget faz split por ele); proibido em `data-*` e `class` → ver `conventions.md`. *(IDs internos, não-raiz, podem usar `-`/`_` livremente.)*
- **`id` da raiz e `data-params` usam o MESMO nome em PascalCase:** `data-params="<NomeWidget>.instance()"` com o nome igual à variável/classe JS (`var <NomeWidget> = SuperWidget.extend(...)`) e igual ao `id` raiz. Ex.: `id="MyWidget_${instanceId}"` + `data-params="MyWidget.instance()"`. O `.instance()` vai com **parênteses vazios** (sem `{}`); passe um objeto só quando houver parâmetros reais → ver `conventions.md`.
- `.instance()` chamado **sem** `instanceId` (injetado pelo framework; no JS use `this.instanceId`) → ver `conventions.md`.
- **Descritores `WEB-INF/web.xml` e `jboss-web.xml`:** copie os blocos canônicos de `architecture.md` › "Empacotamento web (WEB-INF)" — **sem `<!DOCTYPE>`** (o parser XXE-safe do Fluig recusa e o deploy falha). Não escrever de memória → ver `architecture.md`.
- **`edit.ftl` NÃO é vazia:** a `edit.ftl` tem a **mesma div raiz** da `view.ftl` (id com `instanceId`, as 3 classes e `data-params`), o corpo podendo ficar sem conteúdo interno. O arquivo é obrigatório (`edit.file=edit.ftl`) → ver `architecture.md`.
- Bindings declarativos: chave sem o prefixo `data-`; `local` para elementos dentro da raiz, `global` para elementos fora (modais) → ver `conventions.md`.
- Texto visível via i18n; usar `${i18n.getTranslation('chave')}` — mesma sintaxe em `.js` e em `.ftl` (ver `platform-constitution.md`); nunca strings fixas nem acesso a `i18n` como objeto JS → ver `conventions.md`. ⚠️ O FreeMarker processa o `.js` inteiro: use `${...}` **só no código** com expressão válida — **nunca** em comentário/texto (um `${...}` mal-formado em comentário quebra o i18n do arquivo inteiro) → ver `conventions.md`, "Armadilha do `${...}` em comentário".
- Variável raiz da SuperWidget declarada com `var` (ex.: `var MyWidget = SuperWidget.extend({...})`); o restante do JS **fora** do `.extend({})` em ES6+ (`const`/`let`, arrow functions, template literals) → ver `conventions.md`. **Ressalva i18n:** se o `.js` usa i18n e é minificado pelo Closure Compiler, prefira concatenação (`+`) a template literals ao montar textos com a tradução → ver `platform-constitution.md`.
- **Sintaxe de métodos dentro de `.extend({})`:** declarar cada método como propriedade `nome: function() { }` (nunca method shorthand ES6 `nome() {}` nem arrow `nome: () => {}`, que não vincula `this`); acessar o contexto por `this` direto (**proibido** `var ctx = this;` / `var that = this;`) e usar Arrow Functions `() => {}` em todos os callbacks internos (success, fail, eventos) para manter o `this` do widget → ver `conventions.md`.
- Minimizar CSS próprio; priorizar os componentes do Style Guide; CSS próprio só sob pedido explícito → ver `style-guide.md`/`conventions.md`.
- Antes de implementar uma interação de UI (arrastar, ordenar, redimensionar) do zero, verificar Style Guide → jQuery UI → Mustache → código próprio, nessa ordem → ver `style-guide.md`, seção "Plugins embutidos (jQuery, jQuery UI, Mustache)".
- **Arrastar-e-soltar (drag-and-drop) usa jQuery UI, não a API HTML5 nativa.** O Fluig **embarca o jQuery UI** (`draggable`/`sortable`/`droppable`); use-o. A API **HTML5 nativa** (`draggable="true"` + eventos `dragstart`/`dragover`/`drop`/`dataTransfer`) é **desencorajada** em widget Fluig: conflita na prática com os estilos/handlers do Style Guide e do Bootstrap e costuma **não disparar o `drop`** (ex.: um Kanban cujos cartões "não soltam" na coluna). Para reordenar cartões/listas e mover entre colunas, use `.sortable({ connectWith: '...' })` (listas conectadas) ou `.draggable()` + `.droppable()` → ver `style-guide.md`, "Interações mais usadas do jQuery UI".
- **Componentes de Negócio nativos:** quando a funcionalidade envolve seleção de usuários/grupos/papéis/comunidades, busca de documento, recorte de imagem ou outra funcionalidade de negócio recorrente, **verificar `business-components.md` e reutilizar o Componente de Negócio correspondente** em vez de implementar do zero — declarar `application.resource.component.N=<caminho>` no `application.info` → ver `business-components.md`.
- CSS **escopado** à raiz, reutilizando o Style Guide; cores de tema via `var(--fs-color-*)`, sem hexadecimais fixos → ver `style-guide.md`. **Exceção — cor dinâmica escolhida pelo usuário** (ex.: cor de destaque configurável): use uma **custom property própria** (ex.: `--highlight`) alimentada em runtime (`root.style.setProperty(...)`), com hex só como fallback; não é cor de tema e não vem de `var(--fs-color-*)`. Coletar com `<input type="color">` **nativo** (cor sólida simples — default em caso ambíguo) ou `FLUIGC.colorpicker` (quando há alpha/formatos ou consistência visual importa, ex.: Parceiro/Store — exige declarar o componente) → ver `style-guide.md`, "Cor dinâmica configurável pelo usuário".
- **Consulta a datasets no cliente:** quando o widget consulta datasets no lado cliente (via `DatasetFactory`), a view FreeMarker onde a consulta ocorre (`view.ftl` e/ou `edit.ftl`) **deve obrigatoriamente** importar a biblioteca `vcXMLRPC.js`, **exatamente** com `<script src="/webdesk/vcXMLRPC.js" type="text/javascript"></script>` (caminho e atributos inalterados). É uma **exceção** à regra de não importar scripts diretos no `.ftl`; inclua-o **apenas** quando houver consulta a datasets no cliente → ver `conventions.md`.
- Configuração **por instância** do widget (ex.: filtros, limites, URLs editáveis pelo administrador da página) deve usar `WCMSpaceAPI.PageService.UPDATEPREFERENCES` — nunca hardcode nem armazenamento ad-hoc — ver `conventions.md`, seção "Preferências de Widget (persistência por instância)" e `examples/widget/preferences.example.js`. ⚠️ **A preferência salva só volta ao JS se a view a repassar:** `view.ftl`/`edit.ftl` **devem** montar o `data-params` com as preferências reinjetadas pelo FreeMarker (`${nome!''}`) — declarar `prop: null` no `.extend({})` **não** basta (sem o `data-params`, vem `null`: salva mas o F5 não repopula e a view não exibe). Ver o ciclo completo em `conventions.md`.
- **Modal:** quando o widget abre um modal, usar sempre `FLUIGC.modal` (nunca Bootstrap puro); escolher a variação de `content` adequada (estática, Mustache, outra widget via `widgetCode`/`ftl`/`data`, ou `WCMAPI.convertFtlAsync`); o botão de ação do modal **deve** ser declarado em `bindings.global` (nunca `local`) — ver `conventions.md`, seção "Modais em Widgets".
- **Diálogos de mensagem:** `FLUIGC.message` tem **apenas** `.confirm`, `.alert` e `.error` (ver `style-guide.md`, "Diálogos de mensagem"). **Não existe `FLUIGC.message.prompt`** — para **capturar texto digitado** (ex.: adicionar/renomear item), use `FLUIGC.modal` com um `<input>` no corpo e leia o valor no callback do botão de ação; nunca invente um `prompt` (gera `TypeError`).
- **Passagem de dados:** ao receber/enviar dados entre widgets ou entre `edit.ftl`/`view.ftl`, escolher o mecanismo conforme a tabela de decisão de `conventions.md`, seção "Passagem de Dados em Widgets" — não inventar um mecanismo novo. Parâmetros de `data-params="X.instance({...})"` e preferências são lidos no JS via **`this.<prop>`** (propriedade declarada no `.extend({})`, injetada antes do `init()`), **nunca** `this.options` → ver `conventions.md`, "Parâmetros do widget (`data-params` → `this.<prop>`)".
- **Detecção de modo edit/view:** usar **`WCMAPI.getIsEditMode() === 'true'`** — o método retorna **string** (`'true'`/`'false'`); comparar sempre com `'true'` (o retorno direto `'false'` é string truthy → `if` sempre verdadeiro). **Nunca** `this.isEditMode` (não existe) nem `WCMAPI.isEditMode` cru → ver `conventions.md`, "Detecção de modo (edit / view / preview)".
- **Datatable:** quando o widget exibe uma tabela de dados, usar sempre `FLUIGC.datatable` (nunca paginação/busca/drag implementados manualmente); o template de ações por linha (`actions.template`) usa `bindings.local` (contraste com o modal, que usa `global`) — ver `conventions.md`, seção "Datatable em Widgets", e `style-guide.md`, seção "Datatable (`FLUIGC.datatable`)". No modo REST, **não** repita o `root` dentro do `formatData` (lê o campo errado → erro "root attribute").
- **Usuário atual em filtros:** para filtrar por "o usuário logado" (ex.: `requesterId`), use **`WCMAPI.getUserCode()`** (código) — **nunca** `WCMAPI.getUser()`, que retorna o **nome de exibição** e faz a consulta não retornar nada → ver `conventions.md`, "Identidade do usuário logado no cliente".
- **Nome da coluna do dataset:** o `field` pedido nem sempre é a chave do objeto retornado — datasets nativos com PK composta devolvem nome qualificado (ex.: `workflowProcessPK.processInstanceId`). Conferir `data.columns`/resposta real antes de ler `row.<campo>` → ver `conventions.md`, "Datatable em Widgets".
- **Templating:** HTML repetido a partir de dados usa Mustache (`<script type="text/template">` + `Mustache.render`), não concatenação manual de string — ver `conventions.md`, seção "Templating com Mustache".

## Política de Fallback

- Faltando **nome** ou **propósito** essencial para gerar (nome do widget): solicitar antes de gerar.
- **Coordenadas Maven** (parent `groupId`/`artifactId` do `pom.xml`): quando dentro de um projeto existente, inspecionar o `pom.xml` do módulo onde o widget será criado; **nunca inventar** coordenadas.
- **`icon.png`**: gerar um placeholder e registrar como pendência manual.
- **Traduções `en_US`/`es` ausentes**: usar o texto PT como base e marcar `# TODO i18n` por chave, sem deixar de criar os 4 arquivos.
- Dados do desenvolvedor (`developer.*`): usar placeholders genéricos; não assumir identificadores de terceiros.
- **CSS próprio sem pedido explícito:** o padrão é reutilizar o Style Guide; se houver CSS próprio sem solicitação do desenvolvedor, registrar como **pendência a revisar**.

## Procedimento

1. Definir o nome do widget (PascalCase) a partir da entrada e derivar a classe, o `id` raiz e o `<code>` (minúsculo) usado nos arquivos.
2. Criar a estrutura de pastas oficial (ver "Estrutura de Saída") e o descritor **`application.info`** com os campos completos: `application.type=widget`, `application.renderer=freemarker`, `view.file=view.ftl`, `edit.file=edit.ftl`, os recursos CSS/JS e os dados do desenvolvedor (ver a tabela completa em `architecture.md`).
3. Criar a **view de edição `edit.ftl`** (em `src/main/resources/`, irmã da `view.ftl`) com a **mesma div raiz** da `view.ftl` (id com `instanceId`, as 3 classes e `data-params`) — o corpo pode ficar sem conteúdo interno, mas a div raiz **não** fica vazia. Obrigatória e referenciada por `edit.file=edit.ftl`.
4. Criar a **view `view.ftl`** (em `src/main/resources/`) com um elemento raiz contendo `class="super-widget wcm-widget-class fluig-style-guide ..."`, `id="<NomeWidget>_${instanceId}"` e `data-params="<NomeWidget>.instance()"`. ⚠️ **O `id` raiz e o `data-params` usam o MESMO nome em PascalCase** — o mesmo nome da variável/classe JS `var <NomeWidget> = SuperWidget.extend(...)` (ex.: `id="MyWidget_${instanceId}"` + `data-params="MyWidget.instance()"`). O `.instance()` vai com **parênteses vazios** (sem `{}`); use um objeto só quando houver parâmetros reais. As 3 classes obrigatórias fixas são `super-widget`, `wcm-widget-class` e `fluig-style-guide` (ordem indiferente); a classe específica do widget é adicionada a seguir.
5. Marcar os elementos interativos com atributos `data-*` (ex.: `data-save`) cujas chaves serão usadas nos bindings (sem o prefixo `data-`).
6. Criar os arquivos **`.properties` de i18n** (base + `pt_BR`/`en_US`/`es`) com as chaves usadas e aplicar i18n em todo texto visível: `${i18n.getTranslation('chave')}` na `view.ftl`/`edit.ftl` e no `<code>.js` (mesma sintaxe nos dois — ver `platform-constitution.md`). **Codificação dos `.properties`:** arquivos de locale usam escape `\uXXXX` (só o base admite acento direto) → ver `conventions.md` › "Codificação dos arquivos `.properties`".
6a. **Se o widget consultar datasets no cliente** (via `DatasetFactory`), incluir na view onde a consulta ocorre (`view.ftl` e/ou `edit.ftl`) a importação obrigatória `<script src="/webdesk/vcXMLRPC.js" type="text/javascript"></script>`, exatamente nessa forma (ver `conventions.md`). Não incluir se o widget não consulta datasets.
7. Criar o **arquivo JS** (`webapp/resources/js/<code>.js`) com `var <Nome> = SuperWidget.extend({ ... })` (a variável raiz usa `var` — exceção controlada; ver `conventions.md`), declarando `init: function() { ... }` com `this` direto (preparar estado, carregar dados, vincular comportamento) e `bindings: { local: { ... }, global: { ... } }`.
8. Implementar os métodos referenciados pelos bindings usando a sintaxe `nome: function() { ... }` (sem method shorthand ES6 nem arrow function como método); dentro do método, acessar o widget por `this` direto (ex.: `this.instanceId`) e usar Arrow Functions nos callbacks, **sem** `var ctx = this;` → ver `conventions.md`.
8a. **Se o pedido envolve abrir um modal** a partir do widget: declarar `myModal: null`, escolher a variação de `content` adequada ao caso (ver `conventions.md`, seção "Modais em Widgets") e declarar o botão de ação do modal em `bindings.global` (nunca `local`).
8b. **Se o pedido envolve passar dados** entre `edit.ftl`/`view.ftl` ou entre widgets: escolher o mecanismo pela tabela de decisão de `conventions.md`, seção "Passagem de Dados em Widgets" (interpolação direta, preferências, dados no modal, ou eventos `WCMAPI.fireEvent`/`addListener`).
8c. **Se o pedido envolve uma tabela de dados**: usar `FLUIGC.datatable` (ver `conventions.md`, seção "Datatable em Widgets", e `style-guide.md`, seção "Datatable (`FLUIGC.datatable`)"); declarar o template de ações por linha em `bindings.local`.
8d. **Se o pedido envolve HTML repetido a partir de dados** (listas, cards): usar Mustache (ver `conventions.md`, seção "Templating com Mustache") em vez de concatenação manual de string.
8e. Quando a funcionalidade envolve **seleção de usuários/grupos/papéis/comunidades**, **busca de documento**, **recorte de imagem** ou outra **funcionalidade de negócio recorrente**, consultar `business-components.md` e **reutilizar o Componente de Negócio correspondente** (ex.: `SOCIALBC.selectUser`, `ECMBC.searchDocuments`, `ECMBC.cropImage`) — declarar `application.resource.component.N=<caminho>` no `application.info` e invocar o método dentro do `SuperWidget.extend`, conforme `business-components.md`.
9. Adicionar CSS **escopado** (`webapp/resources/css/<code>.css`) à classe raiz **apenas se necessário** (CSS próprio é exceção sob pedido explícito), reutilizando componentes/grid do Style Guide e variáveis `var(--fs-color-*)` para cores de tema.
9a. Criar os descritores **`webapp/WEB-INF/web.xml`** e **`webapp/WEB-INF/jboss-web.xml`** copiando **exatamente** os blocos canônicos de `architecture.md` › "Empacotamento web (WEB-INF)" (`context-root = /<application.code>`; **sem `<!DOCTYPE>`**, que quebra o deploy). Não escrever esses XML de memória → ver `architecture.md`.
10. Quando a estrutura é Maven ou sob pedido, gerar o `pom.xml`, inspecionando as coordenadas Maven no projeto existente (**nunca inventar** coordenadas do parent).
10a. **Na estrutura Maven (qualquer persona):** declarar `simple.deploy` coerente no `application.info`; registrar o módulo no `<modules>` do POM raiz (ordem canônica) e, no módulo `pack`, como `<dependency>` + `<webModule>` com `<contextRoot>` (ver `backend-java-maven.md`). Não gerar nenhum campo `application.version`. Isso é estrutural e **não** depende da persona.
10b. **Somente no ramo Parceiro:** aplicar o prefixo de namespacing a `application.code` e aos 4 `.properties` e os descritores exigidos pela Store (ver `partner-store-conventions.md`). O Consultor não aplica nada da camada Store.
11. Validar o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Esqueleto de widget pronto para evoluir, na estrutura oficial, contendo:

- O **descritor `application.info`** (`application.type=widget`) declarando view, recursos e i18n.
- A **view `view.ftl`** com elemento raiz `fluig-style-guide`, `id` com `instanceId` e `data-params` para `instance()`.
- Os arquivos **`.properties` de i18n** (base + locales) com as chaves de tradução.
- O **arquivo JavaScript** do widget com `SuperWidget.extend`, `init`, `bindings` e métodos correspondentes declarados como `nome: function() { ... }` com `this` direto e callbacks em Arrow Functions, sem `var ctx = this;` (variável raiz em `var`; código fora do `.extend({})` em ES6+).
- (Opcional) CSS escopado reutilizando o Style Guide e os arquivos de empacotamento (`pom.xml`, `WEB-INF`).

Tudo em conformidade com `context/architecture.md`, `context/conventions.md` e `context/style-guide.md`.

## Exemplo de Uso

Use `examples/widget/` como referência mínima (view `view.ftl` + `notifications.js`) que demonstra o elemento raiz com as 3 classes obrigatórias, `instance()` sem `instanceId`, bindings, i18n e a sintaxe de métodos dentro de `.extend({})` (`nome: function() { ... }` com `this` direto e Arrow Functions nos callbacks). Trate-o como trecho de referência, não como projeto completo.

Para o cenário "widget que abre um modal carregando dados de outra widget", use
[`examples/widget/modal.example.js`](../../examples/widget/modal.example.js) +
[`modal.example.view.ftl`](../../examples/widget/modal.example.view.ftl) (widget
"opener", com as 4 variações de `content`) e
[`modal-target.example.js`](../../examples/widget/modal-target.example.js) +
[`modal-target.example.view.ftl`](../../examples/widget/modal-target.example.view.ftl)
(widget "alvo" que recebe o parâmetro).

Para o cenário "widget com uma tabela de dados paginável, com busca e ações por
linha", use [`examples/widget/datatable.example.js`](../../examples/widget/datatable.example.js) +
[`datatable.example.view.ftl`](../../examples/widget/datatable.example.view.ftl).
Para templates com iteração/condicionais, use
[`examples/widget/mustache-templates.example.js`](../../examples/widget/mustache-templates.example.js) +
[`mustache-templates.example.view.ftl`](../../examples/widget/mustache-templates.example.view.ftl).

## Checklist de Validação

- [ ] Persona classificada (Passo 0) e emitida como `Persona: <Parceiro|Consultor> (motivo)`.
- [ ] Estrutura oficial criada, com o descritor **`application.info`** com os campos completos (`application.type=widget`, `view.file=view.ftl`, `edit.file=edit.ftl`, recursos CSS/JS, `developer.*` — ver `architecture.md`).
- [ ] `application.code` **igual** a `locale.file.base.name`.
- [ ] **Estrutura Maven** (qualquer persona): módulo `war` com `finalName=${project.artifactId}`; `simple.deploy` presente e coerente (`true` sem Java, `false` com Java); módulo registrado no POM raiz (ordem canônica) e no módulo `pack` (`<dependency>` + `<webModule>` com `contextRoot`) — ver `backend-java-maven.md`/ [simple.deploy e código Java no módulo](../../context/architecture.md#o-campo-simpledeploy). Nenhum campo `application.version` gerado (o `application.info` não possui essa propriedade).
- [ ] **Estrutura Studio** (qualquer persona): layout em `wcm/widget/<nome>`, sem EAR; `pom.xml` do módulo só quando há agregador Maven (Híbrida) ou sob pedido.
- [ ] **Parceiro:** camada Store aplicada — `application.code` com o prefixo `<prefixoparceiro>` aglutinado nos 4 `.properties`; descritores exigidos pela Store — ver `partner-store-conventions.md` [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro).
- [ ] **Consultor:** nenhuma camada da Store aplicada (sem prefixo de namespacing salvo pedido explícito; sem descritores da Store). A estrutura Maven/EAR, quando existe, é a mesma do Parceiro.
- [ ] Presença da `edit.ftl` (irmã da `view.ftl`) **com a mesma div raiz da view** (id com `instanceId` + 3 classes + `data-params`, corpo sem conteúdo interno é aceitável) e do campo `edit.file=edit.ftl` no descritor. **Não** deixar a `edit.ftl` vazia.
- [ ] Arquivos **`.properties` de i18n** (base + `pt_BR`/`en_US`/`es`) com as mesmas chaves usadas na view/JS.
- [ ] **Codificação dos `.properties` de locale:** caracteres acentuados/não-ASCII escapados em `\uXXXX` (só o arquivo base admite acento direto) → ver `conventions.md`.
- [ ] Presença da pasta `WEB-INF` (com `web.xml` + `jboss-web.xml`) e `context-root` = `/<application.code>` → ver `architecture.md`.
- [ ] **Descritores WEB-INF sem `<!DOCTYPE>`** e idênticos aos blocos canônicos de `architecture.md` → ver `architecture.md` › "Empacotamento web (WEB-INF)".
- [ ] `pom.xml` presente quando o projeto usa Maven ou sob pedido (coordenadas inspecionadas, nunca inventadas).
- [ ] Elemento raiz da view contém as **3 classes obrigatórias fixas**: `super-widget`, `wcm-widget-class` e `fluig-style-guide` (ordem indiferente), além da classe específica do widget.
- [ ] `id` da **div raiz** usa **PascalCase** (mesmo nome da variável/classe JS) + exatamente um `_` (ex.: `MyWidget_${instanceId}`). Nunca mais de um `_` na div raiz. Demais `id`s internos seguem o padrão do artefato.
- [ ] `data-params` usa o **mesmo nome PascalCase** do `id` raiz e da variável/classe JS, com `.instance()` **sem `{}`** (objeto só quando houver parâmetros) — ex.: `id="MyWidget_${instanceId}"` com `data-params="MyWidget.instance()"`.
- [ ] `.instance()` é chamado sem `instanceId`.
- [ ] Se o widget consulta datasets no cliente (via `DatasetFactory`), a view onde a consulta ocorre (`view.ftl`/`edit.ftl`) importa **exatamente** `<script src="/webdesk/vcXMLRPC.js" type="text/javascript"></script>`; se não consulta datasets, o script **não** está presente.
- [ ] Bindings usam a chave sem o prefixo `data-` (escopo local/global correto).
- [ ] Todo texto visível usa i18n — sem strings fixas.
- [ ] JavaScript em ES6+ (`const`/`let`, arrow functions, template literals), **exceto**: (a) a variável raiz da SuperWidget (declarada com `var`); (b) em `.js` que usa i18n e é minificado pelo Closure Compiler, onde se prefere concatenação (`+`) a template literals ao montar textos com a tradução.
- [ ] CSS próprio mínimo (componentes do Style Guide como padrão; CSS próprio sem pedido explícito = pendência a revisar) e, quando houver, escopado à raiz, sem hexadecimais fixos (cores via `var(--fs-color-*)`).
- [ ] **Se o widget abre modal:** usa `FLUIGC.modal` (nunca Bootstrap puro); a variação de `content` foi escolhida conscientemente (estática/Mustache/`widgetCode`+`ftl`+`data`/`convertFtlAsync`); o botão de ação do modal está em `bindings.global` (nunca `local`); o modal é fechado com `.remove()` ou `autoClose`.
- [ ] **Se o widget troca dados com outro widget ou entre `edit.ftl`/`view.ftl`:** o mecanismo usado corresponde à tabela de decisão de `conventions.md` (interpolação direta, preferências, dados no modal, ou eventos).
- [ ] **Se o widget exibe uma tabela de dados:** usa `FLUIGC.datatable` (nunca paginação/busca/drag manuais); o template de ações por linha está em `bindings.local`.
- [ ] **Se o widget monta HTML repetido a partir de dados:** usa Mustache (`<script type="text/template">` + `Mustache.render`), não concatenação manual de string.
- [ ] Componentes de Negócio nativos (`ECMBC.*`, `SOCIALBC.*`, `WCMBC.*`) reutilizados quando aplicável, sem reimplementar funcionalidades de negócio já oferecidas pela plataforma (seleção de usuário/grupo, busca de documento, etc.) — dependências `application.resource.component.N` declaradas no `application.info`.

## Resumo da Geração

Ao concluir, apresente um resumo curto do que foi gerado, para o desenvolvedor
saber o estado e os próximos passos:

- **Widget / `application.code`:** nome e código.
- **Diretório:** onde o widget foi criado.
- **Arquivos gerados:** lista.
- **Pendências manuais:** ex.: `icon.png` real, coordenadas do `pom.xml` pai, traduções `en_US`/`es` marcadas com TODO, CSS próprio gerado sem pedido explícito (a revisar).
- **Próximo passo:** implementar a lógica em `<code>.js` (ver as convenções em `conventions.md`).
