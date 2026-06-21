# Exemplo: Evento de Processo BPM (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos
- `process-event.example.js` — Evento de processo BPM server-side: handlers em pontos definidos do ciclo de vida (`beforeStateEntry(sequenceId)`, `afterStateEntry(sequenceId)`, `afterTaskComplete(colleagueId, nextSequenceId, userList)`) que injetam regra de negócio via API pública `hAPI` (ex.: `hAPI.getCardValue(...)`, `hAPI.setCardValue(...)`). Em ES6+.

## Pontos-chave demonstrados
- Funções de evento nomeadas associadas a **pontos públicos do ciclo de vida** do processo/workflow.
- Regra de negócio injetada **dentro** da função de evento, sem alterar o motor de processos.
- Manipulação dos dados do processo via **API pública** `hAPI` (`getCardValue` / `setCardValue`).
- Validação de dados do processo antes de prosseguir no fluxo.
- Execução server-side, sem acesso a componentes internos do servidor.
- JavaScript server-side em ES6+ (`const`/`let`, arrow functions, template literals).

> Fonte de verdade: `context/architecture.md` e `context/technologies.md`.
