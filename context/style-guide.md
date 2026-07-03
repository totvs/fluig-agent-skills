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

Este documento descreve **o que é** cada recurso e seus padrões de uso. O passo a
passo de execução é responsabilidade das skills em `skills/`.

## API JavaScript pública (`FLUIGC`)

O Style Guide expõe componentes programaticamente pelo objeto global `FLUIGC`.
Cada helper recebe, em geral, um seletor/elemento alvo e um objeto de
configuração, e muitos aceitam um callback. Helpers públicos confirmados:

| Helper | Propósito |
|--------|-----------|
| `FLUIGC.toast(settings)` | Exibe notificações temporárias (toasts) |
| `FLUIGC.modal(settings, cb)` | Cria e controla modais |
| `FLUIGC.message(...)` | Diálogos de mensagem/confirmação (encapsula modal) |
| `FLUIGC.messagePage(settings, cb)` | Página de mensagem (feedback em tela cheia) |
| `FLUIGC.loading(target, settings)` | Indicador de carregamento sobre um alvo |
| `FLUIGC.calendar(target, settings)` | Componente de calendário/seleção de data |
| `FLUIGC.filter(target, settings)` | Campo de filtro com autocomplete/datatable |
| `FLUIGC.autocomplete(target, settings, cb)` | Campo com autocompletar |
| `FLUIGC.switcher` | Interruptores (toggle/switch) |
| `FLUIGC.select(target, settings)` | Select aprimorado |
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

> Para chamadas a endpoints internos do Fluig, use `FLUIGC.ajax` (envia o token
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

## Classes helper `fs-*`

As classes helper `fs-*` são utilitárias **públicas** do Fluig Style Guide,
prontas para aplicar estilos comuns sem escrever CSS próprio. **Priorize-as antes
de criar CSS customizado**: por serem do Style Guide, garantem consistência visual
e adaptação automática ao tema (inclusive dark mode).

A referência completa e oficial está em
`references/helpers-and-variables-css/helper-classes.md`. As categorias
disponíveis são:

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
> Use **somente** as classes listadas em `references/helpers-and-variables-css/helper-classes.md`
> e as variáveis listadas em `references/helpers-and-variables-css/css-variables.md`.
> Se uma classe ou variável não estiver nessas referências, ela **não existe** no
> Style Guide — nesse caso, use CSS próprio escopado ou confirme com o desenvolvedor.

## Sistema de grid

O grid segue o modelo do **Bootstrap 3.4.1** (12 colunas, responsivo):

- Estrutura: `.container` / `.container-fluid` → `.row` → `.col-*`.
- Classes responsivas por breakpoint: `col-xs-*`, `col-sm-*`, `col-md-*`, `col-lg-*`.
- Combine breakpoints na mesma coluna para layouts adaptativos
  (ex.: `class="col-xs-12 col-md-6"`).

Reutilize o grid em vez de criar layouts com posicionamento/medidas fixas.

## Ícones

Os ícones são entregues como fontes de ícone (icon fonts) organizadas em
conjuntos/temas. Conjuntos públicos confirmados:

| Conjunto | Identificador |
|----------|---------------|
| Flat Icons | `flat` |
| Animalia Icons | `animalia` |

O catálogo de ícones pode ser consultado programaticamente via `FLUIGC.icons()`.
Prefira os ícones do Style Guide a imagens próprias para manter consistência
visual e adaptação automática ao tema.

## Utilitários e helpers

- **Componentes/classes do Style Guide** cobrem botões, formulários, cards,
  alertas, tabelas, navegação e tipografia — reutilize-os antes de escrever CSS
  próprio.
- **Classes utilitárias** do Bootstrap (espaçamento, alinhamento, tipografia,
  visibilidade responsiva) estão disponíveis no escopo `fluig-style-guide`.
- **Classes helper `fs-*`** do próprio Style Guide cobrem scrollbar, posicionamento,
  display, flexbox (alinhamento, justify, direção, gap), tamanho, espaçamento
  responsivo, tipografia, cursor, background, cor de texto, formulário e utilitários
  gerais — ver a subseção [Classes helper `fs-*`](#classes-helper-fs-) acima e a
  referência completa em `references/helpers-and-variables-css/helper-classes.md`.
  Prefira-as a CSS customizado.
- **Helpers de comportamento** via `FLUIGC.utilities` (ex.: `randomUUID()`,
  `parseBoolean(value)`, `ctrlIsPressed(ev)`).

## Theming e dark mode (variáveis CSS) — fonte de verdade

O Style Guide define seu tema por **CSS custom properties** declaradas em
`:root`. Há mapas de cores para **modo claro e modo escuro**, então usar as
variáveis garante que o componente se adapte automaticamente ao tema ativo
(inclusive dark mode), sem código adicional.

A referência completa e oficial de todas as variáveis está em
`references/helpers-and-variables-css/css-variables.md`.

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

## Referências Cruzadas

- Para "como fazer" (gerar, adaptar a dark mode, substituir CSS por helpers e
  revisar), ver as skills em `skills/` (ex.: `fluig-dark-mode`, `fluig-style-guide-helpers`).
- Para convenções de código, i18n, segurança e a regra `fluig-style-guide` na
  raiz do widget: [conventions.md](conventions.md).
- Para versões das bibliotecas client-side (jQuery, Bootstrap, Kendo UI):
  [technologies.md](technologies.md).
- Referência completa de **variáveis CSS**: `references/helpers-and-variables-css/css-variables.md`.
- Referência completa de **classes helper `fs-*`**: `references/helpers-and-variables-css/helper-classes.md`.
