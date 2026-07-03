---
name: fluig-code-review
description: Revisa código frontend de customização Fluig (widgets com SuperWidget, Custom Elements, FreeMarker e CSS) e produz um relatório de achados classificados por severidade, cada um referenciando a regra correspondente dos arquivos de contexto. Use quando o desenvolvedor pedir revisão geral de qualidade de um trecho ou arquivo antes de merge, cobrindo ES6+, convenções de widget/Custom Element, i18n, segurança, CSS/Style Guide, acessibilidade e performance.
argument-hint: o código/arquivo frontend alvo da revisão (trecho ou arquivo selecionado), idealmente com o tipo de artefato
---

# Revisão Geral de Código Frontend Fluig

Esta skill revisa código frontend de customização Fluig e emite achados por severidade; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo. O detalhe operacional (checklist e template) está em `assets/`.

## Objetivo

Revisar, com responsabilidade única, a **qualidade geral de código frontend Fluig** (widgets, Custom Elements, FreeMarker, CSS), identificando desvios das convenções públicas e oficiais e produzindo um **relatório de achados classificados por severidade**, cada um vinculado à regra correspondente do arquivo de contexto. A skill **não reescreve** o código — ela aponta problemas e recomenda correções.

## Quando Usar

- Antes de um merge, para uma revisão ampla de qualidade de um widget ou Custom Element.
- Quando o desenvolvedor quer um **diagnóstico transversal** (ES6+, convenções de widget, i18n, segurança, CSS/Style Guide, acessibilidade e performance) em vez de uma revisão especializada.
- Quando há suspeita de múltiplas categorias de problema no mesmo arquivo.
- Para preparar um relatório de revisão estruturado a ser anexado a um pull request.

> Para revisões aprofundadas em um único eixo, prefira as skills especializadas: `fluig-review-performance`, `fluig-review-security`, `fluig-review-accessibility` e `fluig-best-practices`.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho ou arquivo frontend a revisar (widget, Custom Element, `.ftl`, CSS) | sim |
| Tipo de artefato | Tipo em que o código roda (widget, layout, form) | não |
| Foco solicitado | Eixos prioritários da revisão, se houver (ex.: segurança e i18n) | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — ES6+, nomenclatura, convenções de widget (`fluig-style-guide`, `instanceId` só em `id` com `_`, `instance()` sem `instanceId`, bindings), Custom Elements, i18n, segurança (`WCMAPI.validateXSS`, `DOMPurify.sanitize`), REST interna (`WCMAPI`/`FLUIGC.ajax`) e CSS.
- [style-guide.md](../../context/style-guide.md) — reutilização de componentes/helpers/grid do Style Guide e variáveis de cor `var(--fs-color-*)` (sem hexadecimal fixo, suporte a dark mode).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a revisão; o detalhe está no contexto e o checklist completo em `assets/checklist.md`. Cada achado deve citar a regra de origem.

- **ES6+:** `const`/`let` (sem `var`), arrow functions, template literals, `async/await`; sem misturar jQuery e ES6+ no mesmo arquivo → ver `conventions.md`.
- **Widget:** raiz com `fluig-style-guide`; `instanceId` apenas em `id` com separador `_`; `instance()` sem `instanceId`; bindings com chave sem o prefixo `data-` → ver `conventions.md`.
- **Custom Element:** nome de arquivo `[name].[category].js`; classe PascalCase; sem Shadow DOM; topo do arquivo só com `import` → ver `conventions.md`.
- **i18n:** todo texto visível via `${i18n.getTranslation('chave')}`; nunca acessar `i18n` como objeto JS; cuidado com template literals → ver `conventions.md`.
- **Segurança:** entrada do usuário sanitizada (`DOMPurify.sanitize` / `WCMAPI.validateXSS`); `textContent` em vez de `innerHTML` inseguro; sem `eval()`/`new Function()` com dados dinâmicos; escape FreeMarker → ver `conventions.md`.
- **REST interna:** chamadas a endpoints internos via `WCMAPI`/`FLUIGC.ajax` (nunca `fetch`/`$.ajax` direto) → ver `conventions.md`.
- **CSS:** reutilizar Style Guide; CSS escopado à raiz; sem `style` inline/`<style>`; sem hexadecimal fixo (`var(--fs-color-*)`) → ver `conventions.md` e `style-guide.md`.
- **Acessibilidade:** HTML semântico, rótulos/nome acessível, navegação por teclado, contraste → ver `conventions.md` e `style-guide.md`.
- **Performance:** DOM agrupado, sem seletores repetidos, debounce/throttle, dados sob demanda → ver `conventions.md`.

## Escala de Severidade

Classifique **cada achado** em um destes níveis:

| Severidade | Critério | Exemplos típicos |
|------------|----------|------------------|
| **Crítico** | Vulnerabilidade ou quebra funcional/de plataforma; corrigir antes do merge | XSS por `innerHTML` com input não sanitizado; `eval()` com dados dinâmicos; `instanceId` em `class`/`data-*` quebrando a instância |
| **Alto** | Violação clara de convenção pública com risco relevante de bug ou regressão | `fetch` direto para endpoint interno; texto visível sem i18n; ausência de `fluig-style-guide` na raiz |
| **Médio** | Desvio de boa prática que afeta manutenção/performance sem quebra imediata | DOM manipulado em laço sem `DocumentFragment`; seletores repetidos; `var` em código novo |
| **Baixo** | Melhoria menor de estilo/consistência | Nomenclatura pouco descritiva; comentário ausente; pequena oportunidade de reutilizar helper do Style Guide |

## Procedimento

1. Identificar o tipo de artefato e os eixos aplicáveis (ES6+, widget/Custom Element, i18n, segurança, CSS/Style Guide, acessibilidade, performance).
2. Percorrer o **checklist completo** em [assets/checklist.md](assets/checklist.md), categoria por categoria.
3. Para cada desvio, registrar um achado com: localização, descrição, **severidade** (escala acima) e a **regra de contexto** correspondente (`conventions.md` ou `style-guide.md`, com a seção).
4. Recomendar a correção objetiva de cada achado, referenciando a skill especializada quando fizer sentido (ex.: `fluig-validate-security`, `fluig-dark-mode`, `fluig-internationalization`).
5. Consolidar os achados no formato de [assets/output-template.md](assets/output-template.md), ordenando do mais grave ao menos grave.
6. Validar a própria revisão com o checklist de validação abaixo antes de entregar.

## Saída Esperada

Um **relatório de revisão** seguindo [assets/output-template.md](assets/output-template.md), contendo:

- **Resumo** com a contagem de achados por severidade e a avaliação geral.
- **Achados** agrupados por severidade (crítico → baixo); cada achado com localização, descrição, severidade e a **regra de contexto referenciada**.
- **Recomendações** acionáveis por achado, indicando a skill especializada aplicável quando útil.

A skill **não altera** o código — apenas diagnostica e recomenda.

## Exemplo de Uso

Trecho revisado e achado correspondente.

```javascript
// Código revisado (trecho)
container.innerHTML = userInput;                 // entrada do usuário
$.ajax({ url: '/api/internal/list' });           // endpoint interno via $.ajax
```

```markdown
## Achados

### 🔴 Crítico
- **DOM/Segurança — linha 1:** `innerHTML` recebe `userInput` sem sanitização (vetor de XSS).
  - Regra: `conventions.md` › Segurança (APIs públicas).
  - Recomendação: usar `textContent` ou `DOMPurify.sanitize(userInput)` antes de inserir. Ver skill `fluig-validate-security`.

### 🟠 Alto
- **REST interna — linha 2:** chamada a endpoint interno via `$.ajax` direto.
  - Regra: `conventions.md` › Chamadas REST internas.
  - Recomendação: usar `FLUIGC.ajax` (ou `WCMAPI` no legado) para enviar o token de sessão.
```

## Checklist de Validação

- [ ] Todos os eixos aplicáveis foram percorridos via [assets/checklist.md](assets/checklist.md).
- [ ] Cada achado tem **severidade** atribuída conforme a escala (crítico/alto/médio/baixo).
- [ ] Cada achado **referencia a regra** do arquivo de contexto (`conventions.md`/`style-guide.md`, com a seção).
- [ ] O relatório segue [assets/output-template.md](assets/output-template.md), do mais grave ao menos grave.
- [ ] O relatório inclui **Pontos Positivos** e um **Plano de Ação** ordenado por urgência.
- [ ] As recomendações são acionáveis e apontam a skill especializada quando aplicável.
- [ ] A revisão não alterou o código — apenas diagnosticou e recomendou.
