---
name: fluig-internationalization
description: Aplica internacionalização (i18n) em customizações Fluig externalizando todo texto visível para chaves de tradução resolvidas server-side — `${i18n.getTranslation('chave')}` em FreeMarker e a sintaxe recomendada `[=i18n.getTranslation('chave')]` em arquivos `.js` (evita conflito com template literals do ES6) — com `getTranslationP1`/`getTranslationPn` para parâmetros, evitando strings fixas e o acesso incorreto a i18n como objeto JavaScript. Use quando o desenvolvedor pedir para internacionalizar um trecho/arquivo, remover textos fixos ou corrigir o uso de i18n em widgets, Custom Elements ou templates FreeMarker.
argument-hint: o código alvo a internacionalizar (trecho ou arquivo com textos fixos ou uso incorreto de i18n)
---

# Aplicação de Internacionalização (i18n)

Esta skill aplica i18n em customizações Fluig; ela **não duplica** convenções — o arquivo de `context/` é a fonte de verdade, referenciada abaixo.

## Objetivo

Aplicar, com responsabilidade única, **internacionalização ao código de customização Fluig**, substituindo todo texto visível por chaves de tradução resolvidas server-side com `${i18n.getTranslation('chave')}`, sem usar strings fixas nem acessar `i18n` como objeto JavaScript, preservando o comportamento observável.

## Quando Usar

- Quando há **strings fixas** visíveis ao usuário (rótulos, mensagens, títulos, `aria-label`, `alt`).
- Quando é preciso **adicionar uma nova string de UI** garantindo sua presença nos 4 bundles `.properties`.
- Quando o código acessa `i18n` de forma **incorreta** (`i18n.key` ou `i18n['key']`).
- Quando textos traduzidos são montados dentro de **template literals** (backticks) e a expressão `${...}` é interpretada pelo JavaScript em vez do FreeMarker (em `.js`, prefira `[=...]`).
- Antes de publicar um artefato que precisa suportar múltiplos idiomas.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho ou arquivo (FreeMarker `.ftl`, `.js` de widget, Custom Element) com texto a internacionalizar | sim |
| Chaves i18n existentes | Chaves de tradução já definidas/usadas, a reaproveitar | não |
| Parâmetros dinâmicos | Valores a interpolar na tradução (1 ou N parâmetros), quando houver | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — seção **Internacionalização (i18n)**: sintaxe `${i18n.getTranslation('key')}` em `.ftl` e a sintaxe **recomendada em arquivos `.js`** `[=i18n.getTranslation('key')]` (evita conflito com template literals do ES6), métodos com parâmetros (`getTranslationP1` para 1 parâmetro e `getTranslationPn` para N, com marcadores `{0}`/`{1}`...), `getJSTranslation` em `<script>`, proibição de acessar `i18n` como objeto JavaScript e o cuidado com **template literals** (backticks).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a tarefa; o detalhe está no contexto:

- Todo texto visível **deve** vir de i18n — **nunca** strings fixas → ver `conventions.md`.
- **Nunca** acessar `i18n` como objeto JavaScript (`i18n.key` ou `i18n['key']`) — não funciona; a tradução é resolvida server-side pelo FreeMarker → ver `conventions.md`.
- **Em `.ftl`:** usar `${i18n.getTranslation('chave')}` → ver `conventions.md`.
- **Em arquivos `.js` (recomendado):** usar `[=i18n.getTranslation('chave')]` — evita o conflito com template literals do ES6 e funciona inclusive dentro de backticks → ver `conventions.md`.
- **Respeitar o padrão já existente no arquivo `.js`:** se o arquivo já usa `${i18n.getTranslation(...)}`, **manter** essa sintaxe ao editar; usar `[=i18n....]` para **código novo** ou arquivos sem padrão definido — sem misturar as duas no mesmo arquivo → ver `conventions.md`.
- A expressão precisa estar entre aspas quando atribuída a variável em `.js`: `const t = "[=i18n.getTranslation('chave')]";` → ver `conventions.md`.
- **Cuidado com template literals (backticks) e a sintaxe `${...}`:** dentro de backticks, `${...}` é interpretado pelo JavaScript, não pelo FreeMarker. Em `.js`, prefira `[=...]`; se usar `${...}`, declare a tradução em variável separada antes de concatenar → ver `conventions.md`.
- Para valores dinâmicos, usar os métodos com parâmetro — `getTranslationP1('chave', param)` (1 parâmetro) ou `getTranslationPn('chave', p1, p2, ...)` (N parâmetros) — com marcadores posicionais `{0}`, `{1}`, ... na chave de tradução → ver `conventions.md`.

## Procedimento

1. Ler o código alvo e localizar todo texto visível ao usuário (rótulos, mensagens, títulos, `placeholder`, `title`, `aria-label`, `alt`) e usos incorretos de `i18n`. **Ignorar strings técnicas** (seletores, classes CSS, URLs, nomes de evento, chaves de `data-*`), que não são traduzíveis.
2. Definir/identificar uma chave de tradução descritiva para cada texto, seguindo a convenção de dot-notation por domínio. **Reaproveitar uma chave existente** quando o mesmo texto já estiver traduzido em outro ponto, em vez de criar duplicatas. Em `.ftl`, substituir por `${i18n.getTranslation('chave')}`; em arquivos `.js`, **respeitar o padrão já existente no arquivo** — se já usa `${i18n....}`, manter; para código novo (ou arquivo sem padrão), usar `[=i18n.getTranslation('chave')]`.
3. Em `.js`, envolver a expressão em aspas e atribuí-la a uma variável antes de usar.
4. Para textos com valores dinâmicos, usar o método com parâmetros — `getTranslationP1` (1 parâmetro) ou `getTranslationPn` (N parâmetros) — declarando os marcadores `{0}`, `{1}`, ... na chave, em vez de concatenar valores na própria chave.
5. **Propagar cada chave nova nos 4 arquivos `.properties`** (base + `pt_BR`/`en_US`/`es`), em `src/main/resources/`: no fallback e no `pt_BR`, usar o texto original; em `en_US`/`es`, traduzir quando possível e, quando não, usar o PT como base marcando `# TODO i18n` na linha. Manter as chaves agrupadas/ordenadas conforme o arquivo existente. (O nome base dos `.properties` deve ser igual a `application.code` — ver `architecture.md`.)
6. Tratar com cuidado os **template literals**: em `.js`, preferir `[=...]` (que não conflita com backticks); se usar `${...}`, declarar a tradução em variável separada e só então concatenar.
7. Remover qualquer acesso a `i18n` como objeto JavaScript (`i18n.key` / `i18n['key']`).
8. Conferir o resultado com o checklist abaixo, preservando o comportamento.

## Saída Esperada

Código internacionalizado, com todo texto visível resolvido por i18n — em `.ftl` via `${i18n.getTranslation('chave')}` e em arquivos `.js` via `[=i18n.getTranslation('chave')]` (sintaxe recomendada) — usando `getTranslationP1`/`getTranslationPn` para valores dinâmicos, sem strings fixas, sem acesso a `i18n` como objeto JavaScript e com template literals tratados corretamente. Toda chave nova propagada nos 4 arquivos `.properties` (com `# TODO i18n` onde a tradução `en_US`/`es` faltar). Comportamento preservado e em conformidade com `context/conventions.md`.

## Exemplo de Uso

Antes (string fixa e uso incorreto de `i18n` dentro de template literal):

```javascript
// ❌ string fixa visível ao usuário
const title = "Minhas tarefas";

// ❌ i18n acessado como objeto JS e ${...} capturado pelo JavaScript no backtick
const msg = `${i18n['greeting']}: ${userName}`;
```

Depois (em `.js`, sintaxe `[=...]` recomendada — não conflita com backticks):

```javascript
// ✅ texto visível resolvido server-side pelo FreeMarker
const title = "[=i18n.getTranslation('task.myTasks.title')]";

// ✅ [=...] funciona inclusive dentro de template literals
const msg = `[=i18n.getTranslation('common.greeting')]: ${userName}`;
```

Com parâmetros (a chave declara os marcadores posicionais `{0}`, `{1}`, ...):

```javascript
// ✅ 1 parâmetro — chave: "welcome.user=Bem-vindo, {0}!"
const welcome = "[=i18n.getTranslationP1('welcome.user', userName)]";

// ✅ N parâmetros — chave: "report.range=De {0} até {1}"
const range = "[=i18n.getTranslationPn('report.range', startDate, endDate)]";
```

## Mock de i18n em Testes (Jest)

Em testes unitários (Jest) de Web Components/widgets, a tradução **não** é
resolvida server-side pelo FreeMarker. Para que o código sob teste encontre
`i18n`, defina um **mock** que devolve a própria chave — assim os asserts podem
verificar a chave esperada sem depender de bundles `.properties` reais:

```javascript
// retorna a própria chave (key) — útil para asserts em testes de Web Components
global.i18n = {
  getTranslation: jest.fn((key) => key),
  getTranslationP1: jest.fn((key) => key),
  getTranslationPn: jest.fn((key) => key),
};
```

Como o mock retorna a chave recebida, basta afirmar que o componente renderiza a
chave esperada (ex.: `task.myTasks.title`). As regras de i18n em si permanecem
em `conventions.md` → ver [conventions.md](../../context/conventions.md).

## Checklist de Validação

- [ ] Nenhuma string fixa visível ao usuário; todo texto vem de i18n.
- [ ] Strings técnicas (seletores, classes, URLs, nomes de evento) **não** foram convertidas em chaves.
- [ ] Toda chave nova existe nos **4 arquivos `.properties`** (base + `pt_BR`/`en_US`/`es`); traduções `en_US`/`es` ausentes marcadas com `# TODO i18n`.
- [ ] Chaves seguem dot-notation por domínio; chaves existentes reaproveitadas quando o texto se repete.
- [ ] Em arquivos `.js`, respeita o padrão existente do arquivo (mantém `${i18n....}` se já houver) e usa `[=i18n.getTranslation('chave')]` para código novo; em `.ftl`, `${i18n.getTranslation('chave')}`.
- [ ] Sem acesso a `i18n` como objeto JavaScript (`i18n.key` / `i18n['key']`).
- [ ] Expressões em `.js` estão entre aspas e atribuídas a variáveis.
- [ ] Template literals tratados: em `.js`, `[=...]` (ou tradução em variável separada quando usar `${...}`).
- [ ] Valores dinâmicos usam `getTranslationP1`/`getTranslationPn` com marcadores `{0}`, `{1}`...; comportamento preservado.
