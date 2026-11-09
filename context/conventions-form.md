# Convenções de Form (formulário eletrônico)

A view de um formulário eletrônico é um documento HTML que **deve** envolver os
campos em um contêiner com a classe `fluig-style-guide` (ativa os estilos e
componentes do Style Guide) e em um elemento `<form>` nomeado.

## Estrutura base da view

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" type="text/css"
          href="/style-guide/css/fluig-style-guide-flat.min.css">
    <script src="/portal/resources/js/jquery/jquery.js"></script>
    <script src="/portal/resources/js/jquery/jquery-ui.min.js"></script>
    <script src="/portal/resources/js/mustache/mustache-min.js"></script>
    <script src="/style-guide/js/fluig-style-guide.min.js"></script>
</head>
<body>
    <div class="fluig-style-guide">
        <form name="form" role="form">
            <!-- campos do formulário -->
        </form>
    </div>
</body>
</html>
```

## Ordem de scripts e estilos

| Recurso | Onde declarar | Motivo |
|---------|---------------|--------|
| CSS (Style Guide) e `<script>` de bibliotecas | No `<head>` | O funcionamento interno do Fluig depende de os estilos e as bibliotecas estarem disponíveis no carregamento da página |
| Scripts **inline** do formulário | No **fim** da página, antes de `</body>` | Garante que o DOM dos campos já exista quando o script roda |

## Campos do formulário

| Atributo | Obrigatório | Diretriz |
|----------|-------------|----------|
| `name` | **Sim** | Todo campo de formulário **deve** ter `name` — é por ele que o Fluig persiste e lê o valor do campo |
| `id`, `for`, `placeholder`, etc. | Não | **Recomendados** por semântica e boas práticas (acessibilidade, associação `label`/campo, dicas de preenchimento), embora não exigidos pela plataforma |

> **Regra crítica:** um campo sem `name` não é gravado nem recuperado pelo Fluig.
> Associe cada `label` ao seu campo via `for`/`id` para acessibilidade, mesmo que
> não seja obrigatório.

## Tabela Pai x Filho (Form)

No Form, a técnica Pai x Filho e declarada no HTML com o atributo `tablename` na
tag `<table>`. O Fluig usa a linha-base do `<tbody>` como template e cria as
linhas dinâmicas no render da pagina.

### Estrutura HTML minima

| Elemento | Regra |
|----------|-------|
| `<table tablename="...">` | Obrigatório para ativar Pai x Filho na tabela |
| `<tbody id="...">` | Deve representar a tabela (normalmente o mesmo identificador do `tablename`) |
| Linha base no `<tbody>` | Define os campos que serão replicados nas linhas dinamicas |

```html
<table class="table table-striped" tablename="observacoes" noaddbutton="false" nodeletebutton="false">
  <thead>
    <tr>
      <th>Observações</th>
    </tr>
  </thead>
  <tbody id="aprovacoes">
    <tr>
      <td><input type="text" name="obs" id="obs" class="form-control" /></td>
    </tr>
  </tbody>
</table>
```

### Sufixo automatico das linhas

- No HTML de origem, declare os campos com nome simples (ex.: `name="nomeFantasia"`).
- Nas linhas renderizadas dinamicamente, o Fluig aplica sufixo numerico no
  formato `___<índice>` (ex.: `nomeFantasia___1`, `nomeFantasia___2`, ...).
- O indice da linha e controlado pelo Fluig e nao deve ser manipulado manualmente.
- Evite usar `___` no nome base do campo para nao conflitar com o índice gerado.

### Adição e remoção de linhas

- `wdkAddChild("<tablename>")` adiciona uma nova linha e retorna o índice criado.
- **`fnWdkRemoveChild(element)`** remove a linha da interface de edição. ⚠️ Atenção
  ao nome: **adicionar** é `wdkAddChild` (sem prefixo), mas **remover** é
  `fnWdkRemoveChild` (**com o prefixo `fn`**) — par assimétrico. Não existe
  `wdkRemoveChild` sem o `fn`; usá-lo quebra a remoção.
- A linha base (template mestre) fica oculta; o usuário visualiza apenas as
  linhas dinâmicas geradas.
- **Customizar a remoção (oficial):** declare `customFnDelete="minhaFn(this)"` no
  `<table tablename="...">`; a função custom fica no HTML do form e **deve
  obrigatoriamente** chamar a função padrão `fnWdkRemoveChild(element)` para a
  exclusão efetivar. O atributo correlato para trocar o ícone é `deleteicon`.

```html
<table tablename="itens" customFnDelete="fnCustomDelete(this)">
<script>
  function fnCustomDelete(oElement) {
    // customização antes...
    fnWdkRemoveChild(oElement); // chamada padrão — NÃO retirar
    // customização depois...
  }
</script>
```

### Persistência, histórico e versão

- Os dados Pai x Filho sao persistidos em estrutura própria vinculada ao registro
  do formulário.
- Ao salvar o formulário, o Fluig gera nova versão do registro e mantém
  histórico das versões anteriores.
- IDs de linhas removidas nao sao reaproveitados em versões futuras.

Colunas padrão recorrentes na persistência da tabela filha:

| Coluna | Uso |
|--------|-----|
| `anonymization_date` | Data de anonimização (LGPD) |
| `anonymization_user_id` | Usuário que realizou a anonimização |
| `cardid` | ID do formulário no Fluig |
| `companyid` | ID da empresa |
| `documentid` | ID do documento/registro do formulário |
| `id` | ID da linha da tabela filha |
| `masterid` | ID de referencia da tabela |
| `tableid` | Nome da tabela (valor de `tablename`) |
| `version` | versão do registro do formulário |

Encadeamento de relacionamento usado para leitura/versionamento:
`companyid -> cardid -> documentid -> id -> version`.

### Consumo via Dataset (relatórios, dashboards, integrações)

Para consultar registros de uma tabela Pai x Filho do formulário, use
`DatasetFactory.getDataset(...)` com as constraints de `documentid`, `tablename`
e `metadata#active`.

```javascript
// ⚠️ server-side (Rhino): leia com getValue(i, "coluna") + rowsCount — NÃO result.values[i].col
var result = DatasetFactory.getDataset("nomeDoDatasetDoFormulario", null, [
  DatasetFactory.createConstraint("documentid", documentId, documentId, ConstraintType.MUST),
  DatasetFactory.createConstraint("tablename", nomePaiFilho, nomePaiFilho, ConstraintType.MUST),
  DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST)
], null);

for (var i = 0; i < result.rowsCount; i++) {
  var id = result.getValue(i, "id");
  var produto = result.getValue(i, "productName"); // coluna definida no HTML do form
}
```

> ⚠️ **Leitura do retorno difere por contexto.** No **servidor (Rhino)** use
> `result.getValue(i, "coluna")` iterando por `result.rowsCount` — **não**
> `result.values[i].coluna` (no Rhino `result.values` é um array de arrays Java e
> `row.coluna` lança `Java class "[Ljava.lang.Object;" has no public instance
> field ... "coluna"`). No **cliente**, o `content` do `callback.success` é JSON e
> aí sim `content.values[i].coluna` funciona. Ver `architecture.md` › "API pública
> de Dataset".

Colunas recorrentes do retorno incluem metadados e campos da tabela, como:
`anonymization_date`, `anonymization_user_id`, `cardid`, `companyid`,
`documentid`, `id`, `masterid`, `tableid`, `version` e as colunas definidas pelo
desenvolvedor no HTML.

## Eventos de Formulário

Eventos de formulário são scripts JavaScript carregados pela API de Formulários e
disparados em momentos específicos do ciclo de vida/interação do formulário. Fonte
de verdade: TDN *Eventos de Formulário*.

> ⚠️ **Dois contextos de execução distintos — não confunda.** A maioria dos
> eventos roda **server-side** no motor **Rhino (ES5)** e recebe um objeto
> `FormController` (parâmetro `form`); dois eventos rodam **client-side** no
> navegador e, como o restante do JS de cliente do form, ficam **inline num
> `<script>` no HTML do formulário** (o form não passa por FreeMarker — ver
> "Sintaxe em JavaScript — onde o código mora"). No server-side **não existem**
> `WCMAPI`, `DOMPurify`, `document` nem APIs de navegador; use
> `form.getValue`/`form.setValue` e a sintaxe ES5 (`var`, `function`).

### Eventos server-side (Rhino/ES5) — recebem `FormController`

| Evento | Assinatura | Quando dispara | Para que serve |
|--------|-----------|----------------|----------------|
| `beforeProcessing` | `beforeProcessing(form)` | Primeiro de todos, antes de qualquer outro evento | **Somente consulta** — alterações aqui **não** são persistidas |
| `displayFields` | `displayFields(form, customHTML)` | Ao apresentar os objetos do formulário | **Único** que altera valores **antes** da renderização; oculta/mostra campos (`setVisible`/`setVisibleById`), controla botões (`setHideDeleteButton`, `setHidePrintLink`) e injeta HTML/JS via `customHTML.append(...)` |
| `enableFields` | `enableFields(form)` | Ao habilitar os objetos do formulário | Habilita/desabilita campos (`setEnabled`); proteção extra com `setEnabled(nome,false,true)` ou `setEnhancedSecurityHiddenInputs(true)` |
| `inputFields` | `inputFields(form)` | Quando os dados do formulário vão para a BO | Tratar campos vindos do navegador (ex.: normalizar datas). **Não** usar `getValue` aqui |
| `validateForm` | `validateForm(form)` | Antes da gravação dos dados | Validar campos/regras de negócio; `throw "mensagem"` bloqueia a gravação |
| `afterSaveNew` | `afterSaveNew(form)` | Após a criação do registro | Log ou disparo de evento pós-criação |
| `afterProcessing` | `afterProcessing(form)` | Último evento disparado | **Somente consulta** — alterações **não** são persistidas; log/disparo |

> `setEnable` está **depreciado** — não usar.

> ⚠️ **Pegadinha de tipos: compare valores server-side com `==`, nunca `===`.**
> Métodos do `FormController` que "retornam String" devolvem, no Rhino, um objeto
> **`java.lang.String`** (Java), não uma string primitiva JS. A igualdade **estrita**
> `===` compara tipo + identidade e um `java.lang.String` **nunca** é estritamente
> igual a um literal JS — então `form.getFormMode() === 'ADD'` é **sempre falso** e
> a lógica não dispara. Use **igualdade solta `==`** (ou `!=`), que faz a coerção:
> `form.getFormMode() == 'ADD'`.
>
> - `getFormMode()` retorna `'ADD'` (criação), `'MOD'` (edição), `'VIEW'`
>   (visualização) ou `'NONE'` (sem formulário apresentado, ex.: durante a
>   validação). **Trate os quatro** quando a lógica depender do modo.
> - A mesma regra vale para comparar qualquer valor vindo de `getValue(...)` /
>   métodos Java. Quando precisar de comparação estrita ou de encadear métodos de
>   texto, **normalize antes com `String(...)`** (ver
>   [technologies.md](technologies.md) › "Interoperabilidade com Java (Rhino)").

### Eventos client-side (navegador) — num `.js` vinculado ao HTML

| Evento | Assinatura | Quando dispara | Para que serve |
|--------|-----------|----------------|----------------|
| `beforeMovementOptions` | `var beforeMovementOptions = function(numState) { ... }` | Ao clicar em "enviar", **antes** de abrir a tela de movimentação | Validação client-side antes de ir ao servidor. Só executa quando há abertura da tela de movimentação; **não** roda em movimentação via API — combine com `validateForm` para garantir a validação |
| `beforeSendValidate` | `var beforeSendValidate = function(numState, nextState) { ... }` | Ao enviar, **após** escolher a atividade/usuário destino | Validação client-side considerando a atividade destino |

## Campo Pesquisa (zoom)

O **campo pesquisa** (ou **campo zoom**) deixa o usuário buscar e selecionar um
registro de um **dataset** (nativo ou customizado) a partir de um `<input>` no
formulário, gravando o valor exibido e, opcionalmente, um código associado.

### Declaração (HTML)

```html
<input type="zoom" class="form-control" id="user" name="user"
       zoomvalue="colleagueId"
       data-zoom="{'displayKey':'colleagueName','datasetId':'colleague','fields':[{'field':'colleagueId','label':'Codigo','visible':'false'},{'field':'colleagueName','label':'Nome','standard':'true'}]}">
<input type="hidden" id="hidden_user" name="hidden_user">
```

- **`type="zoom"`** marca o input como campo pesquisa.
- **`data-zoom`** carrega a configuração: `datasetId` (dataset consultado),
  `displayKey` (campo exibido após a seleção), `fields[]` (colunas, com
  `'standard':'true'` no campo padrão de busca e `'visible':'false'` para ocultar — como string),
  `maximumSelectionLength` (multi-seleção), `resultLimit`, e filtros.
- **`zoomvalue`** grava, **além** do texto visível, um campo do dataset (ex.: o
  código/PK). Exige um campo irmão **`hidden_<campo>`** com mesmo `id`/`name`
  (ex.: `hidden_user`) — o Fluig o preenche automaticamente com o campo indicado.
  O campo de `zoomvalue` **precisa** estar entre os `fields` do `data-zoom`.
- **Dependências:** o form precisa carregar Style Guide (CSS/JS) + **jQuery** +
  **jQuery UI** (o zoom usa esses plugins embutidos).
- **Filtro do zoom — interno × customizado:** em datasets **internos** do Fluig o
  filtro (`filterValues`/busca) é aplicado **automaticamente**. Em dataset
  **customizado** o filtro **também funciona**, mas **não** automaticamente: a
  plataforma repassa a busca/encadeamento como **constraints** (incluindo a busca
  parcial com `likeSearch=true` e o controle `sqlLimit`), e o **código do dataset
  precisa implementá-las** — senão o zoom não filtra (ou, pior, retorna vazio). Ver
  [architecture.md](architecture.md) › "Constraints de CONTROLE / likeSearch" e a
  subseção "Zoom dependente/encadeado" abaixo.

> ⚠️ **Formato do `data-zoom` — erros que quebram o campo.** O conteúdo do
> `data-zoom` é um objeto que a plataforma **parseia** no carregamento (`JSON.parse`
> em `loadZoomForInput`). Qualquer desvio gera, no console, `Unexpected
> non-whitespace character after JSON at position N`. Três regras **obrigatórias**:
>
> 1. **Envolva o objeto em chaves `{ }`:** `data-zoom="{ ... }"`. **Sem** as chaves
>    o parse falha logo no início (posição ~12). Esse é o erro mais comum.
> 2. **Só aspas simples internas:** o atributo HTML já usa aspas **duplas**
>    (`data-zoom="..."`), então dentro dele use **aspas simples** (`'field':'nome'`).
>    Uma aspa dupla interna fecha o atributo no meio e corrompe o parse.
> 3. **`standard`/`visible` como string com aspas:** `'standard':'true'`,
>    `'visible':'false'` — **não** booleanos (`true`/`false` sem aspas).
>
> Prefira o `data-zoom` em **uma linha** (ou sem indentação profunda) para não
> injetar espaços/quebras que atrapalhem.
>
> - **Nada de `i18n.translate(...)` dentro do `data-zoom`.** O `data-zoom` **não** é
>   ponto de i18n, e `i18n.translate("...")` ainda traria aspas duplas que quebram o
>   atributo. Os `label` de `fields[]` e o `placeholder` do `data-zoom` são **texto
>   literal** (ex.: `'label':'Nome do cliente'`). Se precisar de rótulos traduzidos
>   nas colunas, isso é limitação do componente — mantenha texto fixo aqui e aplique
>   i18n só nos elementos de HTML fora do zoom (`<label>`, etc.).
> - **i18n em atributo HTML NÃO funciona.** `i18n.translate(...)` só é interpolado
>   em **conteúdo de elemento** (`<label>i18n.translate("chave")</label>`), não em
>   `placeholder`/`value`/`title` — ali aparece **literal**. Para um placeholder
>   traduzido, use **texto fixo**, ou leia o texto já traduzido de um elemento com
>   i18n em conteúdo (`document.getElementById('x').textContent`), ou passe-o via
>   `FormContext` (resolvido no `displayFields` server-side). **Não** chame
>   `i18n.translate` no `<script>` client-side — quebra a sintaxe (ver "Sintaxe em
>   JavaScript").

### Métodos sobrescrevíveis (CLIENT-SIDE, navegador)

Estas funções rodam **no navegador** (não no Rhino): são JS **client-side**
comum, escrito direto no `.js`/`<script>` do form e executado pelo navegador sem
passar por FreeMarker nem pelo Rhino. Por isso **não há restrição de sintaxe**:
use **ES6+** (`const`/`let`, arrow functions, template literals, `async/await`)
no corpo das funções, como em qualquer JS de frontend; o jQuery embutido segue
disponível. Mantenha apenas a **declaração do ponto de entrada** na forma
documentada (`function setSelectedZoomItem(item) { ... }`,
`var beforeSendValidate = function(...) { ... }`), pois a plataforma chama essas
funções pelo nome.

| Função | Assinatura | Dispara quando | Uso típico |
|--------|-----------|----------------|------------|
| `setSelectedZoomItem` | `function setSelectedZoomItem(item) { ... }` | Um item é **selecionado** no campo | Autopreencher outros campos com dados do item; validar; atualizar filtros de outros zooms |
| `removedZoomItem` | `function removedZoomItem(item) { ... }` | Um item é **removido** (clique no "X") | **Desfazer** o que `setSelectedZoomItem` fez — limpar os campos preenchidos (evita dado fantasma ao enviar) |
| `reloadZoomFilterValues` | `reloadZoomFilterValues(inputName, filterValues)` | (chamada manualmente) | Atualiza o `filterValues` de outro campo zoom — **zoom dependente/encadeado** |

- O objeto recebido (`item`/`selectedItem`) traz os campos do dataset
  (`item['colleagueId']`, `item.colleagueName`) e **`item.inputId`** — o `id` do
  campo que disparou. Como **a mesma função atende todos os zooms** do form, use
  `item.inputId` (ou o parâmetro `type` da chamada) para diferenciar qual campo
  disparou.
- Metadados do registro de formulário no retorno: `metadata_id`,
  `metadata_version`, `metadata_card_index_id`, `metadata_active`, etc.
- **Par recomendado:** sempre que implementar `setSelectedZoomItem` para
  autopreencher, implemente `removedZoomItem` para **limpar** os mesmos campos —
  caso contrário o form pode ser enviado com o código vazio e os dados residuais
  da seleção anterior na tela.

```javascript
// Autopreenchimento + limpeza (client-side, ES6+ no corpo; ponto de entrada
// declarado como function para a plataforma chamar pelo nome)
function setSelectedZoomItem(item) {
    if (item.inputId === "user") {
        document.getElementById("selected_userCode").value = item.colleagueId;
    }
}
function removedZoomItem(item) {
    if (item.inputId === "user") {
        document.getElementById("selected_userCode").value = "";
    }
}
```

> Como são **client-side** (navegador), **não** se aplica a pegadinha do Rhino
> (`java.lang.String`): aqui os valores do DOM/`item` são strings JS nativas.
> Use `===` normalmente (os exemplos oficiais usam `==`, mas ambos funcionam com
> strings JS nativas). O `==` obrigatório vale **só** nos eventos server-side
> (Rhino).

### Zoom dependente/encadeado — filtrar um zoom pela seleção de outro

Caso de uso mais comum: o usuário seleciona no zoom A e o zoom B passa a mostrar
só os registros relacionados. O mecanismo oficial é
**`reloadZoomFilterValues(inputName, filterValues)`**, chamado de dentro do
`setSelectedZoomItem` do campo de origem.

- **`inputName`** — o `id`/`name` do campo zoom **que receberá o filtro** (o B).
- **`filterValues`** — string de **pares `campo,valor`** separados por vírgula:
  `'campo1,valor1,campo2,valor2'`. O primeiro de cada par é o **campo do dataset**
  a filtrar; o segundo é o **valor**. Passar `""` **remove** o filtro (não filtra
  por nada).
- **Sempre diferencie a origem por `selectedItem.inputId`** — a mesma função
  atende todos os zooms do form.
- **No `removedZoomItem`, limpe o filtro do dependente** (`reloadZoomFilterValues("B", "")`)
  para o B não ficar preso ao filtro de uma seleção que já não existe.

```javascript
// Zoom encadeado: ao escolher o cliente (A), filtra os pedidos (B) por esse cliente
function setSelectedZoomItem(selectedItem) {
    if (selectedItem.inputId == "cliente") {
        reloadZoomFilterValues("pedido", "clienteId," + selectedItem["clienteId"]);
    }
}
function removedZoomItem(removedItem) {
    if (removedItem.inputId == "cliente") {
        reloadZoomFilterValues("pedido", ""); // some o filtro do dependente
    }
}
```

> ⚠️ **Dataset interno × customizado.** `filterValues` (inicial no `data-zoom` ou
> via `reloadZoomFilterValues`) é aplicado **automaticamente** para **datasets
> internos** do Fluig. Em **dataset customizado**, a plataforma apenas repassa os
> filtros como **constraints** — é o código do dataset que **precisa implementá-los**
> (ler `constraints` e filtrar), senão o filtro não tem efeito. Ver
> [conventions.md](conventions.md) › "Convenções de Dataset".
>
> ⚠️ Prefira filtrar por **código/PK** em vez de texto livre: valores com
> **barra** (datas `dd/MM/aaaa`) ou **espaços** são mais sensíveis a falhas de
> encode no filtro.

### Habilitar/desabilitar um campo zoom pela seleção de outro

Para **bloquear/liberar** um campo zoom a partir de outro campo (regra de
visibilidade/edição condicional), o mecanismo **client-side** oficial é o método
**`.disable(bool)`** do objeto do campo, acessível por `window["<idDoZoom>"]`:

```javascript
// true  = bloqueia o campo zoom
// false = libera o campo zoom
window["pedido"].disable(true);
```

Dispare a regra a partir do campo de origem — ex.: `onblur` no HTML, ou de dentro
do próprio `setSelectedZoomItem`:

```html
<input type="text" id="cliente" name="cliente" class="form-control"
       onblur="validarCliente(this.value)">
```

```javascript
function validarCliente(valor) {
    if (valor != "") {
        window["pedido"].disable(false); // tem cliente → libera o zoom de pedido
    } else {
        window["pedido"].disable(true);  // sem cliente → bloqueia
    }
}
```

> **Não confunda com o server-side.** Habilitar/desabilitar **no navegador** é
> `window["campo"].disable(bool)`. O
> `form.setEnabled(nome, bool[, protect])` do `FormController` é **server-side**
> (Rhino), roda em `enableFields`/`displayFields` e protege o valor na gravação —
> são mecanismos distintos, para contextos distintos. (`setEnable`, sem o `d`, está
> **depreciado**.)

### Segurança ao inserir dados (por contexto)

A forma segura de inserir dado **depende do contexto de execução**:

- **No `displayFields` (server-side) com `customHTML.append(...)`:** o `append`
  monta no servidor uma **string** de HTML/JS que o navegador executará depois.
  O risco é **injeção** ao concatenar valores dinâmicos. A defesa é **escapar o
  valor no servidor** antes de concatenar (e evitar interpolar dado direto em
  bloco `<script>`); o padrão mais seguro é injetar **um único objeto de contexto**
  serializado com `JSON.stringify(...)`. ⚠️ **`DOMPurify` não existe no Rhino** —
  não o use dentro de eventos server-side.
- **No `.js` client-side (navegador):** ao jogar dado não confiável no DOM, use
  `textContent` quando for só texto; quando precisar de HTML, sanitize com
  `DOMPurify.sanitize(valor)` **antes** do `innerHTML` (o `DOMPurify` é carregado
  globalmente pela plataforma no cliente).

```javascript
// ✅ displayFields (server-side): injeta UM objeto de contexto via JSON.stringify
function displayFields(form, customHTML) {
    var contexto = {
        modo: form.getFormMode(),
        solicitante: getValue("WKUser")
    };
    customHTML.append(
        "<script>window.FormContext = " + JSON.stringify(contexto) + ";</scr" + "ipt>"
    );
}
```

```javascript
// ✅ client-side (.js vinculado ao HTML): DOMPurify antes de innerHTML
el.innerHTML = DOMPurify.sanitize(valorNaoConfiavel);
```

## Internacionalização (i18n) em formulários

> **Mecanismo exclusivo de formulários** — completamente diferente do i18n de
> widgets/layouts (`${i18n.getTranslation(...)}` no `.ftl` e
> `[=i18n.getTranslation(...)]` no `.js`) e do de processos de workflow.
> É um dos [três domínios de i18n do Fluig](conventions.md#os-três-domínios-de-i18n-do-fluig).
> **Nunca misture os padrões.**

> Para a terminologia correta de textos visíveis ao usuário, ver
> [writing-style-guide.md](writing-style-guide.md).

### Sintaxe no HTML

Todo texto exibido ao usuário no HTML do formulário deve usar `i18n.translate("chave")`.
**Nunca** use texto fixo em elementos visíveis.

```html
<!-- ✅ correto: texto via i18n.translate -->
<label>i18n.translate("customer.name")</label>
<input name="nm_cliente">

<label>i18n.translate("customer.contact")</label>
<input name="contato_cliente">

<!-- ❌ errado: texto fixo no HTML -->
<label>Nome do cliente</label>
<input name="nm_cliente">
```

### Sintaxe em JavaScript — onde o i18n funciona (e onde NÃO)

⚠️ **O formulário não passa por FreeMarker.** Os padrões de widget/layout
(`${i18n.getTranslation(...)}` e `[=i18n.getTranslation(...)]`) **não funcionam** no form. O i18n de formulário é
**substituição textual** do trecho `i18n.translate("chave")` pelo texto traduzido,
feita quando a plataforma processa o artefato. Por isso ele só funciona onde o
texto substituído forma um resultado válido. A documentação oficial (TDN "Tradução
de Formulários") o usa em **exatamente dois lugares**:

1. **Conteúdo de elemento no HTML:** `<label>i18n.translate("field.label")</label>`.
2. **Eventos server-side (Rhino):** `throw i18n.translate("validation.required")`,
   e qualquer evento em `events/` (`validateForm`, `displayFields`, ...).

> 🚫 **i18n.translate NÃO funciona em `<script>` client-side do form** (nem em
> atributo HTML). Ex.: `banner.text(i18n.translate("chave"))` num `<script>` do
> HTML quebra a sintaxe — a substituição injeta o **texto cru** (sem aspas) dentro
> da chamada JS. O i18n de form **não** é uma função de runtime no cliente; é
> substituição textual pré-render.
>
> **Como ter texto traduzido no JS da tela do form (padrões que funcionam):**
> - **Preferido — traduzir no server-side e passar via contexto:** no
>   `displayFields` (onde `i18n.translate` funciona), monte as mensagens e injete
>   via `customHTML.append` um `window.FormContext` com os textos **já traduzidos**;
>   o `<script>` da tela só **lê** `FormContext.msg` (ver "Segurança ao inserir
>   dados"). Esse é o caminho natural quando já se usa `displayFields`.
> - **Alternativa — ler de um elemento HTML:** ponha o texto em um elemento com
>   i18n em **conteúdo** (ex.: `<span id="msgView" hidden>i18n.translate("...")</span>`)
>   e leia com `document.getElementById('msgView').textContent` no script.

Exemplo — i18n em **conteúdo** (label) + JS da tela consumindo texto **já
traduzido** (não chama `i18n.translate` no script):

```html
<div class="fluig-style-guide">
  <form name="form" role="form">
    <label for="campo">i18n.translate("field.label")</label>
    <input type="text" name="campo" id="campo" class="form-control">
    <span id="msgEmpty" hidden>i18n.translate("field.empty")</span>
    <span id="status"></span>
  </form>
</div>

<!-- JS da tela INLINE no HTML do form (não em .js externo) -->
<script type="text/javascript">
  $(document).ready(function () {
    // Lê o texto JÁ traduzido de um elemento (conteúdo HTML), não i18n.translate aqui.
    var msgEmpty = document.getElementById('msgEmpty').textContent;
    $('#campo').on('blur', function () {
      if (!$(this).val()) { $('#status').text(msgEmpty); }
    });
  });
</script>
```

> ⚠️ **`i18n.translate` NÃO é interpolado dentro de atributos HTML**
> (`placeholder`, `value`, `title`, ...). Um `placeholder="i18n.translate('chave')"`
> aparece **literal** na tela (texto `i18n.translate('chave')`). O i18n de
> formulário só é processado em **conteúdo de elemento**
> (`<label>i18n.translate("chave")</label>`) e em **eventos server-side**
> (`throw i18n.translate(...)`) — **não** em atributo nem em `<script>`
> client-side (ver "Sintaxe em JavaScript"). Para um **placeholder/título
> traduzido**, use **texto fixo**, ou leia o texto já traduzido de um elemento
> com i18n em conteúdo (`document.getElementById('x').textContent`), ou passe-o
> via `FormContext` resolvido no `displayFields` (server-side). Isso vale também
> para o `data-zoom` (ver "Campo Pesquisa (zoom)").

### Sintaxe de aspas na chave

`i18n.translate` deve sempre ter a chave entre **aspas duplas**.
O comportamento varia conforme o contexto:

**Declarando em variável** — envolva com aspas simples por fora:

```javascript
// ✅ correto: aspas simples por fora, aspas duplas na chave
var title = 'i18n.translate("label.remove")';
```

**Lançando em validação** — diretamente com aspas duplas na chave:

```javascript
// ✅ correto
throw i18n.translate("validation.required.field");

// ❌ errado: string literal
throw new Error('Campo obrigatório.');
```

**Em evento server-side (Rhino)** — a chave vai entre **aspas duplas**, e aqui
`i18n.translate` é uma função de verdade (resolvida pelo Rhino): pode ser usada em
expressões, atribuída a variável, concatenada:

```javascript
// ✅ evento server-side: i18n.translate é função real no Rhino
var msg = i18n.translate("validation.required.field");
throw msg;
```

> ⚠️ **Em HTML montado por JS no cliente, NÃO use `i18n.translate`.** No
> `<script>` client-side do form `i18n.translate` não é função — é substituição
> textual que injeta o texto cru e **quebra a sintaxe**. Para montar HTML com
> texto traduzido no cliente, obtenha o texto de uma fonte onde o i18n já foi
> resolvido (elemento com i18n em **conteúdo** lido via `textContent`, ou
> `FormContext` preparado no `displayFields`) e injete a **variável**:

```javascript
// ✅ cliente: texto já traduzido (de FormContext/elemento) numa variável
var ph = (window.FormContext && window.FormContext.phEvidencia) || "";
tr.innerHTML = `<input type="text" placeholder="${ph}" maxlength="300">`;

// ❌ errado: i18n.translate no <script> client-side — quebra ("missing ) ...")
tr.innerHTML = `<input placeholder="${i18n.translate("incident.evidence.placeholder")}">`;
```

> **Regra resumida:** `i18n.translate` em `.js` só funciona em **eventos
> server-side** (Rhino) — sempre com a chave entre **aspas duplas**. No **cliente**
> (`<script>` do HTML), o i18n é resolvido só em **conteúdo de elemento**; para JS
> do cliente, use texto **já traduzido** via `textContent`/`FormContext`.

### Convenção de chaves

As chaves seguem **notação de ponto** (dot-notation), descritivas e consistentes:

| Padrão | Uso | Exemplo |
|--------|-----|---------|
| `<entidade>.<campo>` | Campos do formulário | `customer.name`, `customer.contact` |
| `validation.<contexto>` | Mensagens de validação | `validation.required.field`, `validation.invalid.date` |
| `label.<contexto>` | Labels genéricos | `label.save`, `label.cancel` |

```properties
# Exemplos de chaves bem nomeadas
customer.name=Nome
customer.contact=Contato
validation.required.field=Campo obrigat\u00F3rio
```

### Arquivos `.properties` obrigatórios e nome do arquivo HTML

O nome do arquivo HTML do formulário **deve ser exatamente igual** ao prefixo
dos arquivos `.properties`. Todos derivam do mesmo identificador (camelCase):

```text
registroIncidenteTI.html
registroIncidenteTI_pt_BR.properties
registroIncidenteTI_en_US.properties
registroIncidenteTI_es.properties
```

Todo formulário **deve** gerar exatamente **3 arquivos `.properties`**:

| Arquivo | Locale |
|---------|--------|
| `<nomeFormulario>_pt_BR.properties` | Português (Brasil) |
| `<nomeFormulario>_en_US.properties` | Inglês (EUA) |
| `<nomeFormulario>_es.properties` | Espanhol |

> Diferentemente de widgets (que têm um arquivo base sem sufixo de locale), os
> formulários usam **apenas os 3 arquivos com sufixo de locale** listados acima.

Todas as chaves usadas no HTML e nos eventos **devem existir** nos 3 arquivos.

### Codificação dos arquivos `.properties` de formulários

Todos os 3 arquivos seguem o **padrão Java Properties**: **proibido** caractere
acentuado ou não-ASCII diretamente — todo caractere fora do ASCII **deve** ser
convertido para `\uXXXX`.

```properties
# ✅ correto — escapes \uXXXX obrigatórios em todos os arquivos de locale
customer.name=Nome
customer.description=Descri\u00E7\u00E3o
validation.required.field=Campo obrigat\u00F3rio
city=S\u00E3o Paulo

# ❌ errado — caracteres acentuados diretos
customer.description=Descrição
validation.required.field=Campo obrigatório
```

Referência de escapes comuns (válida para os 3 arquivos):

| Caractere | Escape |
|-----------|--------|
| ã | `\u00E3` |
| Ã | `\u00C3` |
| ç | `\u00E7` |
| Ç | `\u00C7` |
| õ | `\u00F5` |
| Õ | `\u00D5` |
| á | `\u00E1` |
| é | `\u00E9` |
| í | `\u00ED` |
| ó | `\u00F3` |
| ú | `\u00FA` |
| â | `\u00E2` |
| ê | `\u00EA` |
| ô | `\u00F4` |
