---
name: fluig-code-review
description: Revisa código frontend de customização Fluig (widgets com SuperWidget, Custom Elements, FreeMarker e CSS) e produz um relatório de achados classificados por severidade, cada um referenciando a regra correspondente dos arquivos de contexto. Use quando o desenvolvedor pedir revisão geral de qualidade de um trecho ou arquivo antes de merge, cobrindo ES6+, convenções de widget/Custom Element, i18n, segurança, CSS/Style Guide, acessibilidade e performance.
argument-hint: o código/arquivo frontend alvo da revisão (trecho ou arquivo selecionado), idealmente com o tipo de artefato
---

# Revisão Geral de Código Frontend Fluig

Esta skill revisa código frontend de customização Fluig e emite achados por severidade; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo. O detalhe operacional (checklist e template) está em `assets/`.

> 🚫 **Escopo: frontend (navegador).** Os eixos, severidades e o "ES6+ esperado"
> desta skill valem para JS de **widget/Custom Element, FreeMarker e CSS**. Se o
> alvo for um **evento server-side** de form/dataset/processo (`events/*.js`,
> `datasets/*.js`, eventos de workflow), ele roda no motor **Rhino (ES5)** e segue
> regras **opostas** às daqui: `var`/`function` (não `const`/arrow/template
> literal), igualdade **solta `==`** e `String(valor)` para valores da API Java
> (que são `java.lang.String`, não primitivos JS). **Não** reporte `var` ou `==`
> como desvio em código server-side — ali é o correto; o anti-padrão é o inverso
> (`===` contra `getFormMode()`/`getIsEditMode()`, `.replace`/`.split` sobre valor
> Java sem `String(...)`). Ver `technologies.md` › "Princípio: valores vindos de
> API Java no Rhino" e `conventions-form.md` › "Eventos server-side".

## Passo 0 — Persona

Antes de revisar, classifique a persona do desenvolvedor seguindo a cascata em
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Se restar ambígua, pare e pergunte antes de
continuar. Emita `Persona: <Parceiro|Consultor> (motivo)` antes do relatório —
a persona determina a camada de contexto carregada (ver "Contexto de
Referência") e a forma de saída da revisão (ver "Saída Esperada").

## Objetivo

Revisar, com responsabilidade única, a **qualidade geral de código frontend Fluig** (widgets, Custom Elements, FreeMarker, CSS), identificando desvios das convenções públicas e oficiais e produzindo um **relatório de achados classificados por severidade**, cada um vinculado à regra correspondente do arquivo de contexto. A skill **não reescreve** o código — ela aponta problemas e recomenda correções.

## Quando Usar

- Antes de um merge, para uma revisão ampla de qualidade de um widget ou Custom Element.
- Quando o desenvolvedor quer um **diagnóstico transversal** (ES6+, convenções de widget, i18n, segurança, CSS/Style Guide, acessibilidade e performance) em vez de uma revisão especializada.
- Quando há suspeita de múltiplas categorias de problema no mesmo arquivo.
- Para preparar um relatório de revisão estruturado a ser anexado a um pull request.

> Para revisões aprofundadas em um único eixo, prefira a skill especializada: `fluig-review-security` (segurança), `fluig-review-performance` (performance), `fluig-review-accessibility` (acessibilidade) ou `fluig-best-practices` (**manutenibilidade/arquitetura**: modularização, responsabilidade única, nomenclatura, organização, reuso).

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho ou arquivo frontend a revisar (widget, Custom Element, `.ftl`, CSS) | sim |
| Tipo de artefato | Tipo em que o código roda (widget, layout, form) | não |
| Foco solicitado | Eixos prioritários da revisão, se houver (ex.: segurança e i18n) | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

### Core (sempre)

- [conventions.md](../../context/conventions.md) — ES6+, nomenclatura, convenções de widget (`fluig-style-guide`, `instanceId` só em `id` com `_`, `instance()` sem `instanceId`, bindings), Custom Elements, i18n, segurança (`WCMAPI.validateXSS`, `DOMPurify.sanitize`), REST via `fetch()` ao domínio do próprio Fluig (API pública, `WCMAPI.getServerURL()`) ou a terceiro, e CSS.
- [style-guide.md](../../context/style-guide.md) — reutilização de componentes/helpers/grid do Style Guide e variáveis de cor `var(--fs-color-*)` (sem hexadecimal fixo, suporte a dark mode).
- [platform-constitution.md](../../context/platform-constitution.md) — regras invioláveis de i18n e HTTP.

### Parceiro (somente se persona = Parceiro)

- [partner-store-review-rules.md](../../context/partner-store-review-rules.md) — análise contextual completa ([§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo)/ [§ 23](../../context/partner-store-review-rules.md#23-contagem-e-classificação-de-chamadas-síncronas-volumetria)), cabeçalho de pré-review ([§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) e persistência do relatório ([§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a revisão; o detalhe está no contexto e o checklist completo em `assets/checklist.md`. Cada achado deve citar a regra de origem.

- **ES6+:** `const`/`let` (sem `var`), arrow functions, template literals, `async/await`; sem misturar jQuery e ES6+ no mesmo arquivo → ver `conventions.md`.
- **Widget:** raiz com as **3 classes obrigatórias** `fluig-style-guide super-widget wcm-widget-class` (a classe específica do widget vem a seguir); `instanceId` apenas em `id` com separador `_`; `instance()` sem `instanceId`; bindings com chave sem o prefixo `data-` → ver `conventions.md`.
- **Custom Element:** nome de arquivo `[name].[category].js`; classe PascalCase; sem Shadow DOM; topo do arquivo só com `import` → ver `conventions.md`.
- **i18n:** todo texto visível via i18n — `[=i18n.getTranslation('chave')]` em `.js` de widget/layout (código novo) e `${i18n.getTranslation('chave')}` em `.ftl`; não misturar as duas sintaxes no mesmo `.js` (legado com `${...}` mantém a sintaxe); nunca acessar `i18n` como objeto JS; template literals são liberados com `[=...]` e só devem ser evitados (preferir concatenação `+`) em `.js` legado com `${i18n...}` minificado pelo Closure Compiler → ver `conventions.md`. **Exceção — Formulários:** a view/eventos de **formulário** usam `i18n.translate("chave")` (outro domínio, 3 locais sem base) — **não** reportar o uso de `i18n.translate` em form como desvio nem exigir `${i18n.getTranslation}` ali (ver "Regra de ouro" em `conventions.md` / `conventions-form.md`).
- **Segurança:** entrada do usuário sanitizada (`DOMPurify.sanitize` / `WCMAPI.validateXSS`); `textContent` em vez de `innerHTML` inseguro; sem `eval()`/`new Function()` com dados dinâmicos; escape FreeMarker → ver `conventions.md`.
- **REST:** qualquer chamada (ao próprio Fluig ou a terceiro) via `fetch()` + `async/await` + `try/catch`; domínio do próprio Fluig só com API pública, URL a partir de `WCMAPI.getServerURL()` → ver `conventions.md`. Severidade **Alta** é por **rota interna não documentada**, não pelo uso de `fetch`.
- **CSS:** reutilizar Style Guide; CSS escopado à raiz; sem `style` inline/`<style>`; sem hexadecimal fixo em **cor de tema** (`var(--fs-color-*)`) → ver `conventions.md` e `style-guide.md`. **Não** sinalizar como violação um hex usado como **fallback de custom property de cor dinâmica** escolhida pelo usuário (ex.: `--highlight: #2196f3`) — é caso legítimo, não cor de tema → ver `style-guide.md`, "Cor dinâmica configurável pelo usuário".
- **Acessibilidade:** HTML semântico, rótulos/nome acessível, navegação por teclado, contraste → ver `conventions.md` e `style-guide.md`.
- **Performance:** DOM agrupado, sem seletores repetidos, debounce/throttle, dados sob demanda → ver `conventions.md`.

## Escala de Severidade

Classifique **cada achado** em um destes níveis.

> **Fonte canônica da severidade.** Esta escala é a definição **conceitual** dos
> níveis. Quando o padrão já tiver severidade atribuída em `conventions.md`
> (seções **"Classificação de segurança frontend (review)"** e **"Classificação
> de performance frontend (review)"**), **vale a severidade de lá** — ela
> prevalece sobre esta escala. Ex.: *DOM em laço sem fragment* = **Média**;
> *rota interna não documentada* = **Alta**; *XSS com origem de API/input/URL* e
> *execução dinâmica (`eval`/`new Function`)* = **Crítica**.

| Severidade | Critério | Exemplos típicos |
|------------|----------|------------------|
| **Crítico** | Vulnerabilidade ou quebra funcional/de plataforma; corrigir antes do merge | XSS por `innerHTML` com input não sanitizado; `eval()` com dados dinâmicos; `instanceId` em `class`/`data-*` quebrando a instância |
| **Alto** | Violação clara de convenção pública com risco relevante de bug ou regressão | Rota interna não documentada do Fluig acessada direto; texto visível sem i18n; ausência de `fluig-style-guide` na raiz |
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

Um **relatório de revisão** com **Resumo** (contagem de achados por severidade e
avaliação geral), **Achados** agrupados por severidade (crítico → baixo; cada um
com localização, descrição, severidade e a **regra de contexto referenciada**) e
**Recomendações** acionáveis, indicando a skill especializada aplicável quando
útil. A forma de entrega segue a persona (ver `conventions.md` › Saída do
review por persona):

- **Consultor:** o relatório é **gravado** em `review-<artefato>-<AAAA-MM-DD>.md` na
  raiz do alvo (a única escrita permitida), sem qualquer menção à Store ou ao App
  Review. Segue a estrutura de [assets/output-template.md](assets/output-template.md)
  com o **cabeçalho Consultor**, ignorando o cabeçalho de pré-review.
- **Parceiro (Store):** o relatório é um **pré-review preparatório** (não aprova,
  não substitui o App Review oficial), segue
  [assets/output-template.md](assets/output-template.md) por completo (que já
  materializa o cabeçalho de pré-review) e é **gravado** em
  `pre-review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo — a única escrita
  permitida. O **contrato** desse relatório (cabeçalho, nome do arquivo e modo
  somente leitura) é **canônico** em
  [§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação) / [§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)
  ([§ 32.1](../../context/partner-store-review-rules.md#321-modo-somente-leitura)); o template é apenas a forma que o concretiza.

Fora esse cenário de Parceiro, a skill **não altera** o código — apenas diagnostica e recomenda.

## Exemplo de Uso

Trecho revisado e achado correspondente.

```javascript
// Código revisado (trecho)
container.innerHTML = userInput;                 // entrada do usuário
fetch('/ecm/api/rest/internal/list');             // rota interna não documentada acessada direto, fora da API pública
```

```markdown
## Achados

### 🔴 Crítico
- **DOM/Segurança — linha 1:** `innerHTML` recebe `userInput` sem sanitização (vetor de XSS).
  - Regra: `conventions.md` › Segurança (APIs públicas).
  - Recomendação: usar `textContent` ou `DOMPurify.sanitize(userInput)` antes de inserir. Ver skill `fluig-validate-security`.

### 🟠 Alto
- **REST — linha 2:** `fetch` chama `/ecm/api/rest/internal/...` direto — **rota interna não documentada**. O problema é a *rota*, não o `fetch`: prefixar com `WCMAPI.getServerURL()` **não** torna uma rota interna pública.
  - Regra: `conventions.md` › Chamadas REST e Integrações.
  - Recomendação: substituir pela **API pública documentada** equivalente (a URL do próprio Fluig montada a partir de `WCMAPI.getServerURL()` + endpoint público); se não houver endpoint público para a necessidade, tratar como pendência em vez de consumir a rota interna.
```

## Checklist de Validação

- [ ] Todos os eixos aplicáveis foram percorridos via [assets/checklist.md](assets/checklist.md).
- [ ] Cada achado tem **severidade** atribuída conforme a escala (crítico/alto/médio/baixo).
- [ ] Cada achado **referencia a regra** do arquivo de contexto (`conventions.md`/`style-guide.md`, com a seção).
- [ ] O relatório segue [assets/output-template.md](assets/output-template.md), do mais grave ao menos grave.
- [ ] O relatório inclui **Pontos Positivos** e um **Plano de Ação** ordenado por urgência.
- [ ] As recomendações são acionáveis e apontam a skill especializada quando aplicável.
- [ ] A persona foi classificada (Passo 0) e emitida como `Persona: <Parceiro|Consultor> (motivo)`.
- [ ] **Consultor:** o relatório foi **gravado** em `review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo, sem cabeçalho de pré-review e sem menção à Store/App Review.
- [ ] **Parceiro:** o relatório abre por um **cabeçalho de pré-review** (não aprova, não substitui o App Review oficial — `partner-store-review-rules.md` [§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) e foi **gravado** em `pre-review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo (`partner-store-review-rules.md` [§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).
- [ ] A revisão não alterou o código além do eventual `.md` de relatório do Parceiro — apenas diagnosticou e recomendou.
