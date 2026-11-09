# Fluig Style Guide

> Fonte única de verdade do pacote para **componentes, helpers, grid, ícones e
> utilitários** do Fluig Style Guide, e para as **regras de cores/variáveis CSS
> (dark mode)**. As skills referenciam este arquivo em vez de duplicar seu
> conteúdo. Para convenções de código, i18n e segurança, veja
> [conventions.md](conventions.md). Para versões de tecnologias públicas, veja
> [technologies.md](technologies.md).

## Visão Geral

O **Fluig Style Guide** é o design system oficial da plataforma Fluig
(pacote `@fluig/lib-styleguide` v2.0.0), construído sobre **Bootstrap 3.4.1**.
Ele fornece componentes visuais, uma API JavaScript pública (`FLUIGC`), sistema
de grid responsivo, conjuntos de ícones, classes utilitárias e tokens de tema
(variáveis CSS) que dão suporte a **temas e dark mode** automaticamente.

Para que os estilos e componentes do Style Guide se apliquem no escopo de um
widget, o elemento raiz deve conter a classe `fluig-style-guide` — essa regra de
widget é detalhada em [conventions.md](conventions.md) (não repetir aqui).

> O catálogo navegável e oficial de componentes vive em https://style.fluig.com/
> (`components.html`) — use-o para consultar a lista completa de componentes,
> variantes e exemplos de markup além do que está resumido neste arquivo.

### Isolamento de CSS do widget (obrigatório)

- Todo o markup HTML de um widget DEVE estar **envelopado** por uma `div` raiz com
  a classe `fluig-style-guide`. Sem ela, o CSS de tema não é aplicado e o widget
  fica fora do isolamento de escopo.
- A classe `fluig-style-guide` na raiz é o que garante que as variáveis de tema,
  os componentes e os helpers `fs-*` só afetem o conteúdo interno do widget — e não
  vazem para o restante da página (nem sofram interferência dela).

```html
<!-- ✅ raiz envelopada por fluig-style-guide (isola o CSS de tema do widget) -->
<div id="myWidget_${instanceId}" class="fluig-style-guide super-widget wcm-widget-class my-widget">
  <!-- conteúdo do widget -->
</div>
```

> O conjunto completo das 3 classes obrigatórias da raiz (`fluig-style-guide`,
> `super-widget`, `wcm-widget-class`) e o uso de `instanceId` são fonte de verdade
> de [conventions.md](conventions.md) § Convenções de Widget — não duplicar aqui.

Este documento descreve **o que é** cada recurso e seus padrões de uso. O passo a
passo de execução é responsabilidade das skills em `skills/`.

## API JavaScript pública (`FLUIGC`)

O Style Guide expõe componentes programaticamente pelo objeto global `FLUIGC`.
Cada helper recebe, em geral, um seletor/elemento alvo e um objeto de
configuração, e muitos aceitam um callback. Helpers públicos documentados no
Style Guide da plataforma (confirmados na documentação oficial — TDN
*style-guide*/`style-guide-miscellaneous`):

| Helper | Propósito |
|--------|-----------|
| `FLUIGC.toast(settings)` | Exibe notificações temporárias (toasts) |
| `FLUIGC.modal(settings, cb)` | Cria e controla modais |
| `FLUIGC.message.confirm(settings, cb)` · `FLUIGC.message.alert(settings, cb)` · `FLUIGC.message.error(settings, cb)` | Diálogos de confirmação/alerta/erro (encapsulam `FLUIGC.modal`). São **apenas estes três** métodos de `FLUIGC.message` (fonte: style.fluig.com/javascript.html). ⚠️ **Não existe `FLUIGC.message.prompt`** — para capturar texto digitado, use `FLUIGC.modal` com um `<input>` no corpo. |
| `FLUIGC.messagePage(settings, cb)` | Página de mensagem (feedback em tela cheia) |
| `FLUIGC.loading(target, settings)` | Indicador de carregamento sobre um alvo |
| `FLUIGC.calendar(target, settings)` | Componente de calendário/seleção de data |
| `FLUIGC.filter(target, settings)` | Campo de filtro com autocomplete/datatable |
| `FLUIGC.autocomplete(target, settings, cb)` | Campo com autocompletar |
| `FLUIGC.switcher` | Interruptores (toggle/switch) |
| `FLUIGC.datatable(target, settings, cb)` | Tabela de dados |
| `FLUIGC.treeview(target, settings)` | Árvore hierárquica |
| `FLUIGC.popover(selector, settings)` | Popovers |
| `FLUIGC.slider` | Controle deslizante (slider) |
| `FLUIGC.colorpicker(target, settings)` | Seletor de cores |
| `FLUIGC.cropper(target, settings)` | Recorte de imagens |
| `FLUIGC.carousel(target, settings)` | Carrossel |
| `FLUIGC.chart(target, settings)` | Gráficos |
| `FLUIGC.tagscloud(target, data, settings)` | Nuvem de tags |
| `FLUIGC.stars(target, options)` | Avaliação por estrelas |
| `FLUIGC.player(target, urlVideo, settings)` | Player de vídeo |
| `FLUIGC.wizardModal(settings, cb)` | Modal em etapas (wizard) |
| `FLUIGC.sidebar(settings)` | Barra lateral |
| `FLUIGC.password(target, settings)` | Campo de senha com regras de força |
| `FLUIGC.copy(target, settings, cb)` | Copiar conteúdo para a área de transferência |
| `FLUIGC.addToCalendar(target, settings, cb)` | Adicionar evento a calendários |
| `FLUIGC.notification(settings)` | Notificações de desktop |
| `FLUIGC.orgChart(target, settings)` | Organograma |
| `FLUIGC.icons()` | Acesso programático aos conjuntos de ícones |
| `FLUIGC.richeditor(target, settings, isTextarea)` | Editor de texto rico |
| `FLUIGC.codeeditor(target, settings)` | Editor de código |
| `FLUIGC.utilities` | Utilitários diversos (ex.: `randomUUID`, `parseBoolean`, `ctrlIsPressed`) |
| `FLUIGC.localStorage` / `FLUIGC.sessionStorage` | Acesso encapsulado ao Web Storage |
| `FLUIGC.periodicalExecutor(cb, frequency)` | Execução periódica de uma função |

## Diálogos de mensagem (`FLUIGC.message`)

`FLUIGC.message` expõe **exatamente três** métodos (todos estendem `FLUIGC.modal`
e recebem um objeto de settings + callback). Fonte oficial:
[style.fluig.com/javascript.html](https://style.fluig.com/javascript.html).

| Método | Uso |
|--------|-----|
| `FLUIGC.message.confirm(settings, cb)` | Confirmação (sim/não). `settings`: `{ message, title, labelYes, labelNo }`; `cb(result, el, ev)` — `result` é a escolha do usuário. |
| `FLUIGC.message.alert(settings, cb)` | Alerta informativo. |
| `FLUIGC.message.error(settings, cb)` | Mensagem de erro (pode exibir detalhes técnicos). |

```javascript
FLUIGC.message.confirm({
    message: "[=i18n.getTranslation('card.remove.confirm')]",
    title: "[=i18n.getTranslation('card.remove.title')]",
    labelYes: "[=i18n.getTranslation('label.remove')]",
    labelNo: "[=i18n.getTranslation('label.cancel')]"
}, (result) => {
    if (result) { /* ação confirmada */ }
});
```

> ⚠️ **Não existe `FLUIGC.message.prompt`** (nem `FLUIGC.prompt`). O Fluig **não**
> tem um diálogo nativo de entrada de texto no `FLUIGC.message`. Para **capturar
> um valor digitado** (ex.: "adicionar item", "renomear"), use `FLUIGC.modal` com
> um `<input>` (ou um template Mustache) no corpo do modal e leia o valor no
> callback do botão de ação (ver "Modais em Widgets" em `conventions.md`). Chamar
> `FLUIGC.message.prompt` resulta em `TypeError: ... is not a function`.

Componente oficial para renderizar tabelas de dados com paginação, busca,
seleção, ações por linha e reordenação por arrastar-e-soltar — **nunca**
recrie paginação/busca/drag manualmente quando `FLUIGC.datatable` já resolve
(ver [style-guide.md](style-guide.md), "Plugins embutidos", mesma lógica de
"verificar antes de criar"). O **uso dentro de um widget** (bindings, template
de ações, persistência da ordenação) é fonte de verdade de
[conventions.md](conventions.md), seção "Datatable em Widgets" — aqui está
apenas a API do componente.

**Assinatura:** `FLUIGC.datatable(target, settings, callback)` — `target` é o
seletor/elemento onde a tabela é renderizada; `callback(err, data)` trata
erro/sucesso da montagem inicial.

### Opções de `settings`

| Opção | Tipo | Papel |
|-------|------|-------|
| `dataRequest` | array de objetos \| objeto REST | **Obrigatório.** Array estático de objetos, **ou** um objeto `{url, options, root, limit, offset, patternKey, limitkey, offsetKey, formatData}` apontando para um serviço REST. Por documentação oficial, **paginação e ordenação server-side só são suportadas no modo REST** — dados estáticos (array) não suportam `orderby`/`offset` do servidor. |
| `renderContent` | array \| string | **Obrigatório.** Array com as chaves do objeto a exibir (`['id', 'name', 'uf']`) **ou** a classe CSS de um template Mustache (`'.my_template'`) — ver [conventions.md](conventions.md), "Templating com Mustache", para a sintaxe do template. |
| `header` | array de objetos | Array de `{title, dataorder, size, display, standard}` — títulos das colunas; `dataorder` é a chave usada para ordenação server-side; `size` é a classe de grid (`col-md-*`); `display: false` oculta a coluna. |
| `multiSelect` | boolean | Habilita seleção múltipla de linhas (default `false`). |
| `classSelected` | string | Classe CSS aplicada à linha selecionada (default `'active'`). |
| `search` | objeto | `{enabled, onlyEnterkey, onSearch, searchAreaStyle}` — campo de busca; `onSearch(texto)` permite implementar a busca própria (local ou server-side). |
| `scroll` | objeto | `{enabled, target, onScroll}` — scroll contínuo como alternativa à paginação por botões. |
| `actions` | objeto | `{enabled, template, actionAreaStyle}` — habilita uma área de botões por linha, renderizada a partir de um template (seletor ou classe CSS). |
| `navButtons` | objeto | `{enabled, forwardstyle, backwardstyle}` — botões de navegação de página (alternativa ao scroll contínuo). |
| `draggable` | objeto | `{enabled, onDrag}` — habilita reordenar linhas por arrastar-e-soltar; `onDrag(dragInfo)` retornando `false` **cancela** o drag. |
| `emptyMessage` | string | Mensagem exibida quando não há dados. |
| `tableStyle` | string | Classes CSS aplicadas à tabela (ex.: `'table-striped table-hover'`). |
| `mobileMainColumns` | array de inteiros | Índices das colunas exibidas por padrão em dispositivos móveis. |

### Métodos da instância

| Método | Papel |
|--------|-------|
| `.addRow(index, row)` | Insere uma linha na posição `index`. |
| `.removeRow(index)` | Remove a linha na posição `index`. |
| `.updateRow(index, row[, templateSelector])` | Atualiza a linha `index` com os novos dados; `templateSelector` opcional troca o template de renderização da linha (ex.: um template de edição inline). |
| `.selectedRows()` | Retorna o array de índices das linhas selecionadas. |
| `.getRow(index)` | Retorna o objeto de dados da linha `index`. |
| `.getData()` | Retorna o array de objetos atualmente carregado na tabela. |
| `.reload([data])` | Recarrega a tabela; com `data`, substitui o conjunto exibido (usado para busca/paginação local). |
| `.nextPage(limit, offset)` | Retorna a próxima página calculada a partir de `limit`/`offset`. |
| `.getClassSelected()` | Retorna a classe CSS usada para a linha selecionada. |
| `.showColumns()` / `.showColumn(index)` / `.hideColumn(index)` | Mostram todas as colunas ocultas, ou uma coluna específica, ou ocultam uma coluna. |
| `.showLoading([target])` / `.hideLoading()` | Exibe/oculta um indicador de carregamento sobre a tabela (ou um alvo específico). |
| `.on(event, callback)` | Registra um listener para os eventos abaixo. |
| `.destroy()` | Remove o comportamento do Datatable, revertendo o elemento ao estado original. |

### Eventos (`.on('fluig.datatable.<nome>', callback)`)

| Evento | Payload / quando dispara |
|--------|----------------------------|
| `fluig.datatable.loadcomplete` | Disparado quando a tabela termina de carregar. |
| `fluig.datatable.onselectrow` | Disparado ao selecionar uma linha; `data.selectedIndex` traz os índices selecionados. |
| `fluig.datatable.drag.start` | Início da reordenação; payload com `lastPosition` e `data`. |
| `fluig.datatable.drag.end` | Fim da reordenação; payload com `lastPosition`, `newPosition`, `targetPosition` e `data`. |
| `fluig.datatable.scroll` | Disparado ao completar um scroll (modo `scroll`). |
| `fluig.datatable.search` | Disparado ao executar uma busca; traz o texto digitado. |
| `fluig.datatable.forward` / `fluig.datatable.backward` | Disparados ao clicar nos botões de navegação de página (`navButtons`). |

> Referência pública oficial completa (opções, exemplos REST, mobile columns):
> [style.fluig.com/javascript.html](https://style.fluig.com/javascript.html),
> seção Datatable.

> Para chamadas a endpoints internos do Fluig, use `fetch()` com `async/await` e
> `try/catch`, montando a URL com `${WCMAPI.getServerURL()}/api/...` (envia o token
> de sessão automaticamente) — ver [conventions.md](conventions.md), seção de
> chamadas REST.

## Categorias do Style Guide

Antes de criar qualquer elemento de UI, **verifique se já existe um componente ou
classe equivalente no Style Guide** que atenda à necessidade. Reaproveitar os
recursos prontos garante consistência visual, acessibilidade e adaptação
automática ao tema (inclusive dark mode), evitando CSS e componentes customizados
desnecessários.

O Style Guide organiza seus recursos públicos nas seguintes categorias:

| Categoria | Descrição | Exemplos |
|-----------|-----------|----------|
| **CSS** | Classes utilitárias e estilos base (buttons, forms, tables, alerts, badges, labels, panels, modals, navs, pagination). | `btn btn-primary`, `alert alert-warning`, `table`, `panel`, `label` |
| **Components** | Componentes JavaScript interativos prontos para uso. | `autocomplete`, `calendar`, `chart`, `datatable`, `filter`, `loading`, `modal`, `popover`, `richeditor`, `select`, `slider`, `switch`, `toast`, `treeview`, `wizard-modal` |
| **Forms** | Inputs, checkboxes, radios, selects, input groups, validações e estados de formulário. | `form-group`, `form-control`, `input-group`, `checkbox`, `radio` |
| **JavaScript (plugins)** | Plugins de comportamento do Style Guide, acessados via `FLUIGC.*` quando aplicável. | `carousel`, `collapse`, `dropdown`, `modal`, `popover`, `tooltip` |
| **Chart** | Componentes de gráficos e visualização de dados. | `FLUIGC.chart()` |
| **Miscellaneous** | Helpers, ícones, thumbnails, skeleton loaders, steps, ilustrações e utilitários diversos. | `fs-*`, `fluig-icon-*` |

A categoria **Miscellaneous** inclui as famílias de classes helper `fs-*`
(espaçamento, display, flexbox, texto, tamanho, etc.), detalhadas na subseção a
seguir.

## Plugins embutidos (jQuery, jQuery UI, Mustache)

Além dos componentes do Style Guide (`FLUIGC.*`), a plataforma Fluig já carrega
três plugins de terceiro junto com o Style Guide — **sem exigir import manual**
nos artefatos onde o Style Guide está presente (widget, form). Versões
confirmadas publicamente em [style.fluig.com](https://style.fluig.com/):

| Plugin | Versão | Propósito | Documentação pública |
|--------|--------|-----------|------------------------|
| jQuery | 3.7.1 | Manipulação de DOM, eventos e Ajax | [api.jquery.com](https://api.jquery.com/) |
| jQuery UI | 1.13.2 | Interações, efeitos e widgets de UI prontos (arrastar, ordenar, redimensionar, selecionar, datas) | [api.jqueryui.com](https://api.jqueryui.com/), demos em [jqueryui.com/demos](https://jqueryui.com/demos/) |
| Mustache JS | 4.2.0 | Templating client-side "logic-less" (usado pelo padrão de modal com `Mustache.render` — ver "Modais em Widgets" em [conventions.md](conventions.md)) | [github.com/janl/mustache.js](https://github.com/janl/mustache.js) |

### Ordem de verificação antes de criar algo do zero

⚠️ **Regra comportamental obrigatória.** Antes de implementar manualmente uma
interação de UI (arrastar-e-soltar, ordenar uma lista, redimensionar um painel,
template de HTML repetido, etc.), verifique **nesta ordem** se o recurso já
existe pronto:

1. **Style Guide (`FLUIGC.*`)** — componente oficial do Fluig (ver "Categorias
   do Style Guide" acima e a tabela de helpers `FLUIGC` no início deste
   arquivo).
2. **jQuery UI** — interação pronta da biblioteca já carregada (tabela abaixo).
3. **Mustache** — templating já carregado, quando o caso é "montar HTML
   repetido a partir de dados" em vez de uma interação de UI.
4. **Código próprio** — **último recurso**, só quando nenhum dos três acima
   resolve a necessidade.

Reimplementar do zero uma interação que o jQuery UI já oferece é retrabalho,
aumenta a superfície de manutenção e tende a divergir de comportamentos padrão
(acessibilidade de teclado, eventos, foco) que a biblioteca já trata.

### Interações mais usadas do jQuery UI

Vocabulário de referência — consulte a [documentação oficial](https://api.jqueryui.com/)
para a assinatura completa de opções/eventos de cada interação; não invente
opções que não constem lá.

| Interação | Propósito oficial | Caso de uso Fluig típico |
|-----------|--------------------|----------------------------|
| `.draggable()` | Torna um elemento arrastável com o mouse/toque | Cards de um Kanban, itens reordenáveis entre colunas |
| `.sortable()` | Reordena uma lista/coleção de elementos por arrastar-e-soltar | Lista de colunas/itens de um Kanban, reordenar prioridades em uma lista |
| `.droppable()` | Define uma área que aceita elementos `.draggable()` soltos nela | Coluna de destino de um Kanban (onde o card é solto) |
| `.resizable()` | Permite redimensionar um elemento arrastando sua borda/canto | Painel ou card expansível dentro do widget |
| `.selectable()` | Permite selecionar um ou mais elementos de um grupo por clique/arrasto | Seleção múltipla de itens em uma lista customizada |

> Exemplo: um Kanban com drag-and-drop entre colunas **não** é implementado com
> listeners de `mousedown`/`mousemove`/`mouseup` manuais **nem com a API
> drag-and-drop HTML5 nativa** (`draggable="true"` + eventos
> `dragstart`/`dragover`/`drop`/`dataTransfer`) — compõe-se com `.sortable()`
> (listas conectadas via `connectWith`) ou `.draggable()` nos cards +
> `.droppable()` nas colunas, ambos já disponíveis sem import adicional.
>
> ⚠️ **Por que não a API HTML5 nativa:** em widget Fluig, o drag-and-drop HTML5
> nativo conflita na prática com os estilos e handlers do Style Guide/Bootstrap e
> frequentemente **não dispara o evento `drop`** — resultado típico: os cartões
> "arrastam" mas **não soltam** na coluna de destino. Prefira sempre o jQuery UI,
> que o Fluig já carrega e trata foco/teclado/eventos de forma consistente.

### Vocabulário de componentes para Wizards de instalação

Este pacote **não define** uma UI de wizard padrão ou obrigatória. As skills de
geração e modernização **compõem** a interface em tempo de geração a partir dos
blocos abaixo, conforme a necessidade real do componente (número de steps,
número de recursos provisionáveis, etc.) — **nunca** reproduzindo sempre o
mesmo layout fixo. A tabela a seguir é um **vocabulário de referência**
(propósito oficial de cada componente do Style Guide e seu papel possível num
wizard de provisionamento), não um template a copiar.

| Componente | Propósito oficial (Style Guide) | Papel num wizard de provisionamento |
|------------|----------------------------------|--------------------------------------|
| **Steps** | Representação visual de um processo passo a passo. Horizontal: `<ul class="steps">`; vertical: `<ul class="steps steps-vertical">`. Cada item é `<li class="step-item">` com `<span class="step-bullet">` e `<span class="step-label">`. | **Stepper** (indicador de progresso entre etapas). Estado por item via modificadores em `.step-item`: `done`, `active`, e os quatro estados gerais `has-success`/`has-error`/`has-info`/`has-warning`. |
| **Panel** | Agrupar conteúdo numa "caixa" (`.panel.panel-default` com `.panel-heading` opcional/`.panel-title`, `.panel-body` e `.panel-footer` opcional). Existem variantes contextuais (`panel-primary`, `panel-success`, etc.). | **Container de cada etapa/step** — cada step do wizard normalmente vive dentro de um `panel`. |
| **Pager** | Links rápidos de anterior/próximo com markup leve: `<ul class="pager">` centralizado, ou `<li class="previous">`/`<li class="next">` para alinhamento lateral. Um `.disabled` no `<li>` desabilita o link. | **Navegação prev/next** entre steps — `.disabled` desabilita "Previous" no primeiro step, "Next" no último, ou durante validação/instalação assíncrona. |
| **Alert** | Banner contextual (`alert-success`/`alert-info`/`alert-warning`/`alert-danger`), com `.alert-dismissible` opcional (botão de fechar). | **Banner de chamada-para-ação/status** da área de instalar — distinto do estado por item do Steps e do agrupamento do Panel. `examples/wizard` usa `alert-info` para "pronto para instalar" (com botão inline) e `alert-success` para "já instalado". |
| **FLUIGC.datatable / FLUIGC.loading / FLUIGC.toast** | `datatable()` renderiza uma tabela de dados; `loading(target)` exibe um indicador de carregamento sobre um alvo; `toast()` exibe notificações temporárias. | `loading(target)`: **overlay de carregamento** durante chamadas de verificação/instalação. `toast()`: **notificação final** de sucesso/erro após uma ação de instalação. `datatable()`: **alternativa de composição** a Steps+Panel+lista de recursos, quando o wizard precisa listar MUITOS recursos provisionáveis numa tabela navegável (colunas código/campos/status de sincronia/status de instalação) em vez de poucos cards — uma opção, não um mandato. |

[`examples/wizard/view.ftl`](../examples/wizard/view.ftl) e
[`examples/wizard/wizard.js`](../examples/wizard/wizard.js) mostram **um exemplo
de composição possível** deste vocabulário (Steps vertical + Panel por step +
Pager + Alert), não "o padrão" — um wizard com menos ou mais steps, ou com
muitos recursos provisionáveis, compõe os mesmos blocos de forma diferente.

Além do vocabulário de steps/containers acima, o Style Guide oferece
componentes de uso geral relevantes para **campos de credencial e coleta de
dado** — documentados em
[style.fluig.com/javascript.html](https://style.fluig.com/javascript.html) e
[style.fluig.com/css.html#forms](https://style.fluig.com/css.html#forms):

| Componente | Propósito oficial (Style Guide) | Papel em campos de credencial/coleta de dado |
|------------|----------------------------------|-----------------------------------------------|
| **FLUIGC.password(target, options)** | Campo de senha com ícone de olho para mostrar/ocultar o valor digitado; opções `eyeOpenClass`/`eyeCloseClass`; métodos `.show()`/`.hide()`/`.toggle()`/`.val()`; eventos `fsshow.password`/`fshide.password`. | Privacy by design "de fábrica" para qualquer campo sensível (senha, token, chave de API) — evita exibir o valor em texto puro por padrão. |
| **FLUIGC.wizardModal(options, callback)** | Renderiza um fluxo em etapas **dentro de um modal** (alternativa ao padrão Steps/Panel/Pager/Alert em página já documentado acima); opções incluem o array `wizard: [{title, content, action}]` e `footerActions` (`cancel`/`prevStep`/`nextStep`/`finish`); métodos `.remove()`/`.isOpen()`; eventos `show.bs.modal`/`shown.bs.modal`/`hide.bs.modal`/`hidden.bs.modal`/`loaded.bs.modal`. | Composição alternativa para um fluxo passo a passo sem ocupar a página inteira — mesma função de orquestração de etapas que Steps/Panel/Pager cumprem em página. |
| **FLUIGC.filter / FLUIGC.autocomplete / FLUIGC.calendar** | Já listados na tabela `FLUIGC` geral acima — busca com autocomplete e tabela de resultados; campo com autocompletar; seleção de data (`.setDate`/`.getDate`/`.setMinDate`/`.setMaxDate`/`.enable`/`.disable`). | Opções típicas para campos de coleta de dado estruturado (busca de um valor existente, autocompletar um texto, selecionar uma data), evitando inputs de texto livre sem validação. |

Como todo o vocabulário desta subseção, estes componentes são **blocos
disponíveis**, não uma UI obrigatória — não existe wizard padrão ou
obrigatório; a interface é composta em tempo de geração conforme a
necessidade real de cada componente.

## Classes helper `fs-*`

As classes helper `fs-*` são utilitárias **públicas** do Fluig Style Guide,
prontas para aplicar estilos comuns sem escrever CSS próprio. **Priorize-as antes
de criar CSS customizado**: por serem do Style Guide, garantem consistência visual
e adaptação automática ao tema (inclusive dark mode).

O catálogo completo e oficial das classes helper `fs-*` está consolidado nas
tabelas de categorias **abaixo, neste arquivo** (fonte única de verdade do
pacote). As categorias disponíveis são:

| Categoria | Classes / Padrão | Exemplos |
|-----------|-----------------|---------|
| **Scrollbar** | `fs-scrollbar`, `fs-scrollbar-thin` | `fs-scrollbar` |
| **Posicionamento** | `fs-float-*`, `fs-clear-*`, `fs-overflow-*`, `fs-position-*`, `fs-clearfix` | `fs-float-left`, `fs-overflow-hidden`, `fs-position-relative` |
| **Display** | `fs-display-*` | `fs-display-flex`, `fs-display-none`, `fs-display-grid` |
| **Flexbox — alinhamento** | `fs-align-items-*`, `fs-align-self-*` | `fs-align-items-center`, `fs-align-self-flex-end` |
| **Flexbox — justify** | `fs-justify-content-*` | `fs-justify-content-center`, `fs-justify-content-space-between` |
| **Flexbox — direção/wrap** | `fs-flex-direction-*`, `fs-flex-wrap-*`, `fs-flex-1` | `fs-flex-direction-column`, `fs-flex-wrap-wrap` |
| **Flexbox — gap** | `fs-{xs\|sm\|md\|lg\|xl}-gap[-horizontal\|-vertical]` | `fs-md-gap`, `fs-sm-gap-horizontal` |
| **Tamanho — largura** | `fs-width-*`, `fs-min-width-*`, `fs-max-width-*`, `fs-full-width`, `fs-half-width`, `fs-one-third-width`, `fs-one-fourth-width`, `fs-one-fifth-width`, `fs-one-sixth-width`, `fs-max-full-width`, `fs-width-inherit`, `fs-width-auto` | `fs-full-width`, `fs-width-200` |
| **Tamanho — altura** | `fs-height-*`, `fs-min-height-*`, `fs-max-height-*`, `fs-height-auto`, `fs-height-inherit`, `fs-no-resize` | `fs-height-100`, `fs-min-height-50` |
| **Espaçamento** | `fs-{m\|mt\|mb\|ml\|mr\|mx\|my}-{0\|4\|8\|16\|24\|32\|40\|48\|56\|64\|auto}` e variantes com breakpoint `{xs\|sm\|md\|lg}:fs-*` | `fs-mt-24`, `sm:fs-mt-16`, `xs:fs-mb-8` |
| **Padding** | `fs-{p\|pt\|pb\|pl\|pr\|px\|py}-{valor}` com variantes de breakpoint | `fs-pb-16`, `sm:fs-pb-8` |
| **Tipografia — alinhamento** | `fs-text-left`, `fs-text-right`, `fs-text-center`, `fs-text-justify`, `fs-text-center-all` | `fs-text-center` |
| **Tipografia — alinhamento vertical** | `fs-v-align-top`, `fs-v-align-middle`, `fs-v-align-bottom` | `fs-v-align-middle` |
| **Tipografia — tamanho** | `fs-text-xs` (10px), `fs-text-sm` (12px), `fs-text-md` (14px), `fs-text-lg` (16px), `fs-text-xl` (18px), `fs-text-xxl` (24px), `fs-text-xxxl` (30px) | `fs-text-sm`, `fs-text-lg` |
| **Tipografia — estilo** | `fs-font-bold`, `fs-no-bold`, `fs-font-italic`, `fs-nowrap`, `fs-ellipsis`, `fs-text-uppercase`, `fs-text-lowercase`, `fs-text-capitalize`, `fs-text-underline`, `fs-no-text-underline`, `fs-word-break`, `fs-word-break-all`, `fs-no-word-break`, `fs-white-space-normal`, `fs-small-letter-spacing`, `fs-list-style-disc`, `fs-no-list-style` | `fs-ellipsis`, `fs-font-bold` |
| **Cursor** | `fs-cursor-*` | `fs-cursor-pointer`, `fs-cursor-not-allowed`, `fs-cursor-grab` |
| **Background** | `fs-bg-white`, `fs-bg-black`, `fs-bg-gray`, `fs-bg-danger`, `fs-bg-warning`, `fs-bg-info`, `fs-bg-success` | `fs-bg-white` |
| **Cor de texto** | `fs-color-white`, `fs-color-black`, `fs-color-gray`, `fs-color-danger`, `fs-color-warning`, `fs-color-info`, `fs-color-success` | `fs-color-danger` |
| **Formulário** | `fs-no-style-input`, `fs-no-spin` | `fs-no-spin` |
| **Utilitários gerais** | `fs-break-text`, `fs-text-access`, `fs-pointer-events-none` | `fs-pointer-events-none` |
| **Responsivos** | Prefixo `fs-{xs\|sm\|md\|lg}-*` para float, display, width, border, font-size, margin, padding, flex e alinhamento | `md:fs-half-width`, `lg:fs-one-third-width` |

> **Padrão de margin/padding responsivo:**
> ```html
> <!-- breakpoint:fs-{propriedade}-{valor} -->
> <div class="fs-mt-24 sm:fs-mt-16 xs:fs-mt-8 sm:fs-pb-8">...</div>
> ```
> Breakpoints: `xs` (<768px) · `sm` (≥768px) · `md` (≥992px) · `lg` (≥1200px)


### Quando criar CSS customizado

**Minimize o CSS próprio:** os componentes e helpers do Style Guide são o
**padrão** de estilização; o CSS próprio é **exceção**, permitida apenas quando o
desenvolvedor o solicita explicitamente ou quando os helpers não cobrem a
necessidade. Quando o CSS próprio for de fato necessário, mantenha a regra de usar
`var(--fs-color-*)` para cores de tema (sem hexadecimais fixos).

- ✅ Quando o desenvolvedor **solicitar explicitamente** CSS customizado.
- ✅ Quando **não houver** classe helper equivalente para o estilo desejado.
- ✅ Quando um componente externo **não permitir** alterar suas classes.
- ❌ **Nunca** para sobrescrever estilos de componentes existentes do Style Guide.
- ❌ **Nunca** quando já existir uma classe helper equivalente.

> ⚠️ **Proibido inventar classes helpers ou variáveis CSS.**
> Use **somente** as classes listadas na seção [Classes helper `fs-*`](#classes-helper-fs-)
> e as variáveis listadas na seção [Theming e dark mode (variáveis CSS)](#theming-e-dark-mode-variáveis-css--fonte-de-verdade),
> ambas neste arquivo. Se uma classe ou variável não constar nessas seções, ela
> **não existe** no Style Guide — nesse caso, use CSS próprio escopado ou confirme
> com o desenvolvedor.

## Sistema de grid

O grid segue o modelo do **Bootstrap 3.4.1** (12 colunas, responsivo):

- Estrutura: `.container` / `.container-fluid` → `.row` → `.col-*`.
- Classes responsivas por breakpoint: `col-xs-*`, `col-sm-*`, `col-md-*`, `col-lg-*`.
- Combine breakpoints na mesma coluna para layouts adaptativos
  (ex.: `class="col-xs-12 col-md-6"`).

Reutilize o grid em vez de criar layouts com posicionamento/medidas fixas.

## Ícones

Os ícones são entregues como fontes de ícone (icon fonts) organizadas em
conjuntos/temas. Conjunto público confirmado:

| Conjunto | Identificador |
|----------|---------------|
| Flat Icons | `flat` |
| Animalia Icons | `animalia` |

O catálogo de ícones pode ser consultado programaticamente via `FLUIGC.icons()`.
Prefira os ícones do Style Guide a imagens próprias para manter consistência
visual e adaptação automática ao tema.

### Catálogos Disponíveis

O projeto disponibiliza o catálogo de ícones embarcados do Fluig: **Flaticon**.

| Catálogo | Arquivo de referência | Uso |
|----------|----------------------|-----|
| **Flaticon** | `context/references/icons/flaticon.json` | Todos os contextos: HTML/FTL (interfaces visuais) e `pages.xml`/`component.xml` (navegação) |

### Regras de Uso

1. **Em HTML/FTL (interfaces visuais):** preferir **Flaticon**.
   Sintaxe: `<i class="flaticon flaticon-{nome}"></i>` (ex.: `<i class="flaticon flaticon-settings"></i>`)

2. **Em pages.xml e component.xml (navegação):** preferir **Flaticon**.
   Sintaxe: valor do `<icon>` em `pages.xml` é o nome sem prefixo CSS (ex.: `flaticon-settings`)

3. **Prefira os catálogos embarcados do Fluig** (Flaticon, Animalia) a ícones de
   CDNs externas (Font Awesome, Material Icons, etc.) — CDN externo é
   desaconselhado.

   > **Parceiro (Store):** CDN externo de ícones é proibido (Crítica) — ver
   > [§ 5](partner-store-review-rules.md#5-cdn-externo).

4. **Consultar o catálogo JSON** (quando disponível) ou `FLUIGC.icons()` para
   verificar se o ícone desejado existe antes de usar — nomes incorretos
   resultam em ícone vazio/invisível.

### Formato do Catálogo

- **flaticon.json**: array de objetos com `key` (nome CSS) e `keywords` (termos de busca em português)

## Utilitários e helpers

- **Componentes/classes do Style Guide** cobrem botões, formulários, cards,
  alertas, tabelas, navegação e tipografia — reutilize-os antes de escrever CSS
  próprio.
- **Classes utilitárias** do Bootstrap (espaçamento, alinhamento, tipografia,
  visibilidade responsiva) estão disponíveis no escopo `fluig-style-guide`.
- **Classes helper `fs-*`** do próprio Style Guide cobrem scrollbar, posicionamento,
  display, flexbox (alinhamento, justify, direção, gap), tamanho, espaçamento
  responsivo, tipografia, cursor, background, cor de texto, formulário e utilitários
  gerais — ver a subseção [Classes helper `fs-*`](#classes-helper-fs-) acima
  (catálogo completo neste arquivo). Prefira-as a CSS customizado.
- **Helpers de comportamento** via `FLUIGC.utilities` (ex.: `randomUUID()`,
  `parseBoolean(value)`, `ctrlIsPressed(ev)`).

## Theming e dark mode (variáveis CSS) — fonte de verdade

O Style Guide define seu tema por **CSS custom properties** declaradas em
`:root`. Há mapas de cores para **modo claro e modo escuro**, então usar as
variáveis garante que o componente se adapte automaticamente ao tema ativo
(inclusive dark mode), sem código adicional.

O catálogo completo e oficial de todas as variáveis de tema está consolidado nas
tabelas de famílias de variáveis **abaixo, neste arquivo** (fonte única de
verdade do pacote).

**Regra obrigatória:** para qualquer cor de tema, **use variáveis CSS no formato
`var(--fs-color-*)`**. São **proibidos** para cores de tema:

- ❌ **Hexadecimais fixos** (`#ffffff`, `#000000`, etc.) — não acompanham a troca
  de tema e quebram o dark mode.
- ❌ **Variáveis SCSS** (`$color-primary`, `$...`) — são resolvidas em tempo de
  compilação e ficam fixas, portanto também não acompanham o tema ativo.
- ✅ Sempre **variáveis CSS** `var(--fs-color-*)`; para cores neutras, prefira as
  variáveis que se invertem entre os modos claro e escuro.

### Famílias de variáveis de cor

Padrão de nome: `--fs-color-<família>-<tom>`

**Marca** — invertidas entre Light e Dark:

| Variável | Light | Dark |
|----------|-------|------|
| `--fs-color-brand-01-lightest` | `#e3eefb` | `#051f31` |
| `--fs-color-brand-01-lighter` | `#afd3fa` | `#004064` |
| `--fs-color-brand-01-light` | `#3dadfa` | `#00659a` |
| `--fs-color-brand-01-base` | `#0079b8` | `#0079b8` |
| `--fs-color-brand-01-dark` | `#00659a` | `#3dadfa` |
| `--fs-color-brand-01-darker` | `#004064` | `#afd3fa` |
| `--fs-color-brand-01-darkest` | `#051f31` | `#e3eefb` |

**Ação** — apontam para variáveis de marca e herdam inversão automática:

| Variável | Light | Dark |
|----------|-------|------|
| `--fs-color-action-default` | `brand-01-base` | `brand-01-dark` |
| `--fs-color-action-hover` | `brand-01-dark` | `brand-01-darker` |
| `--fs-color-action-pressed` | `brand-01-darker` | `brand-01-darkest` |
| `--fs-color-action-disabled` | `neutral-mid-40` | `neutral-mid-40` |
| `--fs-color-action-focus` | `brand-01-darkest` | `brand-01-darkest` |

**Neutras** — invertidas automaticamente entre Light e Dark:

| Variável | Light | Dark |
|----------|-------|------|
| `--fs-color-neutral-light-00` | `#ffffff` | `#1c1c1c` |
| `--fs-color-neutral-light-05` | `#eeeeee` | `#202020` |
| `--fs-color-neutral-light-10` | `#d9d9d9` | `#2b2b2b` |
| `--fs-color-neutral-light-20` | `#c1c1c1` | `#3b3b3b` |
| `--fs-color-neutral-light-30` | `#a1a1a1` | `#5a5a5a` |
| `--fs-color-neutral-mid-40` | `#7c7c7c` | `#7c7c7c` |
| `--fs-color-neutral-mid-60` | `#5a5a5a` | `#a1a1a1` |
| `--fs-color-neutral-dark-70` | `#3b3b3b` | `#c1c1c1` |
| `--fs-color-neutral-dark-80` | `#2b2b2b` | `#d9d9d9` |
| `--fs-color-neutral-dark-90` | `#202020` | `#eeeeee` |
| `--fs-color-neutral-dark-95` | `#1c1c1c` | `#fbfbfb` |

**Feedback** — cada família tem tons `lightest → darkest` (também invertidos):

| Família | Variáveis disponíveis |
|---------|-----------------------|
| Positivo | `--fs-color-positive-lightest` … `--fs-color-positive-darkest` |
| Negativo | `--fs-color-negative-lightest` … `--fs-color-negative-darkest` |
| Aviso | `--fs-color-warning-lightest` … `--fs-color-warning-darkest` |
| Informação | `--fs-color-info-lightest` … `--fs-color-info-darkest` |

**Sombras** — use em vez de valores `box-shadow` fixos:

| Variável | Intensidade |
|----------|-------------|
| `--fs-shadow-none` | Sem sombra |
| `--fs-shadow-sm` | Leve |
| `--fs-shadow-md` | Padrão |
| `--fs-shadow-lg` | Forte |
| `--fs-shadow-xl` | Extra forte |

### Mapeamento de uso comum → variável CSS

Esta tabela é a **fonte única de verdade** do mapeamento de cores do pacote; as
skills (ex.: `fluig-dark-mode`) referenciam esta seção em vez de reproduzir as tabelas.
Para cada uso comum de cor, prefira a variável CSS correspondente:

| Uso | Variável CSS |
|-----|--------------|
| Cor de texto padrão | `var(--fs-color-neutral-dark-90)` |
| Texto com hover/focus | `var(--fs-color-neutral-dark-95)` |
| Background branco (padrão) | `var(--fs-color-neutral-light-00)` |
| Background cinza claro | `var(--fs-color-neutral-light-05)` ou `var(--fs-color-neutral-light-10)` |
| Background cinza com destaque | `var(--fs-color-neutral-light-20)` |
| Borda padrão | `var(--fs-color-neutral-light-20)` ou `var(--fs-color-neutral-light-30)` |
| Sombra padrão | `var(--fs-shadow-md)` |
| Ação interativa | `var(--fs-color-action-default)` |
| Ação hover | `var(--fs-color-action-hover)` |
| Feedback positivo | `var(--fs-color-positive-base)` |
| Feedback negativo | `var(--fs-color-negative-base)` |
| Feedback aviso | `var(--fs-color-warning-base)` |
| Feedback informação | `var(--fs-color-info-base)` |

### Substituição de hexadecimais comuns → variável CSS

Ao modernizar CSS que ainda usa cores fixas, substitua os hexadecimais comuns
pela variável CSS equivalente (cor neutra que se adapta ao tema ativo):

| Hex antigo | Variável CSS | Contexto |
|------------|--------------|----------|
| `#ffffff` | `var(--fs-color-neutral-light-00)` | Background branco |
| `#eeeeee` | `var(--fs-color-neutral-light-05)` | Background cinza claro |
| `#d9d9d9` | `var(--fs-color-neutral-light-10)` | Background cinza |
| `#c1c1c1` | `var(--fs-color-neutral-light-20)` | Borda ou cinza médio |
| `#a1a1a1` | `var(--fs-color-neutral-light-30)` | Cinza escuro |
| `#1c1c1c` | `var(--fs-color-neutral-dark-95)` | Texto preto |
| `#3b3b3b` | `var(--fs-color-neutral-dark-70)` | Texto cinza escuro |
| `#5a5a5a` | `var(--fs-color-neutral-mid-60)` | Cinza médio |

> **Iconfonts e ilustrações:** os ícones (icon fonts) **herdam a cor do texto**
> automaticamente — não defina cores manualmente neles. Para ilustrações que
> precisam acompanhar o tema, use os recursos de ilustração que adaptam ao tema
> ativo, em vez de imagens com cores fixas.

```css
/* ✅ usa variável de tema — adapta a dark mode automaticamente */
.my-widget__header {
  color: var(--fs-color-neutral-dark-90);
  background-color: var(--fs-color-neutral-light-00);
  box-shadow: var(--fs-shadow-md);
}

/* ❌ hexadecimal fixo — não acompanha o tema, quebra o dark mode */
.my-widget__header {
  color: #202020;
  background-color: #ffffff;
}
```

### Cor dinâmica configurável pelo usuário (≠ cor de tema)

A regra "sem hexadecimais fixos" vale para **cores de tema** (texto, fundo,
bordas que devem acompanhar o dark mode). Ela **não se aplica** a uma **cor
escolhida pelo usuário/administrador** (ex.: uma cor de destaque configurável),
que é **dado**, não decisão de design — e por isso não pode vir de
`var(--fs-color-*)` (o Style Guide não tem a cor que o usuário acabou de
escolher).

O padrão correto para cor dinâmica é uma **CSS custom property própria** (ex.:
`--highlight`) alimentada em runtime, com um hex apenas como **fallback inicial**:

```css
/* ✅ cor dinâmica: custom property própria + fallback; NÃO é cor de tema */
.my-widget {
  --highlight: #2196f3;                 /* fallback até o valor real ser aplicado */
  border-left: 4px solid var(--highlight);
}
.my-widget__title { color: var(--highlight); }     /* consome a cor do usuário */
.my-widget__text  { color: var(--fs-color-neutral-dark-90); } /* cor de TEMA → variável do SG */
```

```javascript
// JS aplica a cor escolhida (preferência/param) na raiz, via setProperty.
const root = document.getElementById('MyWidget_' + this.instanceId);
root.style.setProperty('--highlight', this.highlightColor || '#2196f3');
```

**Como coletar a cor no `edit.ftl` — `<input type="color">` nativo vs
`FLUIGC.colorpicker`.** São ferramentas diferentes, não "uma melhor":

| | `<input type="color">` (nativo HTML) | `FLUIGC.colorpicker` (Style Guide) |
|---|---|---|
| O que é | Elemento nativo do navegador | Componente JS do Style Guide |
| Visual | O seletor do **SO** (varia por SO/navegador) | Sempre igual, no padrão Fluig |
| Recursos | Só cor **sólida** (`#rrggbb`) | Roda de cor, **opacidade/alpha**, formatos, posição |
| Declara no `application.info`? | **Não** | **Sim** — `application.resource.component.N=fluigcolorpicker` |
| Custo | Zero JS/dependência | Carrega o componente + `FLUIGC.colorpicker(seletor, settings)` |

**Heurística de escolha:**

- **`<input type="color">` nativo** — quando a cor é **sólida e simples**, sem
  requisito de aparência do seletor. É o **default em caso ambíguo** (menos é
  mais; zero dependência).
- **`FLUIGC.colorpicker`** — quando há **requisito real**: opacidade/alpha,
  formatos, roda de cor completa; **ou** quando a **consistência visual importa**
  — o que inclui tipicamente **componentes de Parceiro (Store)**, onde a UI
  polida/consistente entre SOs é mais valorizada. Lembre de declarar
  `application.resource.component.N=fluigcolorpicker`.

> Regra geral: não traga o componente do Style Guide (mais peso) quando o nativo
> resolve a necessidade — coerente com "preferir o embarcado/simples". Mas se o
> requisito pede alpha/consistência, o `FLUIGC.colorpicker` é o caminho.
>
> ⚠️ **Para o review:** um hex como **fallback de custom property de cor dinâmica**
> (ex.: `--highlight: #2196f3`) **não** é a violação de "hexadecimal fixo de cor
> de tema" — não o confunda com um falso-positivo. O que a regra proíbe é hex
> **direto** em propriedade de cor de tema (`color: #202020`).

## Referências Cruzadas

- Para "como fazer" (gerar, adaptar a dark mode, substituir CSS por helpers e
  revisar), ver as skills em `skills/` (ex.: `fluig-dark-mode`, `fluig-style-guide-helpers`).
- Para convenções de código, i18n, segurança e a regra `fluig-style-guide` na
  raiz do widget: [conventions.md](conventions.md).
- Para versões das bibliotecas client-side (jQuery, Bootstrap, Kendo UI):
  [technologies.md](technologies.md).
- Catálogo completo de **variáveis CSS** (fonte de verdade): seção [Theming e dark mode (variáveis CSS)](#theming-e-dark-mode-variáveis-css--fonte-de-verdade) deste arquivo.
- Catálogo completo de **classes helper `fs-*`** (fonte de verdade): seção [Classes helper `fs-*`](#classes-helper-fs-) deste arquivo.
