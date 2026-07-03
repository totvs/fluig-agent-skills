---
name: fluig-review-performance
description: Revisa a performance de código frontend Fluig (manipulação de DOM, eventos de alta frequência, requisições REST e carga de dados) e produz achados classificados por severidade, cada um referenciando a regra correspondente do arquivo de contexto. Use quando o desenvolvedor pedir uma revisão focada em performance de um widget/Custom Element antes de merge, sem reescrever o código.
argument-hint: o código/arquivo frontend alvo da revisão de performance (trecho ou arquivo selecionado), idealmente com o sintoma observado
---

# Revisão de Performance de Frontend Fluig

Esta skill revisa a performance de código frontend Fluig e emite achados por severidade; ela **não duplica** convenções — o arquivo de `context/` é a fonte de verdade, referenciada abaixo. A skill **não reescreve** o código.

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

- [conventions.md](../../context/conventions.md) — manipulação de DOM, ES6+ e `async/await`, REST a endpoints internos via `WCMAPI`/`FLUIGC.ajax`, bindings de widget e carga de dados sob demanda.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a revisão; o detalhe está no contexto. Cada achado deve citar a regra de origem.

- **Agrupar alterações de DOM** (ex.: `DocumentFragment`) em vez de inserir item a item em laço → ver `conventions.md`.
- **Minimizar reflow/repaint:** não intercalar leitura e escrita de layout dentro de laços.
- **Cachear seletores:** evitar reconsultar o DOM repetidamente.
- **Event delegation:** um listener no container em vez de muitos listeners individuais → ver `conventions.md`.
- **Debounce/throttle** em eventos de alta frequência (scroll, resize, input/keyup).
- **Carregar dados sob demanda** (paginação/lazy load); tratar assíncrono com `async/await` em `try/catch` → ver `conventions.md`.
- **REST a endpoints internos** via `WCMAPI`/`FLUIGC.ajax` (nunca `fetch`/`$.ajax` direto); evitar requisições redundantes → ver `conventions.md`.
- **Liberar recursos:** remover listeners/timers ao destruir o widget (evitar vazamentos).

## Escala de Severidade

Classifique **cada achado** em um destes níveis:

| Severidade | Critério | Exemplos típicos |
|------------|----------|------------------|
| **Crítico** | Gargalo que trava a UI ou degrada gravemente sob uso normal | Reflow em laço sobre listas grandes; loop síncrono bloqueando a thread; vazamento de listeners acumulando a cada render |
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

Um **relatório de revisão de performance** contendo:

- **Resumo** com a contagem de achados por severidade e a avaliação geral.
- **Achados** agrupados por severidade (crítico → baixo); cada um com localização, descrição, severidade e a **regra de contexto referenciada**.
- **Recomendações** acionáveis por achado, indicando a skill `fluig-optimize-performance` para aplicar a correção.

A skill **não altera** o código — apenas diagnostica e recomenda.

## Exemplo de Uso

Trecho revisado e achado correspondente.

```javascript
// Código revisado (trecho)
items.forEach((item) => {
  list.insertAdjacentHTML('beforeend', `<li>${item.name}</li>`); // insere no DOM dentro do laço
});
```

```markdown
## Achados

### 🔴 Crítico
- **DOM em laço — linhas 1-3:** inserção no DOM a cada iteração causa reflow repetido em listas grandes.
  - Regra: `conventions.md` › CSS/DOM e manipulação eficiente.
  - Recomendação: montar os nós em um `DocumentFragment` e inserir uma única vez. Ver skill `fluig-optimize-performance`.
```

## Checklist de Validação

- [ ] Os eixos de performance foram percorridos (DOM, reflow, seletores, eventos, rede, carga de dados, recursos).
- [ ] Cada achado tem **severidade** atribuída conforme a escala (crítico/alto/médio/baixo).
- [ ] Cada achado **referencia a regra** do `conventions.md` (com a seção).
- [ ] O relatório está ordenado do mais grave ao menos grave.
- [ ] As recomendações são acionáveis e apontam a skill `fluig-optimize-performance`.
- [ ] A revisão não alterou o código — apenas diagnosticou e recomendou.
