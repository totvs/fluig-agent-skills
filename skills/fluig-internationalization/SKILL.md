---
name: fluig-internationalization
description: Aplica internacionalização (i18n) no domínio de Páginas (Widgets e Layouts) de customizações Fluig, externalizando todo texto visível para chaves de tradução resolvidas server-side — `[=i18n.getTranslation('chave')]` em arquivos `.js` (padrão para código novo, sem conflito com template literals do ES6) e `${i18n.getTranslation('chave')}` em FreeMarker (`.ftl`) — com `getTranslationP1`/`getTranslationPn` para parâmetros, evitando strings fixas e o acesso incorreto a i18n como objeto JavaScript. Em `.js` legado que já usa `${i18n...}` e é minificado pelo Closure Compiler, orienta preferir concatenação clássica (`+`) a template literals; com `[=...]` não há essa restrição. Formulários e processos usam outro mecanismo (`i18n.translate`) e estão fora do escopo desta skill. Use quando o desenvolvedor pedir para internacionalizar um trecho/arquivo, remover textos fixos ou corrigir o uso de i18n em widgets, layouts ou templates FreeMarker.
argument-hint: o código alvo a internacionalizar (trecho ou arquivo com textos fixos ou uso incorreto de i18n)
---

# Aplicação de Internacionalização (i18n)

Esta skill aplica i18n em customizações Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Passo 0 — Persona

Antes de aplicar i18n, classifique a persona do desenvolvedor seguindo a
cascata em [persona-routing.md](../../context/persona-routing.md): conversa >
marcador de arquivo > marcador técnico de Store (`component.xml` ou API de slot)
> estrutura do projeto > pergunta. Se restar ambígua, pare e
pergunte antes de continuar. Emita `Persona: <Parceiro|Consultor> (motivo)` —
a regra de i18n em `.js` abaixo é a **constituição da plataforma**
([platform-constitution.md](../../context/platform-constitution.md)) e vale
para ambas as personas sem distinção.

## Objetivo

Aplicar, com responsabilidade única, **internacionalização ao código de customização Fluig**, substituindo todo texto visível por chaves de tradução resolvidas server-side — `[=i18n.getTranslation('chave')]` em `.js` (código novo) e `${i18n.getTranslation('chave')}` em `.ftl` —, sem usar strings fixas nem acessar `i18n` como objeto JavaScript, preservando o comportamento observável.

## Quando Usar

- Quando há **strings fixas** visíveis ao usuário (rótulos, mensagens, títulos, `aria-label`, `alt`).
- Quando é preciso **adicionar uma nova string de UI** garantindo sua presença nos 4 bundles `.properties`.
- Quando o código acessa `i18n` de forma **incorreta** (`i18n.key` ou `i18n['key']`).
- Quando um `.js` **legado** que usa `${i18n...}` será minificado pelo Closure Compiler e a tradução precisa ser combinada com uma variável JS — preferir concatenação clássica (`+`) a template literals nesse arquivo (ver "Regras Aplicáveis" abaixo). Em `.js` com `[=...]`, template literals são liberados.
- Antes de publicar um artefato que precisa suportar múltiplos idiomas.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código alvo | Trecho ou arquivo de **Página** (FreeMarker `.ftl` ou `.js` de widget/layout) com texto a internacionalizar | sim |
| Chaves i18n existentes | Chaves de tradução já definidas/usadas, a reaproveitar | não |
| Parâmetros dinâmicos | Valores a interpolar na tradução (1 ou N parâmetros), quando houver | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [platform-constitution.md](../../context/platform-constitution.md) — regra inviolável nº 1: em `.js`, preferir `[=i18n.getTranslation('key')]` (não colide com template literals do ES6); `.ftl` mantém `${i18n.getTranslation('key')}`; cautela oficial sobre o conflito confirmado entre minificação pelo Closure Compiler e template literals apenas em `.js` legado com `${i18n...}`.
- [conventions.md](../../context/conventions.md) — seção **Internacionalização (i18n)**: sintaxes por tipo de arquivo (`[=...]` em `.js`, `${...}` em `.ftl`), métodos com parâmetros (`getTranslationP1` para 1 parâmetro e `getTranslationPn` para N, com marcadores `{0}`/`{1}`...), `getJSTranslation` em `<script>`, proibição de acessar `i18n` como objeto JavaScript e a cautela com **template literals** (backticks) somente em arquivo `.js` legado com `${i18n...}` minificado pelo Closure Compiler.
- [backend-java-maven.md](../../context/backend-java-maven.md) — **ramo Parceiro (Store)**: configuração do `closure-compiler-maven-plugin` (relevante só quando o artefato é empacotado via Maven/EAR). Carregar somente quando a persona for Parceiro.
- [writing-style-guide.md](../../context/writing-style-guide.md) — Terminologia oficial TOTVS para textos visíveis ao usuário (aplicar nas chaves criadas/corrigidas) — "plataforma" (não "produto"/"sistema"), "página" (Web)/"tela" (mobile), "recurso" (não "funcionalidade"), "Modo claro"/"Modo escuro" (não "Tema"), estrangeirismos (_layout_, _widget_) em itálico.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a tarefa; o detalhe está no contexto:

- **Escopo = Páginas (Widgets e Layouts).** Esta skill trata o domínio de widgets/layouts (`[=i18n.getTranslation('chave')]` no `.js`, `${i18n.getTranslation('chave')}` no `.ftl`). **Formulários** usam `i18n.translate("chave")` (3 locais, sem base) e **processos** idem — são mecanismos **independentes e incompatíveis**; não os converta para `i18n.getTranslation` nem misture padrões → ver a **"Regra de ouro"** em `conventions.md` (3 domínios de i18n) e `conventions-form.md`.
- Todo texto visível **deve** vir de i18n — **nunca** strings fixas → ver `conventions.md`.
- **Nunca** acessar `i18n` como objeto JavaScript (`i18n.key` ou `i18n['key']`) — não funciona; a tradução é resolvida server-side pelo FreeMarker → ver `conventions.md`.
- **Em `.js` (código novo):** usar `[=i18n.getTranslation('chave')]` — não colide com template literals do ES6. **Em `.ftl`:** usar `${i18n.getTranslation('chave')}` (e `${i18n.getJSTranslation('chave')}` em `<script>`) → ver `conventions.md` e `platform-constitution.md`.
- **Consistência com o arquivo:** um `.js` legado que já usa `${i18n...}` mantém essa sintaxe; **não misture** as duas no mesmo arquivo; a troca para `[=...]` em código legado só é feita quando explicitamente solicitada → ver `conventions.md`.
- **Template literals:** com `[=i18n.getTranslation(...)]` ficam **liberados** no mesmo arquivo, inclusive na minificação pelo Closure Compiler. A restrição — preferir concatenação clássica (`+`) — vale **somente** para `.js` legado com `${i18n.getTranslation(...)}` minificado pelo Closure Compiler; um `.js` sem i18n não é afetado → ver `platform-constitution.md`.
- A expressão precisa estar entre aspas quando atribuída a variável em `.js`: `const t = "[=i18n.getTranslation('chave')]";` → ver `conventions.md`.
- ⚠️ O FreeMarker processa o `.js` **inteiro**: use a interpolação **só no código**, com expressão válida — **nunca** em comentário/texto (uma interpolação mal-formada em comentário quebra o i18n do arquivo inteiro) → ver `conventions.md`, "Armadilha da interpolação em comentário/texto do `.js`".
- Para valores dinâmicos, usar os métodos com parâmetro — `getTranslationP1('chave', param)` (1 parâmetro) ou `getTranslationPn('chave', p1, p2, ...)` (N parâmetros) — com marcadores posicionais `{0}`, `{1}`, ... na chave de tradução → ver `conventions.md`.
- Ao criar/corrigir chaves de tradução, usar a **terminologia oficial TOTVS**: "plataforma" (não "produto"/"sistema"), "página" (Web)/"tela" (mobile), "recurso" (não "funcionalidade"), "Modo claro"/"Modo escuro" (não "Tema"), estrangeirismos (_layout_, _widget_) em itálico → ver `writing-style-guide.md`.

## Procedimento

1. Ler o código alvo e localizar todo texto visível ao usuário (rótulos, mensagens, títulos, `placeholder`, `title`, `aria-label`, `alt`) e usos incorretos de `i18n`. **Ignorar strings técnicas** (seletores, classes CSS, URLs, nomes de evento, chaves de `data-*`), que não são traduzíveis.
2. Definir/identificar uma chave de tradução descritiva para cada texto, seguindo a convenção de dot-notation por domínio. **Reaproveitar uma chave existente** quando o mesmo texto já estiver traduzido em outro ponto, em vez de criar duplicatas. Em `.js`, substituir por `[=i18n.getTranslation('chave')]`; em `.ftl`, por `${i18n.getTranslation('chave')}`. Se o `.js` já usa `${i18n...}`, manter a sintaxe do arquivo.
3. Em `.js`, envolver a expressão em aspas e atribuí-la a uma variável antes de usar. Com `[=...]`, é permitido combinar a tradução com variáveis JS via template literal. Se o arquivo é **legado** (`${i18n...}`) e será minificado pelo Closure Compiler, preferir concatenação clássica (`+`) a template literal (ver `platform-constitution.md`).
4. Para textos com valores dinâmicos, usar o método com parâmetros — `getTranslationP1` (1 parâmetro) ou `getTranslationPn` (N parâmetros) — declarando os marcadores `{0}`, `{1}`, ... na chave, em vez de concatenar valores na própria chave.
5. **Propagar cada chave nova nos 4 arquivos `.properties`** (base + `pt_BR`/`en_US`/`es`): no fallback e no `pt_BR`, usar o texto original; em `en_US`/`es`, traduzir quando possível e, quando não, usar o PT como base marcando `# TODO i18n` na linha. Manter as chaves agrupadas/ordenadas conforme o arquivo existente. (O nome base dos `.properties` deve ser igual a `application.code` — ver `architecture.md`.) **Local dos arquivos depende da persona:** no **Consultor** (projeto Fluig), ficam na pasta de recursos do artefato; no **Parceiro** (módulo Maven), em `src/main/resources/` — ver `architecture.md` / `backend-java-maven.md`.
6. Tratar os **template literals** em `.js`: `[=i18n.getTranslation('chave')]` funciona dentro de backticks e não conflita com o Closure Compiler. A cautela se aplica apenas ao arquivo `.js` **legado** com `${i18n...}` minificado pelo Closure Compiler — nesse caso, prefira concatenação (`+`) a template literal.
7. Remover qualquer acesso a `i18n` como objeto JavaScript (`i18n.key` / `i18n['key']`).
8. Conferir o resultado com o checklist abaixo, preservando o comportamento.

## Saída Esperada

Código internacionalizado, com todo texto visível resolvido por i18n — via `[=i18n.getTranslation('chave')]` em arquivos `.js` (código novo) e `${i18n.getTranslation('chave')}` em `.ftl` — usando `getTranslationP1`/`getTranslationPn` para valores dinâmicos, sem strings fixas, sem acesso a `i18n` como objeto JavaScript, sem misturar as duas sintaxes no mesmo `.js` e, quando o arquivo é legado com `${i18n...}` minificado pelo Closure Compiler, com a cautela de template literals aplicada ao arquivo inteiro. Toda chave nova propagada nos 4 arquivos `.properties` (com `# TODO i18n` onde a tradução `en_US`/`es` faltar). Comportamento preservado e em conformidade com `context/platform-constitution.md` e `context/conventions.md`.

## Exemplo de Uso

Antes (string fixa e uso incorreto de `i18n` como objeto):

```javascript
// ❌ string fixa visível ao usuário
const title = "Minhas tarefas";

// ❌ i18n acessado como objeto JavaScript — não funciona
const msg = `${i18n['greeting']}: ${userName}`;
```

Depois (sintaxe `[=i18n.getTranslation(...)]` em `.js`; template literal liberado,
sem conflito com a interpolação do ES6 nem com o Closure Compiler):

```javascript
// ✅ texto visível resolvido server-side pelo FreeMarker
const title = "[=i18n.getTranslation('task.myTasks.title')]";

// ✅ template literal liberado com [=...]
const greeting = "[=i18n.getTranslation('common.greeting')]";
const msg = `${greeting}: ${userName}`;

// ✅ também válido: a tradução direto dentro do template literal
const msgInline = `[=i18n.getTranslation('common.greeting')]: ${userName}`;
```

Em `.ftl`, a sintaxe continua sendo a do FreeMarker:

```ftl
<#-- ✅ .ftl mantém ${...} -->
<h1>${i18n.getTranslation('task.myTasks.title')}</h1>
```

### Com parâmetros — `getTranslationP1` / `getTranslationPn`

A chave de tradução declara **marcadores posicionais** `{0}`, `{1}`, ... e a API de
i18n os **substitui automaticamente** pelos argumentos passados a
`getTranslationP1` (1 parâmetro) ou `getTranslationPn` (N parâmetros). **Não** há
substituição manual (`String.replace`): o próprio mecanismo de tradução resolve os
marcadores.

Em `.js` de widget/layout, a chamada `[=i18n.getTranslationP1(...)]` é avaliada
**server-side pelo FreeMarker** (em `.ftl`, `${i18n.getTranslationP1(...)}`), e
**o argumento pode ser uma expressão** (inclusive concatenação com `+`) — o
FreeMarker a avalia e injeta no marcador. Esse é o padrão oficial da plataforma:

```javascript
// ✅ padrão oficial: a expressão passada no argumento vira o {0} da chave
// chave: "record.answered=Você já respondeu o registro {0}."
// o argumento pode ser uma expressão (ex.: concatenação com +), avaliada
// server-side pelo FreeMarker e injetada no {0}
const message = "[=i18n.getTranslationP1('record.answered', '<strong>' + recordName + '</strong>')]";

// ✅ 1 parâmetro — chave: "greeting.user=Bem-vindo, {0}!"
const greeting = "[=i18n.getTranslationP1('greeting.user', userName)]";

// ✅ N parâmetros — chave: "report.range=De {0} até {1}"
const range = "[=i18n.getTranslationPn('report.range', startDate, endDate)]";
```

> **Cautela do Closure Compiler (somente `${...}` legado, não é substituição
> manual):** em um `.js` **legado** que mantém `${i18n...}`, a regra é apenas
> **preferir aspas + concatenação `+`** a **template literals** (backticks) quando o
> arquivo passa pela minificação. Com `[=...]` essa restrição não existe. O
> mecanismo de `{0}`/`{1}` continua o mesmo — nunca use `String.replace` para
> montar a tradução.

### Mesmo conceito no backend Java (ResourceBundle)

A camada Java do parceiro (Camada REST, serviços, exceções) usa o **mesmo** modelo de
marcadores `{0}`/`{1}`, passando os valores como `Object[]`; a mensagem traduzida vive
no `.properties` do backend com `\uXXXX` para acentos:

```java
// ✅ os valores do Object[] preenchem {0} e {1} da mensagem
throw new BadRequestException("error.role.alreadyAssigned",
        new Object[]{ userId, roleId });
```

```properties
# .properties do backend (acentos em \uXXXX)
error.role.alreadyAssigned=Usu\u00e1rio {0} j\u00e1 possui o papel {1}
```

O detalhe do i18n backend (resolução por `Accept-Language`, `ResourceBundle` +
`MessageFormat`) é fonte de verdade de `backend-java-maven.md` [i18n em Camada REST/Java (ResourceBundle)](../../context/backend-java-maven.md#i18n-em-camada-restjava-resourcebundle).

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

- [ ] Persona classificada (Passo 0) e emitida como `Persona: <Parceiro|Consultor> (motivo)`.
- [ ] Nenhuma string fixa visível ao usuário; todo texto vem de i18n.
- [ ] Strings técnicas (seletores, classes, URLs, nomes de evento) **não** foram convertidas em chaves.
- [ ] Toda chave nova existe nos **4 arquivos `.properties`** (base + `pt_BR`/`en_US`/`es`); traduções `en_US`/`es` ausentes marcadas com `# TODO i18n`.
- [ ] Chaves seguem dot-notation por domínio; chaves existentes reaproveitadas quando o texto se repete.
- [ ] Em `.js` (código novo), usa `[=i18n.getTranslation('chave')]`; em `.ftl`, usa `${i18n.getTranslation('chave')}`; um `.js` legado com `${i18n...}` manteve a sintaxe do arquivo, sem misturar as duas.
- [ ] Sem acesso a `i18n` como objeto JavaScript (`i18n.key` / `i18n['key']`).
- [ ] Expressões em `.js` estão entre aspas e atribuídas a variáveis (ou dentro de template literal, quando `[=...]`).
- [ ] Nenhuma interpolação de i18n em comentário/texto do `.js` (o FreeMarker processa o arquivo inteiro).
- [ ] Em `.js` **legado** com `${i18n...}` minificado pelo Closure Compiler, a concatenação com variáveis JS usa `+` em vez de template literal (com `[=...]`, template literal é permitido).
- [ ] Valores dinâmicos usam `getTranslationP1`/`getTranslationPn` com marcadores `{0}`, `{1}`...; comportamento preservado.
- [ ] Chaves criadas/corrigidas seguem a **terminologia oficial TOTVS** ("plataforma", "página"/"tela", "recurso", "Modo claro"/"Modo escuro").
