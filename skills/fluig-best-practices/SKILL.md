---
name: fluig-best-practices
description: Revisa a aderência de código de customização Fluig às boas práticas oficiais da plataforma (convenções de widget com SuperWidget, Custom Elements, i18n, uso do Style Guide, chamadas REST internas e ES6+) e produz achados classificados por severidade, cada um referenciando a regra do arquivo de contexto. Use quando o desenvolvedor pedir uma revisão de conformidade com os padrões Fluig de um trecho ou arquivo antes de merge, sem reescrever o código.
argument-hint: o código/arquivo Fluig alvo da revisão de boas práticas (trecho ou arquivo selecionado), idealmente com o tipo de artefato
---

# Revisão de Aderência às Boas Práticas do Fluig

Esta skill revisa a aderência do código às boas práticas oficiais do Fluig e emite achados por severidade; ela **não duplica** convenções — o arquivo de `context/` é a fonte de verdade, referenciada abaixo. A skill **não reescreve** o código.

## Objetivo

Revisar, com responsabilidade única, a **aderência de código de customização Fluig às boas práticas oficiais da plataforma** — convenções de widget, Custom Elements, i18n, uso do Style Guide, chamadas REST internas e ES6+ — produzindo um **relatório de achados classificados por severidade**, cada um vinculado à regra correspondente do arquivo de contexto.

## Quando Usar

- Antes de um merge, para verificar conformidade com os padrões oficiais do Fluig.
- Quando há dúvida se o código segue as convenções de widget/Custom Element da plataforma.
- Quando se quer garantir compatibilidade e manutenibilidade alinhadas ao padrão Fluig.
- Como complemento às revisões especializadas (`fluig-review-performance`, `fluig-review-security`, `fluig-review-accessibility`).

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho ou arquivo de customização a revisar (widget, Custom Element, `.ftl`, CSS) | sim |
| Tipo de artefato | Tipo em que o código roda (widget, layout, form) | não |
| Foco solicitado | Convenções prioritárias da revisão, se houver | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — ES6+, nomenclatura, convenções de widget (`fluig-style-guide` na raiz, `instanceId` só em `id` com `_`, `instance()` sem `instanceId`, bindings), Custom Elements, comunicação por eventos, i18n, segurança via APIs públicas, chamadas REST internas e CSS.
- [style-guide.md](../../context/style-guide.md) — componentes, grid, classes helper `fs-*` e variáveis CSS de tema (`var(--fs-color-*)`, dark mode).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a revisão; o detalhe está no contexto. Cada achado deve citar a regra de origem.

- **ES6+ para código novo:** `const`/`let`, arrow functions, template literals, `async/await`; sem misturar jQuery e ES6+ no mesmo arquivo → ver `conventions.md`.
- **Convenções de widget:** raiz com `fluig-style-guide`; `instanceId` apenas em `id` com `_`; `instance()` sem `instanceId`; bindings com chave sem o prefixo `data-` → ver `conventions.md`.
- **Custom Elements:** nome de arquivo `[name].[category].js`; classe PascalCase; sem Shadow DOM; topo do arquivo só com `import` → ver `conventions.md`.
- **i18n:** texto visível via `${i18n.getTranslation('chave')}`; nunca acessar `i18n` como objeto JS → ver `conventions.md`.
- **Style Guide:** reutilizar componentes/helpers/grid antes de criar CSS próprio; `var(--fs-color-*)` para cores de tema → ver `conventions.md` e `style-guide.md`.
- **REST interna:** chamadas via `WCMAPI`/`FLUIGC.ajax` (nunca `fetch`/`$.ajax` direto) → ver `conventions.md`.
- **Nomenclatura:** nomes descritivos em Inglês; booleanos com `is`/`has`/`can`/`should` → ver `conventions.md`.

## Tabela de Anti-padrões de Widget

Instrumento rápido de revisão: identifique o anti-padrão no código e aplique a
alternativa recomendada. A tabela **não duplica** a regra — cada item aponta para
a regra-fonte completa em `context/`, que permanece a fonte de verdade.

| ❌ Anti-padrão | ✅ Alternativa | Regra-fonte |
|---------------|----------------|-------------|
| Widget monolítico com responsabilidades misturadas | Modularizar em métodos/funções menores, com responsabilidade única; `init()` delega a métodos claros | [conventions.md](../../context/conventions.md) › JavaScript Moderno (ES6+) |
| Nomes vagos ou abreviações obscuras | Nomenclatura descritiva e consistente, em Inglês; booleanos com `is`/`has`/`can`/`should` | [conventions.md](../../context/conventions.md) › Nomenclatura |
| Strings fixas sem i18n quando há chave disponível | Resolver o texto via `${i18n.getTranslation('chave')}` (e variantes `getTranslationP1`/`getJSTranslation`) | [conventions.md](../../context/conventions.md) › Internacionalização (i18n) |
| Customização inline em HTML (`style` inline) | Classe dedicada no CSS, escopada à raiz do widget | [conventions.md](../../context/conventions.md) › CSS |
| Seletor frágil com `id`, cadeia longa e `!important` | Escopo por classe da widget, com especificidade controlada | [conventions.md](../../context/conventions.md) › CSS |
| Variáveis globais ou `window.*` para comunicação entre artefatos | Eventos: `CustomEvent`/`dispatchEvent` (Web Components) ou `WCMAPI.fireEvent`/`addListener` (widgets) | [conventions.md](../../context/conventions.md) › Comunicação entre artefatos (eventos) |
| `fetch()`/`$.ajax()` direto a endpoint interno | Cliente público: `FLUIGC.ajax` (ES6+) ou `WCMAPI.Read/Create/Update/Delete` (legado) | [conventions.md](../../context/conventions.md) › Chamadas REST internas |
| CSS customizado onde já existe helper/componente do Style Guide | Reutilizar componentes/helpers `fs-*`; cores de tema via `var(--fs-color-*)` | [style-guide.md](../../context/style-guide.md) › Classes helper `fs-*` |

## Escala de Severidade

Classifique **cada achado** em um destes níveis:

| Severidade | Critério | Exemplos típicos |
|------------|----------|------------------|
| **Crítico** | Violação que quebra a integração com a plataforma | `instanceId` em `class`/`data-*`; `instance()` chamado com `instanceId`; ausência de `fluig-style-guide` na raiz quebrando estilos/componentes |
| **Alto** | Desvio claro de convenção oficial com risco de bug/regressão | `fetch` direto para endpoint interno; texto visível sem i18n; Shadow DOM em Custom Element |
| **Médio** | Desvio de boa prática que afeta manutenção | `var` em código novo; mistura pontual de jQuery e ES6+; CSS próprio onde há helper do Style Guide |
| **Baixo** | Ajuste menor de consistência com o padrão | Nomenclatura pouco descritiva; binding com nome inconsistente; comentário ausente |

## Procedimento

1. Identificar o tipo de artefato e as convenções aplicáveis.
2. Avaliar o código contra as boas práticas: ES6+, convenções de widget/Custom Element, i18n, Style Guide, REST interna e nomenclatura.
3. Para cada desvio, registrar um achado com localização, descrição, **severidade** e a **regra de contexto** correspondente (`conventions.md`/`style-guide.md`, com a seção).
4. Recomendar a correção objetiva, apontando a skill aplicável quando útil (ex.: `fluig-internationalization`, `fluig-style-guide-helpers`, `fluig-migrate-jquery-es6`).
5. Consolidar os achados ordenados do mais grave ao menos grave.
6. Validar a revisão com o checklist abaixo antes de entregar.

## Saída Esperada

Um **relatório de revisão de boas práticas** contendo:

- **Resumo** com a contagem de achados por severidade e a avaliação geral de aderência.
- **Achados** agrupados por severidade (crítico → baixo); cada um com localização, descrição, severidade e a **regra de contexto referenciada**.
- **Recomendações** acionáveis por achado, indicando a skill especializada aplicável quando útil.

A skill **não altera** o código — apenas diagnostica e recomenda.

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

- [ ] As convenções aplicáveis foram avaliadas (ES6+, widget, Custom Element, i18n, Style Guide, REST interna, nomenclatura).
- [ ] Cada achado tem **severidade** atribuída conforme a escala (crítico/alto/médio/baixo).
- [ ] Cada achado **referencia a regra** do arquivo de contexto (`conventions.md`/`style-guide.md`, com a seção).
- [ ] O relatório está ordenado do mais grave ao menos grave.
- [ ] As recomendações são acionáveis e apontam a skill especializada quando aplicável.
- [ ] A revisão não alterou o código — apenas diagnosticou e recomendou.
