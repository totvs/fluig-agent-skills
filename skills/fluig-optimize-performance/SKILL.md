---
name: fluig-optimize-performance
description: Otimiza a performance de código frontend Fluig (manipulação de DOM, eventos, requisições e carga de dados) preservando o comportamento, a internacionalização e a compatibilidade com a plataforma. Use quando o desenvolvedor relatar lentidão, travamentos, reflows excessivos ou muitas requisições em um widget/Custom Element e pedir para otimizar um trecho ou arquivo.
argument-hint: o código/artefato frontend alvo a otimizar (trecho ou arquivo selecionado), idealmente com o sintoma observado
---

# Otimização de Performance de Frontend Fluig

Esta skill otimiza a performance de código frontend Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Objetivo

Otimizar, com responsabilidade única, a **performance de código frontend Fluig** — DOM, eventos, requisições e carga de dados — aplicando boas práticas públicas sem alterar o comportamento observável, a i18n nem a compatibilidade com a plataforma.

## Quando Usar

- Quando um widget ou Custom Element está **lento, travando ou com reflows/repaints excessivos**.
- Quando há **muitos listeners** de evento ou eventos de alta frequência (scroll, resize, input) sem controle.
- Quando o código faz **muitas requisições** ou carrega dados desnecessários de uma só vez.
- Antes de evoluir um artefato existente, para eliminar gargalos de renderização e de rede.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho ou arquivo frontend a otimizar (widget ou Custom Element) | sim |
| Sintoma de performance observado | O que foi notado (ex.: lentidão ao renderizar lista, travamento no scroll, muitas chamadas REST) | não |
| Contexto do artefato | Tipo do artefato em que o código roda e onde o gargalo aparece | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — manipulação de DOM, ES6+ e `async/await`, REST a endpoints internos via `WCMAPI`/`FLUIGC.ajax`, bindings de widget, i18n, segurança e **CSS responsivo e funções CSS modernas** (`calc`/`var`/`rgba`/`hsla`/`min`/`max`/`clamp`/`minmax`, media e container queries).
- [style-guide.md](../../context/style-guide.md) — reutilização de componentes/helpers/grid do Fluig Style Guide em vez de soluções próprias mais custosas.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a otimização; o detalhe está no contexto. Boas práticas públicas e genéricas:

- **Agrupar alterações de DOM** em uma única operação; montar nós em um `DocumentFragment` e inserir de uma vez → ver `conventions.md`.
- **Minimizar reflow/repaint:** evitar ler e escrever layout de forma intercalada dentro de laços.
- **Evitar seletores repetidos:** cachear a referência do elemento em uma variável em vez de reconsultar o DOM.
- **Event delegation:** um listener no container em vez de muitos listeners individuais → ver `conventions.md` (bindings de widget).
- **Debounce/throttle** em eventos de alta frequência (scroll, resize, input/keyup).
- **Carregar dados sob demanda** (paginação/lazy load) e tratar o assíncrono com `async/await` em `try/catch` → ver `conventions.md`.
- **REST a endpoints internos** via `WCMAPI`/`FLUIGC.ajax` (nunca `fetch`/`$.ajax` direto) → ver `conventions.md`.
- **Reutilizar componentes** do Style Guide em vez de recriar comportamentos custosos → ver `style-guide.md`.
- **CSS responsivo e funções CSS modernas:** preferir funções nativas (`calc`/`var`/`rgba`/`hsla`/`min`/`max`/`clamp`/`minmax`) e media/container queries para layouts fluidos e eficientes em vez de valores fixos repetidos → ver `conventions.md` (CSS responsivo e moderno).
- **Liberar recursos:** remover listeners/timers ao destruir o widget para evitar vazamentos.

## Procedimento

1. Medir/identificar o gargalo a partir do sintoma e da leitura do código (DOM em laço, seletores repetidos, excesso de listeners, requisições redundantes, evento de alta frequência sem controle).
2. Selecionar a otimização adequada do catálogo acima para cada gargalo encontrado.
3. Aplicar a otimização **preservando o comportamento observável** e a i18n (`${i18n.getTranslation('chave')}`).
4. Garantir que chamadas REST internas continuem via `WCMAPI`/`FLUIGC.ajax` e que o assíncrono seja tratado com `try/catch`.
5. Validar o resultado com o checklist abaixo antes de entregar, anotando as otimizações aplicadas.

## Saída Esperada

Código otimizado, com o **comportamento original preservado** e uma nota curta das otimizações aplicadas (qual gargalo foi tratado e como), mantendo i18n e compatibilidade com a plataforma.

## Exemplo de Uso

Trecho ilustrativo: agrupar escritas de DOM com `DocumentFragment` em vez de inserir item a item.

```javascript
// Antes — insere no DOM dentro do laço (reflow a cada iteração)
const list = document.querySelector(`#MyWidget_${this.instanceId} .items`);
items.forEach((item) => {
  list.insertAdjacentHTML('beforeend', `<li>${item.name}</li>`);
});
```

```javascript
// Depois — monta em DocumentFragment e insere uma única vez
const list = document.querySelector(`#MyWidget_${this.instanceId} .items`);
const fragment = document.createDocumentFragment();
items.forEach((item) => {
  const li = document.createElement('li');
  li.textContent = item.name;
  fragment.appendChild(li);
});
list.appendChild(fragment);
```

## Checklist de Validação

- [ ] Alterações de DOM agrupadas (ex.: `DocumentFragment`); sem inserções repetidas em laço.
- [ ] Sem seletores redundantes — referências de elementos cacheadas.
- [ ] Eventos de alta frequência com debounce/throttle e/ou delegação de eventos.
- [ ] Assíncrono tratado com `async/await` em `try/catch`; dados carregados sob demanda.
- [ ] Chamadas REST a endpoints internos via `WCMAPI`/`FLUIGC.ajax`.
- [ ] Comportamento original e i18n preservados.
