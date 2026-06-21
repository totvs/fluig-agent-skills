---
name: scaffolding-form
description: Gera o esqueleto de um Form (formulário eletrônico) do Fluig — a definição dos campos, a view/markup do formulário e o arquivo de eventos com os handlers de ciclo de vida e de campos para validação e regras, aplicando as convenções oficiais. Use quando o desenvolvedor pedir para criar/iniciar um novo formulário do Fluig a partir de um nome ou propósito e seus campos.
argument-hint: nome e/ou propósito do formulário, campos e regras de validação (ex.: "formulário de solicitação de férias com nome, data de início e dias")
---

# Scaffolding de Form (Formulário eletrônico)

Esta skill gera o esqueleto de um Form do Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Objetivo

Produzir, com responsabilidade única, o **esqueleto de um Form (formulário eletrônico)** do Fluig: a definição dos campos, a view/markup do formulário e o arquivo de eventos com os **handlers de ciclo de vida e de campos** que implementam validação e regras de preenchimento, já em conformidade com as convenções públicas.

## Quando Usar

- Ao criar um **novo formulário eletrônico** do Fluig a partir do zero.
- Quando o desenvolvedor fornece um nome/propósito e a lista de campos e quer um ponto de partida correto (campos + view + eventos) seguindo as convenções oficiais.
- Quando é preciso garantir, desde o início, validação/sanitização da entrada do usuário, i18n nos textos visíveis e código em ES6+.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Nome do formulário | Identificador em Inglês do formulário (ex.: `VacationRequest`) | sim |
| Campos | Lista de campos do formulário (nome, tipo e se é obrigatório) | sim |
| Regras de validação | Regras de preenchimento/consistência por campo ou para o formulário | não |
| Chaves i18n | Chaves de tradução para rótulos e mensagens visíveis | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [architecture.md](../../context/architecture.md) — modelo conceitual do **Form** e seus **pontos de extensão públicos**: handlers que reagem aos **eventos de ciclo de vida do formulário** (ex.: carga e validação) e aos **eventos de campos** (validação e reação a mudanças). Veja também a seção "Estrutura de um Projeto Fluig Studio": o form fica em `forms/` e seus eventos em `forms/events/`.
- [conventions.md](../../context/conventions.md) — i18n (`${i18n.getTranslation('chave')}`), JavaScript em **ES6+** e **segurança** (validar/sanitizar a entrada do usuário com `WCMAPI.validateXSS`/`DOMPurify.sanitize`).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- O desenvolvedor implementa **handlers nos eventos públicos do formulário** — eventos de ciclo de vida (ex.: carga e validação) e eventos de campos — onde injeta as regras de validação e preenchimento → ver `architecture.md`.
- Use **somente** pontos de extensão públicos e oficiais do formulário; quando o nome exato de um evento não for confirmado como público, descreva o comportamento de forma genérica em vez de inventar nomes → ver `architecture.md`.
- JavaScript dos handlers em **ES6+** (`const`/`let`, arrow functions, template literals); evitar `var` → ver `conventions.md`.
- Todo texto visível (rótulos, mensagens de validação) via i18n: `${i18n.getTranslation('chave')}`; nunca strings fixas → ver `conventions.md`.
- **Validar e sanitizar** toda entrada do usuário antes de uso/persistência (`WCMAPI.validateXSS`, `DOMPurify.sanitize`); tratar a entrada como não confiável → ver `conventions.md`.

## Procedimento

1. Definir o nome do formulário (em Inglês) e os **campos** a partir da entrada (nome, tipo e obrigatoriedade de cada campo).
2. Criar a pasta do formulário e a **view/markup** do formulário com os campos definidos, aplicando i18n nos rótulos.
3. Criar o **arquivo de eventos** e implementar os **handlers dos eventos públicos** do formulário: ciclo de vida (ex.: carga e validação do formulário) e eventos de campos (validação e regras de preenchimento).
4. Aplicar **i18n** em todo texto visível — rótulos de campos e mensagens de validação — com `${i18n.getTranslation('chave')}`.
5. **Sanitizar/validar** a entrada do usuário nos handlers antes de usá-la ou persisti-la (`WCMAPI.validateXSS`/`DOMPurify.sanitize`).
6. Validar o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Esqueleto de formulário pronto para evoluir, contendo:

- A **definição dos campos** e a **view/markup** do formulário, com rótulos via i18n.
- O **arquivo de eventos** com os handlers de ciclo de vida e de campos implementando validação e regras de preenchimento, em ES6+.
- Entrada do usuário validada/sanitizada nos handlers.

Tudo em conformidade com `context/architecture.md` e `context/conventions.md`.

## Exemplo de Uso

Use `examples/form/` como referência mínima (arquivo de eventos do formulário) que demonstra handlers de evento, validação de campo e i18n. Trate-o como trecho de referência, não como projeto completo.

## Checklist de Validação

- [ ] Os **handlers** estão implementados nos eventos públicos do formulário (ciclo de vida e campos).
- [ ] Todo texto visível usa `${i18n.getTranslation('...')}` — sem strings fixas.
- [ ] A entrada do usuário é validada/sanitizada (`WCMAPI.validateXSS`/`DOMPurify.sanitize`).
- [ ] JavaScript em ES6+ (sem `var`; `const`/`let`, arrow functions, template literals).
