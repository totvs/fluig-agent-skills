---
name: improve-accessibility
description: Melhora a acessibilidade de markup/UI de customizações Fluig — HTML semântico, rótulos, navegação por teclado, foco visível, ARIA, texto alternativo e contraste de cor — preservando comportamento, internacionalização e compatibilidade com a plataforma. Use quando o desenvolvedor pedir para tornar acessível um trecho de markup ou componente de interface (widget, layout, Custom Element).
argument-hint: o markup/componente alvo a tornar acessível (trecho ou arquivo selecionado), idealmente com o contexto de uso
---

# Melhoria de Acessibilidade de Frontend Fluig

Esta skill melhora a acessibilidade de markup/UI Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Objetivo

Melhorar, com responsabilidade única, a **acessibilidade do frontend Fluig** — semântica, rótulos, teclado/foco, ARIA, texto alternativo e contraste — aplicando boas práticas públicas alinhadas às WCAG, sem alterar o comportamento observável, a i18n nem a compatibilidade com a plataforma.

## Quando Usar

- Quando um markup usa `div`/`span` genéricos no lugar de elementos semânticos.
- Quando campos de formulário **não têm rótulos associados** ou botões só têm ícone, sem nome acessível.
- Quando a interface **não é navegável por teclado** ou o foco não é visível/gerenciado (ex.: modais).
- Quando há imagens/ícones informativos **sem texto alternativo** ou cores com contraste insuficiente.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Markup/componente alvo | Trecho ou arquivo de UI a tornar acessível (widget, layout `.ftl`, Custom Element) | sim |
| Contexto de uso | Onde a UI aparece e como é operada (ex.: modal, lista, formulário) | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — HTML semântico, convenções de markup e i18n (texto visível sempre via `${i18n.getTranslation('chave')}`).
- [style-guide.md](../../context/style-guide.md) — componentes acessíveis do Style Guide, tokens de cor/contraste via `var(--fs-color-*)` e conjuntos de ícones.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a melhoria; o detalhe está no contexto. Boas práticas públicas, genéricas e alinhadas às WCAG:

- **HTML semântico** (`header`, `nav`, `main`, `button`, `label`) em vez de `div`/`span` genéricos → ver `conventions.md`.
- **Rótulos associados** a campos (`label`/`for`, ou `aria-label` quando não há rótulo visível), com texto via i18n → ver `conventions.md`.
- **Navegação por teclado e foco visível:** ordem de tabulação lógica e foco gerenciado em modais/diálogos.
- **Atributos ARIA apenas quando necessário** (roles e `aria-*`) — semântica nativa tem prioridade sobre ARIA.
- **Texto alternativo** em imagens/ícones informativos; ícones puramente decorativos ficam ocultos para a tecnologia assistiva.
- **Contraste de cor adequado** usando as variáveis do Style Guide (`var(--fs-color-*)`) — sem hexadecimal fixo → ver `style-guide.md`.
- **Estados comunicados de forma acessível** (ex.: `aria-expanded`, `aria-selected`, `aria-checked`).
- **Reutilizar componentes acessíveis** do Style Guide em vez de recriar comportamentos → ver `style-guide.md`.

## Procedimento

1. Avaliar o markup e identificar as barreiras de acessibilidade (semântica ausente, campos sem rótulo, falta de navegação por teclado/foco, ícones sem nome, contraste insuficiente).
2. Aplicar **HTML semântico** e corrigir a estrutura antes de recorrer a ARIA.
3. Associar **rótulos/nomes acessíveis** aos controles e garantir **navegação por teclado e foco visível** (foco gerenciado em modais).
4. Adicionar **ARIA e texto alternativo** apenas onde a semântica nativa não basta; ajustar **contraste** usando `var(--fs-color-*)`.
5. Manter a **i18n** em todos os textos acessíveis (rótulos, `aria-label`, `alt`) via `${i18n.getTranslation('chave')}`.
6. Validar o resultado com o checklist abaixo antes de entregar, anotando as melhorias aplicadas.

> **Nota importante:** a conformidade WCAG completa exige **teste manual com tecnologias assistivas** (leitores de tela, navegação só por teclado) e **revisão por especialista**. Esta skill **auxilia** a tornar a UI mais acessível, mas **não garante** conformidade total por si só.

## Saída Esperada

Markup acessível, com o **comportamento original preservado** e uma nota curta das melhorias aplicadas (qual barreira foi tratada e como), mantendo i18n e compatibilidade com a plataforma.

## Exemplo de Uso

Trecho ilustrativo: botão somente com ícone recebe nome acessível via i18n.

```html
<!-- Antes — botão sem nome acessível (só ícone) -->
<button class="btn">
  <span class="icon icon-trash" aria-hidden="true"></span>
</button>
```

```html
<!-- Depois — aria-label com texto via i18n; ícone decorativo oculto -->
<button class="btn" aria-label="${i18n.getTranslation('action.delete')}">
  <span class="icon icon-trash" aria-hidden="true"></span>
</button>
```

## Checklist de Validação

- [ ] Elementos semânticos usados no lugar de `div`/`span` genéricos.
- [ ] Campos com rótulo associado (`label`/`for`) ou nome acessível (`aria-label`).
- [ ] Navegável por teclado, com ordem de tabulação lógica e foco visível/gerenciado.
- [ ] Texto alternativo em imagens/ícones informativos; ARIA usado apenas quando necessário.
- [ ] Contraste adequado via `var(--fs-color-*)`; sem hexadecimal fixo.
- [ ] Textos acessíveis (rótulos, `aria-label`, `alt`) via i18n; comportamento preservado.
