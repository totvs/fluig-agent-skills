---
name: fluig-style-guide-helpers
description: Substitui CSS customizado e comportamentos recriados manualmente por helpers, componentes e classes utilitárias do Fluig Style Guide (FLUIGC e Bootstrap 3.4.1) ou pelos plugins já embutidos na plataforma (jQuery UI, Mustache), reduzindo código próprio e garantindo consistência visual e adaptação automática ao tema. Use quando o desenvolvedor pedir para trocar estilos/markup/interações customizados por recursos oficiais do Style Guide, ou quando reimplementar do zero uma interação (drag-and-drop, ordenação, redimensionamento) que o jQuery UI já embutido na plataforma resolve.
argument-hint: o código/CSS/markup/interação alvo a substituir por helpers, componentes do Style Guide ou plugins embutidos (jQuery UI, Mustache)
---

# Substituição de CSS Customizado por Helpers do Style Guide

Esta skill substitui CSS/markup/interações próprias por recursos oficiais do Fluig; ela **não duplica** o catálogo. As **categorias do Style Guide** (CSS, Components, Forms, JavaScript plugins, Chart, Miscellaneous), as **famílias de classes helper `fs-*`** e os **plugins já embutidos (jQuery, jQuery UI, Mustache)** vivem em `context/style-guide.md`, que é a fonte única de verdade referenciada abaixo.

## Passo 0 — Persona

Antes de substituir CSS/markup, classifique a persona do desenvolvedor seguindo
a cascata em [persona-routing.md](../../context/persona-routing.md): conversa >
marcador de arquivo > marcador técnico de Store (`component.xml` ou API de slot)
> estrutura do projeto > pergunta. Se restar ambígua, pare e
pergunte antes de continuar. Emita `Persona: <Parceiro|Consultor> (motivo)` —
esta skill aplica as mesmas regras técnicas independentemente da persona (não
há camada da Store envolvida no uso do Style Guide).

## Objetivo

Substituir, com responsabilidade única, **CSS customizado e comportamentos recriados manualmente por helpers, componentes, grid e classes utilitárias do Fluig Style Guide**, reduzindo código próprio e garantindo consistência visual e adaptação automática ao tema, sem alterar o comportamento observável.

## Quando Usar

- Quando há **CSS próprio** que recria botões, cards, alertas, tabelas, formulários ou tipografia já oferecidos pelo Style Guide.
- Quando layouts usam **posicionamento/medidas fixas** em vez do grid responsivo.
- Quando comportamentos (modais, toasts, datatables, calendários, selects) são **reimplementados** manualmente em vez de usar `FLUIGC.*`.
- Quando imagens próprias são usadas no lugar dos **ícones** do Style Guide.
- Quando uma **interação de UI** (arrastar-e-soltar, ordenar lista, redimensionar painel, seleção múltipla) é implementada manualmente (ex.: listeners de `mousedown`/`mousemove`) em vez de usar o **jQuery UI** já embutido na plataforma (`.draggable()`/`.sortable()`/`.droppable()`/`.resizable()`/`.selectable()`).
- Quando HTML repetido é montado por concatenação manual de string em vez de **Mustache** (já embutido).
- Quando uma **tabela com paginação, busca ou arrastar-e-soltar** é recriada do zero em vez de usar `FLUIGC.datatable` — ver [conventions.md](../../context/conventions.md), seção "Datatable em Widgets".

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código/CSS/markup alvo | Trecho ou arquivo com estilos/comportamentos customizados a substituir | sim |
| Contexto do componente | Função visual do elemento (botão, card, tabela, modal) para escolher o helper/componente adequado | não |
| Escopo do widget | Confirmação de que o elemento raiz tem a classe `fluig-style-guide` (escopo do Style Guide) | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [style-guide.md](../../context/style-guide.md) — **categorias do Style Guide** (CSS, Components, Forms, JavaScript plugins, Chart, Miscellaneous) e **classes helper `fs-*`** (scrollbar, posicionamento, display, flexbox com gap, tamanho, espaçamento responsivo com breakpoints, tipografia, cursor, background, cor de texto, formulário e utilitários gerais); além da API JavaScript pública (`FLUIGC`), sistema de grid (Bootstrap 3.4.1), ícones, helpers de comportamento (`FLUIGC.utilities`) e a regra de tema via `var(--fs-color-*)`. Inclui também a seção "Plugins embutidos (jQuery, jQuery UI, Mustache)" — disponibilidade do jQuery UI/Mustache já carregados pela plataforma, a **ordem de verificação obrigatória** (Style Guide → jQuery UI → Mustache → código próprio) e a tabela de interações comuns do jQuery UI (`draggable`/`sortable`/`droppable`/`resizable`/`selectable`).
- Referência completa das **classes helper `fs-*`**: [style-guide.md](../../context/style-guide.md#classes-helper-fs-).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a tarefa; o catálogo completo está no contexto:

- **Reutilizar componentes/classes do Style Guide** (botões, cards, alertas, tabelas, formulários, tipografia) antes de escrever CSS próprio → ver `style-guide.md`.
- ⚠️ **Proibido inventar classes helpers ou variáveis CSS.** Usar **somente** as classes documentadas em [style-guide.md](../../context/style-guide.md#classes-helper-fs-) e as variáveis documentadas em [style-guide.md](../../context/style-guide.md#theming-e-dark-mode-variáveis-css--fonte-de-verdade). Se não estiver nessas referências, não existe no Style Guide.
- Usar o **grid responsivo** (`.container`/`.row`/`.col-*`) em vez de posicionamento/medidas fixas → ver `style-guide.md`.
- Usar a **API pública `FLUIGC.*`** (ex.: `modal`, `toast`, `datatable`, `calendar`, `select`, `loading`) em vez de recriar comportamentos → ver `style-guide.md`.
- Usar **ícones do Style Guide** (`flaticon`, `FLUIGC.icons()`) em vez de imagens próprias → ver `style-guide.md`.
- Aproveitar **classes utilitárias** (espaçamento, alinhamento, visibilidade responsiva) e as **classes helper `fs-*`** do Style Guide — scrollbar, posicionamento, display, flexbox (alinhamento, justify, direção, gap), tamanho, espaçamento responsivo com breakpoints (`fs-mt-24`, `sm:fs-mt-16`), tipografia, cursor, background, cor de texto e utilitários gerais; referência completa em [style-guide.md](../../context/style-guide.md#classes-helper-fs-) → ver `style-guide.md`.
- Manter cores de tema via `var(--fs-color-*)` (sem hexadecimais fixos) ao ajustar estilos remanescentes → ver `style-guide.md`.
- Garantir a classe `fluig-style-guide` na raiz para que os estilos/componentes se apliquem no escopo do widget → ver `style-guide.md`.
- ⚠️ **Antes de recriar uma interação de UI do zero**, seguir a ordem obrigatória Style Guide (`FLUIGC.*`) → **jQuery UI** (`.draggable()`/`.sortable()`/`.droppable()`/`.resizable()`/`.selectable()`, já embutido) → **Mustache** (templating já embutido) → código próprio, só como último recurso → ver `style-guide.md`, seção "Plugins embutidos (jQuery, jQuery UI, Mustache)".

## Procedimento

1. Ler o código alvo e mapear cada bloco de CSS/markup próprio e cada comportamento/interação reimplementado (incluindo interações de UI como arrastar, ordenar, redimensionar).
2. Identificar o **recurso equivalente** consultando `style-guide.md`, nesta ordem: componente/classe do Style Guide (`FLUIGC.*`, grid, ícone) → interação do **jQuery UI** já embutido → **Mustache** já embutido (para montagem de HTML repetido a partir de dados).
3. Substituir o CSS/markup próprio pelas classes/componentes oficiais, os comportamentos manuais pelos helpers `FLUIGC.*`, e as interações de UI recriadas manualmente (ex.: listeners de mouse) pela interação equivalente do jQuery UI.
4. Converter layouts com medidas fixas para o **grid responsivo** e trocar imagens próprias por ícones do Style Guide quando aplicável.
5. Remover o CSS/JS próprio que ficou redundante; nos estilos remanescentes, usar `var(--fs-color-*)` e classes utilitárias.
6. Confirmar o escopo (`fluig-style-guide` na raiz) e validar o resultado com o checklist abaixo, preservando o comportamento.

## Saída Esperada

Código que reutiliza **helpers, componentes, grid, ícones e utilitários do Fluig Style Guide**, com CSS próprio reduzido ao mínimo necessário, comportamento preservado, consistência visual e adaptação automática ao tema. Em conformidade com `context/style-guide.md`.

## Exemplo de Uso

Antes (CSS próprio recriando um botão, com cor fixa):

```html
<!-- ❌ botão recriado manualmente em vez do componente do Style Guide -->
<a class="my-custom-btn" onclick="save()">Salvar</a>
```

```css
.my-custom-btn {
  display: inline-block;
  padding: 6px 12px;
  background-color: #0645ad;
  color: #ffffff;
  border-radius: 4px;
}
```

Depois (classes do Style Guide; sem CSS próprio; cor pelo tema):

```html
<!-- ✅ componente oficial: consistente e adaptado ao tema, sem CSS extra -->
<button type="button" class="btn btn-primary" data-save>
  ${i18n.getTranslation('action.save')}
</button>
```

Antes (drag-and-drop de um Kanban reimplementado com listeners manuais):

```javascript
// ❌ interação de arrastar-e-soltar recriada do zero com eventos de mouse
card.addEventListener('mousedown', function(e) { /* ... */ });
document.addEventListener('mousemove', function(e) { /* calcula posição manualmente */ });
document.addEventListener('mouseup', function(e) { /* detecta coluna de destino */ });
```

```javascript
// ✅ jQuery UI já embutido na plataforma — sem import adicional
// Escopar ao container da instância (nunca seletor global): buscar dentro da
// raiz do widget com this.DOM.find(...) para não afetar outras instâncias do
// mesmo widget na mesma página (ver conventions.md). Dentro de um método do
// SuperWidget.extend({}), use `this` direto — sem `var ctx = this;`.
this.DOM.find('.kanban-card').draggable({
  revert: 'invalid',
  containment: this.DOM.find('.kanban-board')
});

this.DOM.find('.kanban-column').droppable({
  accept: '.kanban-card',
  drop: (event, ui) => {
    // arrow não altera o `this` do widget; o elemento da coluna vem de event.target
    ui.draggable.appendTo(event.target);
    // persistir a nova coluna do card via API pública (dataset/REST)
  }
});
```

> Documentação completa das opções/eventos: [api.jqueryui.com](https://api.jqueryui.com/draggable/)
> e [api.jqueryui.com/droppable](https://api.jqueryui.com/droppable/).

## Checklist de Validação

- [ ] CSS/markup próprio substituído por componentes/classes do Style Guide quando há equivalente.
- [ ] Layouts usam o grid responsivo em vez de posicionamento/medidas fixas.
- [ ] Comportamentos usam `FLUIGC.*` em vez de implementações manuais.
- [ ] Interações de UI (arrastar, ordenar, redimensionar, selecionar) usam o **jQuery UI** já embutido em vez de listeners de mouse implementados manualmente.
- [ ] Ícones do Style Guide no lugar de imagens próprias quando aplicável.
- [ ] CSS remanescente sem hexadecimais fixos (usa `var(--fs-color-*)`); raiz com `fluig-style-guide`.
- [ ] Comportamento e consistência visual preservados.
