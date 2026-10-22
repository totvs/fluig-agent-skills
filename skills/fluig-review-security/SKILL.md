---
name: fluig-review-security
description: Revisa a segurança de código frontend de customização Fluig sob a ótica do OWASP Top 10 2025 (XSS, injeção, exposição de dados sensíveis, configuração insegura) usando apenas API pública (WCMAPI.validateXSS, DOMPurify.sanitize) e produz achados classificados por severidade, cada um referenciando a regra do arquivo de contexto. Use quando o desenvolvedor pedir uma revisão de segurança de um trecho ou arquivo antes de merge, sem reescrever o código.
argument-hint: o código/arquivo frontend alvo da revisão de segurança (trecho ou arquivo selecionado), idealmente com a origem dos dados do usuário
---

# Revisão de Segurança (OWASP Top 10 2025) de Frontend Fluig

Esta skill revisa a segurança de código frontend Fluig sob a ótica do OWASP Top 10 2025 e emite achados por severidade; ela **não duplica** convenções — o arquivo de `context/` é a fonte de verdade, referenciada abaixo. Usa **apenas API pública** e **não reescreve** o código.

## Passo 0 — Persona

Antes de revisar, classifique a persona do desenvolvedor seguindo a cascata em
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Se restar ambígua, pare e pergunte antes de
continuar. Emita `Persona: <Parceiro|Consultor> (motivo)` antes do relatório —
a persona determina a camada de contexto carregada (ver "Contexto de
Referência") e a forma de saída da revisão (ver "Saída Esperada").

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

### Core (sempre)

- [conventions.md](../../context/conventions.md) — seção **Segurança (APIs públicas)**: `WCMAPI.validateXSS`, `DOMPurify.sanitize`, `textContent` vs `innerHTML`, escape FreeMarker (`${value?html}`, `${value?js_string}`), proibição de `eval()`/`new Function()` com dados dinâmicos, sanitização na entrada e na exibição, e chamadas REST via `fetch()` ao domínio do próprio Fluig (API pública, `WCMAPI.getServerURL()`) ou a terceiro.
- [platform-constitution.md](../../context/platform-constitution.md) — regras invioláveis de i18n (`${i18n.getTranslation('chave')}`, mesma sintaxe em `.js` e em `.ftl`) e HTTP (`fetch()` + `async/await`, nunca síncrono).

### Parceiro (somente se persona = Parceiro)

- [partner-store-review-rules.md](../../context/partner-store-review-rules.md) — análise contextual completa de classificação de APIs e severidades ([§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo)), cabeçalho de pré-review ([§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) e persistência do relatório ([§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).

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
- **Configuração insegura (A02:2025):** domínio do próprio Fluig consumido apenas via **API pública**, com a URL montada a partir de `WCMAPI.getServerURL()`; qualquer chamada (ao próprio Fluig ou a terceiro) é feita com `fetch()` + `async/await` + `try/catch`, nunca `async: false` → ver `conventions.md`. A severidade **Alta** é pela **rota interna não documentada** acessada (ex.: `/ecm/api/rest/` direto), não pelo uso de `fetch`.
- **Exposição de dados sensíveis (A04:2025):** não embutir segredos/tokens no cliente; não logar dados sensíveis.

## Escala de Severidade

Classifique **cada achado** em um destes níveis, considerando explorabilidade e impacto.

> **Fonte canônica da severidade.** Esta escala é a definição **conceitual**. Quando
> o padrão já tiver severidade atribuída em `conventions.md` (seção **"Classificação
> de segurança frontend (review)"**), **vale a severidade de lá**. Ex.: *XSS com
> origem de API/dataset/input/URL*, *execução dinâmica (`eval`/`new Function`/`setTimeout`
> com string)* e *debug embarcado (`eruda`/`vConsole`)* = **Crítica**; *rota interna
> não documentada* = **Alta**; *XSS de origem ambígua* = **Média "VERIFICAR MANUALMENTE"**.

| Severidade | Critério | Exemplos típicos |
|------------|----------|------------------|
| **Crítico** | Vulnerabilidade explorável diretamente, com alto impacto | XSS por `innerHTML` com input não sanitizado; `eval()` sobre dados do usuário; segredo embutido no cliente |
| **Alto** | Vulnerabilidade provável ou proteção ausente em fluxo de dados do usuário | FreeMarker sem escape em dado dinâmico; sanitização ausente na persistência (POST/PUT); acesso a **rota interna não documentada** do Fluig (ex.: `/ecm/api/rest/` direto) — a severidade é pela rota, **não** pelo uso de `fetch` |
| **Médio** | Fraqueza que depende de condições, mas reduz a postura de segurança | Sanitização só na entrada, faltando na exibição; log verboso de dado potencialmente sensível |
| **Baixo** | Endurecimento recomendado de baixo risco imediato | Log verboso de payload; falta de validação defensiva redundante |

## Procedimento

1. Mapear o fluxo de dados do usuário (origem → uso no DOM/persistência/exibição) no código revisado.
2. Avaliar cada ponto contra as categorias OWASP 2025 aplicáveis: XSS/injeção (A05:2025), exposição de dados (A04:2025), configuração insegura (A02:2025).
3. Para cada vulnerabilidade, registrar um achado com localização, descrição, **categoria OWASP**, **severidade** e a **regra de contexto** correspondente (`conventions.md` › Segurança).
4. Recomendar a correção usando **apenas API pública** (`DOMPurify.sanitize`, `WCMAPI.validateXSS`, escape FreeMarker), apontando a skill `fluig-validate-security`.
5. Consolidar os achados ordenados do mais grave ao menos grave.
6. Validar a revisão com o checklist abaixo antes de entregar.

## Saída Esperada

Um **relatório de revisão de segurança**, com **Resumo** (contagem de achados por
severidade e avaliação geral), **Achados** agrupados por severidade (crítico →
baixo; cada um com localização, descrição, **categoria OWASP**, severidade e a
**regra de contexto referenciada**) e **Recomendações** acionáveis com API
pública, indicando a skill `fluig-validate-security`. A forma de entrega segue a
persona (ver `conventions.md` › Saída do review por persona):

- **Consultor:** o relatório é **gravado** em `review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo — análise de boas práticas para a customização do cliente, **sem** cabeçalho de pré-review e **sem** menção à Store ou ao App Review.
- **Parceiro (Store):** o relatório é um **pré-review preparatório** (não aprova,
  não substitui o App Review oficial), abre por um **cabeçalho de pré-review** e é
  **gravado** em `pre-review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo — a única
  escrita permitida. O **contrato completo** desse relatório (cabeçalho, nome do
  arquivo e modo somente leitura) é **canônico** em
  [§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação) / [§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)
  ([§ 32.1](../../context/partner-store-review-rules.md#321-modo-somente-leitura)) — siga-o de lá, esta skill não o duplica.

Fora esse cenário de Parceiro, a skill **não altera** o código — apenas diagnostica e recomenda.

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
- [ ] A persona foi classificada (Passo 0) e emitida como `Persona: <Parceiro|Consultor> (motivo)`.
- [ ] **Consultor:** o relatório foi **gravado** em `review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo, sem cabeçalho de pré-review e sem menção à Store/App Review.
- [ ] **Parceiro:** o relatório abre por um **cabeçalho de pré-review** (não aprova, não substitui o App Review oficial — `partner-store-review-rules.md` [§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) e foi **gravado** em `pre-review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo (`partner-store-review-rules.md` [§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).
- [ ] A revisão não alterou o código além do eventual `.md` de relatório do Parceiro — apenas diagnosticou e recomendou.
