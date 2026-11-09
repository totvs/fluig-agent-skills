---
name: fluig-review-performance
description: Revisa a performance de código frontend Fluig (manipulação de DOM, eventos de alta frequência, requisições REST e carga de dados) e produz achados classificados por severidade, cada um referenciando a regra correspondente do arquivo de contexto. Use quando o desenvolvedor pedir uma revisão focada em performance de um widget/Custom Element antes de merge, sem reescrever o código.
argument-hint: o código/arquivo frontend alvo da revisão de performance (trecho ou arquivo selecionado), idealmente com o sintoma observado
---

# Revisão de Performance de Frontend Fluig

Esta skill revisa a performance de código frontend Fluig e emite achados por severidade; ela **não duplica** convenções — o arquivo de `context/` é a fonte de verdade, referenciada abaixo. A skill **não reescreve** o código.

## Passo 0 — Persona

Antes de revisar, classifique a persona do desenvolvedor seguindo a cascata em
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Se restar ambígua, pare e pergunte antes de
continuar. Emita `Persona: <Parceiro|Consultor> (motivo)` antes do relatório —
a persona determina a camada de contexto carregada (ver "Contexto de
Referência") e a forma de saída da revisão (ver "Saída Esperada").

## Objetivo

Revisar, com responsabilidade única, a **performance de código frontend Fluig** — DOM, eventos, requisições e carga de dados — identificando gargalos e produzindo um **relatório de achados classificados por severidade**, cada um vinculado à regra correspondente do arquivo de contexto. Para aplicar as correções, use a skill `fluig-optimize-performance`.

## Quando Usar

- Antes de um merge, para uma revisão focada em performance de um widget ou Custom Element.
- Quando há sintomas de lentidão, travamento, reflow/repaint excessivo ou muitas requisições.
- Quando o código tem muitos listeners ou eventos de alta frequência (scroll, resize, input) sem controle.
- Para diagnosticar gargalos sem ainda alterar o código.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho ou arquivo frontend a revisar (widget ou Custom Element) | sim |
| Sintoma observado | O que foi notado (ex.: lentidão ao renderizar lista, travamento no scroll, muitas chamadas REST) | não |
| Contexto do artefato | Tipo do artefato e onde o gargalo aparece | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

### Core (sempre)

- [conventions.md](../../context/conventions.md) — manipulação de DOM, ES6+ e `async/await`, REST via `fetch()` ao domínio do próprio Fluig (API pública, `WCMAPI.getServerURL()`) ou a terceiro, bindings de widget e carga de dados sob demanda.
- [platform-constitution.md](../../context/platform-constitution.md) — regras invioláveis de HTTP (`fetch()` + `async/await`, nunca síncrono).

### Parceiro (somente se persona = Parceiro)

- [partner-store-review-rules.md](../../context/partner-store-review-rules.md) — análise contextual de performance ([§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo)/ [§ 23](../../context/partner-store-review-rules.md#23-contagem-e-classificação-de-chamadas-síncronas-volumetria)), cabeçalho de pré-review ([§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) e persistência do relatório ([§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a revisão; o detalhe está no contexto. Cada achado deve citar a regra de origem.

- **Agrupar alterações de DOM** (ex.: `DocumentFragment`) em vez de inserir item a item em laço → ver `conventions.md`.
- **Minimizar reflow/repaint:** não intercalar leitura e escrita de layout dentro de laços.
- **Cachear seletores:** evitar reconsultar o DOM repetidamente.
- **Event delegation:** um listener no container em vez de muitos listeners individuais → ver `conventions.md`.
- **Debounce/throttle** em eventos de alta frequência (scroll, resize, input/keyup).
- **Carregar dados sob demanda** (paginação/lazy load); tratar assíncrono com `async/await` em `try/catch` → ver `conventions.md`.
- **Nunca `DatasetFactory.getDataset()` síncrono no cliente:** no front-end a chamada síncrona bloqueia a thread da UI — é **Crítica**. Consumir dataset no cliente via API REST v2 (`/dataset/api/v2/dataset-handle/search`, `fetch` + `async/await`) → ver `conventions.md`, "Consumo de Datasets no Front-End (regra de performance)".
- **REST ao domínio do próprio Fluig** apenas via **API pública**, com a URL montada a partir de `WCMAPI.getServerURL()`, usando `fetch()` + `async/await`; evitar requisições redundantes → ver `conventions.md`.
- **Liberar recursos:** remover listeners/timers ao destruir o widget (evitar vazamentos).

## Escala de Severidade

Classifique **cada achado** em um destes níveis.

> **Fonte canônica da severidade.** Esta escala é a definição **conceitual** dos
> níveis. Quando o padrão já tiver severidade atribuída em `conventions.md`
> (seção **"Classificação de performance frontend (review)"**), **vale a
> severidade de lá** — ela prevalece sobre esta escala. Ex.: *DOM em laço sem
> `DocumentFragment`* = **Média** (não Crítica); *busy-wait* = **Alta**;
> *`DatasetFactory.getDataset()` síncrono no cliente* = **Crítica**; *seletor
> repetido >3× sem cache* = **Média**.

| Severidade | Critério | Exemplos típicos |
|------------|----------|------------------|
| **Crítico** | Gargalo que trava a UI ou degrada gravemente sob uso normal | `DatasetFactory.getDataset()` síncrono no cliente (bloqueia a thread) |
| **Alto** | Custo significativo de renderização ou rede com impacto perceptível | Muitas requisições redundantes; carregar todo o conjunto de dados de uma vez sem paginação |
| **Médio** | Ineficiência que afeta escala/manutenção sem trava imediata | Seletores repetidos não cacheados; evento de alta frequência sem debounce/throttle |
| **Baixo** | Otimização menor de baixo impacto | Microajuste em concatenação; oportunidade pontual de delegação de evento |

## Procedimento

1. Identificar o tipo de artefato e, a partir do sintoma, os pontos suspeitos no código.
2. Percorrer os eixos de performance: DOM em laço, reflow/repaint, seletores repetidos, listeners/eventos de alta frequência, requisições redundantes, carga de dados, liberação de recursos.
3. Para cada gargalo, registrar um achado com localização, descrição, **severidade** e a **regra de contexto** correspondente (`conventions.md`, com a seção).
4. Recomendar a correção objetiva, apontando a skill `fluig-optimize-performance` para aplicação.
5. Consolidar os achados ordenados do mais grave ao menos grave.
6. Validar a revisão com o checklist abaixo antes de entregar.

## Saída Esperada

Um **relatório de revisão de performance**, com **Resumo** (contagem de achados
por severidade e avaliação geral), **Achados** agrupados por severidade (crítico
→ baixo; cada um com localização, descrição, severidade e a **regra de contexto
referenciada**) e **Recomendações** acionáveis, indicando a skill
`fluig-optimize-performance`. A forma de entrega segue a persona (ver
`conventions.md` › Saída do review por persona):

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

```javascript
// Código revisado (trecho)
items.forEach((item) => {
  list.insertAdjacentHTML('beforeend', `<li>${item.name}</li>`); // insere no DOM dentro do laço, item.name é dado local (não i18n)
});
```

```markdown
## Achados

### 🟡 Médio
- **DOM em laço — linhas 1-3:** inserção no DOM a cada iteração causa reflow repetido em listas grandes.
  - Regra: `conventions.md` › Classificação de performance frontend (review) — "Manipulação de DOM repetitiva em loop sem fragment" = **Média**.
  - Recomendação: montar os nós em um `DocumentFragment` e inserir uma única vez. Ver skill `fluig-optimize-performance`.
```

## Checklist de Validação

- [ ] Os eixos de performance foram percorridos (DOM, reflow, seletores, eventos, rede, carga de dados, recursos).
- [ ] Cada achado tem **severidade** atribuída conforme a escala (crítico/alto/médio/baixo).
- [ ] Cada achado **referencia a regra** do `conventions.md` (com a seção).
- [ ] O relatório está ordenado do mais grave ao menos grave.
- [ ] As recomendações são acionáveis e apontam a skill `fluig-optimize-performance`.
- [ ] A persona foi classificada (Passo 0) e emitida como `Persona: <Parceiro|Consultor> (motivo)`.
- [ ] **Consultor:** o relatório foi **gravado** em `review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo, sem cabeçalho de pré-review e sem menção à Store/App Review.
- [ ] **Parceiro:** o relatório abre por um **cabeçalho de pré-review** (não aprova, não substitui o App Review oficial — `partner-store-review-rules.md` [§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) e foi **gravado** em `pre-review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo (`partner-store-review-rules.md` [§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).
- [ ] A revisão não alterou o código além do eventual `.md` de relatório do Parceiro — apenas diagnosticou e recomendou.
