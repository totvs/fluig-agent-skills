# Constituição da Plataforma Fluig

> Regras técnicas **invioláveis** que se aplicam a **todas as personas**
> (Parceiro e Consultor) e a todo artefato de frontend (widget, layout, Web
> Component, wizard). Elas existem por limitações da própria plataforma — não são
> preferência de estilo nem regra da Store. A persona é resolvida em
> [persona-routing.md](persona-routing.md); o detalhe de cada regra vive em
> [conventions.md](conventions.md), que este arquivo apenas resume.

## Visão Geral

| # | Regra | Detalhe (fonte de verdade) |
|---|-------|----------------------------|
| 1 | i18n em `.js` e `.ftl` = mesma sintaxe `${i18n.getTranslation('key')}` (fonte oficial TDN) | [conventions.md — i18n — Widgets e Layouts](conventions.md#internacionalização-i18n--widgets-e-layouts) |
| 2 | HTTP = `fetch()` + `async/await` + `try/catch` para qualquer endpoint; nunca síncrono | [conventions.md — Chamadas REST e Integrações](conventions.md#chamadas-rest-e-integrações) |
| 3 | Dentro de `SuperWidget.extend({})`, métodos sempre como `nome: function() {}` | [conventions.md — Sintaxe de métodos dentro de `.extend({})`](conventions.md#sintaxe-de-métodos-dentro-de-extend) |

Quando uma skill, um exemplo ou um pedido do desenvolvedor conflitar com estas
três regras, **a constituição prevalece**.

## 1. Internacionalização em arquivos `.js`

- Em arquivos `.js` **e** `.ftl` de widgets e layouts, use **sempre**
  `${i18n.getTranslation('key')}`. A expressão é resolvida server-side pelo
  FreeMarker, antes de o `.js` chegar ao navegador. Em `.js` minificado pelo
  Closure Compiler, evite template literals (backticks) quando usar i18n — prefira
  concatenação clássica (`+`) para evitar conflitos confirmados pela TOTVS (TDN
  "Closure Compiler Maven Plugin"). Formulários/processos usam mecanismo próprio
  (`i18n.translate("chave")`).
- Detalhe completo, incluindo exemplos `✅`/`❌` e a cautela da TOTVS:
  [conventions.md — i18n — Widgets e Layouts](conventions.md#internacionalização-i18n--widgets-e-layouts).

## 2. Integrações HTTP

- Para **qualquer** chamada no **cliente** (navegador) — ao próprio domínio do
  Fluig ou a terceiros — use `fetch()` com `async/await` e `try/catch`. **Nunca**
  use `async: false` nem requisição síncrona. A decisão correta não é "interno
  vs externo", mas sim: (1) quem recebe a chamada e (2) a chamada exige
  credencial? Resumo:
  - **Domínio do próprio Fluig**: `fetch()` client-side com URL via
    `WCMAPI.getServerURL()` — sessão do usuário autentica automaticamente.
  - **Terceiro sem autenticação**: `fetch()` client-side direto é seguro.
  - **Terceiro que exige credencial**: **NUNCA** client-side. Centralizar via
    **Cadastro de Serviços** (`fluigAPI.getAuthorizeClientService()` +
    `invoke(...)`), chamado de código **server-side** (dataset ou servicetask).
- Detalhe completo, incluindo exemplos `✅`/`❌`:
  [conventions.md — Chamadas REST e Integrações](conventions.md#chamadas-rest-e-integrações).

## 3. Sintaxe de métodos no `SuperWidget.extend({})`

- Dentro do objeto passado a `SuperWidget.extend({})`, declare os métodos
  **sempre** como `nomeDoMetodo: function() {}` (ou
  `nomeDoMetodo: async function() {}`), capturando o contexto com
  `var ctx = this;`. **Nunca** use method shorthand do ES6 (`nomeDoMetodo() {}`)
  nem arrow function como método (`nomeDoMetodo: () => {}`). Fora do
  `.extend({})`, o ES6+ segue como padrão.
- Detalhe completo, incluindo exemplos `✅`/`❌`:
  [conventions.md — Sintaxe de métodos dentro de `.extend({})`](conventions.md#sintaxe-de-métodos-dentro-de-extend).

## Referências Cruzadas

- Detalhe das regras: [conventions.md](conventions.md).
- Tecnologias públicas (ES6+, FreeMarker, Rhino): [technologies.md](technologies.md).
- Classificação da persona antes de gerar, modernizar ou revisar:
  [persona-routing.md](persona-routing.md).
