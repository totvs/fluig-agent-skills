---
name: fluig-style-guide-helpers
description: Substitui CSS customizado e comportamentos recriados manualmente por helpers, componentes, grid e classes utilitárias do Fluig Style Guide (FLUIGC e Bootstrap 3.4.1), reduzindo código próprio e garantindo consistência visual e adaptação automática ao tema. Use quando o desenvolvedor pedir para trocar estilos/markup customizados por recursos oficiais do Style Guide ou simplificar CSS próprio reutilizando o design system.
argument-hint: o código/CSS/markup alvo a substituir por helpers e componentes do Style Guide
---

# Substituição de CSS Customizado por Helpers do Style Guide

Esta skill substitui CSS/markup próprio por recursos do Fluig Style Guide; ela **não duplica** o catálogo. As **categorias do Style Guide** (CSS, Components, Forms, JavaScript plugins, Chart, Miscellaneous) e as **famílias de classes helper `fs-*`** vivem em `context/style-guide.md`, que é a fonte única de verdade referenciada abaixo.

## Objetivo

Substituir, com responsabilidade única, **CSS customizado e comportamentos recriados manualmente por helpers, componentes, grid e classes utilitárias do Fluig Style Guide**, reduzindo código próprio e garantindo consistência visual e adaptação automática ao tema, sem alterar o comportamento observável.

## Quando Usar

- Quando há **CSS próprio** que recria botões, cards, alertas, tabelas, formulários ou tipografia já oferecidos pelo Style Guide.
- Quando layouts usam **posicionamento/medidas fixas** em vez do grid responsivo.
- Quando comportamentos (modais, toasts, datatables, calendários, selects) são **reimplementados** manualmente em vez de usar `FLUIGC.*`.
- Quando imagens próprias são usadas no lugar dos **ícones** do Style Guide.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código/CSS/markup alvo | Trecho ou arquivo com estilos/comportamentos customizados a substituir | sim |
| Contexto do componente | Função visual do elemento (botão, card, tabela, modal) para escolher o helper/componente adequado | não |
| Escopo do widget | Confirmação de que o elemento raiz tem a classe `fluig-style-guide` (escopo do Style Guide) | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [style-guide.md](../../context/style-guide.md) — **categorias do Style Guide** (CSS, Components, Forms, JavaScript plugins, Chart, Miscellaneous) e **classes helper `fs-*`** (scrollbar, posicionamento, display, flexbox com gap, tamanho, espaçamento responsivo com breakpoints, tipografia, cursor, background, cor de texto, formulário e utilitários gerais); além da API JavaScript pública (`FLUIGC`), sistema de grid (Bootstrap 3.4.1), ícones, helpers de comportamento (`FLUIGC.utilities`) e a regra de tema via `var(--fs-color-*)`.
- Referência completa das **classes helper `fs-*`**: `references/helpers-and-variables-css/helper-classes.md`.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a tarefa; o catálogo completo está no contexto:

- **Reutilizar componentes/classes do Style Guide** (botões, cards, alertas, tabelas, formulários, tipografia) antes de escrever CSS próprio → ver `style-guide.md`.
- ⚠️ **Proibido inventar classes helpers ou variáveis CSS.** Usar **somente** as classes documentadas em `references/helpers-and-variables-css/helper-classes.md` e as variáveis documentadas em `references/helpers-and-variables-css/css-variables.md`. Se não estiver nessas referências, não existe no Style Guide.
- Usar o **grid responsivo** (`.container`/`.row`/`.col-*`) em vez de posicionamento/medidas fixas → ver `style-guide.md`.
- Usar a **API pública `FLUIGC.*`** (ex.: `modal`, `toast`, `datatable`, `calendar`, `select`, `loading`) em vez de recriar comportamentos → ver `style-guide.md`.
- Usar **ícones do Style Guide** (`flat`/`animalia`, `FLUIGC.icons()`) em vez de imagens próprias → ver `style-guide.md`.
- Aproveitar **classes utilitárias** (espaçamento, alinhamento, visibilidade responsiva) e as **classes helper `fs-*`** do Style Guide — scrollbar, posicionamento, display, flexbox (alinhamento, justify, direção, gap), tamanho, espaçamento responsivo com breakpoints (`fs-mt-24`, `sm:fs-mt-16`), tipografia, cursor, background, cor de texto e utilitários gerais; referência completa em `references/helpers-and-variables-css/helper-classes.md` → ver `style-guide.md`.
- Manter cores de tema via `var(--fs-color-*)` (sem hexadecimais fixos) ao ajustar estilos remanescentes → ver `style-guide.md`.
- Garantir a classe `fluig-style-guide` na raiz para que os estilos/componentes se apliquem no escopo do widget → ver `style-guide.md`.

## Procedimento

1. Ler o código alvo e mapear cada bloco de CSS/markup próprio e cada comportamento reimplementado.
2. Identificar o **recurso equivalente** do Style Guide (componente/classe, item do grid, helper `FLUIGC.*` ou ícone) consultando `style-guide.md`.
3. Substituir o CSS/markup próprio pelas classes/componentes oficiais e os comportamentos manuais pelos helpers `FLUIGC.*`.
4. Converter layouts com medidas fixas para o **grid responsivo** e trocar imagens próprias por ícones do Style Guide quando aplicável.
5. Remover o CSS próprio que ficou redundante; nos estilos remanescentes, usar `var(--fs-color-*)` e classes utilitárias.
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

## Checklist de Validação

- [ ] CSS/markup próprio substituído por componentes/classes do Style Guide quando há equivalente.
- [ ] Layouts usam o grid responsivo em vez de posicionamento/medidas fixas.
- [ ] Comportamentos usam `FLUIGC.*` em vez de implementações manuais.
- [ ] Ícones do Style Guide no lugar de imagens próprias quando aplicável.
- [ ] CSS remanescente sem hexadecimais fixos (usa `var(--fs-color-*)`); raiz com `fluig-style-guide`.
- [ ] Comportamento e consistência visual preservados.
