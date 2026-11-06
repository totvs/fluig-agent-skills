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

As três regras invioláveis para todas as personas (i18n via FreeMarker, com
`[=i18n.getTranslation('key')]` preferida em `.js`, HTTP com `fetch()` + `async/await` e sintaxe
`nome: function() {}` dentro de `SuperWidget.extend({})`) estão resumidas em
[platform-constitution.md](platform-constitution.md); este arquivo traz o detalhe
de cada uma.

Princípio de idioma: **conteúdo em Português (Brasil)**; **identificadores de
código (variáveis, funções, classes, comentários) em Inglês**.

## JavaScript Moderno (ES6+)

Código novo de frontend deve usar a **última versão da linguagem (ES6+)**. jQuery
é uma via válida e suportada para código escrito em jQuery — não misture
paradigmas no mesmo arquivo.

| Recurso | Recomendação para código novo |
|---------|-------------------------------|
| Declaração de variável | **Nunca** `var`; `const` por padrão; `let` única e exclusivamente quando há reatribuição (única exceção: a variável raiz da SuperWidget — ver [Convenções de Widget](#convenções-de-widget-superwidgetextend)) |
| Funções anônimas | Arrow functions obrigatórias em todos os callbacks (concisão e `this` léxico) — **exceto** os próprios métodos do objeto de `SuperWidget.extend({})`, declarados como `nome: function() {}` (ver [Sintaxe de métodos dentro de `.extend({})`](#sintaxe-de-métodos-dentro-de-extend)) |
| Concatenação de texto | Template literals — em arquivos `.js` com i18n, use `[=i18n.getTranslation('key')]` (não colide com `${...}` do ES6); em um `.js` que usa i18n e é minificado pelo Closure Compiler, prefira concatenação clássica (`+`) a template literals (ver [i18n — Widgets e Layouts](#internacionalização-i18n--widgets-e-layouts)) — arquivos `.js` sem i18n não são afetados |
| Assíncrono | `async/await` em vez de cadeias longas de `.then()` |
| Organização | Módulos ES6; funções pequenas com responsabilidade única |

### Regras de modernização JavaScript (ES6+) — Widgets e Layouts

### 1. Modernização Javascript (ES6+)

Escopo: Todos os arquivos `.js` de Widgets e Layouts (exceto scripts Rhino de backend).

O código deve ser estritamente ES6+, garantindo legibilidade e prevenindo problemas de escopo.

- Variáveis: Nunca utilize `var`. Use `const` por padrão. Utilize `let` única e exclusivamente quando a variável sofrer reatribuição.
- Contexto e Escopo (`this`): É estritamente proibido o uso de cache de escopo léxico (`var ctx = this;` ou `var that = this;`).
- Arrow Functions: Utilize obrigatoriamente Arrow Functions (`() => {}`) em todos os callbacks (success, fail, eventos) para manter o contexto correto do `this`.

> **Única exceção documentada:** a variável raiz que recebe `SuperWidget.extend({...})`
> (`var MyWidget = SuperWidget.extend(...)`), por ser global da página — ver
> [Variável raiz da SuperWidget (`var`)](#variável-raiz-da-superwidget-var). Os
> métodos do objeto de `.extend({})` seguem `nome: function() {}` (não são callbacks);
> dentro deles use `this` direto e Arrow Functions nos callbacks.

```javascript
// ✅ correto: const/let, sem cache de this, callbacks em Arrow Function
carregar: function() {
    let tentativas = 0;                       // let: sofre reatribuição
    const preferences = {};
    WCMSpaceAPI.PageService.UPDATEPREFERENCES({
        async: true,
        success: (data) => { this.renderizar(data); },   // this = widget
        fail: (xhr, message, errorData) => { tentativas++; }
    }, this.instanceId, preferences);
}

// ❌ errado: var + cache de escopo + callback com function()
carregar: function() {
    var ctx = this;
    WCMSpaceAPI.PageService.UPDATEPREFERENCES({
        success: function(data) { ctx.renderizar(data); }
    }, ctx.instanceId, {});
}
```

### Strict Mode e recursos modernos

- **Strict Mode:** habilite `'use strict';` no topo dos arquivos JavaScript. O
  modo estrito previne erros silenciosos e reforça boas práticas.
- **Recursos modernos como padrão:** use **arrow functions**, **template
  literals**, **desestruturação** e **async/await** por padrão no código novo.

```javascript
// ✅ Strict Mode no topo + recursos ES6+ como padrão
'use strict';

const buildLabel = (user) => {
  const { firstName, lastName } = user;      // desestruturação
  return `${firstName} ${lastName}`;         // template literal
};
```

> A exceção de sintaxe dentro de `SuperWidget.extend({})` (métodos como
> `nome: function() {}`, nunca arrow nem shorthand; contexto via `this` direto, sem
> `var ctx = this;`) permanece válida — ver
> [Sintaxe de métodos dentro de `.extend({})`](#sintaxe-de-métodos-dentro-de-extend).

### Preferência por APIs nativas do navegador

Toda dependência de biblioteca frontend (jQuery incluído) é um acoplamento que
precisa ser justificado. As APIs nativas modernas já cobrem manipulação de DOM,
seleção de elementos, estilos e inserção de conteúdo com compatibilidade ampla
entre navegadores. **Preferir sempre a API nativa** quando houver equivalente —
isso reduz superfície de manutenção e elimina a vulnerabilidade a mudanças de
versão da biblioteca.

jQuery continua sendo uma via válida e suportada para código **já escrito** em
jQuery (não misture paradigmas no mesmo arquivo); a recomendação vale para código
novo e para modernização do legado.

Equivalências diretas para modernizar código frontend:

| Intenção | Padrão jQuery (legado) | Equivalente nativo (recomendado) |
|----------|------------------------|----------------------------------|
| Selecionar elemento | `$('.classe')` | `document.querySelector('.classe')` / `querySelectorAll` |
| Selecionar dentro do widget | `$(seletor, this.DOM)` | `this.DOM.querySelector(seletor)` |
| Definir texto | `$(el).text('valor')` | `el.textContent = 'valor'` |
| Adicionar classe | `$(el).addClass('ativa')` | `el.classList.add('ativa')` |
| Remover / alternar classe | `$(el).removeClass()/toggleClass()` | `el.classList.remove()/toggle()` |
| Estilo único | `$(el).css('color', 'red')` | `el.style.color = 'red'` |
| Múltiplos estilos | `$(el).css({...})` | `Object.assign(el.style, {...})` |
| Inserir HTML | `$(el).append(html)` / `prepend` / `before` / `after` | `el.insertAdjacentHTML(posição, html)` |
| Exibir elemento | `$(el).show()` | `el.style.removeProperty('display')` ou `el.style.display = 'block'/'flex'/...` |
| Ocultar elemento | `$(el).hide()` | `el.style.display = 'none'` |

> **Nota sobre propriedades CSS com hífen:** no DOM nativo, propriedades com hífen
> viram camelCase — `background-color` → `el.style.backgroundColor`. Alternativa:
> `el.style.setProperty('background-color', valor)`.

#### Escopo de busca via `this.DOM` (obrigatório em widget)

Em widget, a seleção de elementos DEVE partir de **`this.DOM`** (o subárvore DOM
da própria instância do widget), nunca de `document`. Buscar a partir de
`document` pode capturar elementos de **outro widget** presente na mesma página —
fonte de bugs difíceis de rastrear em páginas com múltiplos widgets.

```javascript
// ✅ correto: busca restrita ao DOM do próprio widget
const el = this.DOM.querySelector('.mensagem');
el.style.color = 'red';

// ❌ errado: busca global — pode pegar elemento de outro widget na página
const el = document.querySelector('.mensagem');
```

| Regra | Detalhe |
|-------|---------|
| Origem da busca | `this.DOM.querySelector(...)` dentro do widget (via `this.DOM` nos métodos) |
| Proibido | `document.querySelector(...)` para elementos do próprio widget |
| Benefício | Isolamento entre widgets + performance (subárvore menor) |

#### Recursos ES6+ no frontend (não confundir com Rhino/dataset)

No **frontend** (widget/layout), o código roda no navegador moderno e DEVE usar
ES6+: `const`/`let` (com escopo de bloco), template literals, destructuring,
spread/rest e enhanced object literals. A **única exceção `var`** é a variável
raiz que recebe `SuperWidget.extend({...})` — ela é atribuída ao escopo global da
página (equivalente a `window.MyWidget`) e por isso não pode ser `let`/`const`
(ver [Variável raiz da SuperWidget (`var`)](#variável-raiz-da-superwidget-var)).

> **Não confundir com dataset:** o scripting **server-side** de dataset roda sobre
> Rhino (ES5) e segue regras rígidas distintas — ver
> [Runtime Rhino: sintaxe rígida](technologies.md#runtime-rhino-sintaxe-rígida-não-é-es6).
> As heurísticas ES6+ desta seção valem **apenas para o frontend**.

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
| Classes raiz obrigatórias | O elemento raiz **deve** conter **as 3 classes fixas** (além da classe específica do widget): `super-widget` (identifica o componente como SuperWidget), `wcm-widget-class` (classe fixa da plataforma) e `fluig-style-guide` (ativa os estilos/componentes do Style Guide). A **ordem não importa** (classes CSS não são ordenadas). Ex.: `class="super-widget wcm-widget-class fluig-style-guide weather-widget"` |
| `instanceId` | Usar **exclusivamente** em atributos `id`, com **exatamente um** `_` (underscore) como separador. **Na `div` raiz do widget**, a parte antes do `_` deve ser o **mesmo nome da variável/classe JS** (`SuperWidget.extend`), em **PascalCase** (ex.: `id="MyWidget_${instanceId}"`, com `var MyWidget = SuperWidget.extend(...)`). Nunca use mais de um `_` na div raiz, pois a SuperWidget faz split por ele. IDs **internos** (não-raiz) podem usar `-`/`_` livremente antes do `_${instanceId}`. |
| `instanceId` proibido em | Atributos `data-*` e `class` (devem ser estáticos) |
| `.instance()` | Chamar **sem** o `instanceId` — ele é injetado automaticamente pelo framework. Use `data-params="MyWidget.instance()"` (parênteses **vazios**, sem `{}`); passe um objeto apenas quando houver parâmetros reais a enviar (ex.: `instance({filtro: '...'})`). Dentro do JS, use `this.instanceId`. |
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
<!-- id: PascalCase (mesmo nome da variável/classe JS) + exatamente um _; instance() sem {} -->
<div id="MyWidget_${instanceId}"
     class="super-widget wcm-widget-class fluig-style-guide my-widget"
     data-params="MyWidget.instance()">
  <button data-save-filter>...</button>
</div>
```

> Ao injetar no `.ftl` um valor de string **controlado pelo usuário** dentro de
> `data-params` (ex.: um parâmetro passado para `.instance({...})`), use o
> built-in do FreeMarker `?js_string` para escapar aspas corretamente — ex.:
> `data-params="MyWidget.instance({filtro: '${valorUsuario?js_string}'})"`.

```javascript
// chave do binding sem o prefixo data-
bindings: { local: { 'save-filter': ['click_onSaveFilter'] } }
```

### Variável raiz da SuperWidget (`var`)

A variável raiz que recebe `SuperWidget.extend({ ... })` é declarada com **`var`**:

```javascript
var MyWidget = SuperWidget.extend({ /* ... */ });
```

Esta é a **única exceção explícita** à proibição de `var` em
[JavaScript Moderno (ES6+)](#javascript-moderno-es6).
A exceção vale **apenas** para a variável raiz do widget; o **restante do JS do
widget permanece em ES6+** (`const`/`let`, arrow functions, template literals).

> ⚠️ **Ressalva de i18n (regra 1 da constituição):** num arquivo `.js` que usa
> i18n (`[=i18n.getTranslation(...)]` / `getTranslationP1/Pn`) e passa pela
> minificação do **Closure Compiler**, **prefira concatenação clássica (`+`) a
> template literals** ao montar textos com a tradução — a minificação conflita
> com template strings que contêm i18n. Template literals
> seguem liberados no JS de widget que **não** usa i18n. Ver
> [platform-constitution.md](platform-constitution.md) (regra 1).

### Sintaxe de métodos dentro de `.extend({})`

Dentro do objeto literal passado a `.extend({})`, todo widget segue uma
**convenção de sintaxe padronizada** (regra 3 de
[platform-constitution.md](platform-constitution.md)): métodos são declarados como propriedade com
`function()`; dentro de cada método o contexto é acessado por `this` direto (sem
cache de escopo como `var ctx = this;`) e os callbacks são Arrow Functions. Essa
convenção existe por dois motivos técnicos concretos:

1. **Padronização do ecossistema** — todo o código de widget do ecossistema
   Fluig segue o mesmo formato `nomeMetodo: function() {}`, o que mantém
   previsibilidade e legibilidade entre componentes de diferentes autores.
2. **Compatibilidade no build Maven** — o empacotamento do widget passa
   por minificação (YUI Compressor / Closure). Declarar os métodos como
   `nome: function() {}` é a forma **suportada** nesse pipeline, evitando
   incompatibilidades de sintaxe moderna no nível do método.

Por isso, **dentro do objeto passado a `.extend({})`**, valem regras de sintaxe
distintas das convenções ES6+ gerais:

| Regra | Obrigatório dentro de `.extend({})` |
|-------|-------------------------------------|
| Declaração de método | `nomeDoMetodo: function() { }` — sintaxe de propriedade com `function` (convenção do ecossistema + segura no build/minificação) |
| Captura de contexto | **Proibido** `var ctx = this;` / `var that = this;` — use `this` direto no método e Arrow Functions nos callbacks, que preservam a referência ao widget |
| Method shorthand | **Nunca** `nomeDoMetodo() { }` — foge da convenção e não é a forma segura no build |
| Método com arrow function | **Nunca** `nomeDoMetodo: () => { }` — arrow **não** vincula `this`, então o método não recebe a instância do widget |
| Callbacks internos | **Obrigatoriamente** Arrow Functions `() => {}` (success, fail, eventos, `.then`) — mantêm o `this` do widget |

**Importante:** essas restrições aplicam-se **exclusivamente** ao objeto literal
passado a `.extend({})`. Fora dele (módulo, utilitários, constantes no topo do
arquivo), ES6+ continua sendo o padrão (`const`/`let`, arrow functions, template
literals etc.).

```javascript
// ✅ correto: sintaxe obrigatória dentro de .extend({})
var MyWidget = SuperWidget.extend({
    init: function() {
        // lógica de inicialização usando this
    },

    // método async dá await; declarado com `nome: async function()`
    loadData: async function() {
        try {
            const data = await this.fetchList();
            this.renderList(data);
        } catch (error) {
            console.error('Falha ao carregar dados:', error);
            this.showError(error.message);
        }
    },

    // método separado devolve a Promise do fetch (sem IIFE)
    fetchList: function() {
        return fetch(this.getApiUrl()).then((response) => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        });
    },

    bindings: {
        local: {
            'refresh-btn': ['click_loadData']
        }
    }
});
```

```javascript
// ❌ errado: method shorthand ES6 — proibido dentro de .extend({}) pela
// constituição (todo widget usa `nomeMetodo: function() {}`)
var MyWidget = SuperWidget.extend({
    init() {
        // ...
    },
    loadData() {
        // ...
    }
});

// ❌ errado: arrow function como método — arrow NÃO vincula `this`,
// então `this` aqui é o escopo léxico externo, NÃO a instância do widget
var MyWidget = SuperWidget.extend({
    init: () => {
        // this aqui é o escopo léxico externo, NÃO o widget
    }
});

// ✅ preferir: dois métodos (async + fetch) declarados com sintaxe de propriedade
// (convenção do ecossistema), callbacks em Arrow Function;
// método async dá await, o outro devolve a Promise do fetch — sem IIFE
var MyWidget = SuperWidget.extend({
    loadData: async function() {
        try {
            const data = await this.fetchList();
            this.renderList(data);
        } catch (error) {
            console.error('Falha ao carregar dados:', error);
        }
    },

    fetchList: function() {
        return fetch(this.getApiUrl()).then((response) => {
            return response.json();
        });
    }
});
```

### Correspondência de Nomes (Widget)

O ecossistema de widget usa uma convenção de nomenclatura estrita onde múltiplos
identificadores são **derivados do mesmo valor base** (`application.code`
declarado no `application.info`). Errar qualquer um deles quebra o widget
silenciosamente.

> **Formato do `application.code`:** **apenas letras, números e `_`** (sem espaço,
> hífen, acento ou ponto). A convenção recomendada é **minúsculas** (ex.:
> `mywidget`). `locale.file.base.name` e os arquivos `.properties` seguem o
> `application.code` **literal**.
>
> **O nome usado no `id` da div raiz e na variável JS é derivado, não o
> `application.code` literal.** Padrão do pacote: a variável/classe do SuperWidget
> é **PascalCase** (`MyWidget`) e o `id` da **div raiz** usa o **mesmo nome em
> PascalCase** (`MyWidget_${instanceId}`), com **exatamente um `_`** separando do
> `${instanceId}` — a SuperWidget faz *split* por `_` na raiz, então o nome não
> pode conter `_` (`view.ftl`: `id="MyWidget_${instanceId}"`,
> `data-params="MyWidget.instance()"`). IDs **internos** (não-raiz) podem usar
> `-`/`_` livremente antes do `_${instanceId}`.
>
> *(A plataforma também aceita o `id` raiz em camelCase — ex.:
> `id="myWidget_${instanceId}"`. As duas formas funcionam; o pacote adota o
> PascalCase como padrão de geração, consistente com o que o desenvolvedor vê ao
> criar um widget novo no ambiente do Consultor.)*

| Conceito | Derivação | Exemplo (widget `MyWidget`, `application.code = mywidget`) |
|----------|-----------|------------------------------------------|
| Variável JS / classe (SuperWidget) | **PascalCase** | `var MyWidget = SuperWidget.extend({...})` |
| `data-params` no FTL | PascalCase + `.instance()` (sem `{}` quando não há parâmetros) | `data-params="MyWidget.instance()"` |
| `id` da div raiz no FTL | **PascalCase** (mesmo nome da classe JS) + **um** `_` + `${instanceId}` | `id="MyWidget_${instanceId}"` |
| Seletores no JS (raiz) | mesma forma do id raiz + `this.instanceId` | `document.getElementById('MyWidget_' + this.instanceId)` |
| `locale.file.base.name` | Exatamente igual ao `application.code` (literal) | `locale.file.base.name=mywidget` |
| Arquivos i18n | `application.code` (literal) + sufixo locale | `mywidget.properties`, `mywidget_pt_BR.properties` |
| CSS class raiz | `#` + id da div raiz como seletor | `#MyWidget_${instanceId} .my-class` |

> **Importante:** o `instanceId` é fornecido automaticamente pelo framework
> SuperWidget via `this.instanceId` — **NUNCA** acessar via
> `this.options.widgetId` ou qualquer outra propriedade inventada.

### Parâmetros do widget (`data-params` → `this.<prop>`)

O `data-params="MyWidget.instance({...})"` passa um objeto de parâmetros para a
instância do widget. **A forma de lê-los no JS é declarar uma propriedade com o
mesmo nome dentro do `.extend({})`** — o framework SuperWidget injeta o valor
automaticamente **antes** do `init()` rodar. Lê-se via `this.<nomeDaProp>`. É o
**mesmo mecanismo** das Preferências de Widget (ver seção abaixo).

```html
<#-- view.ftl: monta o objeto de params (FreeMarker) e passa no instance(...) -->
<#assign parametros = "{'modo':'view', 'cor': '${cor!''}'}">
<div id="MyWidget_${instanceId}"
     class="super-widget wcm-widget-class fluig-style-guide my-widget"
     data-params="MyWidget.instance(${parametros})">
```

```javascript
// JS: declara as propriedades com o MESMO nome; o framework injeta os valores.
var MyWidget = SuperWidget.extend({
    modo: null,   // ← recebe 'view'
    cor:  null,   // ← recebe o valor de ${cor}
    init: function() {
        console.log(this.modo, this.cor); // lê via this.<prop>
    }
});
```

> **Edit × View pelo mesmo parâmetro.** Como `edit.ftl` e `view.ftl` têm, cada
> uma, o seu `data-params`, um parâmetro (ex.: `'modo'`) pode valer `'edit'` numa
> e `'view'` na outra — o JS distingue o contexto lendo `this.modo`. Para detectar
> o modo **sem** depender de um parâmetro, use **`WCMAPI.getIsEditMode() === 'true'`**
> (retorno é string — ver "Detecção de modo (edit/view/preview)" abaixo) —
> **nunca** `this.isEditMode` (não existe na instância do widget).
>
> ⚠️ Valor de **string vindo do usuário** dentro do objeto deve ser escapado com
> `?js_string` no FreeMarker (ver o alerta em "Convenções de Widget" acima), para
> não quebrar o objeto de params nem permitir injeção.

### Detecção de modo (edit / view / preview)

Para saber se o widget está sendo renderizado no **modo de edição** (configuração
pelo administrador da página) ou no **modo de visualização**, use os **métodos do
`WCMAPI`** — a fonte oficial é o `WCMAPI`, **não** a instância do widget.

| Usar | Retorno | Como comparar |
|------|---------|---------------|
| `WCMAPI.getIsEditMode()` | **string** `'true'`/`'false'` | `=== 'true'` (ou `== "true"`) |
| `WCMAPI.getIsPreviewMode()` | **string** `'true'`/`'false'` | `=== 'true'` |

> ⚠️ **O retorno é string, não boolean.** Ambos os métodos chegam como string
> (`'true'`/`'false'`). Portanto **compare sempre com `'true'`** — **nunca** use o
> retorno direto num `if`, porque a string `'false'` é *truthy* e faria o `if` dar
> sempre verdadeiro.

```javascript
init: function() {
    if (WCMAPI.getIsEditMode() === 'true') {
        this.renderSettingsForm();   // modo de edição (configuração)
    } else {
        this.renderPanel();          // modo de visualização
    }
}
```

> ⚠️ **Três armadilhas comuns (todas quebram a detecção):**
> 1. **`this.isEditMode`** — **não existe** na instância do
>    widget; vem `undefined` (sempre falsy → cai sempre no `else`).
> 2. **`WCMAPI.isEditMode`** (propriedade crua) — string `"false"`, *truthy*.
> 3. **`if (WCMAPI.getIsEditMode())`** sem comparar — o retorno `'false'` é string
>    *truthy* → `if` **sempre verdadeiro**. Compare com `=== 'true'`.

### Reuso de Componentes de Negócio nativos

- **Priorizar sempre** os Componentes de Negócio nativos em vez de recriar modais
  customizadas do zero para ações que a plataforma já resolve.
- Exemplos: seleção de usuários → `WCMBC.selectUser`; seleção de grupos →
  `WCMBC.selectGroup`; seleção de papéis → `WCMBC.selectRole`; busca de documentos
  do ECM → `ECMBC.searchDocument`; recorte de imagem → `WCMBC.cropImage`.
- Reimplementar do zero uma funcionalidade coberta por um componente nativo é
  retrabalho, diverge do padrão visual/UX e costuma recair em APIs internas.
- O catálogo completo (assinatura, parâmetros e a dependência
  `application.resource.component.N`) é fonte de verdade de
  [business-components.md](business-components.md). Não duplicar aqui.

> **Parceiro (Store):** a regra de quando **exigir/bloquear** o reuso na revisão
> está em [§ 30](partner-store-review-rules.md#30-reuso-de-componentes-de-negócio-nativos).

### Eventos e estilos: sem inline no HTML

- **Sem eventos inline no HTML.** Evitar `onclick="funcao()"` (e demais
  `on*="..."`) na marcação. A lógica de eventos deve ser **delegada via listeners**
  no JavaScript — no widget, preferir os **bindings declarativos** do SuperWidget
  (`bindings.local` / `bindings.global`) atrelados à view; em Web Components, usar
  `addEventListener`.
- **Sem estilos inline massivos.** Evitar `style="..."` na marcação. O visual deve
  ser resolvido por **classes CSS** atreladas ao tema (Style Guide + variáveis
  `var(--fs-color-*)`), no `.css` empacotado — não embutido no elemento.
- Motivos: separação de responsabilidades, testabilidade, reaproveitamento de
  classes de tema e suporte a dark mode. Estilo inline também impede o override por
  tema. Regras de CSS de tema em [style-guide.md](style-guide.md).

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
[Chamadas REST e Integrações](#chamadas-rest-e-integrações): a importação do script no
`.ftl` é permitida (e exigida) **apenas** para habilitar a consulta a datasets no
cliente. Regras:

- Importe o script **somente** quando o widget de fato consulta datasets no
  cliente; se o widget não consulta datasets, não inclua o script.
- Inclua-o na **view onde a consulta ocorre** (`view.ftl` e/ou `edit.ftl`).
- Mantenha o caminho `/webdesk/vcXMLRPC.js` e os atributos **inalterados** — é o
  caminho público e oficial dessa biblioteca.

Uma vez importado o script, o `DatasetFactory` fica disponível no cliente. **No
JavaScript do cliente (navegador)**, a consulta a dataset **deve obrigatoriamente**
informar o objeto de `callback` (com `success` e `error`) — é isso que torna a
chamada **assíncrona** no browser.

> ⚠️ **Não confunda os dois contextos:** o parâmetro de `callback` (`success`/
> `error`) que torna a chamada assíncrona **só existe no client-side (navegador,
> via `vcXMLRPC.js`)**. Dentro do **Rhino (server-side: datasets, eventos,
> customizações)** o `DatasetFactory.getDataset(...)` é chamado **sem callback** e
> retorna o resultado diretamente — e isso está **correto** naquele contexto. A
> proibição de chamada síncrona vale **apenas** para o JavaScript do cliente.

**Padrão canônico no cliente:** o método assíncrono usa `await`, e uma função
`*Promise()` separada encapsula o `DatasetFactory.getDataset(...)` mapeando
`success: resolve` / `error: reject`:

```javascript
// ✅ ÚNICO padrão permitido no client-side: getDataset com callback envolto em Promise
// (métodos dentro de SuperWidget.extend({}), na sintaxe `nome: function() {}`)
obterColleague: async function() {
    const colleague = await this.obterColleaguePromise();
    console.log(colleague);
},

obterColleaguePromise: function() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset('colleague', ['colleagueName'], null, null, {
            success: resolve,
            error: reject
        });
    });
}
```

> 🚨 **ESTRITAMENTE PROIBIDO no client-side:** chamar `DatasetFactory.getDataset(...)`
> **sem** o objeto de `callback` (modo síncrono, com retorno direto). No navegador,
> a chamada síncrona bloqueia a thread principal, trava a interface e causa
> timeouts. **Toda** consulta a dataset no cliente **deve** informar `success`/`error`.
>
> ```javascript
> // ❌ PROIBIDO no client-side: chamada síncrona (sem callback) — trava a interface
> const result = DatasetFactory.getDataset('colleague', ['colleagueName'], null, null);
> ```

> As **assinaturas completas** de `DatasetFactory.getDataset`,
> `DatasetFactory.createConstraint`, `ConstraintType` e correlatos são fonte de
> verdade de [architecture.md](architecture.md), seção "API pública de Dataset —
> assinaturas". Não as duplique nem invente parâmetros.

### Consumo de dataset em widget (padrão SuperWidget)

> **Regras base de performance** (URL v2, `field` obrigatório, paginação,
> proibição de URLs legadas, preferência por API REST sobre `DatasetFactory`) são
> fonte de verdade de [Consumo de Datasets no Front-End (regra de performance)](#consumo-de-datasets-no-front-end-regra-de-performance).
> **Não duplique** essas regras aqui; esta seção cobre apenas o **padrão de
> integração dentro de `SuperWidget.extend`** (uso de `this` direto e feedback
> via `FLUIGC.toast`).

Dentro do `.extend({})`, separe em **dois métodos**: um método **`async`** que dá
`await` e trata o resultado, e um método que retorna o `fetch()` (que já é uma
`Promise`). Cada método é declarado com a sintaxe de propriedade do `.extend`
(`nome: function()` / `nome: async function()`) e usa `this` direto (sem cache de
escopo), com Arrow Functions nos callbacks, para preservar o contexto do widget:

```javascript
const URL_DATASET_V2 = WCMAPI.getServerURL() + '/dataset/api/v2/dataset-handle/search';
```

```javascript
loadData: async function() {
    try {
        const data = await this.fetchDataset();
        this.renderTable(data);
    } catch (error) {
        console.error('Falha ao consultar dataset:', error);
        FLUIGC.toast({
            message: "[=i18n.getTranslation('error.load.data')]",
            type: 'danger'
        });
    }
},

fetchDataset: function() {
    const url = URL_DATASET_V2
        + '?datasetId=' + encodeURIComponent(this.datasetName)
        + '&field=codigo&field=descricao&field=status'
        + '&limit=50&offset=0';

    return fetch(url, {
        headers: { 'Accept': 'application/json; charset=UTF-8' }
    }).then((response) => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
    });
}
```

| Regra específica do padrão SuperWidget | Detalhe |
|----------------------------------------|---------|
| Dois métodos (`async` + `*Promise`/`fetch`) | Método `async` dá `await`; o outro devolve a `Promise` do `fetch` — sem IIFE dentro do método |
| `this` direto + Arrow Functions | Preserva a referência ao widget sem `var ctx = this` |
| `fetch()` + `async/await` + `try/catch` | Padrão único de integração HTTP no cliente |
| `FLUIGC.toast` no `catch` | Feedback visual obrigatório ao usuário em caso de falha |
| `encodeURIComponent` | Sempre codificar valores dinâmicos na URL |

### Preferências de Widget (persistência por instância)

É a forma **oficial e recomendada** pela plataforma Fluig de persistir
configuração **por instância** de widget (ex.: filtros, limites, URLs
editáveis pelo administrador da página) — evita hardcode e fica sob o controle
de versão da própria página.

> ⚠️ **O valor salvo NÃO "aparece sozinho" nas propriedades do JS.** Salvar com
> `UPDATEPREFERENCES` persiste a preferência; para o JS **lê-la de volta** é
> preciso o **ciclo via FreeMarker + `data-params`** (abaixo). Apenas declarar
> `panelTitle: null` no `.extend({})` **não** basta — sem o `data-params` passar o
> valor, a propriedade fica `null` (sintoma típico: salva, mas no F5 o formulário
> não repopula e a view não exibe nada).

**Ciclo completo (salvar → persistir → ler de volta):**

1. **Salvar** (no `edit.ftl`/JS): `WCMSpaceAPI.PageService.UPDATEPREFERENCES({...}, this.instanceId, preferences)`, com `preferences` chaveado pelos nomes da configuração.
2. **Reinjeção via FreeMarker:** a plataforma, ao renderizar, disponibiliza cada
   preferência salva como variável FreeMarker de **mesmo nome** — `${panelTitle!''}`,
   `${numberOfItems!''}` — tanto na `view.ftl` quanto na `edit.ftl`.
3. **Repasse ao JS via `data-params`:** a view **deve** montar o objeto de params
   com essas variáveis e passá-lo no `instance(...)` — é isso que leva o valor ao JS.
4. **Leitura no JS:** declare a propriedade de mesmo nome no `.extend({})`; ela
   recebe o valor via `data-params` (ver "Parâmetros do widget (`data-params` →
   `this.<prop>`)") e é lida por `this.<prop>`.

```html
<#-- view.ftl E edit.ftl: repassam as preferências reinjetadas ao JS -->
<#assign parametros = "{'panelTitle':'${panelTitle!''?js_string}','numberOfItems':'${numberOfItems!''?js_string}'}">
<div id="ConfigurablePanel_${instanceId}"
     class="super-widget wcm-widget-class fluig-style-guide configurable-panel-widget"
     data-params="ConfigurablePanel.instance(${parametros})">
```

```html
<#-- edit.ftl: além do data-params, os campos do form repopulam direto via FreeMarker -->
<input id="panelTitleInput_${instanceId}" class="form-control" value="${panelTitle!''}" />
```

| Conceito | Regra |
|----------|-------|
| Declaração | Declare a propriedade em `.extend({})` com o **mesmo nome** da chave salva — o valor chega **via `data-params`** (passo 3), lido por `this.<prop>` |
| Repasse (obrigatório) | A `view.ftl`/`edit.ftl` **deve** passar a preferência reinjetada (`${nome!''}`) no `data-params`; sem isso a propriedade vem `null` |
| Tipos | Tudo é persistido como **string** — converta no uso (`parseInt`, etc.) |
| Salvar | `WCMSpaceAPI.PageService.UPDATEPREFERENCES({ async: true, success: ..., fail: ... }, this.instanceId, preferences)` |
| Repopular o form (`edit.ftl`) | Além do `data-params`, o `value="${nome!''}"` do campo repopula direto no FreeMarker |

```javascript
// chave do objeto 'preferences' bate com o nome da propriedade declarada em .extend({})
saveSettings: function() {
    const preferences = { numberOfArticles: this.readNumberOfArticlesInput() };

    WCMSpaceAPI.PageService.UPDATEPREFERENCES({
        async: true,
        success: (data) => {
            FLUIGC.toast({ message: "[=i18n.getTranslation('preferences.saved')]", type: 'success' });
        },
        fail: (xhr, message, errorData) => {
            FLUIGC.toast({ message: "[=i18n.getTranslation('preferences.saveError')]", type: 'danger' });
        }
    }, this.instanceId, preferences);
}
```

> Exemplo completo (declaração, repasse via `data-params`, leitura em modo view,
> formulário de edição com validação):
> [`examples/widget/preferences.example.js`](../examples/widget/preferences.example.js)
> (o cabeçalho do arquivo mostra o `data-params` que a view precisa ter).

### Modais em Widgets

A forma **oficial e recomendada** de abrir um modal a partir de um widget é
`FLUIGC.modal(settings, callback)` — nunca recriar um modal com Bootstrap puro
ou markup próprio. O modal é renderizado **fora da raiz do widget**, direto no
`body` da página — isso tem uma consequência direta sobre bindings (ver "Regra
crítica" abaixo).

```javascript
// variável para controlar a instância do modal aberto
var MyWidget = SuperWidget.extend({
    myModal: null,

    bindings: {
        local: {
            // botão que ABRE o modal fica DENTRO da raiz do widget → local
            'open-modal': ['click_openModal']
        },
        global: {
            // botão de AÇÃO do modal (ex.: "Salvar") fica FORA da raiz,
            // renderizado no body pelo FLUIGC.modal → global
            'save-data': ['click_saveData']
        }
    },

    saveData: function() {
        // ... persistir os dados lidos do modal ...
        this.myModal.remove(); // fecha e remove o modal do DOM
    },

    openModal: function() {
        this.myModal = FLUIGC.modal({
            title: 'Title',
            content: '<h1>Modal Content</h1>', // ver variações de `content` abaixo
            id: 'fluig-modal',
            actions: [{
                'label': 'Salvar',
                'bind': 'data-save-data', // casa com a chave 'save-data' do binding global
                'classType': 'btn-info'
            }, {
                'label': 'Close',
                'autoClose': true // fecha automaticamente, sem precisar de binding
            }]
        }, (err, data) => {
            if (err) {
                // tratamento de erro
            }
        });
    }
});
```

| Opção de `FLUIGC.modal` | Papel |
|--------------------------|-------|
| `title` | Título exibido no cabeçalho do modal |
| `content` | O conteúdo do modal — ver as 4 variações abaixo |
| `id` | `id` do modal no DOM (usado para escutar eventos Bootstrap, ex.: `hide.bs.modal`) |
| `actions` | Array de botões do rodapé; `bind: 'data-<chave>'` liga o botão a um binding **global**; `autoClose: true` fecha sem precisar de binding |
| `callback(err, data)` | Chamado ao fechar/concluir; trata erro ou dado retornado |

> **Regra crítica:** o botão de ação do modal (`actions[].bind`) **deve** ser
> declarado em `bindings.global`, nunca em `bindings.local`. Como o modal é
> renderizado fora da `div` raiz do widget (direto no `body`), um binding
> `local` **não dispara** — essa é a causa mais comum de "o botão do modal não
> funciona".

#### Variações de `content`

O `content` de `FLUIGC.modal` aceita 4 formas, conforme a origem do conteúdo:

**1. String estática** — HTML fixo, sem dados dinâmicos:

```javascript
content: '<h1>Modal Content</h1>'
```

**2. Mustache** — monta o HTML a partir de um `<script type="text/template">`
na própria `view.ftl` do widget, usando o Mustache já embutido na plataforma
(ver [style-guide.md](style-guide.md), "Plugins embutidos"). A sintaxe completa
de templates Mustache (interpolação, iteração, seções invertidas) é fonte de
verdade de "Templating com Mustache" abaixo — aqui só o uso dentro do modal:

```html
<!-- view.ftl: template Mustache dentro da própria widget -->
<script type="text/template" id="tpl-modal">
    <h4>{{param1}}</h4>
</script>
```

```javascript
openModal: function() {
    const view = { param1: 'Valor enviado ao template' };
    const content = Mustache.render($('#tpl-modal').html(), view);

    this.myModal = FLUIGC.modal({ title: 'Title', content: content, id: 'fluig-modal', actions: [/* ... */] });
}
```

**3. Outra widget (`widgetCode`/`ftl`/`data`)** — carrega a view de **outra
widget** dentro do modal, passando dados para ela:

```javascript
openModal: function() {
    this.myModal = FLUIGC.modal({
        title: 'Title',
        content: {
            'widgetCode': 'widget_reutilizavel',  // application.code da widget alvo
            'ftl': 'view.ftl',                     // view a renderizar
            'data': {
                'meuParametro1': 'Parametro enviado da widget que abriu o modal'
            }
        },
        id: 'fluig-modal',
        actions: [/* ... */]
    });
}
```

**4. `WCMAPI.convertFtlAsync`** — pré-renderiza o FTL de outra widget de forma
**assíncrona** antes de montar o modal (equivalente à variação 3, mas via
callback explícito, útil quando é preciso agir sobre o HTML já renderizado
antes de abrir o modal):

```javascript
openModal: function() {
    WCMAPI.convertFtlAsync('widget_reutilizavel', 'view.ftl', JSON.stringify({ 'meuParametro1': 'Valor personalizado' }), (data) => {
        this.myModal = FLUIGC.modal({ title: 'Title', content: data, id: 'fluig-modal', actions: [/* ... */] });
    });
}
```

> Nas variações 3 e 4, a widget alvo lê o parâmetro recebido **direto no seu
> `view.ftl`**, igual a qualquer outra variável injetada pela plataforma — ver
> "Passagem de Dados em Widgets" abaixo, cenário (c):
>
> ```html
> <!-- view.ftl da widget alvo (ex.: widget_reutilizavel) -->
> <p>${meuParametro1!''}</p>
> ```

> Exemplo completo (widget "opener" com as 4 variações + widget alvo):
> [`examples/widget/modal.example.js`](../examples/widget/modal.example.js) e
> [`examples/widget/modal-target.example.js`](../examples/widget/modal-target.example.js).

### Templating com Mustache

Mustache é o motor de templating "logic-less" já embutido na plataforma (ver
[style-guide.md](style-guide.md), "Plugins embutidos") — reutilizado em mais de
um cenário de widget: dentro de um modal (ver "Modais em Widgets" acima) e como
`renderContent` de um `FLUIGC.datatable` (ver "Datatable em Widgets" abaixo).
Esta seção documenta a sintaxe de template em si, uma única vez, para os dois
casos a reutilizarem.

**Padrão de uso:** o template vive em um `<script type="text/template" id="...">`
dentro da própria `view.ftl` do widget; o JS lê o template com `.innerHTML`
(ou `.html()` via jQuery), renderiza com `Mustache.render(template, view)` e
insere o resultado no DOM:

```javascript
const template = document.getElementById('tpl-example').innerHTML;
const output = Mustache.render(template, view);
document.getElementById('target_' + this.instanceId).innerHTML = output;
```

**Interpolação simples e valores computados** — `{{chave}}` interpola uma
propriedade do objeto `view`; o escape automático do HTML é a regra padrão
(ver "Mustache: cuidado com o triple-stache `{{{ }}}`" acima — não repetir
aqui). Uma chave também pode ser uma **função** no objeto `view` — o Mustache
chama a função e usa o retorno:

```html
<!-- view.ftl -->
<script type="text/template" id="tpl-example">
    {{title}} spends {{calc}}
</script>
```

```javascript
const view = {
    title: 'Joe',
    calc: () => 2 + 4 // valor computado
};
```

**Seções/iteração sobre array** — `{{#lista}}...{{/lista}}` repete o bloco
interno uma vez por item do array, com as chaves do item acessíveis direto
(sem prefixo) dentro do bloco:

```html
<script type="text/template" id="tpl-people">
    {{#people}}
    <p>{{name}} has {{age}} years old</p>
    {{/people}}
</script>
```

```javascript
const view = {
    people: [
        { name: 'Luis', age: '19' },
        { name: 'Ana', age: '20' }
    ]
};
```

**Seções invertidas** — `{{^condicao}}...{{/condicao}}` renderiza o bloco
interno **apenas quando** a chave é falsy, um array vazio, ou está ausente do
objeto `view` — o uso típico é um fallback de "sem dados":

```html
<script type="text/template" id="tpl-item">
    {{#reviews}}
    <p>Review: {{content}}</p>
    {{/reviews}}
    {{^reviews}}
    <p>No reviews yet</p>
    {{/reviews}}
</script>
```

> Seções podem ser **aninhadas**: um item de uma lista `{{#produtos}}` pode ter
> sua própria subseção invertida de fallback (ex.: cada produto com ou sem
> `{{#avaliacao}}`/`{{^avaliacao}}`), um por item, dentro do mesmo laço externo.

> Exemplo completo (interpolação + valor computado, iteração, seção
> invertida): [`examples/widget/mustache-templates.example.js`](../examples/widget/mustache-templates.example.js).

### Datatable em Widgets

A forma **oficial e recomendada** de exibir uma tabela de dados em um widget é
`FLUIGC.datatable` (ver [style-guide.md](style-guide.md), "Datatable
(`FLUIGC.datatable`)", para a API completa de `settings`/métodos/eventos) —
nunca implementar paginação, busca ou arrastar-e-soltar manualmente quando o
componente já resolve.

**Estrutura básica:** um `<div>` vazio na `view.ftl` serve de alvo; a tabela é
montada dentro de um método chamado por `init()`:

```html
<!-- view.ftl -->
<div id="target_datatable_${instanceId}"></div>
```

```javascript
var MyWidget = SuperWidget.extend({
    myTable: null,

    init: function() {
        this.initDatatable();
    },

    initDatatable: function() {
        this.myTable = FLUIGC.datatable('#target_datatable_' + this.instanceId, {
            dataRequest: this.data,
            renderContent: ['id', 'name', 'uf'],
            header: [{ 'title': 'Código' }, { 'title': 'Nome' }, { 'title': 'UF' }]
        }, (err, data) => {
            if (err) {
                // tratamento de erro
            }
        });
    }
});
```

#### Ações por linha (`actions.template`)

Um template de botões por linha, declarado em um `<script type="text/template">`
**dentro da própria `view.ftl` do widget**:

```html
<!-- view.ftl -->
<script type="text/template" id="area-acao">
    <button type="button" class="btn btn-success btn-sm" data-add-linha>Adicionar</button>
    <button type="button" class="btn btn-danger btn-sm" data-rem-linha>Remover</button>
</script>
```

```javascript
actions: {
    enabled: true,
    template: '#area-acao',
    actionAreaStyle: 'col-md-6'
}
```

> **Regra crítica (contraste com Modal):** os botões do template de ações do
> Datatable usam **`bindings.local`** — ao contrário do botão de ação do
> modal (que usa `bindings.global`, ver "Modais em Widgets" acima). A
> diferença é onde cada template é renderizado: o template de ações do
> Datatable é renderizado **dentro** do escopo/raiz do próprio widget, enquanto
> o modal é renderizado fora da raiz, direto no `body`.

```javascript
bindings: {
    local: {
        'add-linha': ['click_addRow'],
        'rem-linha': ['click_delRow']
    },
    global: {}
}
```

#### Busca local

`search.onSearch` recebe o texto digitado; a filtragem do array local e o
`.reload()` com o resultado ficam a cargo do widget:

```javascript
// No método do widget que monta o datatable:
// ... FLUIGC.datatable(elemento, { ... settings ... }) ...
search: {
    enabled: true,
    onlyEnterkey: false,
    onSearch: (text) => {
        // Arrow Function: o `this` léxico continua sendo o widget (o método que
        // monta o datatable), sem precisar de cache de escopo.
        if (!text) {
            this.myTable.reload(this.dataInit);
            return;
        }
        const filtered = this.dataInit.filter((item) => {
            return item.name.toUpperCase().includes(text.toUpperCase());
        });
        this.myTable.reload(filtered);
    }
}
```

#### Reordenação com persistência (`draggable` + preferências)

`draggable.enabled` habilita arrastar linhas; o evento
`fluig.datatable.drag.end` entrega a página atual já reordenada via
`.getData()`. Persistir a nova ordem usa o mesmo mecanismo de
`WCMSpaceAPI.PageService.UPDATEPREFERENCES` já documentado em "Preferências de
Widget (persistência por instância)" acima — não duplicar aqui, apenas aplicar:

```javascript
this.myTable.on('fluig.datatable.drag.end', (data) => {
    const reorderedPage = this.myTable.getData();
    // mesclar a página reordenada no array completo (this.dataInit) antes de salvar
    const preferences = { orderedData: encodeURIComponent(JSON.stringify(this.dataInit)) };

    WCMSpaceAPI.PageService.UPDATEPREFERENCES({
        async: true,
        success: (result) => { /* ... */ },
        fail: (xhr, message, errorData) => { /* ... */ }
    }, this.instanceId, preferences);
});
```

#### Paginação manual client-side

Quando `dataRequest` é um array estático (não REST), a paginação é implementada
pelo próprio widget com `pageSize`/`currentPage` e um método que faz o `slice`
dos dados, chamado nos eventos `forward`/`backward`:

```javascript
var MyWidget = SuperWidget.extend({
    pageSize: 10,
    currentPage: 0,

    paginateData: function() {
        const start = this.currentPage * this.pageSize;
        return this.dataInit.slice(start, start + this.pageSize);
    }
});
```

```javascript
this.myTable.on('fluig.datatable.forward', () => {
    this.currentPage++;
    this.myTable.reload(this.paginateData());
});
```

> Paginação e ordenação **server-side** (via REST) são suportadas oficialmente
> apenas quando `dataRequest` é o objeto REST (`{url, options, ...}`), não um
> array estático — ver [style-guide.md](style-guide.md), "Datatable
> (`FLUIGC.datatable`)".

#### Template de edição inline

Um segundo template, com placeholders Mustache (ver "Templating com Mustache"
acima para a sintaxe), substitui a linha pelo modo de edição via
`.updateRow(index, row, templateSelector)`:

```html
<script type="text/template" class="template-datatable-edit">
    <tr class="{{classSelected}}">
        <td>{{id}}</td>
        <td><input type="text" value="{{name}}" id="datatable-input-name"></td>
    </tr>
</script>
```

```javascript
editRow: function() {
    const row = this.myTable.getRow(this.myTable.selectedRows()[0]);
    this.myTable.updateRow(this.myTable.selectedRows()[0], row, '.template-datatable-edit');
}
```

| Cenário | `dataRequest` | Mecanismo |
|---------|---------------|-----------|
| Lista pequena, estática ou de um dataset já carregado | Array de objetos | Paginação/busca manuais no cliente (`paginateData()`, `search.onSearch` filtrando localmente) |
| Grande volume de dados, com paginação/ordenação no servidor | Objeto REST (`{url, options, ...}`) | O próprio Datatable delega `offset`/`limit`/`orderby` à URL — sem paginação manual no cliente |
| Reordenar linhas pelo usuário, persistindo a ordem | Qualquer | `draggable.enabled` + `fluig.datatable.drag.end` + `UPDATEPREFERENCES` |
| Ação por linha (editar, remover, selecionar) | Qualquer | `actions.template` com `bindings.local` |

> Exemplo completo: [`examples/widget/datatable.example.js`](../examples/widget/datatable.example.js).

> ⚠️ **O nome da coluna retornada pode ser qualificado — confira a resposta real.**
> Ao consumir um dataset (nativo ou avançado) via REST/`DatasetFactory`, o campo
> **pedido** nem sempre é o **nome da chave** no objeto de retorno. Datasets
> nativos com chave composta expõem a coluna com o **nome qualificado pela PK** —
> ex.: `workflowProcess` retorna `workflowProcessPK.processInstanceId`, não
> `processInstanceId`. Ler `row.processInstanceId` daria `undefined` e a coluna
> sairia vazia. **Confira os nomes reais em `data.columns`** (ou na aba Network) e
> use-os em `renderContent`/`formatData`/no template — não assuma que o nome do
> `field` pedido é a chave do objeto.

> ⚠️ **Modo REST: `root` × `formatData` não se sobrepõem.** No `dataRequest`
> objeto REST, o `root` (ex.: `'values'`) já indica ao Datatable **onde está o
> array** de registros — o `formatData` recebe **esse array já extraído**, não a
> resposta inteira. Fazer `formatData: function(data) { return data.values... }`
> **quando `root` já é `'values'`** lê o campo errado e dispara
> `"check if the root attribute was set correctly"`. Escolha **um**: ou define
> `root` e o `formatData` itera direto sobre o array recebido, ou omite `root` e o
> `formatData` navega a resposta inteira.

### Passagem de Dados em Widgets

Existem **quatro mecanismos** distintos para um widget receber ou trocar dados,
cada um adequado a um cenário diferente. Esta seção consolida os quatro e
quando usar cada um — os mecanismos (b) e (d) já têm regra completa em outras
seções deste arquivo; aqui apenas se referenciam, sem duplicar.

| Cenário | Mecanismo | Quando usar |
|---------|-----------|--------------|
| (a) `edit.ftl` → `view.ftl`, mesma instância | Interpolação direta no FreeMarker | Dado simples de configuração visual (ex.: uma cor), sem precisar ser lido no JS |
| (b) Configuração editável por instância, persistida | `WCMSpaceAPI.PageService.UPDATEPREFERENCES` (ver "Preferências de Widget" acima) | Filtro, limite, URL editável pelo administrador da página, que precisa sobreviver a reloads |
| (c) Widget → widget, dentro de um modal | `data` em `FLUIGC.modal` ou `WCMAPI.convertFtlAsync` (ver "Modais em Widgets" acima) | Carregar outra widget com dados dentro de um modal |
| (d) Widget → widget, sem modal, já renderizados | `WCMAPI.fireEvent`/`WCMAPI.addListener` (ver "Comunicação entre artefatos (eventos)" abaixo) | Dois widgets já na página precisam reagir um ao outro (ex.: seleção em um atualiza o outro) |

**(a) `edit.ftl` → `view.ftl` via interpolação direta no FreeMarker.** O valor
digitado no modo de edição é lido direto na `view.ftl`, sem passar pelo
JavaScript — útil para um dado simples de apresentação (ex.: uma cor
configurada pelo administrador da página):

```html
<!-- edit.ftl: campo de configuração -->
<input class="form-control" id="colorPicker_${instanceId}" name="colorPicker_${instanceId}" value="${color!''}" />
```

```html
<!-- view.ftl: o mesmo valor, interpolado direto no FreeMarker -->
<p style="color: ${color!''};">Texto na cor configurada</p>
```

> Esse padrão **não persiste automaticamente** o valor digitado em `edit.ftl`
> — a persistência real continua sendo via preferências (cenário b) ou outro
> mecanismo explícito; aqui o que se demonstra é apenas a **leitura** do valor
> já disponível na `view.ftl`/`edit.ftl` via FreeMarker, sem round-trip de JS.

> **Ciclo completo (a)+(b): edit configura → persiste → view usa.** Na prática,
> um dado configurável pelo administrador combina os dois: o `edit.ftl` coleta o
> valor e **salva via preferências** (`UPDATEPREFERENCES`, cenário b); a
> plataforma injeta a preferência de volta e o FreeMarker a disponibiliza em
> `view.ftl`/`edit.ftl` como `${pref!''}`; daí o valor pode ser **interpolado
> direto** no HTML (cenário a) **e/ou** passado ao JS como parâmetro de
> `instance({...})` — lido via `this.<prop>` (ver "Parâmetros do widget
> (`data-params` → `this.<prop>`)" acima). Ou seja: **preferência persiste →
> FreeMarker lê → (interpola na view) e/ou (vira param do JS)**.

> Exemplo completo: [`examples/widget/modal-target.example.js`](../examples/widget/modal-target.example.js)
> e seu `.view.ftl` correspondente mostram a leitura de um parâmetro recebido
> (cenário c); para (a)/(b), ver `examples/widget/preferences.example.js`.

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

## Convenções de Dataset (customizado)

### Anti-padrão "Dataset chamando Dataset"

Evite encadear datasets customizados: um dataset `A` que chama
`DatasetFactory.getDataset("B", ...)`, que por sua vez chama um dataset `C`
para só então chegar à fonte real (banco/serviço), em vez de `A` consultar essa
fonte diretamente. Cada salto da cadeia é um round-trip adicional (mais
latência), esconde onde a falha de fato ocorreu (debug mais difícil) e torna o
resultado final dependente da saúde de **todos** os elos — uma falha em
qualquer dataset intermediário quebra a cadeia inteira.

```text
❌ dsPedidos → dsClientes → dsClientesBanco (3 saltos até a fonte real)
✅ dsPedidos → consulta a fonte (banco/serviço) diretamente
```

> **Parceiro (Store):** a severidade de revisão para cadeias de dataset (ex.:
> "3+ níveis → alerta de performance") é fonte de verdade de
> [§ 24](partner-store-review-rules.md#24-datasets--estrutura-classificação-e-mapa-de-dependências), "Mapa de
> Dependências" — não duplicada aqui.

### Nomenclatura de Dataset

| Item | Regra | Exemplo |
|------|-------|---------|
| Identificador do dataset | Prefixo `ds` + nome descritivo | `dsClientes`, `dsProdutosRM`, `dsIntegracaoERP` |
| Nome do arquivo (`datasets/`) | Mesmo identificador do dataset, com extensão `.js` | `dsClientes.js` |

> Para o checklist completo de publicação de um dataset, ver
> [fluig-scaffolding-dataset/SKILL.md](../skills/fluig-scaffolding-dataset/SKILL.md),
> seção "Checklist de Validação".

## Convenções de Form (formulário eletrônico)

→ **Movido para [conventions-form.md](conventions-form.md)** — documento
dedicado a formulários eletrônicos (estrutura base, campos, tabela Pai x Filho,
i18n exclusivo de forms).

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

## Os três domínios de i18n do Fluig

O Fluig possui **três mecanismos de internacionalização distintos e
incompatíveis** entre si. Cada domínio tem sua própria função de tradução, seus
arquivos `.properties` e sua convenção de chaves — **nunca misture os padrões de
um domínio no outro**.

| Domínio | Função de tradução | Arquivos `.properties` | Onde se aplica |
|---------|--------------------|------------------------|----------------|
| **Formulários** | `i18n.translate("chave")` (HTML e scripts de evento) | **3** arquivos de locale (`_pt_BR`, `_en_US`, `_es`) — **sem** arquivo base | View HTML do formulário e seus eventos → ver [i18n em formulários](conventions-form.md#internacionalização-i18n-em-formulários) |
| **Páginas (Widgets e Layouts)** | `i18n.getTranslation('chave')` resolvido pelo FreeMarker: em `.js`, preferir `[=i18n.getTranslation('chave')]`; em `.ftl`, a sintaxe FreeMarker do arquivo | **1 base** (`<code>.properties`) **+** locales | `view.ftl`/`layout.ftl`, `edit.ftl` e o `.js` do widget → ver [i18n — Widgets e Layouts](#internacionalização-i18n--widgets-e-layouts) |
| **Processos (Workflow)** | `i18n.translate("chave")` (customizações/eventos do processo) | Locale na pasta `literals/` (`<diagrama>_pt_BR`, `_en_US`, `_es`) | Diagrama do processo (atividades, fluxos) e eventos → ver [i18n — Processos (Workflow)](#internacionalização-i18n--processos-workflow) |

> **Regra de ouro:** formulários e processos usam `i18n.translate("chave")`;
> páginas (widgets/layouts) usam `i18n.getTranslation('chave')` via FreeMarker —
> em `.js`, preferir `[=i18n.getTranslation('chave')]`. Os três
> mecanismos são independentes — a função, os arquivos e a nomenclatura de chaves
> de um domínio **não** valem no outro.

> **Estes três mecanismos não são exaustivos para todo o Fluig.** Há um quarto
> mecanismo, exclusivo da camada **backend Java** (REST/service/entity) do
> modelo parceiro — plain Java com `ResourceBundle`/`MessageFormat`, que resolve
> o locale pelo cabeçalho HTTP `Accept-Language` em vez da sessão do usuário.
> Fora do escopo deste arquivo.

> **Parceiro (Store):** o contrato completo do quarto mecanismo está em
> [i18n em Camada REST/Java (ResourceBundle)](backend-java-maven.md#i18n-em-camada-restjava-resourcebundle).

> Para a terminologia correta de textos visíveis ao usuário (não a sintaxe de
> i18n em si), ver [writing-style-guide.md](writing-style-guide.md).

## Internacionalização (i18n) — Widgets e Layouts

> **Escopo:** as convenções desta seção aplicam-se **exclusivamente a Widgets e Layouts**. Formulários eletrônicos possuem um mecanismo de i18n próprio, descrito na seção [Internacionalização (i18n) — Formulários](conventions-form.md#internacionalização-i18n-em-formulários); processos de workflow têm o seu, em [Internacionalização (i18n) — Processos (Workflow)](#internacionalização-i18n--processos-workflow). **Não aplique as regras desta seção em formulários nem em processos.**

> Para a terminologia correta de textos visíveis ao usuário, ver
> [writing-style-guide.md](writing-style-guide.md).

Todo texto visível ao usuário em widgets e layouts **deve** vir de i18n — nunca usar strings fixas.
A tradução é resolvida server-side pelo FreeMarker antes de chegar ao navegador.

### 2. Internacionalização (i18n) — Widgets e Layouts

Escopo: Exclusivo para Widgets e Layouts. (Formulários possuem mecanismo próprio de i18n, não aplique estas regras neles).

Todo texto visível deve vir de i18n, resolvido server-side pelo FreeMarker.

- Em `.js`: Prefira `[=i18n.getTranslation('key')]`. A sintaxe `${...}` colide com template literals do ES6, e a sintaxe `[=...]` evita esse conflito, sendo resolvida de forma segura no server-side.
- Consistência: Respeite o padrão do arquivo. Se um arquivo legado já usa `${i18n...}`, mantenha. Use `[=i18n...]` para código novo ou em arquivos sem um padrão estabelecido. Não misture as duas sintaxes no mesmo arquivo.
- Acesso: Nunca acesse i18n como objeto (ex: `i18n.key`). A expressão precisa estar entre aspas quando atribuída a uma variável (ex: `const msg = "[=i18n.getTranslation('key')]";`).

### Sintaxes de tradução

O FreeMarker resolve a tradução **server-side**. A chamada `i18n.getTranslation`
é a mesma; muda apenas o delimitador da interpolação (a sintaxe `${...}` é a
documentada pela TOTVS — TDN "Internacionalização", pageId=185738869):

| Contexto | Sintaxe | Observação |
|----------|---------|------------|
| FreeMarker (`.ftl`) | `${i18n.getTranslation('key')}` | Sintaxe padrão em templates; mantenha a já usada no arquivo |
| **Arquivo `.js` (código novo)** | `[=i18n.getTranslation('key')]` | Preferida: não colide com template literals ES6 (regra 1 de [platform-constitution.md](platform-constitution.md)) |
| Arquivo `.js` legado | `${i18n.getTranslation('key')}` | Mantida se o arquivo já usa esse padrão — **não misture** as duas sintaxes no mesmo arquivo |

**Regra para arquivos `.js`:** em código novo use
`[=i18n.getTranslation('key')]`. A expressão deve estar **entre aspas** quando
atribuída a uma variável: `const t = "[=i18n.getTranslation('key')]";`.

> **Minificação com Closure Compiler.** A minificação de um `.js` pelo
> `closure-compiler-maven-plugin` (ver a documentação oficial
> ["Closure Compiler Maven Plugin"](https://tdn.totvs.com/display/public/fluig/Closure+Compiler+Maven+Plugin))
> conflita com o mecanismo de i18n quando esse arquivo usa template strings
> (backticks), gerando inconsistências. Se o `.js` **não** usa i18n, o template
> string funciona normalmente. Em um `.js` que usa i18n, prefira concatenação
> clássica (`+`) a template literals para montar textos com
> `[=i18n.getTranslation(...)]`. O cuidado é do **arquivo inteiro** que passa
> por essa minificação, não de um backtick específico — ver também
> [platform-constitution.md](platform-constitution.md).

> **Parceiro (Store):** a configuração do `closure-compiler-maven-plugin`
> está em [backend-java-maven.md](backend-java-maven.md).

```javascript
// ✅ correto em .js (código novo) — colchetes, entre aspas
const title = "[=i18n.getTranslation('save.success.title')]";

// ✅ correto por cautela — concatenação clássica (+) em vez de template
// literal, em .js que usa i18n e é minificado pelo Closure Compiler
const translatedPart = "[=i18n.getTranslation('save.success.message')]";
const fullMessage = translatedPart + ': ' + name;

// ❌ evite — template string envolvendo i18n em .js minificado pelo Closure
// Compiler (a minificação conflita com template strings que contêm i18n)
const risky = `[=i18n.getTranslation('save.success.message')]: ${name}`;
```

Regras gerais:

- **Nunca** acessar `i18n` como objeto JavaScript (`i18n.key` ou `i18n['key']`) — não funciona.
- A expressão precisa estar entre aspas quando atribuída a uma variável em `.js`:
  `const t = "[=i18n.getTranslation('key')]";`.
- Dentro de `<script>` em `.ftl`, o texto continua com a sintaxe do FreeMarker
  (`${i18n.getJSTranslation('key')}` — ver abaixo).

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

### Tradução das propriedades do `application.info`

Algumas propriedades do `application.info` aparecem em telas do próprio sistema
(por exemplo, na seleção de widgets ao editar uma página). Por isso, é
**obrigatório** que ao menos `application.title`, `application.description` e
`application.category` sejam traduzíveis.

Para traduzi-las, declare **chaves com o mesmo nome da propriedade** nos arquivos
i18n do artefato (base + locales), ao lado das demais chaves de UI:

```properties
# arquivo i18n do widget/layout (base e locales)
codigo.da.label=Valor da Label
application.title=T\u00EDtulo
application.description=Descri\u00E7\u00E3o do Componente
application.category=Categoria Escolhida
```

Assim, o valor exibido dessas propriedades é resolvido por i18n conforme o idioma
do usuário, em vez de um texto fixo no descritor.

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

A interpolação de i18n em `.js` é resolvida pelo FreeMarker **server-side**,
antes de o `.js` chegar ao navegador — exatamente como em um `.ftl`. A sintaxe
`${...}` colide com os template literals do ES6; por isso, em código novo, o
padrão do pacote é `[=i18n.getTranslation('key')]` (ver
[2. Internacionalização (i18n) — Widgets e Layouts](#2-internacionalização-i18n--widgets-e-layouts)).
Arquivos legados que já usam `${i18n...}` mantêm essa sintaxe, sem misturar as
duas no mesmo arquivo.

O ponto de atenção adicional: a minificação de um `.js` pelo
`closure-compiler-maven-plugin` (ver a documentação oficial ["Closure Compiler Maven
Plugin"](https://tdn.totvs.com/display/public/fluig/Closure+Compiler+Maven+Plugin))
conflita com o mecanismo de i18n quando
esse arquivo usa template strings, gerando inconsistências. Se o `.js` **não**
usa i18n, o template string funciona normalmente. A mitigação prática é
preferir concatenação clássica (`+`) a template literals ao montar textos com
`[=i18n.getTranslation(...)]` em um `.js` que usa i18n:

```javascript
// ✅ mitigação prudente — concatenação clássica (+) em vez de template
// literal, em .js que usa i18n e é minificado pelo Closure Compiler
const translatedPart = "[=i18n.getTranslation('save.success.message')]";
const fullMessage = translatedPart + ': ' + name;

// ❌ evite — template string envolvendo i18n em .js minificado pelo Closure
// Compiler (a minificação conflita com template strings que contêm i18n)
const risky = `[=i18n.getTranslation('save.success.message')]: ${name}`;
```

> Essa regra vale para o **arquivo `.js` inteiro** que usa i18n e passa pela
> minificação do Closure Compiler, não apenas para um backtick específico. Um
> `.js` sem i18n não é afetado e pode usar template literals livremente. Aplica-se
> sobretudo a artefatos de Parceiro empacotados via Maven/EAR.

> ⚠️ **Armadilha da interpolação em comentário/texto do `.js`.** Como o FreeMarker
> processa o **`.js` inteiro** antes de servir, ele interpreta **qualquer**
> interpolação (`${...}` ou `[=...]`) — inclusive dentro de **comentários**
> (`//` ou `/* */`), que o FreeMarker **não** ignora. Uma interpolação mal-formada
> (ex.: escrever a chamada com reticências literais como ilustração num
> comentário) causa `Syntax error in template` no deploy e faz o Fluig **cair no
> conteúdo original**, deixando **todas** as chaves i18n do arquivo **sem
> resolver** (a mensagem aparece crua na tela).
> **Regra:** use a interpolação **apenas no código**, com expressão válida
> (`"[=i18n.getTranslation('chave.real')]"`). Em comentários/explicações, **não**
> escreva a interpolação — refira a função sem delimitadores (ex.: "use
> `i18n.getTranslation('chave')`").

> **Parceiro (Store):** a configuração do `closure-compiler-maven-plugin`
> está em [backend-java-maven.md](backend-java-maven.md).

## Internacionalização (i18n) — Processos (Workflow)

> **Escopo:** mecanismo **exclusivo de processos de workflow**, independente do
> i18n de formulários e do de widgets/layouts. Traduz os textos do **diagrama**
> (atividades, fluxos, dados gerais do processo) e as mensagens de customizações
> do processo. **Não** use `${i18n.getTranslation(...)}` aqui.

> Para a terminologia correta de textos visíveis ao usuário, ver
> [writing-style-guide.md](writing-style-guide.md).

### Arquivos de literais (`literals/`)

Os textos do processo ficam em arquivos `.properties` na pasta `literals/` do
projeto, **um por idioma suportado**, nomeados com o nome do diagrama + o sufixo
de locale:

| Arquivo | Locale |
|---------|--------|
| `<nomeDiagrama>_pt_BR.properties` | Português (Brasil) |
| `<nomeDiagrama>_en_US.properties` | Inglês (EUA) |
| `<nomeDiagrama>_es.properties` | Espanhol |

Se algum arquivo de locale não for exportado, a plataforma assume as propriedades
definidas no próprio diagrama para os usuários daquele idioma.

### Convenção de chaves

As informações gerais do processo e de sua versão usam chaves fixas; as
atividades e fluxos usam o **código do elemento** (obtido nas propriedades do
elemento no diagrama) como prefixo:

| Chave | Traduz |
|-------|--------|
| `process.category` | Categoria do processo |
| `process.description` | Descrição do processo |
| `process.instructions` | Instruções do processo |
| `process.version.instructions` | Instruções da versão do processo |
| `<codAtividade>.name` | Nome da atividade |
| `<codAtividade>.instructions` | Instruções da atividade |
| `<codFluxo>.name` / `<codFluxo>.flow` / `<codFluxo>.return` | Nome, "Ativ. Fluxo" e "Ativ. Retorno" de um fluxo |

```properties
# <nomeDiagrama>_pt_BR.properties
process.category=Recursos Humanos
process.description=Solicita\u00E7\u00E3o de f\u00E9rias
6.name=Aprova\u00E7\u00E3o financeira
6.instructions=Neste ponto do processo ocorre a aprova\u00E7\u00E3o financeira
```

### Quebra de linha em literais longas (`\n`)

Literais longas podem ultrapassar o espaço do objeto que as exibe no diagrama.
Use `\n` na literal para forçar a quebra de linha:

```properties
# antes (estoura o espaço do objeto)
7.name=Solicita\u00E7\u00E3o workflow inicia nesta tarefa

# depois (com quebra de linha)
7.name=Solicita\u00E7\u00E3o workflow \n inicia nesta tarefa
```

### Mensagens customizadas em eventos do processo

Para traduzir mensagens de erro/validação lançadas em customizações do processo,
adicione a chave aos arquivos de `literals/` e use `i18n.translate("chave")` (a
mesma função dos formulários — **não** `getTranslation`):

```javascript
// literals/<nomeDiagrama>_pt_BR.properties → validation_user=Informe o usuário
// literals/<nomeDiagrama>_en_US.properties → validation_user=Enter a user
// literals/<nomeDiagrama>_es.properties    → validation_user=Informe un usuario

throw i18n.translate("validation_user");
```

> A codificação dos arquivos de `literals/` segue o padrão Java Properties em
> UTF-8, com caracteres não-ASCII em `\uXXXX` (mesma regra dos demais
> `.properties` — ver a seção de codificação acima).

## Segurança (APIs públicas)

Tratar toda entrada do usuário como não confiável e sanitizar antes de uso no DOM.

| Objetivo | API pública |
|----------|-------------|
| Sanitizar string/campo de formulário contra XSS (API oficial) | `WCMAPI.validateXSS(data, replace)` |
| Manter HTML válido removendo código malicioso | `DOMPurify.sanitize(value)` |
| Bloquear qualquer HTML (retorna texto puro) | `DOMPurify.sanitize(value, { USE_PROFILES: { html: false } })` |

**`WCMAPI.validateXSS(data, replace)` — API oficial de sanitização XSS.** Sanitiza
um valor de string ou um campo de formulário contra ataques XSS (internamente usa
o utilitário `FLUIGC.utilities.preventXSS`). Suporta dois modos:

- **String:** recebe e retorna uma string sanitizada.
- **Elemento de formulário:** recebe um elemento DOM ou jQuery com `.value`,
  atualiza o valor **no lugar** e retorna o objeto jQuery.

O parâmetro `replace`, quando `true`, também remove as entidades `>` e `<` do
resultado sanitizado.

```javascript
// Modo string — sanitizar dados antes de exibir
const textoSeguro = WCMAPI.validateXSS(comentarioDoUsuario, false);
$('#area-comentario').text(textoSeguro);

// Modo input — sanitizar o campo diretamente ao perder o foco
$('#campo-titulo').on('blur', (event) => {
    // Em arrow function o `this` não é o elemento: use event.currentTarget
    WCMAPI.validateXSS(event.currentTarget, false);
});
```

Quando o objetivo é **manter HTML válido** (em vez de converter tudo em texto),
use `DOMPurify.sanitize(value)`; para **bloquear qualquer HTML**, use o perfil
`DOMPurify.sanitize(value, { USE_PROFILES: { html: false } })`.

> **Sobre `FLUIGC.utilities.preventXSS`:** **não é depreciado** — é o utilitário
> que o próprio `WCMAPI.validateXSS` usa por baixo. Em código de widget/layout,
> prefira a API de alto nível `WCMAPI.validateXSS` (ou `DOMPurify.sanitize` quando
> precisar preservar HTML); `preventXSS` permanece válido e documentado no Style
> Guide, mas `validateXSS` é a entrada recomendada.

Boas práticas:

- Preferir `textContent` a `innerHTML`; quando precisar de HTML, sanitizar com `DOMPurify` antes.
- Em FreeMarker, escapar dados dinâmicos: `${value?html}` (escape HTML) e `${value?js_string}` (escape para JS inline).
- Não usar `eval()` nem `new Function()` com dados dinâmicos.
- Sanitizar tanto ao enviar (POST/PUT) quanto ao receber (GET) dados do usuário.

> **`DOMPurify` é recurso oficial embarcado — não contradiz "preferir o nativo".**
> A plataforma **carrega o `DOMPurify` no cliente** e a TOTVS o documenta como a via
> recomendada de sanitização XSS no frontend — sanitizar com `DOMPurify.sanitize(...)`
> **antes de enviar** (POST) e **antes de exibir** (GET) dado não confiável (TDN
> "Dicas e truques para criar portais no TOTVS Fluig"). Portanto o princípio de
> preferir o embarcado/nativo **não** é motivo para evitar o `DOMPurify`: ele **é** o
> embarcado para esse fim. (No server-side/Rhino o `DOMPurify` não existe — ali a
> defesa é escape no servidor; ver `conventions-form.md`.)

### Regras de negócio e controle de acesso no client-side

- **Nunca** delegar ao client-side (JavaScript do frontend) regras de negócio
  críticas, controle de acesso/autorização ou ofuscação de dados sensíveis.
- O JavaScript e o HTML entregues ao navegador são **totalmente inspecionáveis e
  contornáveis** pelo usuário — qualquer validação só no frontend é uma barreira de
  UX, nunca de segurança.
- **Anti-pattern:** ocultar/validar dado sensível com `base64` (`btoa`/`atob`) em
  campo `hidden`, esconder ação por `display:none`, ou liberar recurso apenas por
  checagem em JS. Tudo isso é facilmente burlado.
  > Para o vetor específico de token/senha de integração em campo `hidden` do
  > formulário de um processo, ver
  > [processo-bpm.md — Segurança: Nunca Credencial em Campo Hidden do Formulário](processo-bpm.md#segurança-nunca-credencial-em-campo-hidden-do-formulário).
- Toda decisão de segurança (autenticação, autorização por papel/permissão,
  validação de dados) DEVE ser feita e **reforçada no backend** (serviço/endpoint
  autenticado). O frontend apenas reflete o resultado.

> **Parceiro (Store):** ver também as falhas de segurança de acesso em
> [§ 19](partner-store-review-rules.md#19-falhas-de-segurança-de-acesso).

### Classificação de segurança frontend (review)

Severidades aplicadas a padrões de segurança frontend durante a revisão. A
classificação de XSS decide pela **origem rastreada** da variável injetada no DOM,
não pelo método sintático isolado. Toda anotação de XSS deve indicar **arquivo,
linha, variável e origem**.

> **Parceiro (Store):** a tabela de origem XSS e a análise contextual completa
> estão em [§ 12](partner-store-review-rules.md#12-classificação-de-origem-xss) e [§ 22](partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo).

| Padrão frontend | Regra | Severidade |
|-----------------|-------|------------|
| XSS com origem de API/dataset/input/URL | `.html(var)` / `.append(var)` / `innerHTML = var` cuja variável vem de resposta de API, dataset, input de usuário ou parâmetro de URL | Crítica |
| XSS de origem **ambígua** | Origem não rastreável com certeza | Média — "VERIFICAR MANUALMENTE" com o trecho exato |
| Execução dinâmica de código | `eval()`, `new Function(string)`, `setTimeout`/`setInterval` **com string** (em vez de referência de função) | Crítica |
| Vetores de XSS por composição/decodificação | Concatenação de HTML com dado externo injetado no DOM; `atob()` (base64) seguido de escrita no DOM; `location.search`/`location.hash` seguido de escrita no DOM | Crítica |
| Ferramentas de debug embarcadas | Presença de `eruda` / `vConsole` | Crítica |
| Chamada direta a rota interna não documentada do Fluig | `fetch` / `$.ajax` **direto** para `/ecm/`, `/portal/` ou `/social/` (deve passar pelas APIs públicas — ver "Chamadas REST e Integrações") | Alta |

> **Não é XSS (não reportar):** literal fixo, `.html('')` (string vazia),
> `i18n.getTranslation()`, `.text(var)`. A recomendação segura é sanitizar com
> `WCMAPI.validateXSS()` / `DOMPurify.sanitize()`, evitar execução dinâmica de
> código e consumir dados via APIs públicas.

> **Parceiro (Store):** o catálogo completo de exceções anti-falso-positivo está
> em [§ 11](partner-store-review-rules.md#11-exceções-anti-falso-positivo--widgets); para credenciais/
> tokens expostos e armazenamento de token client-side, ver
> [§ 2](partner-store-review-rules.md#2-credenciais-e-tokens-expostos).

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

## Chamadas REST e Integrações

### Três casos de integração HTTP

Não existe uma única régua "interno vs externo": a decisão depende de **quem**
recebe a chamada e se ela **exige credencial**. Resumo (regra base em
[platform-constitution.md](platform-constitution.md#2-integrações-http)) — três
casos:

#### Caso 1 — Domínio do próprio Fluig

`fetch()` client-side com a URL via `WCMAPI.getServerURL()` — a sessão do
usuário logado autentica automaticamente, sem enviar nenhuma credencial do
cliente. O consumo de dataset via API pública usa a URL canônica
`${WCMAPI.getServerURL()}/dataset/api/v2/dataset-handle/search` (ver "Consumo
de Datasets no Front-End").

```javascript
// ✅ Caso 1 — domínio do próprio Fluig: fetch + async/await + try/catch
const fetchData = async () => {
  try {
    const response = await fetch(`${WCMAPI.getServerURL()}/api/rest/endpoint`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    FLUIGC.toast({ message: "[=i18n.getTranslation('error.load')]", type: 'danger' });
  }
};
```

> **Identidade do usuário logado no cliente (`WCMAPI`) — código × nome.** Ao
> filtrar/consultar por "o usuário atual" (ex.: `requesterId` de `workflowProcess`,
> dono de um registro, etc.), use o **código**, não o nome de exibição:
>
> | Método | Retorna | Use para |
> |--------|---------|----------|
> | `WCMAPI.getUserCode()` | **código** do usuário (equivalente ao login na maioria dos casos — ex.: `jsilva`) | **filtros/constraints** por usuário, `requesterId`, dono de registro |
> | `WCMAPI.getUserLogin()` | login | autenticação/identificação por login |
> | `WCMAPI.getUserId()` | id numérico | chaves numéricas |
> | `WCMAPI.getUser()` / `getUserFirstName()` / `getUserLastName()` | **nome de exibição** ("João Silva") | **apenas texto visível** (saudação, etc.) — **nunca** em filtro |
>
> ⚠️ Usar `WCMAPI.getUser()` (nome) num filtro que espera código (ex.:
> `constraintInitialValue` de `requesterId`) faz a consulta **não retornar nada** —
> o campo guarda o código, não o nome.

#### Caso 2 — Terceiro sem autenticação (ex.: ViaCEP)

Quando o terceiro **não exige credencial**, `fetch()` client-side direto é
seguro — não há segredo para expor no navegador.

```javascript
// ✅ Caso 2 — terceiro sem autenticação: fetch client-side direto
const consultarCep = async (cep) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Falha ao consultar CEP:', error);
  }
};
```

#### Caso 3 — Terceiro que exige credencial (NUNCA client-side)

Quando o terceiro exige credencial (usuário/senha, Basic Auth, bearer token,
API key, OAuth secret), a chamada **nunca** pode ser feita no cliente — a
credencial ficaria exposta no navegador. O caminho obrigatório é o **Cadastro
de Serviços** (`fluigAPI.getAuthorizeClientService()` + `invoke(...)`), chamado
sempre de código **server-side**:

- **Fluxo de leitura:** dentro de um **dataset** — sintaxe completa já
  documentada em "Consumo de serviço externo (REST)" em
  [architecture.md](architecture.md) e em "Sem APIs de navegador; HTTP externo
  via Cadastro de Serviços" em [technologies.md](technologies.md) (não
  duplicada aqui).
- **Fluxo de escrita amarrado a um processo:** dentro de uma **Atividade de
  Serviço (servicetask)** do processo BPM, usando o mesmo Cadastro de Serviços
  e lendo/gravando campos do formulário do processo via
  `hAPI.getCardValue()`/`hAPI.setCardValue()`; falhas devem lançar o evento de
  erro do BPMN. Esse é o padrão usual dos tutoriais oficiais de integração
  Fluig↔Protheus e Fluig↔TOTVS RM.

Em nenhum dos dois fluxos a credencial do terceiro aparece no código do
cliente — ela fica só no serviço cadastrado na plataforma.

> O detalhe dos objetos facilitadores (`hAPI`, `form`, `customHTML`), o
> padrão de idempotência (GET antes do POST) e a regra de sempre relançar o
> erro no `catch` da Atividade de Serviço são fonte de verdade de
> [processo-bpm.md](processo-bpm.md). Não duplicados aqui.

### Requisições em paralelo (`Promise.all`)

Quando várias requisições são **independentes entre si**, dispare-as em paralelo
com `Promise.all` em vez de aguardar uma de cada vez. Isso reduz o tempo total de
carregamento da interface.

```javascript
// ✅ chamadas simultâneas em paralelo — resolvem juntas
const [users, branches] = await Promise.all([
  fetch(`${WCMAPI.getServerURL()}/api/rest/users`).then((r) => r.json()),
  fetch(`${WCMAPI.getServerURL()}/api/rest/branches`).then((r) => r.json())
]);
```

> Use requisições sequenciais (uma após a outra) **apenas** quando uma chamada
> depender do resultado da anterior.

### Integrações assíncronas e tratamento de erros

- **Toda integração** (APIs REST e Datasets) deve ser **assíncrona**. Nunca use
  `async: false` — chamadas síncronas bloqueiam a thread principal, travam a
  interface e causam timeouts.
- **Sempre trate erros:** `try/catch` com `async/await`, ou `.catch()` em
  cadeias de `Promise`. Não deixe uma falha de rede sem tratamento.
- **Dê feedback ao usuário** em caso de erro (ex.: `FLUIGC.toast`,
  `FLUIGC.message`) em vez de falhar silenciosamente. Registre o detalhe técnico
  no `console.error` para diagnóstico.

```javascript
// ✅ integração assíncrona com feedback ao usuário
const loadDashboard = async () => {
  try {
    const data = await fetchData();
    render(data);
  } catch (error) {
    console.error('Falha ao carregar o dashboard:', error);
    FLUIGC.toast({ message: "[=i18n.getTranslation('dashboard.load.error')]", type: 'danger' });
  }
};
```

### Classificação de APIs frontend (review)

Classificação aplicada durante a revisão para garantir que o widget consome
**apenas APIs públicas** — rotas internas não documentadas do Fluig estão
sujeitas a mudança sem aviso. A decisão é pela **URL/API real** consumida, não
pelo padrão sintático isolado.

> **Parceiro (Store):** a análise contextual completa (heurísticas
> anti-falso-positivo) está em
> [§ 22](partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo).

| API / recurso consumido | Classificação |
|-------------------------|---------------|
| `WCMAPI.*` | ✅ pública suportada — não reportar |
| `FLUIGC.*` | ✅ pública suportada — não reportar |
| `WCMSpaceAPI.*` | ⚠️ uso com atenção — sinalizar para verificação |
| `WCMC.*` | ⚠️ uso com atenção — sinalizar para verificação |
| Acesso direto a `/ecm/api/rest/`, `/portal/api/rest/`, `/social/api/rest/` | Alta — consumir via API pública |
| Recursos internos `/webdesk/assets/`, `/portal/resources/` | Média — **exceto** os caminhos **prescritos** da plataforma, que **não** são achado: a folha global `/portal/resources/css/wcm_responsive_layout.css` do layout (ver `architecture.md`, "CSS de layout no descritor") e o carregamento de `/portal/resources/js/{jquery,mustache}/…` no HTML de formulário (ver `conventions-form.md`) |

> Uma URL montada a partir de `WCMAPI.getServerURL()` **não** é acesso direto a
> uma rota interna não documentada — não reportar. Só apontar consumo de
> dataset fora do contrato quando a URL divergir de
> `/dataset/api/v2/dataset-handle/search`.

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

## Consumo de Datasets no Front-End (regra de performance)

Quando o widget precisa consultar dados de um dataset no lado cliente, existem duas opções:

| Abordagem | Quando usar |
|-----------|-------------|
| **API REST** (`/dataset/api/v2/dataset-handle/search`) | **SEMPRE como primeira opção** — async nativo (`fetch`/`async`/`await`), paginação via query params, sem importação de bibliotecas extras |
| `DatasetFactory.getDataset` (via `vcXMLRPC.js`) | **Apenas quando necessário** (ex.: constraints complexas, campos calculados pelo motor server-side) — requer importar `vcXMLRPC.js` na view |

### Regra obrigatória: nunca chamada síncrona no front

**PROIBIDO no client-side (navegador)** usar `DatasetFactory.getDataset` sem callback (modo síncrono) em código novo — bloqueia a thread principal, trava a interface e causa timeouts em datasets lentos.

> ⚠️ Esta regra vale **apenas para o JavaScript do cliente** (via `vcXMLRPC.js`). No **Rhino (server-side: datasets, eventos, customizações)** o `DatasetFactory.getDataset(...)` é chamado **sem callback** e retorna direto — isso é o correto naquele contexto e **não** é alvo desta proibição.

Se precisar usar `DatasetFactory.getDataset` **no cliente**, **sempre** encapsular em `new Promise` para tornar assíncrono (método assíncrono com `await` + método `*Promise()` que mapeia `success: resolve` / `error: reject`):

```javascript
// ✅ correto: DatasetFactory encapsulado em Promise (async/await)
// (métodos dentro de SuperWidget.extend({}), na sintaxe `nome: function() {}`)
obterColleague: async function() {
    const colleague = await this.obterColleaguePromise();
    console.log(colleague);
},

obterColleaguePromise: function() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset('colleague', ['colleagueName'], null, null, {
            success: resolve,
            error: reject
        });
    });
}
```

```javascript
// ❌ PROIBIDO: chamada síncrona (sem callback) — trava a interface
const result = DatasetFactory.getDataset('colleague', ['colleagueName'], null, null);
```

### Preferir API REST para datasets

A API REST de dataset oferece vantagens significativas de performance e DX:

```javascript
// ✅ recomendado: API REST com fetch (async nativo, paginação, sem import extra)
// (método dentro de SuperWidget.extend({}); o chamador trata o erro com try/catch)
_loadCategories: async function() {
    const url = WCMAPI.getServerURL()
        + '/dataset/api/v2/dataset-handle/search'
        + '?datasetId=categorias'
        + '&field=nome&field=descricao'
        + '&limit=50&offset=0';

    const response = await fetch(url, {
        headers: { 'Accept': 'application/json; charset=UTF-8' }
    });

    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    return data.values || [];
},
```

#### Parâmetros completos da API REST de Dataset (`/dataset/api/v2/dataset-handle/search`)

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `datasetId` | sim | Nome/código do dataset. |
| `field` | não (recomendado) | Coluna a retornar; repetir o parâmetro para cada coluna. |
| `offset` | não | Deslocamento para paginação. |
| `limit` | não (recomendado) | Tamanho da página; **padrão 300** quando omitido, `0` retorna tudo — **sempre informar** para evitar busca lenta e não paginada. |
| `orderby` | não | Campo de ordenação; acrescentar `_ASC` ou `_DESC` ao nome do campo. |
| `constraintsField` | não | Campo do filtro (repetir junto com os demais `constraints*` na **mesma ordem**, um conjunto por filtro). |
| `constraintsInitialValue` / `constraintsFinalValue` | não | Valores do filtro (iguais para igualdade simples; distintos para faixa/BETWEEN). |
| `constraintsType` | não | `MUST` \| `MUST_NOT` \| `SHOULD`. |
| `constraintsLikeSearch` | não | Habilita busca parcial (LIKE) para o filtro correspondente. |

Respostas: `200` (sucesso, corpo com `columns`/`values`), `400` (parâmetros
inválidos), `401` (sem sessão/autenticação), `500` (erro no servidor).

> **Múltiplos filtros = parâmetros repetidos em paralelo, na mesma ordem.** Cada
> filtro é um conjunto `constraintsField` + `constraintsInitialValue` +
> `constraintsFinalValue` + `constraintsType` + `constraintsLikeSearch`; para N
> filtros, repita cada parâmetro N vezes, mantendo a **mesma ordem** entre eles.
> Para `LIKE`, use `constraintsLikeSearch=true` e `%` no valor. Exemplos
> (apenas as colunas usadas, com `limit` e ordenação):

```text
# só as colunas necessárias (performance)
GET {serverURL}/dataset/api/v2/dataset-handle/search?datasetId=colleague&field=active&field=colleagueName&field=login&limit=100

# filtro de igualdade (active = true) + ordenação
GET {serverURL}/dataset/api/v2/dataset-handle/search?datasetId=colleague&field=active&field=colleagueName&field=login&orderby=colleagueName_ASC&constraintsField=active&constraintsInitialValue=true&constraintsFinalValue=true&constraintsType=MUST&limit=100

# dois filtros em paralelo: active=true (exato) + login LIKE 'Lu%'
GET {serverURL}/dataset/api/v2/dataset-handle/search?datasetId=colleague&field=active&field=colleagueName&field=login&constraintsField=active&constraintsField=login&constraintsInitialValue=true&constraintsInitialValue=Lu%25&constraintsFinalValue=true&constraintsFinalValue=Lu%25&constraintsType=MUST&constraintsType=MUST&constraintsLikeSearch=false&constraintsLikeSearch=true&limit=100
```

> ⚠️ **O filtro só funciona se o dataset consultado o implementar.** Enviar
> `field`/`constraints*`/`orderby` (REST) ou `fields`/`constraints`/`sortFields`
> (`DatasetFactory`) **não** garante filtragem: quem aplica é a origem. Os
> **datasets internos/nativos** da plataforma (ex.: `colleague`,
> `catalogItemDataset`) aplicam tudo **nativamente**; já um **dataset avançado**
> (codificado à mão, dados externos/valores fixos) **só filtra se o próprio código
> do dataset tratar esses parâmetros** — se os ignora, a consulta volta tudo igual.
> Ao consumir um dataset avançado de terceiro, confirme que ele trata
> filtro/ordenação. Fonte: [architecture.md](architecture.md) (seção *Dataset*),
> TDN *Datasets internos* e *Construção do Dataset Avançado*.

**Vantagens da API REST sobre `DatasetFactory`:**
- `async`/`await`/`fetch` nativos — sem biblioteca extra, sem import no `.ftl`;
- Paginação via `limit`/`offset` (consulta parcial, sem carregar tudo em memória);
- Controle de timeout e abort via `AbortController`;
- Tratamento de erro padronizado (status HTTP);
- Funciona em qualquer contexto (widget, Web Component, wizard);

**Quando usar `DatasetFactory` (raro):**
- Necessidade do processamento server-side do motor de datasets (campos calculados, joins internos) que não seja alcançável pelos parâmetros da API REST;
- Código legado que já usa o padrão — manter consistência sem refatorar;

> **Nota:** filtros/constraints (incluindo igualdade, faixa de valores e busca
> parcial `LIKE` com `%`) **são suportados pela API REST v2** via
> `constraintsField`/`constraintsInitialValue`/`constraintsFinalValue`/
> `constraintsType`/`constraintsLikeSearch` — portanto "constraints" por si só
> **não** justifica cair para o `DatasetFactory`.

### Boas práticas de performance frontend

- **Sem manipulação massiva de DOM em laços.** Evitar inserir/alterar o DOM nó a
  nó dentro de `for`/`while`. Montar a estrutura **em memória** (string HTML única
  ou `DocumentFragment`) e injetar no DOM **de uma só vez** — reduz reflow/repaint.
- **Proibido loop bloqueante (busy-wait).** Nunca usar `while`/`for` vazios ou
  pesados aguardando um estado (ex.: esperar um valor mudar em laço). Isso congela
  a thread principal do navegador e trava a UI. Usar callbacks, eventos, `Promise`
  ou `setTimeout`/`requestAnimationFrame` para aguardar de forma assíncrona.
- Cachear seletores consultados repetidamente (variável ou `this.DOM`) em vez de
  reconsultar o DOM.

### Classificação de performance frontend (review)

Severidades aplicadas a padrões de performance frontend durante a revisão. A
decisão é sempre por **contexto real** (ler ±20 linhas ao redor da ocorrência),
não por padrão sintático isolado.

> **Parceiro (Store):** a análise contextual completa está em
> [§ 22](partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo); a volumetria de
> chamadas síncronas (`async:false` e `DatasetFactory` síncrono) está em
> [§ 23](partner-store-review-rules.md#23-contagem-e-classificação-de-chamadas-síncronas-volumetria).

| Padrão frontend | Regra | Severidade |
|-----------------|-------|------------|
| `DatasetFactory.getDataset()` client-side síncrono | Proibido em código novo (bloqueia a thread) — ver "Regra obrigatória: nunca chamada síncrona no front" | Crítica |
| Dataset de **alto volume** sem constraints | Consulta a `colleague`, `document` ou `group` **sem** constraints | Alta |
| Manipulação de DOM repetitiva em **loop** sem fragment | Inserções nó a nó no DOM a cada iteração, sem `DocumentFragment` (montar em memória e injetar de uma só vez) | Média |
| Loop **bloqueante** (busy-wait) | `while`/`for` vazio ou pesado aguardando estado — congela a thread principal | Alta |
| **Mesmo seletor** consultado **mais de 3×** sem cache | Reconsulta do mesmo seletor sem armazenar o resultado em variável/`this.DOM` | Média |
| `console.log` / `console.debug` / `console.info` / `console.warn` | Log de desenvolvimento deixado em produção | Baixo |

> **Exceção:** `console.error` **dentro de bloco `catch`** é log de erro legítimo
> e **não** deve ser reportado.

> **Parceiro (Store):** a correção segura de `async:false` e datasets sem
> constraints segue [§ 11](partner-store-review-rules.md#11-exceções-anti-falso-positivo--widgets),
> [§ 14](partner-store-review-rules.md#14-recomendações-de-correção-seguras) e [§ 23](partner-store-review-rules.md#23-contagem-e-classificação-de-chamadas-síncronas-volumetria).

## Recursos locais (sem CDN)

Recomenda-se **embarcar localmente** no artefato todos os recursos estáticos
(fontes tipográficas, bibliotecas JavaScript, ícones SVG, imagens) em vez de
carregá-los de uma CDN externa:

```
resources/
├── fonts/
├── js/
├── images/
└── icons/
```

| Recomendação | Motivo |
|--------------|--------|
| Evitar `<script src="https://...">` | Falha em ambientes sem acesso à internet |
| Evitar `<link href="https://...">` | Latência adicional e ponto de falha externo |
| Evitar `@import url('https://...')` | Risco de CORS e dependência de terceiros |
| Preferir embarcar localmente | Autonomia do artefato e inspeção do código carregado |

> **Exceção:** URLs externas que são **APIs de serviço** (não recursos estáticos)
> seguem a recomendação de [URLs externas com SSL/TLS](#urls-externas-com-ssltls).

> **Parceiro (Store):** para publicação na Store, carregar recursos de **CDN
> externa é reprovado** (violação Crítica no App Review) — a regra deixa de ser
> recomendação e passa a ser proibição. Fonte de verdade em
> [§ 5](partner-store-review-rules.md#5-cdn-externo).

## Codificação UTF-8 (arquivos e APIs)

Todo código gerado ou evoluído DEVE manter codificação **UTF-8** de ponta a ponta.

| Camada | Regra |
|--------|-------|
| Arquivos-fonte (JS/FTL/CSS/XML/`.properties`) | Salvar em UTF-8 — nunca ISO-8859-1/Windows-1252 |
| Respostas REST | Content-Type com charset UTF-8 — nunca `application/json` sem charset |
| Locale `.properties` | Caracteres não-ASCII em `\uXXXX` (padrão Java Properties) |
| Chamadas a serviços externos | Definir charset UTF-8 em request/response |

> **Anti-pattern:** gerar `.properties` ou FTL em codificação diferente de UTF-8 —
> acentos corrompem na plataforma.

## Sem valores fixos de ambiente

Nenhum valor dependente do ambiente do cliente pode ser codificado literalmente.

| Valor | Origem correta no frontend |
|-------|----------------------------|
| Empresa / tenant | contexto da sessão via `WCMAPI` |
| Usuário logado | contexto da sessão |
| URL base do servidor | `WCMAPI.getServerURL()` |
| Pasta de publicação | parâmetro de configuração |

> **Regra de geração:** ao gerar código que precise desses valores, sempre emitir
> a resolução dinâmica — nunca um literal fixo.

## Parametrização de configurações

Ao gerar/evoluir código, valores operacionais (pastas, periodicidade, endpoints,
limiares) DEVEM vir de uma fonte de configuração alterável (formulário de config,
Cadastro de Serviços, wizard) — nunca fixos no código.

> **Anti-pattern:** cravar um intervalo de execução, uma URL de integração ou um
> limite diretamente no código impede o ajuste por ambiente/cliente sem nova
> publicação.

## URLs externas com SSL/TLS

Toda URL externa consumida pelo artefato DEVE usar `https://`.

| Regra | Detalhe |
|-------|---------|
| Protocolo | Sempre `https://` — `http://` para serviço externo é inseguro |
| Recursos estáticos | Continuam embarcados localmente (ver [Recursos locais (sem CDN)](#recursos-locais-sem-cdn)) — só APIs de serviço são consumidas por URL externa |

> **Anti-pattern:** gerar chamada `fetch('http://api.externa/...')` — inseguro.
> Sempre `https://`.

## Saída do review por persona

Toda skill de review — inclusive as skills base `fluig-*` (code review, security,
performance, accessibility, best practices) — **grava o relatório num arquivo
Markdown na raiz do alvo** (a única escrita permitida). O que muda conforme a
persona é **o conteúdo e o nome do arquivo**, não a existência dele:

> **Consultor:** grava `review-<artefato>-<AAAA-MM-DD>.md` — uma **análise de boas
> práticas** para a customização do cliente, **sem** cabeçalho de pré-review e
> **sem** qualquer menção à Store ou ao App Review (o Consultor não publica na
> Store).

> **Parceiro (Store):** grava `pre-review-<artefato>-<AAAA-MM-DD>.md` — um
> **pré-review preparatório**: passar nele **não** significa aprovação e **não**
> substitui o App Review oficial. O relatório abre por um **cabeçalho de
> pré-review**. As regras de **forma** (cabeçalho e persistência) são fonte única
> de verdade em [§ 32.9](partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação) e [§ 32.10](partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md).

> **Comum às duas personas:** a revisão é **somente leitura** — o próprio `.md` de
> relatório é a **única escrita permitida**; nenhum outro arquivo do projeto é
> criado, alterado ou removido.

## Referências Cruzadas

- Para "como fazer" (gerar, modernizar e revisar código), ver as skills em `skills/`.
- Para componentes, helpers, grid e variáveis CSS de dark mode do Style Guide: [style-guide.md](style-guide.md) (fonte única de verdade dessas regras).
- Para versões de tecnologias públicas de customização (ES6+, libs client-side, runtime de datasets): [technologies.md](technologies.md).
