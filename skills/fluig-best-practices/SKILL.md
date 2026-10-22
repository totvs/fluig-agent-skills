---
name: fluig-best-practices
description: Revisa a MANUTENIBILIDADE e a arquitetura de código de customização Fluig — modularização e responsabilidade única (métodos pequenos no SuperWidget, `init` que delega), nomenclatura, organização, acoplamento, reuso (Componentes de Negócio nativos, Style Guide, plugins embutidos) e aderência às convenções estruturais da plataforma — produzindo achados por severidade, cada um referenciando a regra do contexto. É o eixo de QUALIDADE ESTRUTURAL do código; NÃO cobre segurança, performance nem acessibilidade (use `fluig-review-security`/`-performance`/`-accessibility`), nem substitui a varredura transversal da `fluig-code-review`. Use quando o desenvolvedor pedir revisão de boas práticas/manutenibilidade/organização de um trecho ou arquivo antes de merge, sem reescrever o código.
argument-hint: o código/arquivo Fluig alvo da revisão de boas práticas (trecho ou arquivo selecionado), idealmente com o tipo de artefato
---

# Revisão de Boas Práticas e Manutenibilidade do Fluig

Esta skill revisa a **qualidade estrutural** do código — **manutenibilidade, arquitetura, organização e reuso** — à luz das boas práticas oficiais do Fluig, emitindo achados por severidade; ela **não duplica** convenções (o `context/` é a fonte de verdade) e **não reescreve** o código.

> **Fronteira (eixo único).** Esta skill é o eixo de **qualidade estrutural/manutenibilidade**: modularização e responsabilidade única, nomenclatura, organização do código, acoplamento e **reuso** (Componentes de Negócio nativos, Style Guide, plugins embutidos) sobre as convenções estruturais do widget/Custom Element. Ela **não** avalia **segurança** (→ `fluig-review-security`), **performance** (→ `fluig-review-performance`) nem **acessibilidade** (→ `fluig-review-accessibility`); e **não** é a varredura transversal geral — para um diagnóstico de todos os eixos de uma vez, use `fluig-code-review`.

> 🚫 **Contexto server-side (Rhino/ES5).** O "ES6+ para código novo" abaixo vale para
> JS de **widget/Custom Element** (navegador). Se o alvo for **evento server-side**
> de form/dataset/processo (`events/*.js`, `datasets/*.js`), ele roda no **Rhino
> (ES5)**: `var`/`function` e igualdade **solta `==`** são o **correto** ali — não
> os reporte como desvio. Nesse contexto o anti-padrão é o inverso: `===` contra
> valores da API Java (`getFormMode()`, `getIsEditMode()`, que são `java.lang.String`
> e tornam `===` sempre falso) e encadear `.replace`/`.split` sobre valor Java sem
> `String(...)`. Ver `technologies.md` › "Princípio: valores vindos de API Java no
> Rhino" e `conventions-form.md` › "Eventos server-side".

## Passo 0 — Persona

Antes de revisar, classifique a persona do desenvolvedor seguindo a cascata em
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Se restar ambígua, pare e pergunte antes de
continuar. Emita `Persona: <Parceiro|Consultor> (motivo)` antes do relatório —
a persona determina a camada de contexto carregada (ver "Contexto de
Referência") e a forma de saída da revisão (ver "Saída Esperada").

## Objetivo

Revisar, com responsabilidade única, a **manutenibilidade e a qualidade estrutural** do código de customização Fluig — **modularização e responsabilidade única** (métodos pequenos no `SuperWidget.extend`, `init` que delega), **nomenclatura**, **organização/acoplamento**, **reuso** (Componentes de Negócio nativos, Style Guide, plugins embutidos) e a aderência às **convenções estruturais** do widget/Custom Element/ES6+ — produzindo um **relatório de achados por severidade**, cada um vinculado à regra do contexto. Segurança, performance e acessibilidade **não** entram neste eixo (há skills dedicadas).

## Quando Usar

- Antes de um merge, para avaliar **manutenibilidade e organização** do código (modularização, responsabilidade única, nomenclatura, acoplamento).
- Quando o widget está **monolítico** ou com responsabilidades misturadas e se quer um diagnóstico de refatoração estrutural.
- Quando se quer confirmar o **reuso** correto (Componentes de Negócio nativos, Style Guide, plugins embutidos) em vez de reimplementação.
- Para checar aderência às **convenções estruturais** do widget/Custom Element e à sintaxe do `SuperWidget.extend` (regra 3).

**Quando NÃO usar:** para **segurança** (`fluig-review-security`), **performance** (`fluig-review-performance`) ou **acessibilidade** (`fluig-review-accessibility`); e, se o objetivo é uma **revisão transversal de todos os eixos de uma vez**, use `fluig-code-review` (não esta).

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho ou arquivo de customização a revisar (widget, Custom Element, `.ftl`, CSS) | sim |
| Tipo de artefato | Tipo em que o código roda (widget, layout, form) | não |
| Foco solicitado | Convenções prioritárias da revisão, se houver | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

### Core (sempre)

- [conventions.md](../../context/conventions.md) — ES6+, nomenclatura, convenções de widget (`fluig-style-guide` na raiz, `instanceId` só em `id` com `_`, `instance()` sem `instanceId`, bindings), Custom Elements, comunicação por eventos, i18n, segurança via APIs públicas, chamadas REST e CSS.
- [style-guide.md](../../context/style-guide.md) — componentes, grid, classes helper `fs-*` e variáveis CSS de tema (`var(--fs-color-*)`, dark mode).
- [platform-constitution.md](../../context/platform-constitution.md) — regras invioláveis de i18n e HTTP.
- [business-components.md](../../context/business-components.md) — Componentes de Negócio nativos (`ECMBC`, `SOCIALBC`, `WCMBC`, `LMSBC`) — obrigatório reuso de funcionalidades de negócio.

### Parceiro (somente se persona = Parceiro)

- [partner-store-review-rules.md](../../context/partner-store-review-rules.md) — cabeçalho de pré-review ([§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) e persistência do relatório ([§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a revisão; o detalhe está no contexto. Cada achado deve citar a regra de origem.

- **ES6+ para código novo:** `const`/`let`, arrow functions, template literals, `async/await`; sem misturar jQuery e ES6+ no mesmo arquivo → ver `conventions.md`. **Ressalva i18n:** num `.js` que usa i18n e é minificado pelo Closure Compiler, preferir concatenação (`+`) a template literals → ver `platform-constitution.md`.
- **Convenções de widget:** raiz com `fluig-style-guide`; `instanceId` apenas em `id` com `_`; `instance()` sem `instanceId`; bindings com chave sem o prefixo `data-` → ver `conventions.md`.
- **Sintaxe dentro de `SuperWidget.extend({})` (regra 3 da constituição):** métodos declarados como `nome: function() {}` (**nunca** method shorthand ES6 `nome() {}` nem arrow `nome: () => {}`, que não vincula `this`); `var ctx = this;` no topo de cada método e callbacks internos em `function() {}` acessando `ctx`; a variável raiz do widget usa `var`. O "ES6+ para código novo" acima **não** se aplica à sintaxe dos métodos do `.extend({})` → ver `platform-constitution.md` (regra 3) e `conventions.md`.
- **Custom Elements:** nome de arquivo `[name].[category].js`; classe PascalCase; sem Shadow DOM; topo do arquivo só com `import` → ver `conventions.md`.
- **i18n:** texto visível via `${i18n.getTranslation('chave')}` — mesma sintaxe em `.js` e em `.ftl`; nunca acessar `i18n` como objeto JS → ver `conventions.md`. **Exceção — Formulários:** a view/eventos de **formulário** usam `i18n.translate("chave")` (outro domínio) — não reportar como desvio nem exigir `${i18n.getTranslation}` ali (ver "Regra de ouro" em `conventions.md` / `conventions-form.md`).
- **Style Guide:** reutilizar componentes/helpers/grid antes de criar CSS próprio; `var(--fs-color-*)` para cores de tema → ver `conventions.md` e `style-guide.md`.
- **Plugins embutidos:** interações de UI (arrastar, ordenar, redimensionar) e templating devem usar jQuery UI/Mustache já embutidos antes de código próprio → ver `style-guide.md`, seção "Plugins embutidos (jQuery, jQuery UI, Mustache)".
- **Componentes de Negócio nativos:** reutilizar **Componentes de Negócio** (`ECMBC.*`, `SOCIALBC.*`, `WCMBC.*`, `LMSBC.*`) em vez de reimplementar funcionalidades de negócio (seleção de usuário/grupo/papéis/comunidades, busca de documento, recorte de imagem, compartilhamento, etc.) — declarar `application.resource.component.N` no `application.info` → ver `business-components.md`.
- **REST:** qualquer chamada (ao próprio Fluig ou a terceiro) via `fetch()` + `async/await` + `try/catch`; domínio do próprio Fluig só com API pública, URL a partir de `WCMAPI.getServerURL()` → ver `conventions.md`. Severidade **Alta** é por **rota interna não documentada**, não pelo uso de `fetch`.
- **Nomenclatura:** nomes descritivos em Inglês; booleanos com `is`/`has`/`can`/`should` → ver `conventions.md`.

## Tabela de Anti-padrões de Widget

Instrumento rápido de revisão: identifique o anti-padrão no código e aplique a
alternativa recomendada. A tabela **não duplica** a regra — cada item aponta para
a regra-fonte completa em `context/`, que permanece a fonte de verdade.

| ❌ Anti-padrão | ✅ Alternativa | Regra-fonte |
|---------------|----------------|-------------|
| Widget monolítico com responsabilidades misturadas | Modularizar em métodos/funções menores, com responsabilidade única; `init()` delega a métodos claros | [conventions.md](../../context/conventions.md) › JavaScript Moderno (ES6+) |
| Nomes vagos ou abreviações obscuras | Nomenclatura descritiva e consistente, em Inglês; booleanos com `is`/`has`/`can`/`should` | [conventions.md](../../context/conventions.md) › Nomenclatura |
| Strings fixas sem i18n quando há chave disponível | Resolver o texto via `${i18n.getTranslation('chave')}`, mesma sintaxe em `.js` e em `.ftl`; variantes `getTranslationP1`/`getJSTranslation` | [conventions.md](../../context/conventions.md) › Internacionalização (i18n) |
| Customização inline em HTML (`style` inline) | Classe dedicada no CSS, escopada à raiz do widget | [conventions.md](../../context/conventions.md) › CSS |
| Seletor frágil com `id`, cadeia longa e `!important` | Escopo por classe da widget, com especificidade controlada | [conventions.md](../../context/conventions.md) › CSS |
| Variáveis globais ou `window.*` para comunicação entre artefatos | Eventos: `CustomEvent`/`dispatchEvent` (Web Components) ou `WCMAPI.fireEvent`/`addListener` (widgets) | [conventions.md](../../context/conventions.md) › Comunicação entre artefatos (eventos) |
| Rota interna não documentada do Fluig acessada fora da API pública (ex.: `/ecm/api/rest/` direto) | `fetch()` + `async/await` + `try/catch`, com a URL montada a partir de `WCMAPI.getServerURL()` | [conventions.md](../../context/conventions.md) › Chamadas REST e Integrações |
| CSS customizado onde já existe helper/componente do Style Guide | Reutilizar componentes/helpers `fs-*`; cores de tema via `var(--fs-color-*)` | [style-guide.md](../../context/style-guide.md) › Classes helper `fs-*` |
| Modal customizado com Bootstrap puro/markup próprio em vez de `FLUIGC.modal` | Usar `FLUIGC.modal(settings, callback)`, escolhendo a variação de `content` adequada | [conventions.md](../../context/conventions.md) › Modais em Widgets |
| Botão de ação do modal declarado em `bindings.local` (não dispara — o modal renderiza fora da raiz do widget, no `body`) | Declarar em `bindings.global` | [conventions.md](../../context/conventions.md) › Modais em Widgets |
| Interação de UI (arrastar, ordenar, redimensionar) implementada do zero com listeners de mouse | Usar jQuery UI já embutido (`.draggable()`/`.sortable()`/`.droppable()`/`.resizable()`/`.selectable()`) | [style-guide.md](../../context/style-guide.md) › Plugins embutidos (jQuery, jQuery UI, Mustache) |
| Tabela com paginação/busca/drag-and-drop implementada do zero | Usar `FLUIGC.datatable` (`dataRequest`/`search`/`draggable`) | [conventions.md](../../context/conventions.md) › Datatable em Widgets |
| HTML repetido montado por concatenação manual de string | Usar Mustache (`<script type="text/template">` + `Mustache.render`) | [conventions.md](../../context/conventions.md) › Templating com Mustache |
| Reimplementar seleção de usuário/grupo/documento manualmente | Usar Componente de Negócio nativo correspondente (ex.: `SOCIALBC.selectUser`, `SOCIALBC.selectGroup`, `ECMBC.searchDocuments`), declarando `application.resource.component.N` no `application.info` | [business-components.md](../../context/business-components.md) |
| **Server-side (Rhino):** `===`/`!==` contra valor da API Java (`getFormMode() === 'ADD'`, `getIsEditMode() === 'true'`) — sempre falso, lógica não dispara | Igualdade solta `==`/`!=` (ou normalizar com `String(valor)` e comparar) | [technologies.md](../../context/technologies.md) › "Princípio: valores vindos de API Java no Rhino" |
| **Server-side (Rhino):** encadear `.replace`/`.split` sobre valor Java (`campo.toString().replace(...)`) — sobrecarga ambígua, quebra em runtime | Normalizar com `String(valor)` antes de encadear métodos de texto | [technologies.md](../../context/technologies.md) › "Princípio: valores vindos de API Java no Rhino" |

## Escala de Severidade

Classifique **cada achado** em um destes níveis.

> **Fonte canônica da severidade.** Esta escala é a definição **conceitual** dos
> níveis. Quando o padrão já tiver severidade atribuída em `conventions.md`, **vale
> a severidade de lá** — ela prevalece sobre esta escala. (Esta skill é o eixo de
> **manutenibilidade/arquitetura** — ver fronteira no topo; achados de
> segurança/performance/acessibilidade são das skills dedicadas.)

| Severidade | Critério | Exemplos típicos |
|------------|----------|------------------|
| **Crítico** | Violação que quebra a integração com a plataforma | `instanceId` em `class`/`data-*`; `instance()` chamado com `instanceId`; ausência de `fluig-style-guide` na raiz quebrando estilos/componentes; botão de ação de modal em `bindings.local` (nunca dispara) |
| **Alto** | Desvio claro de convenção oficial com risco de bug/regressão | Rota interna não documentada do Fluig acessada direto; texto visível sem i18n; Shadow DOM em Custom Element |
| **Médio** | Desvio de boa prática que afeta manutenção | `var` em código novo; mistura pontual de jQuery e ES6+; CSS próprio onde há helper do Style Guide |
| **Baixo** | Ajuste menor de consistência com o padrão | Nomenclatura pouco descritiva; binding com nome inconsistente; comentário ausente |

## Procedimento

1. Identificar o tipo de artefato e as convenções aplicáveis.
2. Avaliar o código contra as boas práticas: ES6+, convenções de widget/Custom Element, i18n, Style Guide, REST e nomenclatura.
3. Para cada desvio, registrar um achado com localização, descrição, **severidade** e a **regra de contexto** correspondente (`conventions.md`/`style-guide.md`, com a seção).
4. Recomendar a correção objetiva, apontando a skill aplicável quando útil (ex.: `fluig-internationalization`, `fluig-style-guide-helpers`, `fluig-migrate-jquery-es6`).
5. Consolidar os achados ordenados do mais grave ao menos grave.
6. Validar a revisão com o checklist abaixo antes de entregar.

## Saída Esperada

Um **relatório de revisão de boas práticas**, com **Resumo** (contagem de
achados por severidade e avaliação geral de aderência), **Achados** agrupados
por severidade (crítico → baixo; cada um com localização, descrição, severidade
e a **regra de contexto referenciada**) e **Recomendações** acionáveis,
indicando a skill especializada aplicável quando útil. A forma de entrega segue
a persona (ver `conventions.md` › Saída do review por persona):

- **Consultor:** o relatório é **gravado** em `review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo — análise de boas práticas para a customização do cliente, **sem** cabeçalho de pré-review e **sem** menção à Store ou ao App Review.
- **Parceiro (Store):** o relatório é um **pré-review preparatório** (não aprova,
  não substitui o App Review oficial), abre por um **cabeçalho de pré-review** e é
  **gravado** em `pre-review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo — a única
  escrita permitida. O **contrato completo** desse relatório (cabeçalho, nome do
  arquivo e modo somente leitura) é **canônico** em
  [§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação) / [§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)
  ([§ 32.1](../../context/partner-store-review-rules.md#321-modo-somente-leitura)) — siga-o de lá, esta skill não o duplica.

Fora esse cenário de Parceiro, a skill **não altera** o código — apenas diagnostica e recomenda.

## Exemplo de Uso

Trecho revisado e achado correspondente.

```html
<!-- Código revisado (trecho) -->
<div id="MyWidget" class="wcm-widget-class" data-instance="MyWidget_${instanceId}">
```

```markdown
## Achados

### 🔴 Crítico
- **Convenção de widget — linha 1:** `instanceId` usado em atributo `data-*` e ausência de `fluig-style-guide` na raiz; `id` sem o `instanceId`.
  - Regra: `conventions.md` › Convenções de Widget.
  - Recomendação: usar `id="MyWidget_${instanceId}"`, manter `data-*`/`class` estáticos e incluir `fluig-style-guide` na classe raiz.
```

## Checklist de Validação

- [ ] As convenções aplicáveis foram avaliadas (ES6+, widget, Custom Element, i18n, Style Guide, REST, nomenclatura).
- [ ] Componentes de Negócio nativos (`ECMBC.*`, `SOCIALBC.*`, `WCMBC.*`) avaliados — reimplementação de funcionalidades de negócio já oferecidas pela plataforma identificada como achado.
- [ ] Cada achado tem **severidade** atribuída conforme a escala (crítico/alto/médio/baixo).
- [ ] Cada achado **referencia a regra** do arquivo de contexto (`conventions.md`/`style-guide.md`, com a seção).
- [ ] O relatório está ordenado do mais grave ao menos grave.
- [ ] As recomendações são acionáveis e apontam a skill especializada quando aplicável.
- [ ] A persona foi classificada (Passo 0) e emitida como `Persona: <Parceiro|Consultor> (motivo)`.
- [ ] **Consultor:** o relatório foi **gravado** em `review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo, sem cabeçalho de pré-review e sem menção à Store/App Review.
- [ ] **Parceiro:** o relatório abre por um **cabeçalho de pré-review** (não aprova, não substitui o App Review oficial — `partner-store-review-rules.md` [§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) e foi **gravado** em `pre-review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo (`partner-store-review-rules.md` [§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).
- [ ] A revisão não alterou o código além do eventual `.md` de relatório do Parceiro — apenas diagnosticou e recomendou.
