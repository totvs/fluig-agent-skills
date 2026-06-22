# Exemplo: Comunicação por eventos (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos
- `events.example.js` — Comunicação entre artefatos de cliente por eventos: um Web Component dispara um `CustomEvent` com payload em `detail` e `bubbles: true` em resposta a uma ação; outro artefato escuta via `addEventListener` lendo `ev.detail`. Inclui uma nota sobre o caso SuperWidget (`WCMAPI.fireEvent` para disparar e `WCMAPI.addListener` para escutar). Em ES6+.

## Pontos-chave demonstrados
- Disparo de evento com `dispatchEvent(new CustomEvent(...))`, com payload em `detail`.
- Uso de `bubbles: true` para o evento subir pela árvore do DOM (o pai escuta sem referência direta ao filho).
- Escuta via `addEventListener`, lendo o payload de `ev.detail`.
- Nomes de evento em **kebab-case** (ex.: `document-selected`, `task-completed`).
- Caso SuperWidget: `WCMAPI.fireEvent(eventName, data)` para disparar e `WCMAPI.addListener(context, eventName, callback, listenerId)` para escutar.
- Texto visível ao usuário sempre via i18n (`${i18n.getTranslation('...')}`).

> Fonte de verdade: `context/conventions.md` (seção "Comunicação entre artefatos (eventos)").
