---
name: scaffolding-process-event
description: Gera o esqueleto de eventos de processo BPM do Fluig — o arquivo JavaScript server-side com a(s) função(ões) de evento que a plataforma invoca em pontos definidos do ciclo de vida do processo/workflow, para injetar regras de negócio via API pública sem alterar o motor. Use quando o desenvolvedor pedir para criar/iniciar a customização de um evento de processo a partir de um ponto do ciclo de vida e uma regra de negócio.
argument-hint: qual ponto do ciclo de vida do processo e a regra a implementar (ex.: "ao entrar na etapa de aprovação, preencher o campo status")
---

# Scaffolding de Evento de Processo (BPM, server-side)

Esta skill gera o esqueleto de eventos de processo BPM do Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Objetivo

Produzir, com responsabilidade única, o **esqueleto de handlers de eventos de processo BPM** do Fluig: o arquivo JavaScript executado no servidor com a(s) **função(ões) de evento** que a plataforma invoca em **pontos definidos do ciclo de vida** do processo/workflow, já com o ponto para **injetar a regra de negócio** usando **somente a API pública de eventos de processo**, sem alterar o motor de processos.

## Quando Usar

- Ao iniciar a **customização de um evento de processo BPM** a partir do zero, para injetar regra de negócio em um momento do fluxo (ex.: entrada/saída de etapa, criação/conclusão de tarefa, criação/fim do processo).
- Quando o desenvolvedor fornece o **ponto do ciclo de vida** alvo e a **regra de negócio** a aplicar e quer um ponto de partida correto (função de evento + estrutura) seguindo as convenções oficiais.
- Quando é preciso garantir, desde o início, o uso exclusivo da API pública de eventos de processo, sem tocar em componentes internos da plataforma.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Ponto do ciclo de vida alvo | Momento do fluxo em que a regra deve agir (ex.: entrada de etapa, conclusão de tarefa, criação do processo) | sim |
| Regra de negócio | Comportamento a injetar no evento (validação, preenchimento, desvio de fluxo) | sim |
| Dados do processo | Campos/dados do processo manipulados pela regra (ex.: campos do formulário associado) | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [architecture.md](../../context/architecture.md) — modelo conceitual do **Evento de processo (BPM)**: funções server-side disparadas pela plataforma em **pontos definidos do ciclo de vida** do processo/workflow; o desenvolvedor implementa **handlers nos pontos de extensão públicos** para injetar regra de negócio sem alterar o motor. Veja também a seção "Estrutura de um Projeto Fluig Studio": os scripts de evento ficam em `workflow/scripts/` (diagramas em `workflow/diagrams/`, literais em `workflow/literals/`).
- [technologies.md](../../context/technologies.md) — **runtime público de scripting server-side**: eventos de processo são escritos em **JavaScript executado no servidor sobre o motor Mozilla Rhino** (base **ES5**, com suporte apenas parcial a ES6+), interagindo apenas com a API pública de seu contexto (sem acesso a componentes internos do servidor). Veja a seção "Runtime Rhino: sintaxe rígida (não é ES6+)" para as restrições de sintaxe e a seção de **interoperabilidade com Java**.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- Implemente as **funções de evento** nos **pontos públicos do ciclo de vida** do processo que a plataforma invoca — funções de evento nomeadas associadas a momentos do fluxo → ver `architecture.md`.
- Use **SOMENTE a API pública de eventos de processo**: manipule os dados do processo pelo helper público `hAPI` (ex.: `hAPI.getCardValue(...)`, `hAPI.setCardValue(...)`, `hAPI.transferTask(...)`) → ver `architecture.md`.
- **Injete a regra de negócio dentro da função de evento**, sem alterar o motor de processos → ver `architecture.md`.
- Código **server-side no motor Rhino** (base **ES5**, **não** ES6+): use `var` e `function` tradicionais, concatene strings com `+` e **evite** arrow functions, template literals, `let`/`const`, destructuring, classes ES6 e `Promise`/`async`/`await`; **sem acesso a componentes internos** do servidor. Quando útil, é possível usar **interop com Java** (`Packages.*`, `importPackage`/`importClass`) → ver `technologies.md`.
- Se o nome exato de uma função de evento/método não puder ser confirmado como público, descreva o comportamento de forma genérica (uma função de evento que a plataforma invoca em um ponto definido do ciclo de vida) em vez de inventar → ver `architecture.md`.

## Procedimento

1. Identificar o **ponto do ciclo de vida** alvo a partir da entrada (ex.: entrada/saída de etapa, criação/conclusão de tarefa, criação/fim do processo).
2. Criar o arquivo JavaScript do evento e implementar a **função de evento correspondente** ao ponto identificado (por exemplo: `beforeStateEntry(sequenceId)`, `afterStateEntry(sequenceId)`, `beforeStateLeave(sequenceId)`, `afterStateLeave(sequenceId)`, `beforeTaskCreate(...)`, `afterTaskComplete(colleagueId, nextSequenceId, userList)`, `afterProcessCreate(...)`).
3. **Aplicar a regra de negócio** dentro da função usando a **API pública** — manipular os dados do processo via `hAPI` (`getCardValue`/`setCardValue` etc.) conforme necessário.
4. **Validar** o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Esqueleto de evento de processo pronto para evoluir, contendo:

- O **arquivo JavaScript** server-side com a(s) **função(ões) de evento públicas** correspondente(s) ao(s) ponto(s) do ciclo de vida escolhido(s).
- A **regra de negócio** injetada dentro da função, manipulando os dados do processo via API pública (`hAPI`), sem acesso a componentes internos.
- Código server-side compatível com o **motor Rhino** (base **ES5**, não ES6+), podendo usar interop com Java quando necessário.

Tudo em conformidade com `context/architecture.md` e `context/technologies.md`.

## Exemplo de Uso

Use `examples/process-event/` como referência mínima (arquivo JavaScript do evento) que demonstra uma função de evento em um ponto do ciclo de vida do processo e a aplicação da regra de negócio via API pública (`hAPI`). Trate-o como trecho de referência, não como projeto completo.

## Checklist de Validação

- [ ] A **função de evento** está implementada no **ponto correto** do ciclo de vida do processo.
- [ ] A regra de negócio usa **somente a API pública** de eventos de processo (`hAPI`), sem acesso a componentes internos.
- [ ] Código server-side compatível com o **motor Rhino** (base **ES5**): `var`/`function` tradicionais, sem arrow functions, template literals, `let`/`const` ou outros recursos ES6+ não suportados.
