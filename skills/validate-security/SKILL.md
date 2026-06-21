---
name: validate-security
description: Sanitiza entradas e previne vulnerabilidades de frontend Fluig (XSS, innerHTML inseguro, eval com dados dinâmicos) usando APIs públicas como WCMAPI.validateXSS e DOMPurify.sanitize. Use quando precisar validar/sanitizar código client-side de customização que manipula entrada do usuário no DOM, na persistência ou na exibição.
argument-hint: o código frontend alvo a validar/sanitizar (ex.: trecho que insere input do usuário no DOM)
---

# Validação de Segurança (Sanitização e Prevenção de XSS)

Esta skill sanitiza entradas e previne vulnerabilidades no frontend de customização Fluig; ela **não duplica** convenções — o arquivo de `context/` é a fonte de verdade, referenciada abaixo.

## Objetivo

Com responsabilidade única, **sanitizar entradas e prevenir vulnerabilidades** no frontend de customização Fluig (XSS, uso inseguro de `innerHTML`, `eval()`/`new Function()` com dados dinâmicos), aplicando exclusivamente as APIs públicas e oficiais — preservando o comportamento do código.

## Quando Usar

- Ao manipular **entrada do usuário** que será inserida no DOM, persistida ou exibida.
- Quando o código usa `innerHTML` com conteúdo derivado de dados do usuário.
- Quando há `eval()`/`new Function()` recebendo dados dinâmicos.
- Quando dados dinâmicos são interpolados em templates FreeMarker sem escape.
- Antes de enviar (POST/PUT) ou ao receber/exibir (GET) dados do usuário.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho de frontend (JS de widget/Custom Element, FreeMarker) a validar/sanitizar | sim |
| Origem dos dados do usuário | De onde vêm os dados não confiáveis (formulário, query string, resposta de API, parâmetros) | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — seção **Segurança (APIs públicas)**: `WCMAPI.validateXSS`, `DOMPurify.sanitize`, `textContent` vs `innerHTML`, escape FreeMarker (`${value?html}`, `${value?js_string}`), proibição de `eval()`/`new Function()` e sanitização na entrada e na exibição.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a tarefa; o detalhe está no contexto:

- Tratar **toda entrada do usuário como não confiável** antes de qualquer uso no DOM ou persistência → ver `conventions.md`.
- Sanitizar com `DOMPurify.sanitize` quando precisar **manter HTML válido** sem código malicioso → ver `conventions.md`.
- Sanitizar com `WCMAPI.validateXSS` quando quiser **converter o valor em texto puro** (elimina XSS) → ver `conventions.md`.
- Preferir `textContent` a `innerHTML`; só usar `innerHTML` com conteúdo já sanitizado por `DOMPurify.sanitize` → ver `conventions.md`.
- Escapar dados dinâmicos em FreeMarker: `${value?html}` (e `${value?js_string}` para JS inline) → ver `conventions.md`.
- **Nunca** usar `eval()` nem `new Function()` com dados dinâmicos → ver `conventions.md`.
- Sanitizar tanto na **entrada** (POST/PUT) quanto na **exibição** (GET) → ver `conventions.md`.

## Procedimento

1. Localizar os pontos onde **entrada do usuário** entra no DOM, na persistência ou na exibição (atribuições a `innerHTML`, interpolações FreeMarker, chamadas dinâmicas).
2. Aplicar a sanitização adequada com a API pública correta: `DOMPurify.sanitize` para preservar HTML válido; `WCMAPI.validateXSS` para reduzir a texto puro.
3. Substituir usos inseguros de `innerHTML` por `textContent` (quando texto basta) ou por conteúdo sanitizado com `DOMPurify.sanitize`.
4. Escapar dados dinâmicos em FreeMarker com `${value?html}` (e `${value?js_string}` em contexto JS inline).
5. Remover `eval()`/`new Function()` que recebam dados dinâmicos, substituindo por lógica explícita e segura.
6. Garantir sanitização **na entrada e na exibição** dos dados do usuário.
7. Validar o resultado com o checklist abaixo, confirmando que o comportamento foi preservado.

## Saída Esperada

Código com:

- Entradas do usuário **sanitizadas** via APIs públicas (`DOMPurify.sanitize` e/ou `WCMAPI.validateXSS`).
- **Sem vetores de XSS**: sem `innerHTML` inseguro e sem `eval()`/`new Function()` com dados dinâmicos.
- Dados dinâmicos **escapados** em FreeMarker.
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
- [ ] Sanitização aplicada tanto na entrada (POST/PUT) quanto na exibição (GET).
- [ ] Comportamento do código preservado após a sanitização.
