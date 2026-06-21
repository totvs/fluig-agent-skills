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
- **Helpers de comportamento** via `FLUIGC.utilities` (ex.: `randomUUID()`,
  `parseBoolean(value)`, `ctrlIsPressed(ev)`).

## Theming e dark mode (variáveis CSS) — fonte de verdade

O Style Guide define seu tema por **CSS custom properties** declaradas em
`:root`. Há mapas de cores para **modo claro e modo escuro**, então usar as
variáveis garante que o componente se adapte automaticamente ao tema ativo
(inclusive dark mode), sem código adicional.

**Regra obrigatória:** para qualquer cor de tema, **use variáveis CSS no formato
`var(--fs-color-*)`**. **Hexadecimais fixos para cores de tema são proibidos** —
eles não acompanham a troca de tema e quebram o dark mode.

Famílias de tokens de cor confirmadas (padrão `--fs-color-<família>-<tom>`):

| Família | Exemplos confirmados |
|---------|----------------------|
| Marca | `--fs-color-brand-01-light`, `--fs-color-brand-01-base`, `--fs-color-brand-01-darkest` |
| Ação | `--fs-color-action-default`, `--fs-color-action-hover`, `--fs-color-action-pressed`, `--fs-color-action-disabled`, `--fs-color-action-focus` |
| Neutros | `--fs-color-neutral-light-00`, `--fs-color-neutral-light-05`, `--fs-color-neutral-mid-40`, `--fs-color-neutral-dark-90`, `--fs-color-neutral-dark-95` |
| Feedback | `--fs-color-positive-*`, `--fs-color-negative-*`, `--fs-color-warning-*`, `--fs-color-info-*` |

Tokens de tipografia e sombra também são expostos como variáveis, por exemplo:

| Token | Uso |
|-------|-----|
| `--fs-font-family` | Família tipográfica padrão (`'Lato', Arial, sans-serif`) |
| `--fs-font-size` / `--fs-font-color` | Tamanho e cor de fonte padrão |
| `--fs-shadow-sm` / `--fs-shadow-md` | Sombras padronizadas |

```css
/* ✅ usa variável de tema — adapta a dark mode automaticamente */
.my-widget__header {
  color: var(--fs-color-neutral-dark-90);
  background-color: var(--fs-color-neutral-light-00);
}

/* ❌ hexadecimal fixo — não acompanha o tema, quebra o dark mode */
.my-widget__header {
  color: #202020;
  background-color: #ffffff;
}
```

## Referências Cruzadas

- Para "como fazer" (gerar, adaptar a dark mode, substituir CSS por helpers e
  revisar), ver as skills em `skills/` (ex.: `dark-mode`, `style-guide-helpers`).
- Para convenções de código, i18n, segurança e a regra `fluig-style-guide` na
  raiz do widget: [conventions.md](conventions.md).
- Para versões das bibliotecas client-side (jQuery, Bootstrap, Kendo UI):
  [technologies.md](technologies.md).
