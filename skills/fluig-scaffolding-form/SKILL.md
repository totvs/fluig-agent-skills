---
name: fluig-scaffolding-form
description: Gera o esqueleto de um Form (formulário eletrônico) do Fluig — definição de campos, view/markup, eventos e (quando solicitado) tabela Pai x Filho com tablename, template de linha e orientações de consumo via dataset, aplicando as convenções oficiais. Use quando o desenvolvedor pedir para criar/iniciar um novo formulário do Fluig a partir de um nome ou propósito e seus campos.
argument-hint: 'nome e/ou propósito do formulário, campos e regras de validação (ex.: "formulário de solicitação de férias com nome, data de início e dias")'
---

# Scaffolding de Form (Formulário eletrônico)

Esta skill gera o esqueleto de um Form do Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Passo 0a — Estrutura

Antes de gerar, identifique a **estrutura do projeto** — ela decide o **layout de
pastas**, e é independente da persona. Emita
`Estrutura: <Studio|Maven|Híbrida> (motivo)`:

- **Studio** — projeto Fluig sem `pom.xml` na raiz. O form é gerado em `forms/`.
- **Maven** — projeto multi-módulo com `pom.xml` na raiz. O form fica em `forms/`
  do projeto (P4: forms/datasets ficam em `forms/` e `datasets/`, e o agente
  pergunta na dúvida) — ver [backend-java-maven.md](../../context/backend-java-maven.md).
- **Híbrida** — estrutura Studio com agregador Maven interno, sem `pom.xml` na
  raiz. Trate como Studio para o layout de pastas.

## Passo 0b — Persona

Classifique a persona do desenvolvedor seguindo a cascata em
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Se restar ambígua, pare e pergunte antes de continuar.
Emita `Persona: <Parceiro|Consultor> (motivo)` antes de gerar — a persona
determina **apenas** se a **camada Store** entra: Consultor cria o form sem a
camada Store; Parceiro aplica, quando aplicável, o prefixo de namespacing de
datasets/formulários (ver
[§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)).

## Objetivo

Produzir, com responsabilidade única, o **esqueleto de um Form (formulário eletrônico)** do Fluig: a definição dos campos, a view/markup do formulário e o arquivo de eventos com os **handlers de ciclo de vida e de campos** que implementam validação e regras de preenchimento, já em conformidade com as convenções públicas.

Quando a entrada pedir grade dinâmica, o escopo inclui também a estrutura de
**tabela Pai x Filho** (HTML com `tablename`, linha-base no `<tbody>` e acionamento
de inclusão/remoção de filhos), seguindo as regras oficiais.

## Quando Usar

- Ao criar um **novo formulário eletrônico** do Fluig a partir do zero.
- Quando o desenvolvedor fornece um nome/propósito e a lista de campos e quer um ponto de partida correto (campos + view + eventos) seguindo as convenções oficiais.
- Quando é preciso garantir, desde o início, i18n nos textos visíveis, validação/sanitização da entrada do usuário e o contexto de execução correto dos eventos (server-side, Rhino/ES5).
- Quando o formulário precisa de **coleções dinâmicas** (itens, aprovações,
  anexos lógicos etc.) com modelagem em **Pai x Filho**.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Nome do formulário | Identificador camelCase do formulário — usado como nome do arquivo HTML **e** como prefixo dos arquivos `.properties` (ex.: `registroIncidenteTI`) | sim |
| Campos | Lista de campos do formulário (nome, tipo e se é obrigatório) | sim |
| Regras de validação | Regras de preenchimento/consistência por campo ou para o formulário | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [architecture.md](../../context/architecture.md) — modelo conceitual do **Form** e seus **pontos de extensão públicos**: a **view/markup** do formulário e os handlers que reagem aos **eventos de ciclo de vida e de campos**. ⚠️ **Atenção ao contexto de execução:** esses eventos de formulário rodam **server-side no motor Rhino (base ES5)** — não no navegador. Veja também a seção "Estrutura de um Projeto Fluig": o form fica em `forms/` e seus eventos em `forms/events/`.
- [conventions-form.md](../../context/conventions-form.md) — **Convenções de Form**: contêiner `fluig-style-guide`, `<form>` nomeado, ordem de scripts/estilos no `<head>`, scripts inline antes de `</body>`, atributo `name` obrigatório nos campos, **i18n de formulários** (`i18n.translate("chave")` no HTML e em eventos, 3 arquivos `.properties` por locale, codificação `\uXXXX`). **Os eventos de formulário são server-side (Rhino/ES5):** usam `var`/`function` (sem `const`/arrow/template literal), acessam os valores via API server-side do formulário (`form.getValue`/`form.setValue`) e **não** têm acesso a `WCMAPI`, `DOMPurify` nem a APIs de navegador. A validação/sanitização da entrada é feita server-side nesse contexto.
- Quando o formulário fizer parte de um **processo (workflow)** com eventos
  server-side (`beforeTaskSave`, `displayFields`) ou Atividade de Serviço,
  essas camadas são conceitualmente distintas da view do Form e são fonte de
  verdade de [processo-bpm.md](../../context/processo-bpm.md) — fora do
  escopo de geração desta skill.
- [writing-style-guide.md](../../context/writing-style-guide.md) — Terminologia oficial TOTVS para textos visíveis ao usuário (chaves i18n) — "plataforma" (não "produto"/"sistema"), "página" (Web)/"tela" (mobile), "recurso" (não "funcionalidade"), "criar"/"configurar" (não "cadastrar"), estrangeirismos em itálico.

> ⚠️ **Atenção:** o i18n de formulários usa `i18n.translate("chave")` — mecanismo
> **completamente diferente** do i18n de widgets/layouts (`${i18n.getTranslation(...)}`).
> Nunca misture os dois padrões.

## Estrutura de Saída

O formulário gerado segue a estrutura oficial (fonte de verdade em
`architecture.md`, seção "Estrutura de um Projeto Fluig"). O **nome do
arquivo HTML é idêntico ao prefixo dos `.properties`** (ex.: `<nomeForm>` em
camelCase) — divergência quebra a i18n do formulário. Os **eventos ficam em uma
pasta `events/`** e rodam **server-side (Rhino/ES5)**.

```text
<nomeForm>/
├── <nomeForm>.html                   # view/markup: fluig-style-guide + <form> nomeado
├── <nomeForm>_pt_BR.properties        # i18n pt-BR (i18n.translate)
├── <nomeForm>_en_US.properties        # i18n en-US
├── <nomeForm>_es.properties           # i18n es
├── beforeMovementOptions.js          # (quando aplicável) evento CLIENT-SIDE, na RAIZ do form
├── beforeSendValidate.js             # (quando aplicável) evento CLIENT-SIDE, na RAIZ do form
└── events/                           # handlers SERVER-SIDE (Rhino/ES5)
    ├── displayFields.js              # exibição/preenchimento de campos (quando aplicável)
    ├── validateForm.js               # validação server-side da entrada (quando aplicável)
    └── <demais eventos do ciclo de vida>.js   # beforeProcessing, enableFields, inputFields, afterSaveNew, afterProcessing
```

> **Dois locais, dois contextos de execução** (ver TDN *Eventos de Formulário*):
> os eventos **server-side** (contexto Rhino, recebem
> `FormController`) ficam em **`events/`**; os eventos **client-side** que rodam no
> **navegador** — `beforeMovementOptions(numState)` e
> `beforeSendValidate(numState, nextState)` — ficam na **raiz do form** (não em
> `events/`) como `.js` **vinculado no HTML** via
> `<script src="beforeMovementOptions.js" charset="utf-8"></script>` no `<head>`.
> Os client-side declaram o ponto de entrada como `var nome = function(...) { ... }`
> (a plataforma os chama pelo nome), leem o DOM (`document.form.campo.value`) e
> sinalizam erro com `throw`. Como rodam direto no navegador (sem FreeMarker nem
> Rhino), o **corpo** pode usar ES6+ (`const`/`let`, arrow, template literals);
> o ES5 vale só para `events/` (Rhino). Ver a tabela
> completa (assinatura × contexto) em `conventions-form.md` › "Eventos de
> Formulário".

> **i18n do form:** diferentemente de widgets/layouts, **não** há arquivo
> `.properties` "base" sem locale — o formulário usa os 3 locais (`_pt_BR`,
> `_en_US`, `_es`) com `i18n.translate("chave")`, nunca
> `${i18n.getTranslation(...)}`. Todos os `.properties` em padrão Java Properties
> (sem caractere não-ASCII direto — usar `\uXXXX`).
>
> **Eventos = server-side (Rhino/ES5).** Os arquivos em `events/` usam
> `var`/`function` (sem `const`/`let`/arrow/template literal), leem/gravam via
> `form.getValue`/`form.setValue` e **não** têm `WCMAPI`/`DOMPurify` nem APIs de
> navegador. Os nomes de evento válidos (ex.: `displayFields`, `validateForm`,
> `inputFields`, `beforeProcessing`, `afterProcessing`) e seus contratos vivem em
> [conventions-form.md](../../context/conventions-form.md), seção "Eventos de
> Formulário" — **não invente** nomes de evento.
>
> **Pai × Filho (quando solicitado):** a grade dinâmica é declarada **dentro do
> `<nomeForm>.html`** com `<table tablename="...">` e linha-base no `<tbody>`
> (não gera arquivo novo) — ver `conventions-form.md`.
>
> **Ramo Parceiro (Store).** Quando a persona é **Parceiro** (ver Passo 0),
> aplica-se, quando aplicável, o **prefixo de namespacing** de datasets/formulários
> ([§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)); o restante
> da estrutura (HTML = prefixo dos `.properties`, 3 locais, `events/` server-side) é
> **igual** nas duas personas.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- A **view/markup** envolve os campos em `fluig-style-guide` + `<form>` nomeado; CSS/libs no `<head>`, scripts inline antes de `</body>` → ver `conventions-form.md`.
- **Todo campo tem o atributo `name`** (obrigatório para o Fluig gravar/ler o valor); `id`, `for`, `placeholder` são recomendados por semântica/acessibilidade → ver `conventions-form.md`.
- **Pai x Filho (quando aplicável):** declarar a tabela com `tablename` no
   `<table>`, manter uma linha-base no `<tbody>` e deixar o Fluig gerar as linhas
   com sufixo `___<indice>` → ver `conventions-form.md`.
- **Adicionar/remover filhos:** usar `wdkAddChild("<tablename>")` e
   `fnWdkRemoveChild(...)` (remover tem prefixo `fn` — par assimétrico; `wdkRemoveChild` sem `fn` **não existe**) sem manipular índice manualmente. Para customizar a exclusão, usar o atributo `customFnDelete="minhaFn(this)"` chamando `fnWdkRemoveChild` dentro → ver `conventions-form.md`.
- **Consumo via dataset:** para consultar a tabela filha, filtrar por
   `documentid`, `tablename` e `metadata#active` → ver `conventions-form.md`.
- **Campo pesquisa (zoom):** quando o form seleciona um registro de dataset, usar `<input type="zoom" data-zoom="...">` (com `zoomvalue`+`hidden_<campo>` para gravar o código) e as funções **client-side** `setSelectedZoomItem(item)`/`removedZoomItem(item)` (par — selecionar autopreenche, remover limpa), diferenciando a origem por `item.inputId` → ver `conventions-form.md` › "Campo Pesquisa (zoom)".
- **⚠️ Formato do `data-zoom` (o atributo é parseado como objeto):** envolver em **chaves `{ }`** (`data-zoom="{ ... }"` — sem elas o parse quebra), **só aspas simples** internas (aspa dupla quebra o atributo), e `standard`/`visible` como **string** (`'standard':'true'`, não booleano). **Nunca** `i18n.translate(...)` dentro do `data-zoom` — labels/placeholder do zoom são **texto literal**; i18n só nos elementos HTML fora do zoom → ver `conventions-form.md` › "Campo Pesquisa (zoom)".
- **Zoom dependente/encadeado (caso comum):** filtrar um zoom B pela seleção do zoom A com `reloadZoomFilterValues("B", "campo," + item["valor"])` dentro do `setSelectedZoomItem`; limpar com `reloadZoomFilterValues("B", "")` no `removedZoomItem`. Filtro automático **só p/ dataset interno** — em dataset customizado o filtro vira **constraint** e precisa ser implementado no código do dataset → ver `conventions-form.md` › "Zoom dependente/encadeado".
- **Habilitar/desabilitar zoom por seleção (client-side):** usar `window["<idZoom>"].disable(true|false)` (ex.: via `onblur` do campo de origem) — **não** confundir com o `form.setEnabled(...)` server-side (Rhino) → ver `conventions-form.md` › "Habilitar/desabilitar um campo zoom".
- O desenvolvedor implementa **handlers nos eventos públicos do formulário** (ciclo de vida e campos), que rodam **server-side (Rhino/ES5)** — não no navegador → ver `architecture.md`.
- **i18n — HTML:** todo texto exibido ao usuário usa `i18n.translate("chave")`. **Nunca** gerar texto fixo em elementos visíveis → ver `conventions-form.md`.
- **i18n — Eventos JS:** mensagens em handlers usam `i18n.translate("chave")` — chave **sempre entre aspas duplas** → ver `conventions-form.md`. (Eventos de form são server-side Rhino/ES5 — ver a regra de sintaxe `var`/`function` abaixo.)
- **i18n — Arquivos:** gerar **obrigatoriamente** os 3 arquivos `.properties` (`_pt_BR`, `_en_US`, `_es`). Todas as chaves do HTML e dos eventos devem estar presentes nos 3 arquivos → ver `conventions-form.md`.
- **i18n — Codificação:** todos os 3 arquivos `.properties` seguem padrão Java Properties; **nenhum** caractere não-ASCII diretamente — usar `\uXXXX` → ver `conventions-form.md`.
- **Chaves descritivas** em dot-notation: `customer.name`, `validation.required.field` → ver `conventions-form.md`.
- **Terminologia oficial TOTVS:** textos visíveis ao usuário (chaves i18n) seguem a **terminologia oficial TOTVS** — "plataforma" em vez de "produto"/"sistema", "página" para Web/"tela" para mobile, "recurso" em vez de "funcionalidade", "criar"/"configurar" em vez de "cadastrar", estrangeirismos (_layout_, _widget_) em itálico → ver `writing-style-guide.md`.
- **Eventos de formulário = server-side (Rhino/ES5):** escrever o arquivo de eventos em **ES5** (`var`, `function`), **sem** `const`/`let`/arrow/template literal, que podem quebrar no Rhino. Ler/gravar valores via `form.getValue`/`form.setValue`. **Não** usar `WCMAPI`, `DOMPurify` nem APIs de navegador nesse arquivo (não existem no servidor) → ver `conventions-form.md`.
- **Valores vindos do Java no Rhino:** um valor lido de campo pode ser `java.lang.String`, não string JS — encadear métodos sobrecarregados (`.replace`, `.split`) causa erro de **sobrecarga ambígua**, inclusive com regex e inclusive após `.toString()`. Envolva o valor com `String(...)` antes de operar → ver `technologies.md` › "Interoperabilidade com Java (Rhino)".
- **Comparação de valores server-side: use `==`, nunca `===`.** `getFormMode()` e demais retornos "String" são `java.lang.String`, então `=== 'ADD'` é **sempre falso** e a lógica não dispara; compare com `==` (modos: `'ADD'`/`'MOD'`/`'VIEW'`/`'NONE'`) → ver `conventions-form.md` › "Eventos server-side".
- **Validar e sanitizar** toda entrada do usuário **no servidor**, dentro dos eventos (ex.: validar formato/obrigatoriedade e rejeitar conteúdo perigoso antes de gravar) → ver `conventions-form.md`. (A sanitização para exibição com `WCMAPI.validateXSS`/`DOMPurify` pertence ao JS **client-side** do widget/layout, não aos eventos server-side do form.)

## Procedimento

1. Definir o **nome do formulário** em camelCase (ex.: `registroIncidenteTI`) — ele será usado como nome do arquivo HTML **e** como prefixo dos 3 arquivos `.properties`. O nome do `.html` e o prefixo dos `.properties` devem ser **exatamente iguais**:
   ```
   registroIncidenteTI.html
   registroIncidenteTI_pt_BR.properties
   registroIncidenteTI_en_US.properties
   registroIncidenteTI_es.properties
   ```
2. Levantar todas as **chaves de i18n** necessárias — uma por rótulo, placeholder e mensagem de validação visível — seguindo a convenção dot-notation.
3. Criar a **view/markup** (`<nomeFormulario>.html`) — o nome do arquivo HTML deve ser **idêntico** ao prefixo dos `.properties`.
4. Criar os **arquivos de eventos server-side** (em `events/`, Rhino/ES5) com os handlers dos eventos públicos (ciclo de vida e campos): `function nome(form) { ... }`, em **ES5** (`var`/`function`), lendo/gravando valores via `form.getValue`/`form.setValue`. Mensagens de validação via `i18n.translate("chave")`; validar/sanitizar a entrada **no servidor** (sem `WCMAPI`/`DOMPurify`, que não existem nesse contexto). **Não** usar `setEnable` (depreciado).
4a. **Se houver validação no envio/movimentação** (`beforeMovementOptions`/`beforeSendValidate`): criar o(s) `.js` **na raiz do form** (não em `events/`) como `var nome = function(numState[, nextState]) { ... }`, lendo o DOM (`document.form.campo.value`) e sinalizando erro com `throw`; e **vincular o arquivo no HTML** com `<script src="<arquivo>.js" charset="utf-8"></script>` no `<head>`. São eventos **client-side** (navegador), contexto distinto dos de `events/`.
5. Criar os **3 arquivos `.properties`** (`_pt_BR`, `_en_US`, `_es`) com todas as chaves levantadas no passo 2. Em todos os arquivos: **nenhum** caractere não-ASCII diretamente — usar `\uXXXX`.
6. Se houver necessidade de grade dinâmica, criar a seção **Pai x Filho** no HTML:
   - `<table tablename="...">` com `<tbody id="...">` contendo a linha-base.
   - Campos com nome base sem sufixo manual (`campo`, não `campo___1`).
   - Botão/ação para inclusão usando `wdkAddChild("<tablename>")`; remoção com `fnWdkRemoveChild(element)` (prefixo `fn`), opcionalmente via `customFnDelete`.
7. Quando solicitado consumo analítico, incluir exemplo de consulta ao dataset do
   formulário com constraints de `documentid`, `tablename` e `metadata#active`.
8. Validar o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Esqueleto de formulário pronto para evoluir, contendo:

- A **view/markup** com contêiner `fluig-style-guide`, `<form>` nomeado, cada campo com `name` (e `id`/`for`/`placeholder` quando aplicável) e todos os rótulos via `i18n.translate("chave")`.
- Quando aplicável, a **tabela Pai x Filho** com `tablename`, linha-base no
   `<tbody>`, campos prontos para sufixação automática `___<indice>` e gatilhos de
   inclusão/remoção compatíveis com Fluig.
- O **arquivo de eventos** (server-side, Rhino/ES5) com handlers de ciclo de vida e de campos, em ES5 (`var`/`function`), lendo/gravando via `form.getValue`/`form.setValue`, mensagens via `i18n.translate` e entrada validada/sanitizada no servidor.
- Os **3 arquivos `.properties`** (`_pt_BR`, `_en_US`, `_es`) com todas as chaves, sem caracteres não-ASCII diretos (usar `\uXXXX`).

Tudo em conformidade com `context/architecture.md` e `context/conventions.md`.

## Exemplo de Uso

Use `examples/form/` como referência mínima que demonstra `i18n.translate` no HTML, handlers de evento com `i18n.translate` em mensagens, sanitização e os 3 arquivos `.properties`. Trate-o como trecho de referência, não como projeto completo.

## Política de Fallback

- **Faltando o nome ou os campos essenciais** para gerar: solicitar antes de gerar — não assumir campos nem inventar o identificador do formulário.
- **Funcionalidade já coberta por Componente de Negócio nativo** (seleção de usuário/grupo/papéis, busca de documento, recorte de imagem, resposta de formulário): **não reimplementar** UI/lógica própria nos eventos — orientar o reuso do componente nativo (`ECMBC`/`SOCIALBC`/`WCMBC`), conforme [business-components.md](../../context/business-components.md).
- **Formulário vinculado a um processo (workflow)** — eventos server-side de processo (`beforeTaskSave`, `displayFields` de processo) ou Atividade de Serviço: essa é **outra camada**, fonte de verdade de [processo-bpm.md](../../context/processo-bpm.md) e **fora do escopo** desta skill — orientar o desenvolvedor em vez de gerar o artefato de processo aqui.
- **Nome de evento ou API de formulário não confirmável** como público/oficial: descrever o comportamento de forma genérica e **perguntar/registrar como pendência** em vez de inventar nomes de evento — os eventos válidos vivem em [conventions-form.md](../../context/conventions-form.md).
- **Parceiro — prefixo de namespacing** de datasets/formulários (quando aplicável): vem do onboarding na Store (`partner-store-conventions.md` [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)) — **nunca inventar**; se desconhecido, tratar como pendência e perguntar.

## Checklist de Validação

- [ ] A **view** envolve os campos em `fluig-style-guide` + `<form>` nomeado; CSS/scripts de biblioteca no `<head>` e scripts inline antes de `</body>`.
- [ ] **Todo campo tem o atributo `name`**; `id`/`for`/`placeholder` aplicados quando fizerem sentido.
- [ ] **Todo texto visível** no HTML usa `i18n.translate("chave")` — nenhum texto fixo em rótulos, placeholders ou mensagens.
- [ ] **Mensagens em handlers** usam `i18n.translate("chave")` — nenhuma string literal lançada diretamente.
- [ ] O **nome do arquivo HTML** é idêntico ao prefixo dos `.properties` (ex.: `registroIncidenteTI.html` + `registroIncidenteTI_pt_BR.properties`, etc.).
- [ ] Se houver Pai x Filho: tabela declarada com `tablename`, linha-base no
   `<tbody>` e campos com nome base (sem sufixar manualmente `___n`).
- [ ] Se houver Pai x Filho: inclusão/remoção de linhas modeladas com
   `wdkAddChild(...)` e `fnWdkRemoveChild(...)` — remover usa o prefixo `fn`
   (`wdkRemoveChild` sem `fn` não existe e quebra a exclusão).
- [ ] Se houver consumo da tabela filha: exemplo de dataset com constraints de
   `documentid`, `tablename` e `metadata#active`.
- [ ] Se houver campo **zoom**: o `data-zoom` está envolto em **chaves `{ }`**, usa **apenas aspas simples** internas, `standard`/`visible` como **string** (`'true'`/`'false'`) e **nenhum** `i18n.translate(...)` (labels/placeholder do zoom são texto literal) — qualquer desvio quebra o parse do componente (`Unexpected ... JSON`).
- [ ] **i18n só em conteúdo de elemento HTML e em eventos server-side.** `i18n.translate(...)` **NÃO** funciona em atributo (`placeholder`/`value`) — aparece literal — **nem** em `<script>` client-side do form — quebra a sintaxe (`missing ) after argument list`). Texto traduzido no JS da tela: ler de elemento com i18n em conteúdo (`textContent`) ou passar via `FormContext` do `displayFields` (server-side) → ver `conventions-form.md` › "Sintaxe em JavaScript".
- [ ] Os **3 arquivos `.properties`** foram gerados (`_pt_BR`, `_en_US`, `_es`).
- [ ] Todas as **chaves do HTML e dos eventos** existem nos 3 arquivos `.properties`.
- [ ] Textos i18n seguem terminologia oficial TOTVS (`writing-style-guide.md`) — "plataforma" (não "produto"), "página"/"tela" conforme Web/mobile, "recurso" (não "funcionalidade"), estrangeirismos em itálico.
- [ ] Nenhum arquivo `.properties` contém caracteres não-ASCII diretos — todos convertidos para `\uXXXX`.
- [ ] A entrada do usuário é validada/sanitizada **no servidor**, dentro dos eventos (sem `WCMAPI`/`DOMPurify`, que não existem no contexto Rhino).
- [ ] Os **arquivos de eventos server-side** (em `events/`) estão em **ES5** (Rhino): usam `var`/`function`, **sem** `const`/`let`/arrow/template literal, e leem/gravam via `form.getValue`/`form.setValue`. Não usam `setEnable` (depreciado).
- [ ] Valores lidos de campos (possíveis `java.lang.String`) são envolvidos com `String(...)` antes de encadear métodos de texto (`.replace`/`.split`) — evita erro de sobrecarga ambígua no Rhino; regex ou `.toString()` **não** resolvem (`technologies.md` › "Interoperabilidade com Java (Rhino)").
- [ ] Comparações de `getFormMode()` (e demais retornos "String" do `FormController`) usam `==`/`!=`, **nunca** `===`/`!==` — com igualdade estrita o `java.lang.String` nunca casa com o literal JS e a condição não dispara (`conventions-form.md` › "Eventos server-side").
- [ ] Se houver validação no envio (`beforeMovementOptions`/`beforeSendValidate`): o `.js` está na **raiz do form** (não em `events/`), como `var nome = function(...)`, e está **vinculado no HTML** via `<script src="...js" charset="utf-8"></script>`.
