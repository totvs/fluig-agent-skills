---
name: internationalization
description: Aplica internacionalização (i18n) em customizações Fluig externalizando todo texto visível para chaves de tradução resolvidas server-side via ${i18n.getTranslation('chave')} no FreeMarker, evitando strings fixas e o acesso incorreto a i18n como objeto JavaScript. Use quando o desenvolvedor pedir para internacionalizar um trecho/arquivo, remover textos fixos ou corrigir o uso de i18n em widgets, Custom Elements ou templates FreeMarker.
argument-hint: o código alvo a internacionalizar (trecho ou arquivo com textos fixos ou uso incorreto de i18n)
---

# Aplicação de Internacionalização (i18n)

Esta skill aplica i18n em customizações Fluig; ela **não duplica** convenções — o arquivo de `context/` é a fonte de verdade, referenciada abaixo.

## Objetivo

Aplicar, com responsabilidade única, **internacionalização ao código de customização Fluig**, substituindo todo texto visível por chaves de tradução resolvidas server-side com `${i18n.getTranslation('chave')}`, sem usar strings fixas nem acessar `i18n` como objeto JavaScript, preservando o comportamento observável.

## Quando Usar

- Quando há **strings fixas** visíveis ao usuário (rótulos, mensagens, títulos, `aria-label`, `alt`).
- Quando o código acessa `i18n` de forma **incorreta** (`i18n.key` ou `i18n['key']`).
- Quando textos traduzidos são montados dentro de **template literals** (backticks) e a expressão `${...}` é interpretada pelo JavaScript em vez do FreeMarker.
- Antes de publicar um artefato que precisa suportar múltiplos idiomas.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho ou arquivo (FreeMarker `.ftl`, `.js` de widget, Custom Element) com texto a internacionalizar | sim |
| Chaves i18n existentes | Chaves de tradução já definidas/usadas, a reaproveitar | não |
| Parâmetros dinâmicos | Valores a interpolar na tradução (1 ou N parâmetros), quando houver | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — seção **Internacionalização (i18n)**: sintaxe `${i18n.getTranslation('key')}` (e a alternativa `[=i18n.getTranslation('key')]` em Web Components), variantes com parâmetros (`getTranslationP1`/`getTranslationPn`), proibição de acessar `i18n` como objeto JavaScript e o cuidado com **template literals** (backticks).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a tarefa; o detalhe está no contexto:

- Todo texto visível **deve** vir de i18n via `${i18n.getTranslation('chave')}` — **nunca** strings fixas → ver `conventions.md`.
- **Nunca** acessar `i18n` como objeto JavaScript (`i18n.key` ou `i18n['key']`) — não funciona; a tradução é resolvida server-side pelo FreeMarker → ver `conventions.md`.
- A expressão precisa estar entre aspas em `.js`: `const t = "${i18n.getTranslation('key')}";` → ver `conventions.md`.
- **Cuidado com template literals (backticks):** dentro de backticks, `${...}` é interpretado pelo JavaScript, não pelo FreeMarker. Declarar a tradução em uma variável separada e só então concatenar: `const msg = \`${t}: ${name}\`;` → ver `conventions.md`.
- Para valores dinâmicos, usar `${i18n.getTranslationP1('key', param)}` (1 parâmetro) ou `${i18n.getTranslationPn('key', p1, p2)}` (N parâmetros) → ver `conventions.md`.
- Em Web Components, considerar a alternativa `[=i18n.getTranslation('key')]` quando aplicável → ver `conventions.md`.

## Procedimento

1. Ler o código alvo e localizar todo texto visível ao usuário (rótulos, mensagens, títulos, `aria-label`, `alt`) e usos incorretos de `i18n`.
2. Definir/identificar uma chave de tradução descritiva para cada texto e substituí-lo por `${i18n.getTranslation('chave')}`.
3. Em `.js`, envolver a expressão em aspas e atribuí-la a uma variável antes de usar.
4. Para textos com valores dinâmicos, usar a variante com parâmetros (`getTranslationP1`/`getTranslationPn`) em vez de concatenar dentro da própria chave.
5. Tratar com cuidado os **template literals**: declarar a tradução em variável separada e só então concatenar dentro de backticks, evitando que `${...}` seja capturado pelo JavaScript.
6. Remover qualquer acesso a `i18n` como objeto JavaScript (`i18n.key` / `i18n['key']`).
7. Conferir o resultado com o checklist abaixo, preservando o comportamento.

## Saída Esperada

Código internacionalizado, com todo texto visível vindo de `${i18n.getTranslation('chave')}` (e variantes com parâmetros quando necessário), sem strings fixas, sem acesso a `i18n` como objeto JavaScript e com template literals tratados corretamente. Comportamento preservado e em conformidade com `context/conventions.md`.

## Exemplo de Uso

Antes (string fixa e uso incorreto de `i18n` dentro de template literal):

```javascript
// ❌ string fixa visível ao usuário
const title = "Minhas tarefas";

// ❌ i18n acessado como objeto JS e ${...} capturado pelo JavaScript no backtick
const msg = `${i18n['greeting']}: ${userName}`;
```

Depois (tradução via FreeMarker, em variável separada antes do backtick):

```javascript
// ✅ texto visível resolvido server-side pelo FreeMarker
const title = "${i18n.getTranslation('task.myTasks.title')}";

// ✅ tradução em variável separada; só então concatenada no template literal
const greeting = "${i18n.getTranslation('common.greeting')}";
const msg = `${greeting}: ${userName}`;
```

## Checklist de Validação

- [ ] Nenhuma string fixa visível ao usuário; todo texto vem de `${i18n.getTranslation('chave')}`.
- [ ] Sem acesso a `i18n` como objeto JavaScript (`i18n.key` / `i18n['key']`).
- [ ] Expressões em `.js` estão entre aspas e atribuídas a variáveis.
- [ ] Template literals tratados: tradução declarada em variável separada antes do backtick.
- [ ] Valores dinâmicos usam `getTranslationP1`/`getTranslationPn`; comportamento preservado.
