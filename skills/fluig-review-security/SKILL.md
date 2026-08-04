---
name: fluig-review-security
description: Revisa a segurança de código frontend de customização Fluig sob a ótica do OWASP Top 10 2025 (XSS, injeção, exposição de dados sensíveis, configuração insegura) usando apenas API pública (WCMAPI.validateXSS, DOMPurify.sanitize) e produz achados classificados por severidade, cada um referenciando a regra do arquivo de contexto. Use quando o desenvolvedor pedir uma revisão de segurança de um trecho ou arquivo antes de merge, sem reescrever o código.
argument-hint: o código/arquivo frontend alvo da revisão de segurança (trecho ou arquivo selecionado), idealmente com a origem dos dados do usuário
---

# Revisão de Segurança (OWASP Top 10 2025) de Frontend Fluig

Esta skill revisa a segurança de código frontend Fluig sob a ótica do OWASP Top 10 2025 e emite achados por severidade; ela **não duplica** convenções — o arquivo de `context/` é a fonte de verdade, referenciada abaixo. Usa **apenas API pública** e **não reescreve** o código.

## Objetivo

Revisar, com responsabilidade única, a **segurança de código frontend de customização Fluig** sob a ótica do **OWASP Top 10 2025**, identificando vulnerabilidades e produzindo um **relatório de achados classificados por severidade**, cada um vinculado à regra correspondente do arquivo de contexto e à categoria OWASP. Para aplicar as correções, use a skill `fluig-validate-security`.

## Quando Usar

- Antes de um merge, para uma revisão de segurança focada de um widget, Custom Element ou template FreeMarker.
- Quando o código manipula **entrada do usuário** no DOM, na persistência ou na exibição.
- Quando há uso de `innerHTML`, `eval()`/`new Function()` ou interpolação dinâmica em FreeMarker.
- Quando dados sensíveis podem estar expostos no cliente ou em chamadas a endpoints.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho ou arquivo frontend a revisar (JS de widget/Custom Element, FreeMarker) | sim |
| Origem dos dados do usuário | De onde vêm os dados não confiáveis (formulário, query string, resposta de API, parâmetros) | não |
| Contexto do artefato | Tipo do artefato e fluxo de dados | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — seção **Segurança (APIs públicas)**: `WCMAPI.validateXSS`, `DOMPurify.sanitize`, `textContent` vs `innerHTML`, escape FreeMarker (`${value?html}`, `${value?js_string}`), proibição de `eval()`/`new Function()` com dados dinâmicos, sanitização na entrada e na exibição, e chamadas REST internas via `WCMAPI`/`FLUIGC.ajax`.

## Referência OWASP Top 10 2025

Esta skill segue a estrutura do **OWASP Top 10 2025** ([owasp.org/Top10/2025](https://owasp.org/Top10/2025/)). O escopo de cobertura **não muda** em relação às revisões anteriores — continua focado em XSS/injeção, exposição de dados sensíveis e configuração insegura no frontend Fluig. Apenas a **numeração e a nomenclatura** das categorias foram alinhadas à edição 2025:

| Cobertura da skill | Categoria OWASP 2025 | Numeração anterior (2021) |
|--------------------|----------------------|----------------------------|
| Injeção / XSS | **A05:2025 – Injection** | A03:2021 |
| Configuração insegura | **A02:2025 – Security Misconfiguration** | A05:2021 |
| Exposição de dados sensíveis | **A04:2025 – Cryptographic Failures** | A02:2021 |

Ao citar a categoria OWASP em um achado, use a numeração 2025 (ex.: `A05:2025 Injection`).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a revisão, mapeado ao OWASP Top 10 2025; o detalhe está no contexto. Cada achado deve citar a regra de origem. Use **apenas API pública**.

- **Injeção / XSS (A05:2025):** entrada do usuário sanitizada com `DOMPurify.sanitize` (HTML válido) ou `WCMAPI.validateXSS` (texto puro) antes de ir ao DOM → ver `conventions.md`.
- **XSS via `innerHTML`:** preferir `textContent`; só usar `innerHTML` com conteúdo já sanitizado → ver `conventions.md`.
- **Injeção via `eval`:** **nunca** `eval()`/`new Function()` com dados dinâmicos → ver `conventions.md`.
- **Escape de template:** dados dinâmicos escapados em FreeMarker (`${value?html}`, `${value?js_string}`) → ver `conventions.md`.
- **Sanitização na entrada e na exibição (A05:2025):** validar tanto em POST/PUT quanto em GET → ver `conventions.md`.
- **Configuração insegura (A02:2025):** chamadas a endpoints internos via `WCMAPI`/`FLUIGC.ajax` (token de sessão automático); sem `fetch`/`$.ajax` direto → ver `conventions.md`.
- **Exposição de dados sensíveis (A04:2025):** não embutir segredos/tokens no cliente; não logar dados sensíveis.

## Escala de Severidade

Classifique **cada achado** em um destes níveis, considerando explorabilidade e impacto:

| Severidade | Critério | Exemplos típicos |
|------------|----------|------------------|
| **Crítico** | Vulnerabilidade explorável diretamente, com alto impacto | XSS por `innerHTML` com input não sanitizado; `eval()` sobre dados do usuário; segredo embutido no cliente |
| **Alto** | Vulnerabilidade provável ou proteção ausente em fluxo de dados do usuário | FreeMarker sem escape em dado dinâmico; sanitização ausente na persistência (POST/PUT) |
| **Médio** | Fraqueza que depende de condições, mas reduz a postura de segurança | Sanitização só na entrada, faltando na exibição; chamada interna via `fetch` direto |
| **Baixo** | Endurecimento recomendado de baixo risco imediato | Log verboso de payload; falta de validação defensiva redundante |

## Procedimento

1. Mapear o fluxo de dados do usuário (origem → uso no DOM/persistência/exibição) no código revisado.
2. Avaliar cada ponto contra as categorias OWASP 2025 aplicáveis: XSS/injeção (A05:2025), exposição de dados (A04:2025), configuração insegura (A02:2025).
3. Para cada vulnerabilidade, registrar um achado com localização, descrição, **categoria OWASP**, **severidade** e a **regra de contexto** correspondente (`conventions.md` › Segurança).
4. Recomendar a correção usando **apenas API pública** (`DOMPurify.sanitize`, `WCMAPI.validateXSS`, escape FreeMarker), apontando a skill `fluig-validate-security`.
5. Consolidar os achados ordenados do mais grave ao menos grave.
6. Validar a revisão com o checklist abaixo antes de entregar.

## Saída Esperada

Um **relatório de revisão de segurança** contendo:

- **Resumo** com a contagem de achados por severidade e a avaliação geral.
- **Achados** agrupados por severidade (crítico → baixo); cada um com localização, descrição, **categoria OWASP**, severidade e a **regra de contexto referenciada**.
- **Recomendações** acionáveis com API pública, indicando a skill `fluig-validate-security`.

A skill **não altera** o código — apenas diagnostica e recomenda.

## Exemplo de Uso

Trecho revisado e achado correspondente.

```javascript
// Código revisado (trecho)
container.innerHTML = userInput; // entrada do usuário direto no DOM como HTML
```

```markdown
## Achados

### 🔴 Crítico
- **A05:2025 Injeção/XSS — linha 1:** `innerHTML` recebe `userInput` sem sanitização (XSS refletido/armazenado).
  - Regra: `conventions.md` › Segurança (APIs públicas).
  - Recomendação: usar `textContent` ou `DOMPurify.sanitize(userInput)` antes de inserir; `WCMAPI.validateXSS` para reduzir a texto puro. Ver skill `fluig-validate-security`.
```

## Checklist de Validação

- [ ] O fluxo de dados do usuário foi mapeado (origem → DOM/persistência/exibição).
- [ ] Cada achado tem **categoria OWASP** e **severidade** atribuídas conforme a escala.
- [ ] Cada achado **referencia a regra** do `conventions.md` › Segurança (com a seção).
- [ ] As recomendações usam **apenas API pública** (`DOMPurify.sanitize`, `WCMAPI.validateXSS`, escape FreeMarker).
- [ ] O relatório está ordenado do mais grave ao menos grave e aponta a skill `fluig-validate-security`.
- [ ] A revisão não alterou o código — apenas diagnosticou e recomendou.
