# Convenções de Código Fluig

> Fonte única de verdade do pacote para **convenções de código, i18n e segurança**
> na customização Fluig. As skills referenciam este arquivo em vez de duplicar seu
> conteúdo. Para componentes/grid/helpers do Style Guide e variáveis CSS de dark
> mode, veja [style-guide.md](style-guide.md). Para versões de tecnologias públicas,
> veja [technologies.md](technologies.md).

## Visão Geral

Este documento descreve **o que são** as convenções públicas e oficiais para
escrever código de customização Fluig (widgets, Custom Elements, FreeMarker e
estilos). O objetivo é gerar código correto, seguro, internacionalizado e
compatível com a plataforma. Aqui não há passo a passo de execução — isso é
responsabilidade das skills em `skills/`.

Princípio de idioma: **conteúdo em Português (Brasil)**; **identificadores de
código (variáveis, funções, classes, comentários) em Inglês**.

## JavaScript Moderno (ES6+)

Código novo de frontend deve usar **ES6+**. jQuery é aceitável apenas para
manutenção de código legado já escrito em jQuery — não misture paradigmas no
mesmo arquivo.

| Recurso | Recomendação para código novo |
|---------|-------------------------------|
| Declaração de variável | `const` por padrão; `let` quando há reatribuição; evitar `var` (exceto a variável raiz da SuperWidget — ver [Convenções de Widget](#convenções-de-widget-superwidgetextend)) |
| Funções anônimas | Arrow functions (concisão e `this` léxico) |
| Concatenação de texto | Template literals |
| Assíncrono | `async/await` em vez de cadeias longas de `.then()` |
| Organização | Módulos ES6; funções pequenas com responsabilidade única |

## Nomenclatura

| Item | Regra | Exemplo |
|------|-------|---------|
| Nomes em geral | Descritivos, em Inglês; evitar abreviações obscuras | `calculateTotalPrice` |
| Booleanos | Prefixos `is` / `has` / `can` / `should` | `isActive`, `hasPermission` |
| Classe (Custom Element) | PascalCase com sufixo de tipo | `UserProfileComponent` |
| Métodos/propriedades | camelCase, orientados a ação | `getUserList()` |

## Convenções de Widget (`SuperWidget.extend`)

Regras críticas e específicas do padrão de widget:

| Regra | Diretriz |
|-------|----------|
| Classes raiz obrigatórias | O elemento raiz **deve** conter **exatamente estas 3 classes fixas** (além da classe específica do widget): `fluig-style-guide` (ativa os estilos/componentes do Style Guide), `super-widget` (identifica o componente como SuperWidget) e `wcm-widget-class` (classe fixa da plataforma). Ex.: `class="fluig-style-guide super-widget wcm-widget-class weather-widget"` |
| `instanceId` | Usar **exclusivamente** em atributos `id`, com **exatamente um** `_` (underscore) como separador. **Na `div` raiz do widget**, a parte antes do `_` deve ser **camelCase com inicial minúscula**; nunca use mais de um `_` na div raiz pois a SuperWidget faz split por ele. Ex.: `id="myWidget_${instanceId}"` |
| `instanceId` proibido em | Atributos `data-*` e `class` (devem ser estáticos) |
| `.instance()` | Chamar **sem** o `instanceId` — ele é injetado automaticamente pelo framework. Dentro do JS, use `this.instanceId` |
| Separador | Exatamente **um** `_`, nunca `-` e nunca mais de um `_`, antes do `instanceId` (especialmente na div raiz) |

Bindings declarativos associam eventos a métodos. A chave do binding é o valor do
atributo `data-*` **sem** o prefixo `data-` (o framework adiciona `data-`
automaticamente).

| Escopo | Propriedade | Quando usar |
|--------|-------------|-------------|
| Local | `bindings.local` | Elementos **dentro** da `div` raiz do widget |
| Global | `bindings.global` | Elementos **fora** do escopo (modais, dropdowns renderizados no `body`) |

```html
<!-- ✅ raiz com as 3 classes obrigatórias + classe do widget; instanceId só no id, com _ -->
<!-- id: camelCase com inicial minúscula + exatamente um _ -->
<div id="myWidget_${instanceId}"
     class="fluig-style-guide super-widget wcm-widget-class my-widget"
     data-params="myWidget.instance({})">
  <button data-save-filter>...</button>
</div>
```

```javascript
// chave do binding sem o prefixo data-
bindings: { local: { 'save-filter': ['click_onSaveFilter'] } }
```

### Variável raiz da SuperWidget (`var`)

A variável raiz que recebe `SuperWidget.extend({ ... })` é declarada com **`var`**:

```javascript
var MyWidget = SuperWidget.extend({ /* ... */ });
```

Esta é uma **exceção explícita** à convenção de
[JavaScript Moderno (ES6+)](#javascript-moderno-es6) que recomenda evitar `var`.
A exceção vale **apenas** para a variável raiz do widget; o **restante do JS do
widget permanece em ES6+** (`const`/`let`, arrow functions, template literals).

### Consulta a datasets no cliente (`vcXMLRPC.js`)

Quando o widget precisa **consultar datasets no lado cliente** (via
`DatasetFactory`), a view FreeMarker (`view.ftl` ou `edit.ftl`, conforme onde a
consulta é necessária) **deve obrigatoriamente importar** a biblioteca
`vcXMLRPC.js` que expõe essa API no navegador. Inclua o script **exatamente**
nesta forma, sem alterar o caminho, os atributos ou a ordem:

```html
<script src="/webdesk/vcXMLRPC.js" type="text/javascript"></script>
```

Esta é uma **exceção explícita** à convenção de
[Chamadas REST internas](#chamadas-rest-internas): a importação do script no
`.ftl` é permitida (e exigida) **apenas** para habilitar a consulta a datasets no
cliente. Regras:

- Importe o script **somente** quando o widget de fato consulta datasets no
  cliente; se o widget não consulta datasets, não inclua o script.
- Inclua-o na **view onde a consulta ocorre** (`view.ftl` e/ou `edit.ftl`).
- Mantenha o caminho `/webdesk/vcXMLRPC.js` e os atributos **inalterados** — é o
  caminho público e oficial dessa biblioteca.

Uma vez importado o script, o `DatasetFactory` fica disponível no cliente com as
**mesmas assinaturas** do runtime server-side — a única diferença é o parâmetro
`callback` (exclusivo do cliente), que torna a chamada **assíncrona** quando
informado e **síncrona** quando omitido:

```javascript
// Assíncrono: resultado em callback.success; falhas em callback.error
var constraints = [DatasetFactory.createConstraint('active', 'true', 'true', ConstraintType.MUST)];
DatasetFactory.getDataset('branches', ['code', 'name', 'state'], constraints, ['name'], {
  success: function (content) { /* content.values */ },
  error: function (jqXHR, textStatus, errorThrown) { /* trata falha */ }
});

// Síncrono: sem callback, retorna o conteúdo diretamente
var result = DatasetFactory.getDataset('branches', ['code', 'name', 'state'], constraints, ['name']);
```

> As **assinaturas completas** de `DatasetFactory.getDataset`,
> `DatasetFactory.createConstraint`, `ConstraintType` e correlatos são fonte de
> verdade de [architecture.md](architecture.md), seção "API pública de Dataset —
> assinaturas". Não as duplique nem invente parâmetros.

## Convenções de Custom Elements (Web Components)

| Item | Regra | Exemplo |
|------|-------|---------|
| Nome de arquivo | `[name].[category].js` em kebab-case | `user-profile.component.js` |
| Categorias | Sufixo por ponto: `component`, `service`, `api` | `user-auth.service.js` |
| Nome de classe | PascalCase com sufixo de tipo | `UserProfileComponent` |
| Tag | kebab-case, registrada via `customElements.define` | `user-profile` |
| Shadow DOM | **Não** utilizar (`attachShadow`/`shadowRoot`) | — |
| Escopo do arquivo | Fora da classe, **apenas** `import`; nada de `function`/`const`/`let`/`var` no topo | — |
| Membros privados | Prefixar com `#` quando sensíveis ao componente | `#userData` |

### Categorias de arquivo (`[name].[category].js`)

O nome de arquivo segue o formato `[name].[category].js`, sempre em **kebab-case**
e **lowercase**. A categoria é um **sufixo separado por ponto** que comunica a
responsabilidade do arquivo:

| Categoria | Responsabilidade | Exemplo |
|-----------|------------------|---------|
| `component` | UI e interação (o Custom Element em si) | `user-profile.component.js` |
| `service` | Regras de negócio e transformação de dados | `user-auth.service.js` |
| `api` | Integração com recursos externos (chamadas REST etc.) | `user.api.js` |

A separação por categoria evita concentrar tudo em um único arquivo: o
`component` cuida da apresentação, delegando regras de negócio ao `service` e
integrações ao `api`. **Outras categorias** podem existir, desde que a convenção
de nome (`[name].[category].js`, kebab-case, lowercase) permaneça consistente.

```text
❌ UserProfile.component.js   (não é lowercase)
❌ user_profile.component.js  (separador errado: usar kebab-case)
❌ user-profile-component.js  (categoria sem ponto)
✅ user-profile.component.js
```

### Membros privados de classe (`#`)

Use o prefixo `#` para métodos e propriedades **sensíveis ou internos** ao
componente, que não devem ser acessados de fora. O `#` torna o membro
verdadeiramente privado (diferente de uma convenção como `_`).

```javascript
export class UserProfileComponent extends HTMLElement {
  #userFirstName = 'Robert';

  #loadSensitiveData() {
    // lógica interna do componente
  }
}
```

Aplique com critério: marque como privado o que de fato é estado/lógica interna,
sem **uso excessivo** de `#` em membros que não precisam de proteção.

### Escopo do módulo: apenas `import` fora da classe

Fora da classe do componente, **somente `import`** é permitido no topo do
arquivo. É **vedado** declarar `function`, `const`, `let` ou `var` no escopo do
módulo — esses elementos devem viver **dentro** da classe (como propriedades e
métodos). Isso mantém todo o estado e comportamento encapsulados no componente.

```javascript
// ❌ declarações no escopo do módulo (function/const fora da classe)
import { UserService } from './user.service.js';

const endpoint = '/api/users';

function buildParams() {
  return { active: true };
}

export class UserProfileComponent extends HTMLElement {
  // ...
}
```

```javascript
// ✅ apenas import fora da classe; o resto vira membro da classe
import { UserService } from './user.service.js';

export class UserProfileComponent extends HTMLElement {
  endpoint = '/api/users';

  buildParams() {
    return { active: true };
  }
}
```

### CSS escopado pela tag e agrupado por tag

O CSS de um Custom Element deve ser **escopado pela própria tag** do elemento,
aninhando as classes internas dentro do seletor da tag. Isso isola os estilos sem
depender de Shadow DOM (que **não** é utilizado — ver tabela acima).

```css
/* ✅ escopo iniciado pela tag do custom element */
user-profile .user-card {
  /* estilização */
}
```

Agrupe **todo** o CSS de uma tag em um **único bloco**: não repita o seletor da
tag em vários lugares do arquivo.

```css
/* ❌ seletor da tag repetido em blocos separados */
my-element { .item-title { } }
my-element { .item-body  { } }

/* ✅ um único bloco por tag, reunindo as classes internas */
my-element {
  .item-title { }

  .item-body  { }
}
```

### Variáveis CSS contra números mágicos

Evite "números mágicos" repetidos nas regras de estilo: nomeie-os com **variáveis
CSS (custom properties)** descritivas e reutilize-as. Isso melhora a leitura e
centraliza o ajuste de valores.

```css
/* ✅ valor nomeado em custom property; reutilizado via var() */
user-profile {
  --sidebar-width: 80px;

  display: block;
  width: calc(100% - var(--sidebar-width));
  margin-left: var(--sidebar-width);
}
```

> As regras de **cores de tema** (`var(--fs-color-*)`, dark mode) são consolidadas
> em [style-guide.md](style-guide.md); aqui o foco é o escopo por tag, o
> agrupamento e o uso de variáveis nomeadas para números mágicos.

## Convenções de Form (formulário eletrônico)

A view de um formulário eletrônico é um documento HTML que **deve** envolver os
campos em um contêiner com a classe `fluig-style-guide` (ativa os estilos e
componentes do Style Guide) e em um elemento `<form>` nomeado.

### Estrutura base da view

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

### Ordem de scripts e estilos

| Recurso | Onde declarar | Motivo |
|---------|---------------|--------|
| CSS (Style Guide) e `<script>` de bibliotecas | No `<head>` | O funcionamento interno do Fluig depende de os estilos e as bibliotecas estarem disponíveis no carregamento da página |
| Scripts **inline** do formulário | No **fim** da página, antes de `</body>` | Garante que o DOM dos campos já exista quando o script roda |

### Campos do formulário

| Atributo | Obrigatório | Diretriz |
|----------|-------------|----------|
| `name` | **Sim** | Todo campo de formulário **deve** ter `name` — é por ele que o Fluig persiste e lê o valor do campo |
| `id`, `for`, `placeholder`, etc. | Não | **Recomendados** por semântica e boas práticas (acessibilidade, associação `label`/campo, dicas de preenchimento), embora não exigidos pela plataforma |

> **Regra crítica:** um campo sem `name` não é gravado nem recuperado pelo Fluig.
> Associe cada `label` ao seu campo via `for`/`id` para acessibilidade, mesmo que
> não seja obrigatório.

### Tabela Pai x Filho (Form)

No Form, a técnica Pai x Filho e declarada no HTML com o atributo `tablename` na
tag `<table>`. O Fluig usa a linha-base do `<tbody>` como template e cria as
linhas dinâmicas no render da pagina.

#### Estrutura HTML minima

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

#### Sufixo automatico das linhas

- No HTML de origem, declare os campos com nome simples (ex.: `name="nomeFantasia"`).
- Nas linhas renderizadas dinamicamente, o Fluig aplica sufixo numerico no
  formato `___<índice>` (ex.: `nomeFantasia___1`, `nomeFantasia___2`, ...).
- O indice da linha e controlado pelo Fluig e nao deve ser manipulado manualmente.
- Evite usar `___` no nome base do campo para nao conflitar com o índice gerado.

#### Adição e remoção de linhas

- `wdkAddChild("<tablename>")` adiciona uma nova linha e retorna o índice criado.
- `wdkRemoveChild(element)` remove a linha da interface de edição.
- A linha base (template mestre) fica oculta; o usuário visualiza apenas as
  linhas dinâmicas geradas.

#### Persistência, histórico e versão

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

#### Consumo via Dataset (relatórios, dashboards, integrações)

Para consultar registros de uma tabela Pai x Filho do formulário, use
`DatasetFactory.getDataset(...)` com as constraints de `documentid`, `tablename`
e `metadata#active`.

```javascript
const rows = DatasetFactory.getDataset("nomeDoDatasetDoformulário", null, [
  DatasetFactory.createConstraint("documentid", documentId, documentId, ConstraintType.MUST),
  DatasetFactory.createConstraint("tablename", nomePaiFilho, nomePaiFilho, ConstraintType.MUST),
  DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST)
], null);
```

Colunas recorrentes do retorno incluem metadados e campos da tabela, como:
`anonymization_date`, `anonymization_user_id`, `cardid`, `companyid`,
`documentid`, `id`, `masterid`, `tableid`, `version` e as colunas definidas pelo
desenvolvedor no HTML.

### Internacionalização (i18n) em formulários

> **Mecanismo exclusivo de formulários** — completamente diferente do i18n de
> widgets/layouts (`${i18n.getTranslation(...)}`). **Nunca misture os dois padrões.**

#### Sintaxe no HTML

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

#### Sintaxe em eventos e arquivos JavaScript

Em arquivos `.js`, `i18n.translate` deve sempre ter a chave entre **aspas duplas**.
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

**Dentro de template literal** — use aspas duplas na chave normalmente (não conflita com backticks):

```javascript
// ✅ correto: aspas duplas na chave dentro do template literal
tr.innerHTML = `
  <td>
    <input type="text" class="form-control"
           id="evidenceDesc_${count}"
           name="evidenceDesc_${count}"
           placeholder="i18n.translate("incident.evidence.description.placeholder")"
           maxlength="300">
  </td>
  <td class="text-center"></td>
`;

// ❌ errado: aspas simples na chave dentro de template literal
tr.innerHTML = `<input placeholder="i18n.translate('incident.evidence.description.placeholder')">`;
```

> **Regra resumida:** a chave de `i18n.translate` em `.js` é **sempre com aspas duplas** — independentemente do contexto (variável, `throw` ou template literal).

#### Convenção de chaves

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

#### Arquivos `.properties` obrigatórios e nome do arquivo HTML

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
| `<nomeformulário>_pt_BR.properties` | Português (Brasil) |
| `<nomeformulário>_en_US.properties` | Inglês (EUA) |
| `<nomeformulário>_es.properties` | Espanhol |

> Diferentemente de widgets (que têm um arquivo base sem sufixo de locale), os
> formulários usam **apenas os 3 arquivos com sufixo de locale** listados acima.

Todas as chaves usadas no HTML e nos eventos **devem existir** nos 3 arquivos.

#### Codificação dos arquivos `.properties` de formulários

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

## Comunicação entre artefatos (eventos)

Artefatos de cliente (widgets e Web Components) comunicam-se por **eventos**,
usando o mecanismo próprio de cada tipo. Esta é a fonte única de verdade da regra
de **uso** de eventos no pacote.

| Tipo de artefato | Mecanismo público |
|------------------|-------------------|
| Web Component | `dispatchEvent` com `CustomEvent` (escuta via `addEventListener`) |
| Widget (`SuperWidget`) | `WCMAPI.fireEvent` (disparo) + `WCMAPI.addListener` (escuta) |

> ❌ **Nunca** use variáveis globais nem `window.*` para comunicação entre
> artefatos — isso quebra o isolamento e gera acoplamento implícito.

### Web Components (`CustomEvent`)

- Nomes de evento em **kebab-case** (`document-change`, `task-completed`).
- Use `bubbles: true` quando o evento precisar subir pela árvore do DOM (o pai
  ouve sem referência direta ao filho).
- Sempre coloque o payload em `detail` — nunca passe dados por atributos do evento.

```javascript
// ✅ dispara: nome kebab-case, payload em detail, bubbles para subir no DOM
this.dispatchEvent(new CustomEvent('task-completed', {
  detail: { taskId: this.taskId },
  bubbles: true,
}));

// ✅ escuta via addEventListener; lê o payload de ev.detail
element.addEventListener('task-completed', (ev) => {
  const { taskId } = ev.detail;
});
```

### Widgets (`WCMAPI.fireEvent` / `WCMAPI.addListener`)

- `WCMAPI.fireEvent(eventName, data)` dispara o evento para todos os listeners
  registrados, passando `data` como payload.
- `WCMAPI.addListener(context, eventName, callback, listenerId)` registra a
  escuta: `context` é o widget (`this`), `callback` recebe `(evt, data)` e
  `listenerId` é um identificador único que evita listeners duplicados.

```javascript
// ✅ dispara um evento para outros widgets
WCMAPI.fireEvent('document-selected', { id: 99, title: 'Contract 2024' });

// ✅ escuta o evento; listenerId único evita duplicatas
WCMAPI.addListener(this, 'document-selected', (evt, data) => {
  console.log(data.title);
}, 'document-viewer');
```

## Internacionalização (i18n) — Widgets e Layouts

> **Escopo:** as convenções desta seção aplicam-se **exclusivamente a Widgets e Layouts**. Formulários eletrônicos possuem um mecanismo de i18n próprio, descrito na seção [Internacionalização (i18n) — Formulários](#internacionalização-i18n--formulários) abaixo. **Não aplique as regras desta seção em formulários.**

Todo texto visível ao usuário em widgets e layouts **deve** vir de i18n — nunca usar strings fixas.
A tradução é resolvida server-side pelo FreeMarker antes de chegar ao navegador.

### Sintaxes de tradução

O FreeMarker resolve a tradução server-side e aceita **duas sintaxes** de
interpolação. A escolha depende do tipo de arquivo:

| Contexto | Sintaxe recomendada | Observação |
|----------|---------------------|------------|
| FreeMarker (`.ftl`) | `${i18n.getTranslation('key')}` | Sintaxe padrão em templates |
| **Arquivo `.js`** | `[=i18n.getTranslation('key')]` | **Recomendada em `.js`** — evita conflito com template literals do ES6 |

**Regra para arquivos `.js`:** prefira a sintaxe `[=i18n.getTranslation('key')]`.
Em ES6, a sintaxe `${...}` colide com a interpolação de **template literals**
(backticks) — o JavaScript tenta avaliar `${...}` em runtime antes de o
FreeMarker resolver. A sintaxe `[=...]` não tem esse conflito e é resolvida
server-side com segurança em qualquer ponto do `.js` (inclusive dentro de
backticks).

> **Consistência com o padrão do arquivo:** respeite o padrão de i18n **já
> existente** no arquivo `.js`. Se o arquivo já usa `${i18n.getTranslation(...)}`,
> **mantenha** essa sintaxe ao editar trechos existentes. Use `[=i18n....]` para
> **código novo** ou em arquivos que ainda não tenham um padrão estabelecido.
> Não misture as duas sintaxes no mesmo arquivo só por preferência — a troca para
> `[=...]` em código legado deve ser feita apenas quando explicitamente solicitada.

```javascript
// ✅ recomendado em .js — [=...] não conflita com template literals
const title = "[=i18n.getTranslation('save.success.title')]";
const fullMessage = `[=i18n.getTranslation('save.success.message')]: ${name}`;

// ⚠️ funciona em .js fora de backticks, mas evite — ${...} colide com template literals
const title2 = "${i18n.getTranslation('save.success.title')}";
```

Regras gerais:

- **Nunca** acessar `i18n` como objeto JavaScript (`i18n.key` ou `i18n['key']`) — não funciona.
- A expressão precisa estar entre aspas quando atribuída a uma variável em `.js`:
  `const t = "[=i18n.getTranslation('key')]";`.

### Métodos de tradução (com e sem parâmetros)

A API de i18n oferece um método padrão e variantes que recebem parâmetros para
interpolar valores na própria mensagem traduzida. Os marcadores na chave de
tradução são posicionais: `{0}`, `{1}`, `{2}`, ...

| Método | Uso | Marcadores na chave |
|--------|-----|---------------------|
| `i18n.getTranslation('key')` | Tradução simples, sem parâmetros | — |
| `i18n.getTranslationP1('key', param)` | Tradução com **1 parâmetro** | `{0}` |
| `i18n.getTranslationPn('key', p1, p2, ...)` | Tradução com **N parâmetros** | `{0}`, `{1}`, ... |
| `i18n.getJSTranslation('key')` | Tradução dentro de `<script>` (escapa aspas simples) | — |

> `getTranslationP1` é equivalente a `getTranslationPn` com um único parâmetro.
> Prefira as variantes com parâmetro a concatenar valores na própria chave — isso
> mantém a ordem das palavras correta em cada idioma.

Exemplo com N parâmetros (a chave declara os marcadores `{0}` e `{1}`):

```properties
# bundle .properties (en_US)
wcmapplicationcenter.deactivate.extension.dataset.dependencies.description=The component extension <strong>{0}</strong> has a dependency on <strong>{1}</strong> datasets. Upon confirmation, all dependent datasets listed below will also be deactivated and all their instances in the system will be removed.
```

```ftl
<#-- chamada passando os dois parâmetros, na ordem {0}, {1} -->
${i18n.getTranslationPn("wcmapplicationcenter.deactivate.extension.dataset.dependencies.description", "{{componentName}}", "{{dependenciesTotal}}")}
```

Exemplo com 1 parâmetro:

```properties
welcome.user=Bem-vindo, {0}!
```

```ftl
${i18n.getTranslationP1('welcome.user', userName)}
```

### Estrutura de arquivos `.properties` (base + locale)

Cada artefato tem um conjunto de bundles `.properties`: um **arquivo base**
(fallback, sem sufixo de locale) e **um por locale** suportado. O nome base
corresponde ao **código do artefato**.

| Arquivo | Propósito |
|---------|-----------|
| `<code>.properties` | **Base/fallback** — usado quando o locale do usuário não tem correspondência |
| `<code>_pt_BR.properties` | Português (Brasil) |
| `<code>_en_US.properties` | Inglês (EUA) |
| `<code>_es.properties` | Espanhol |

**Fallback:** se a chave não existir no bundle do locale do usuário, o sistema cai
no arquivo base; se ainda assim não existir, retorna a própria chave como string
literal. Por isso o arquivo base deve conter **todas** as chaves.

### Codificação dos arquivos `.properties`

O tratamento de caracteres especiais difere entre o arquivo base e os arquivos de locale:

| Arquivo | Idioma | Acentuação |
|---------|--------|------------|
| `<code>.properties` (base) | **Português** — é o fallback principal | Acentos e caracteres especiais são **permitidos diretamente** |
| `<code>_pt_BR.properties` e demais locales | Idioma do locale | **Proibido** caractere acentuado ou não-ASCII diretamente; **obrigatório** usar escapes `\uXXXX` (padrão Java Properties) |

**Regra para os arquivos de locale:** nunca escreva caracteres acentuados ou
fora do ASCII diretamente. Converta-os para a notação `\uXXXX`.

```properties
# ✅ <code>.properties (base, em Português) — acentuação direta permitida
application.description=Acompanhe as publicações de uma das comunidades criadas.
menu.configuration=Configurações
button.save=Salvar alterações
```

```properties
# ✅ <code>_pt_BR.properties (locale) — escapes \uXXXX obrigatórios
application.description=Acompanhe as publica\u00E7\u00F5es de uma das comunidades criadas.
menu.configuration=Configura\u00E7\u00F5es
button.save=Salvar altera\u00E7\u00F5es
```

```properties
# ❌ <code>_pt_BR.properties (locale) — NÃO deixar acentos diretamente
application.description=Acompanhe as publicações de uma das comunidades criadas.
```

Referência rápida de escapes comuns:

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

### Convenção de nomes de chave (dot-notation)

As chaves seguem **notação de ponto** (dot-notation), agrupadas por
domínio/funcionalidade para facilitar a leitura e a manutenção.

| Padrão | Uso | Exemplo |
|--------|-----|---------|
| `<domínio>.<ação>` | Ações | `save.success`, `remove.comment` |
| `<domínio>.<entidade>.<campo>` | Campos de formulário | `user.info.first.name`, `user.info.email` |
| `error.<contexto>` | Mensagens de erro | `error.generic`, `error.load.page` |
| `label.<contexto>` | Labels genéricos | `label.loading`, `label.sort.by` |
| `button.<ação>` | Botões | `button.save`, `button.cancel` |

### Tradução dentro de `<script>` (`getJSTranslation`)

Para texto usado **dentro de blocos `<script>`**, prefira
`${i18n.getJSTranslation('key')}`: além de resolver a tradução server-side, ele
**escapa aspas simples**, evitando que um apóstrofo na tradução quebre a string
JavaScript.

```html
<!-- ✅ getJSTranslation escapa aspas simples (ex.: "Você não tem permissão") -->
<script>
  const message = '${i18n.getJSTranslation('error.permission')}';
</script>
```

### Armadilha dos template literals

Dentro de backticks, `${...}` é interpretado pelo **JavaScript**, não pelo
FreeMarker. Escrever `` `${i18n.getTranslation('key')}` `` faz o JS procurar uma
variável `i18n` em runtime — e falha.

Em arquivos `.js`, a forma **recomendada** de evitar esse conflito é usar a
sintaxe `[=i18n.getTranslation('key')]`, que não colide com a interpolação de
template literals e funciona inclusive dentro de backticks:

```javascript
// ✅ recomendado em .js — [=...] resolve server-side mesmo dentro de backticks
const fullMessage = `[=i18n.getTranslation('save.success.message')]: ${name}`;
```

Se ainda assim optar pela sintaxe `${...}` em `.js`, **não** a use diretamente
dentro de backticks: declare a tradução em uma **variável separada** (com aspas,
resolvida server-side) e só então concatene no template literal.

```javascript
// ✅ alternativa com ${...}: tradução em variável separada, depois concatena
const successMsg = "${i18n.getTranslation('save.success.message')}";
const fullMessage = `${successMsg}: ${name}`;

// ❌ dentro de backticks o ${...} é avaliado pelo JS, não pelo FreeMarker
const fullMessage = `${i18n.getTranslation('save.success.message')}: ${name}`;
```

## Segurança (APIs públicas)

Tratar toda entrada do usuário como não confiável e sanitizar antes de uso no DOM.

| Objetivo | API pública |
|----------|-------------|
| Converter HTML em texto puro (elimina XSS) | `WCMAPI.validateXSS(value)` |
| Manter HTML válido removendo código malicioso | `DOMPurify.sanitize(value)` |
| Bloquear qualquer HTML (retorna texto puro) | `DOMPurify.sanitize(value, { USE_PROFILES: { html: false } })` |

A escolha depende do que se quer preservar: `WCMAPI.validateXSS(value)` **converte
o HTML em texto puro** (qualquer marcação vira texto, eliminando o XSS), enquanto
`DOMPurify.sanitize(value)` **mantém o HTML válido removendo apenas o código
malicioso**. Para garantir que nenhum HTML seja interpretado, use o perfil
`DOMPurify.sanitize(value, { USE_PROFILES: { html: false } })`.

> ❌ **Depreciado — não usar:** `FLUIGC.utilities.preventXSS(value)` e
> `FLUIGC.utilities.decodeHTML(value)` são APIs **legadas**. Prefira sempre
> `WCMAPI.validateXSS` ou `DOMPurify.sanitize`; não as recomende em código novo.

Boas práticas:

- Preferir `textContent` a `innerHTML`; quando precisar de HTML, sanitizar com `DOMPurify` antes.
- Em FreeMarker, escapar dados dinâmicos: `${value?html}` (escape HTML) e `${value?js_string}` (escape para JS inline).
- Não usar `eval()` nem `new Function()` com dados dinâmicos.
- Sanitizar tanto ao enviar (POST/PUT) quanto ao receber (GET) dados do usuário.

### Mustache: cuidado com o triple-stache `{{{ }}}`

Por padrão, o Mustache **escapa o HTML automaticamente** com `{{ value }}`. A
sintaxe de triple-stache `{{{ value }}}` (assim como `{{& value }}`) **desabilita
esse escape** e renderiza o HTML como veio — só use com conteúdo **previamente
sanitizado** via `DOMPurify`.

```javascript
// ✅ sanitizar antes de renderizar com triple-stache
const html = Mustache.render(template, {
  content: DOMPurify.sanitize(data.content),
});
element.innerHTML = html;
```

```html
<!-- ✅ escape automático do Mustache -->
{{ content }}

<!-- ⚠️ sem escape: só com conteúdo já sanitizado via DOMPurify -->
{{{ content }}}
```

## Chamadas REST internas

Para endpoints internos do Fluig, usar as APIs públicas de cliente — assim os
tokens de sessão são enviados automaticamente. **Não** usar `fetch()` ou
`$.ajax()` direto para endpoints internos.

| Cenário | Abordagem pública |
|---------|-------------------|
| Código novo (ES6+) | `FLUIGC.ajax` (pode ser encapsulado em `Promise`) |
| Código legado (jQuery/ES5) | `WCMAPI.Read` / `WCMAPI.Create` / `WCMAPI.Update` / `WCMAPI.Delete` |

## CSS

- **Minimizar CSS próprio:** **reutilizar** classes e componentes do Fluig Style Guide é o padrão; o CSS próprio é **exceção**, permitida apenas sob pedido explícito do desenvolvedor (ver [style-guide.md](style-guide.md)).
- **Escopar** o CSS à classe raiz do widget (ou à tag do Custom Element); evitar seletores por `id`, cadeias longas e `!important`.
- **Sem** `style` inline e **sem** blocos `<style>` em templates.
- **Sem** hexadecimais fixos para cores de tema — usar variáveis CSS que suportam dark mode. As regras de cores e variáveis (`var(--fs-color-*)`) são consolidadas em [style-guide.md](style-guide.md); não as duplique aqui.
- Evitar "números mágicos": usar CSS custom properties com nomes descritivos.

### CSS responsivo e moderno

Planeje o estilo considerando **diferentes dimensões de tela** antes de
implementar e aproveite classes responsivas já disponíveis no Style Guide quando
aplicável (ver [style-guide.md](style-guide.md)).

#### Funções CSS

Prefira funções CSS nativas para cálculos, valores fluidos e dimensionamento
flexível, em vez de valores fixos repetidos.

| Função | Uso principal |
|--------|---------------|
| `calc()` | Cálculos de tamanho (combinar unidades, ex.: `calc(100% - 80px)`) |
| `var()` | Uso de custom properties (valores nomeados e reutilizáveis) |
| `rgba()` / `hsla()` | Cores com transparência (canal alfa) |
| `min()` / `max()` | Limites de valor (escolher o menor/maior entre opções) |
| `clamp()` | Valor fluido dentro de um intervalo (mínimo, preferido, máximo) |
| `minmax()` | Dimensionamento flexível em grid (faixa mínima–máxima de trilha) |

> `var()` aqui trata de **custom properties em geral**; `rgba()`/`hsla()` tratam
> de **transparência**. As **cores de tema** (`var(--fs-color-*)`, dark mode) são
> consolidadas em [style-guide.md](style-guide.md) — não as recrie aqui.

#### Media queries

Use **media queries** para ajustar o estilo com base nas características do
**viewport** (largura, altura, orientação), garantindo responsividade conforme o
tamanho da tela do usuário.

#### Container queries

Use **container queries** para ajustar o estilo com base no tamanho do
**contêiner** em que o componente está inserido — útil quando o mesmo componente
aparece em larguras distintas independentemente do viewport.

- Prefira um **contexto de contenção nomeado** (nomear o contêiner) para deixar
  explícito qual elemento serve de referência da consulta.
- Container query é um recurso **recente**; valide o suporte no ambiente-alvo
  antes de depender dele.

## Referências Cruzadas

- Para "como fazer" (gerar, modernizar e revisar código), ver as skills em `skills/`.
- Para componentes, helpers, grid e variáveis CSS de dark mode do Style Guide: [style-guide.md](style-guide.md) (fonte única de verdade dessas regras).
- Para versões de tecnologias públicas de customização (ES6+, libs client-side, runtime de datasets): [technologies.md](technologies.md).
