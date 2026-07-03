---
name: fluig-validate-security
description: Sanitiza entradas e previne vulnerabilidades de frontend Fluig (XSS, innerHTML inseguro, eval/new Function com dados dinâmicos, escape FreeMarker ?html/?js_string, cuidado com Mustache triple-stache {{{ }}}, REST interna via WCMAPI/FLUIGC.ajax) usando APIs públicas como WCMAPI.validateXSS e DOMPurify.sanitize (preferindo-as à API legada FLUIGC.utilities.preventXSS). Use quando precisar validar/sanitizar código client-side de customização que manipula entrada do usuário no DOM, na persistência ou na exibição.
argument-hint: 'o código frontend alvo a validar/sanitizar (ex.: trecho que insere input do usuário no DOM)'
---

# Validação de Segurança (Sanitização e Prevenção de XSS)

Esta skill sanitiza entradas e previne vulnerabilidades no frontend de customização Fluig; ela **não duplica** convenções — o arquivo de `context/` é a fonte de verdade, referenciada abaixo.

## Objetivo

Com responsabilidade única, **sanitizar entradas e prevenir vulnerabilidades** no frontend de customização Fluig (XSS, uso inseguro de `innerHTML`, `eval()`/`new Function()` com dados dinâmicos, interpolações sem escape em FreeMarker, uso de Mustache triple-stache `{{{ }}}` sem sanitização e chamadas REST internas), aplicando exclusivamente as APIs públicas e oficiais — preservando o comportamento do código.

## Quando Usar

- Ao manipular **entrada do usuário** que será inserida no DOM, persistida ou exibida.
- Quando o código usa `innerHTML` com conteúdo derivado de dados do usuário.
- Quando há `eval()`/`new Function()` recebendo dados dinâmicos.
- Quando dados dinâmicos são interpolados em templates FreeMarker sem escape.
- Quando o código renderiza HTML via Mustache com triple-stache `{{{ }}}` (ou `{{& }}`), que desabilita o escape automático.
- Ao fazer chamadas REST internas, que devem usar `WCMAPI`/`FLUIGC.ajax` (e não `fetch()`/`$.ajax()` direto).
- Antes de enviar (POST/PUT) ou ao receber/exibir (GET) dados do usuário.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho de frontend (JS de widget/Custom Element, FreeMarker) a validar/sanitizar | sim |
| Origem dos dados do usuário | De onde vêm os dados não confiáveis (formulário, query string, resposta de API, parâmetros) | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — seção **Segurança (APIs públicas)**: distinção entre `WCMAPI.validateXSS` (reduz a texto puro) e `DOMPurify.sanitize` (mantém HTML válido), depreciação de `FLUIGC.utilities.preventXSS`/`decodeHTML`, `textContent` vs `innerHTML`, escape FreeMarker (`${value?html}`, `${value?js_string}`), cautela com o triple-stache `{{{ }}}` do Mustache, proibição de `eval()`/`new Function()` e sanitização na entrada e na exibição.
- [conventions.md](../../context/conventions.md) — seção **Chamadas REST internas**: usar `FLUIGC.ajax` (ES6+) ou `WCMAPI.Read`/`Create`/`Update`/`Delete` (legado) em vez de `fetch()`/`$.ajax()` direto para endpoints internos.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a tarefa; o detalhe está no contexto:

- Tratar **toda entrada do usuário como não confiável** antes de qualquer uso no DOM ou persistência → ver `conventions.md`.
- Sanitizar com `DOMPurify.sanitize` quando precisar **manter HTML válido** sem código malicioso → ver `conventions.md`.
- Sanitizar com `WCMAPI.validateXSS` quando quiser **converter o valor em texto puro** (elimina XSS) → ver `conventions.md`.
- Preferir `textContent` a `innerHTML`; só usar `innerHTML` com conteúdo já sanitizado por `DOMPurify.sanitize` → ver `conventions.md`.
- Escapar dados dinâmicos em FreeMarker: `${value?html}` (e `${value?js_string}` para JS inline) → ver `conventions.md`.
- Usar Mustache triple-stache `{{{ }}}` (ou `{{& }}`) **apenas** com conteúdo já sanitizado por `DOMPurify`, pois ele desabilita o escape automático → ver `conventions.md`.
- **Nunca** usar `eval()` nem `new Function()` com dados dinâmicos → ver `conventions.md`.
- Para REST interna, usar `FLUIGC.ajax`/`WCMAPI` em vez de `fetch()`/`$.ajax()` direto → ver `conventions.md`.
- Sanitizar tanto na **entrada** (POST/PUT) quanto na **exibição** (GET) → ver `conventions.md`.

## Procedimento

1. Localizar os pontos onde **entrada do usuário** entra no DOM, na persistência ou na exibição (atribuições a `innerHTML`, interpolações FreeMarker, chamadas dinâmicas).
2. Aplicar a sanitização adequada com a API pública correta: `DOMPurify.sanitize` para preservar HTML válido; `WCMAPI.validateXSS` para reduzir a texto puro.
3. Substituir usos inseguros de `innerHTML` por `textContent` (quando texto basta) ou por conteúdo sanitizado com `DOMPurify.sanitize`.
4. Escapar dados dinâmicos em FreeMarker com `${value?html}` (e `${value?js_string}` em contexto JS inline); ao usar Mustache, garantir que conteúdo em triple-stache `{{{ }}}` esteja previamente sanitizado por `DOMPurify`.
5. Remover `eval()`/`new Function()` que recebam dados dinâmicos, substituindo por lógica explícita e segura.
6. Substituir chamadas REST internas feitas com `fetch()`/`$.ajax()` direto por `FLUIGC.ajax`/`WCMAPI` (APIs públicas de cliente).
7. Garantir sanitização **na entrada e na exibição** dos dados do usuário.
8. Validar o resultado com o checklist abaixo, confirmando que o comportamento foi preservado.

## Saída Esperada

Código com:

- Entradas do usuário **sanitizadas** via APIs públicas (`DOMPurify.sanitize` e/ou `WCMAPI.validateXSS`).
- **Sem vetores de XSS**: sem `innerHTML` inseguro, sem `eval()`/`new Function()` com dados dinâmicos e sem Mustache triple-stache `{{{ }}}` com conteúdo não sanitizado.
- Dados dinâmicos **escapados** em FreeMarker.
- Chamadas REST internas via `FLUIGC.ajax`/`WCMAPI` (sem `fetch()`/`$.ajax()` direto).
- **Comportamento preservado** em relação ao original.

Tudo em conformidade com `context/conventions.md`.

## Exemplo de Uso

Antes (inseguro — input do usuário direto em `innerHTML`):

```javascript
// ❌ vetor de XSS: userInput não confiável vai direto ao DOM como HTML
container.innerHTML = userInput;
```

Depois (texto puro com `textContent`, ou HTML sanitizado com `DOMPurify.sanitize`):

```javascript
// ✅ quando basta texto: sem interpretação de HTML
container.textContent = userInput;

// ✅ quando HTML é necessário: sanitizar antes de inserir
container.innerHTML = DOMPurify.sanitize(userInput);

// ✅ quando o objetivo é eliminar qualquer HTML, reduzindo a texto puro
const safeText = WCMAPI.validateXSS(userInput);
```

## Checklist de Validação

- [ ] Toda entrada do usuário é sanitizada com `DOMPurify.sanitize` e/ou `WCMAPI.validateXSS`.
- [ ] Não há `innerHTML` inseguro (usa `textContent` ou conteúdo sanitizado).
- [ ] Não há `eval()` nem `new Function()` com dados dinâmicos.
- [ ] Dados dinâmicos em FreeMarker estão escapados (`${value?html}` / `${value?js_string}`).
- [ ] Mustache triple-stache `{{{ }}}` (ou `{{& }}`) só é usado com conteúdo sanitizado por `DOMPurify`.
- [ ] Chamadas REST internas usam `FLUIGC.ajax`/`WCMAPI`, não `fetch()`/`$.ajax()` direto.
- [ ] Sanitização aplicada tanto na entrada (POST/PUT) quanto na exibição (GET).
- [ ] Comportamento do código preservado após a sanitização.
