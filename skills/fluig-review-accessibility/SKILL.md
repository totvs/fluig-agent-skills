---
name: fluig-review-accessibility
description: Revisa a acessibilidade de markup/UI de customizações Fluig (HTML semântico, rótulos, navegação por teclado, foco visível, ARIA, texto alternativo e contraste de cor) e produz achados classificados por severidade alinhados às WCAG, cada um referenciando a regra do arquivo de contexto. Use quando o desenvolvedor pedir uma revisão de acessibilidade de um trecho de markup ou componente antes de merge, sem reescrever o código.
argument-hint: o markup/componente alvo da revisão de acessibilidade (trecho ou arquivo selecionado), idealmente com o contexto de uso
---

# Revisão de Acessibilidade de Frontend Fluig

Esta skill revisa a acessibilidade de markup/UI Fluig e emite achados por severidade; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo. A skill **não reescreve** o código.

## Objetivo

Revisar, com responsabilidade única, a **acessibilidade do frontend Fluig** — semântica, rótulos, teclado/foco, ARIA, texto alternativo e contraste — identificando barreiras alinhadas às WCAG e produzindo um **relatório de achados classificados por severidade**, cada um vinculado à regra correspondente do arquivo de contexto. Para aplicar as correções, use a skill `fluig-improve-accessibility`.

## Quando Usar

- Antes de um merge, para uma revisão focada em acessibilidade de um widget, layout ou Custom Element.
- Quando o markup usa `div`/`span` genéricos no lugar de elementos semânticos.
- Quando campos não têm rótulos associados ou botões só têm ícone, sem nome acessível.
- Quando a interface pode não ser navegável por teclado ou o contraste pode ser insuficiente.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Markup/componente alvo | Trecho ou arquivo de UI a revisar (widget, layout `.ftl`, Custom Element) | sim |
| Contexto de uso | Onde a UI aparece e como é operada (ex.: modal, lista, formulário) | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — HTML semântico, convenções de markup e i18n (texto visível sempre via `${i18n.getTranslation('chave')}`).
- [style-guide.md](../../context/style-guide.md) — componentes acessíveis do Style Guide, tokens de cor/contraste via `var(--fs-color-*)` e conjuntos de ícones.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a revisão, alinhado às WCAG; o detalhe está no contexto. Cada achado deve citar a regra de origem.

- **HTML semântico** (`header`, `nav`, `main`, `button`, `label`) em vez de `div`/`span` genéricos → ver `conventions.md`.
- **Rótulos/nome acessível** em campos e botões (`label`/`for`, `aria-label`), com texto via i18n → ver `conventions.md`.
- **Navegação por teclado e foco visível:** ordem de tabulação lógica e foco gerenciado em modais.
- **ARIA apenas quando necessário** — semântica nativa tem prioridade sobre ARIA.
- **Texto alternativo** em imagens/ícones informativos; decorativos ocultos para a tecnologia assistiva (`aria-hidden`).
- **Contraste adequado** via `var(--fs-color-*)`; sem hexadecimal fixo → ver `style-guide.md`.
- **Estados comunicados** de forma acessível (`aria-expanded`, `aria-selected`, `aria-checked`).
- **Reutilizar componentes acessíveis** do Style Guide em vez de recriar comportamentos → ver `style-guide.md`.

## Escala de Severidade

Classifique **cada achado** em um destes níveis, considerando o impacto na operação por tecnologia assistiva:

| Severidade | Critério | Exemplos típicos |
|------------|----------|------------------|
| **Crítico** | Bloqueia o uso por teclado ou leitor de tela | Controle interativo sem nome acessível; funcionalidade só acessível por mouse; foco preso fora do modal |
| **Alto** | Barreira relevante que dificulta muito a operação | Campo de formulário sem rótulo associado; imagem informativa sem texto alternativo |
| **Médio** | Problema que degrada a experiência sem bloquear | Uso de `div`/`span` no lugar de elemento semântico; estado não comunicado via ARIA |
| **Baixo** | Ajuste menor de consistência/acessibilidade | Contraste no limite do aceitável; ícone decorativo sem `aria-hidden` |

## Procedimento

1. Identificar o tipo de componente e como ele é operado (modal, lista, formulário).
2. Avaliar os eixos: semântica, rótulos/nome acessível, navegação por teclado/foco, ARIA, texto alternativo, contraste e estados.
3. Para cada barreira, registrar um achado com localização, descrição, **severidade** e a **regra de contexto** correspondente (`conventions.md`/`style-guide.md`, com a seção).
4. Recomendar a correção objetiva, apontando a skill `fluig-improve-accessibility`.
5. Consolidar os achados ordenados do mais grave ao menos grave.
6. Validar a revisão com o checklist abaixo antes de entregar.

> **Nota importante:** a conformidade WCAG completa exige **teste manual com tecnologias assistivas** (leitores de tela, navegação só por teclado) e **revisão por especialista**. Esta skill **auxilia** a identificar barreiras, mas **não garante** conformidade total por si só.

## Saída Esperada

Um **relatório de revisão de acessibilidade** contendo:

- **Resumo** com a contagem de achados por severidade e a avaliação geral.
- **Achados** agrupados por severidade (crítico → baixo); cada um com localização, descrição, severidade e a **regra de contexto referenciada**.
- **Recomendações** acionáveis por achado, indicando a skill `fluig-improve-accessibility`.

A skill **não altera** o código — apenas diagnostica e recomenda.

## Exemplo de Uso

Trecho revisado e achado correspondente.

```html
<!-- Código revisado (trecho) -->
<button class="btn">
  <span class="icon icon-trash"></span>
</button>
```

```markdown
## Achados

### 🔴 Crítico
- **Nome acessível — linha 1:** botão só com ícone, sem nome acessível para leitor de tela.
  - Regra: `conventions.md` › HTML semântico e i18n.
  - Recomendação: adicionar `aria-label="${i18n.getTranslation('action.delete')}"` e `aria-hidden="true"` no ícone decorativo. Ver skill `fluig-improve-accessibility`.
```

## Checklist de Validação

- [ ] Os eixos foram percorridos (semântica, rótulos, teclado/foco, ARIA, texto alternativo, contraste, estados).
- [ ] Cada achado tem **severidade** atribuída conforme a escala (crítico/alto/médio/baixo).
- [ ] Cada achado **referencia a regra** do arquivo de contexto (`conventions.md`/`style-guide.md`, com a seção).
- [ ] O relatório está ordenado do mais grave ao menos grave e aponta a skill `fluig-improve-accessibility`.
- [ ] A nota sobre teste manual/WCAG foi considerada na avaliação geral.
- [ ] A revisão não alterou o código — apenas diagnosticou e recomendou.
