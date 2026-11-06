---
name: fluig-review-accessibility
description: Revisa a acessibilidade de markup/UI de customizações Fluig (HTML semântico, rótulos, navegação por teclado, foco visível, ARIA, texto alternativo e contraste de cor) e produz achados classificados por severidade alinhados às WCAG, cada um referenciando a regra do arquivo de contexto. Use quando o desenvolvedor pedir uma revisão de acessibilidade de um trecho de markup ou componente antes de merge, sem reescrever o código.
argument-hint: o markup/componente alvo da revisão de acessibilidade (trecho ou arquivo selecionado), idealmente com o contexto de uso
---

# Revisão de Acessibilidade de Frontend Fluig

Esta skill revisa a acessibilidade de markup/UI Fluig e emite achados por severidade; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo. A skill **não reescreve** o código.

## Passo 0 — Persona

Antes de revisar, classifique a persona do desenvolvedor seguindo a cascata em
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Se restar ambígua, pare e pergunte antes de
continuar. Emita `Persona: <Parceiro|Consultor> (motivo)` antes do relatório —
a persona determina a camada de contexto carregada (ver "Contexto de
Referência") e a forma de saída da revisão (ver "Saída Esperada").

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

### Core (sempre)

- [conventions.md](../../context/conventions.md) — HTML semântico, convenções de markup e i18n (texto visível sempre via i18n: `[=i18n.getTranslation('chave')]` em `.js` e `${i18n.getTranslation('chave')}` em `.ftl`).
- [style-guide.md](../../context/style-guide.md) — componentes acessíveis do Style Guide, tokens de cor/contraste via `var(--fs-color-*)` e conjuntos de ícones.
- [platform-constitution.md](../../context/platform-constitution.md) — regras invioláveis de i18n e HTTP.

### Parceiro (somente se persona = Parceiro)

- [partner-store-review-rules.md](../../context/partner-store-review-rules.md) — cabeçalho de pré-review ([§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) e persistência do relatório ([§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a revisão, alinhado às **WCAG 2.1 AA** (fonte
pública: W3C). Cada achado cita a diretriz WCAG aplicável; **quando** houver regra
correspondente no `context/` (ex.: i18n em textos visíveis, contraste via tokens
do Style Guide), referencie-a também.

> **Nota de fonte:** o `context/` ainda **não tem uma seção dedicada de
> acessibilidade** no core — por isso as regras abaixo se ancoram diretamente na
> **WCAG 2.1 AA** (W3C). A criação de uma seção "Acessibilidade" no core está
> pendente (ADR-16, em avaliação com o time de produto). Até lá, **não** exija que
> cada achado aponte uma seção de a11y do `context/`: baste a diretriz WCAG, mais
> a regra de `context/` **quando ela de fato existir** (i18n, contraste).

- **HTML semântico** (`header`, `nav`, `main`, `button`, `label`) em vez de `div`/`span` genéricos → WCAG 1.3.1 / 4.1.2. O texto visível segue a i18n de `conventions.md`.
- **Rótulos/nome acessível** em campos e botões (`label`/`for`, `aria-label`), com texto via i18n → WCAG 1.3.1 / 2.4.6 / 4.1.2; i18n em `conventions.md`.
- **Navegação por teclado e foco visível:** ordem de tabulação lógica e foco gerenciado em modais → WCAG 2.1.1 / 2.4.3 / 2.4.7.
- **ARIA apenas quando necessário** — semântica nativa tem prioridade sobre ARIA → WCAG 4.1.2 (regra "primeira regra do ARIA").
- **Texto alternativo** em imagens/ícones informativos; decorativos ocultos para a tecnologia assistiva (`aria-hidden`) → WCAG 1.1.1.
- **Contraste adequado** via `var(--fs-color-*)`; sem hexadecimal fixo → WCAG 1.4.3; tokens de cor em `style-guide.md`.
- **Estados comunicados** de forma acessível (`aria-expanded`, `aria-selected`, `aria-checked`) → WCAG 4.1.2.
- **Reutilizar componentes acessíveis** do Style Guide em vez de recriar comportamentos → ver `style-guide.md`.

## Escala de Severidade

Classifique **cada achado** em um destes níveis, considerando o impacto na operação por tecnologia assistiva.

> **Fonte da severidade.** Diferentemente dos eixos de segurança/performance, o
> `conventions.md` **não** tem tabela de classificação de acessibilidade — a
> severidade aqui segue o **impacto por tecnologia assistiva** (ancorado em
> **WCAG 2.1 AA**; ver ADR-16/A-D5-48). Onde o achado tocar um eixo que **tem**
> regra no core — i18n de texto visível (`conventions.md`) ou contraste de cor
> (`style-guide.md`) —, vale a classificação dessas seções.

| Severidade | Critério | Exemplos típicos |
|------------|----------|------------------|
| **Crítico** | Bloqueia o uso por teclado ou leitor de tela | Controle interativo sem nome acessível; funcionalidade só acessível por mouse; foco preso fora do modal |
| **Alto** | Barreira relevante que dificulta muito a operação | Campo de formulário sem rótulo associado; imagem informativa sem texto alternativo |
| **Médio** | Problema que degrada a experiência sem bloquear | Uso de `div`/`span` no lugar de elemento semântico; estado não comunicado via ARIA |
| **Baixo** | Ajuste menor de consistência/acessibilidade | Contraste no limite do aceitável; ícone decorativo sem `aria-hidden` |

## Procedimento

1. Identificar o tipo de componente e como ele é operado (modal, lista, formulário).
2. Avaliar os eixos: semântica, rótulos/nome acessível, navegação por teclado/foco, ARIA, texto alternativo, contraste e estados.
3. Para cada barreira, registrar um achado com localização, descrição, **severidade** e a **diretriz WCAG** correspondente (ex.: WCAG 1.3.1, 2.4.6, 4.1.2); quando houver regra equivalente no `context/` (i18n, contraste), citá-la também.
4. Recomendar a correção objetiva, apontando a skill `fluig-improve-accessibility`.
5. Consolidar os achados ordenados do mais grave ao menos grave.
6. Validar a revisão com o checklist abaixo antes de entregar.

> **Nota importante:** a conformidade WCAG completa exige **teste manual com tecnologias assistivas** (leitores de tela, navegação só por teclado) e **revisão por especialista**. Esta skill **auxilia** a identificar barreiras, mas **não garante** conformidade total por si só.

## Saída Esperada

Um **relatório de revisão de acessibilidade**, com **Resumo** (contagem de
achados por severidade e avaliação geral), **Achados** agrupados por severidade
(crítico → baixo; cada um com localização, descrição, severidade e a **regra de
contexto referenciada**) e **Recomendações** acionáveis, indicando a skill
`fluig-improve-accessibility`. A forma de entrega segue a persona (ver
`conventions.md` › Saída do review por persona):

- **Consultor:** o relatório é **gravado** em `review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo — análise de boas práticas para a customização do cliente, **sem** cabeçalho de pré-review e **sem** menção à Store ou ao App Review.
- **Parceiro (Store):** o relatório é um **pré-review preparatório** (não aprova,
  não substitui o App Review oficial), abre por um **cabeçalho de pré-review** e é
  **gravado** em `pre-review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo — a única
  escrita permitida. O **contrato completo** desse relatório (cabeçalho, nome do
  arquivo e modo somente leitura) é **canônico** em
  [§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação) / [§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)
  ([§ 32.1](../../context/partner-store-review-rules.md#321-modo-somente-leitura)) — siga-o de lá, esta skill não o duplica.

Fora esse cenário de Parceiro, a skill **não altera** o código — apenas diagnostica e recomenda.

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
  - Diretriz: WCAG 4.1.2 (Nome, Função, Valor) / 2.4.6 (Rótulos). Texto do rótulo via i18n (`conventions.md`).
  - Recomendação: adicionar `aria-label="${i18n.getTranslation('action.delete')}"` e `aria-hidden="true"` no ícone decorativo. Ver skill `fluig-improve-accessibility`.
```

## Checklist de Validação

- [ ] Os eixos foram percorridos (semântica, rótulos, teclado/foco, ARIA, texto alternativo, contraste, estados).
- [ ] Cada achado tem **severidade** atribuída conforme a escala (crítico/alto/médio/baixo).
- [ ] Cada achado cita a **diretriz WCAG** aplicável; quando existir regra equivalente no `context/` (i18n, contraste), ela é citada também. (Não exigir seção de a11y do `context/` enquanto o ADR-16 não criar uma.)
- [ ] O relatório está ordenado do mais grave ao menos grave e aponta a skill `fluig-improve-accessibility`.
- [ ] A nota sobre teste manual/WCAG foi considerada na avaliação geral.
- [ ] A persona foi classificada (Passo 0) e emitida como `Persona: <Parceiro|Consultor> (motivo)`.
- [ ] **Consultor:** o relatório foi **gravado** em `review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo, sem cabeçalho de pré-review e sem menção à Store/App Review.
- [ ] **Parceiro:** o relatório abre por um **cabeçalho de pré-review** (não aprova, não substitui o App Review oficial — `partner-store-review-rules.md` [§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) e foi **gravado** em `pre-review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo (`partner-store-review-rules.md` [§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).
- [ ] A revisão não alterou o código além do eventual `.md` de relatório do Parceiro — apenas diagnosticou e recomendou.
