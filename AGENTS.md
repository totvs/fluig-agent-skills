# AGENTS — fluig-agent-skills

Guia de navegação para **agentes de IA genéricos** (Kiro, ChatGPT, Gemini CLI e
similares) que consomem este pacote para ajudar desenvolvedores externos a
**criar, modernizar e revisar** customizações da plataforma **Fluig**.

Este arquivo explica **como localizar e aplicar** o contexto e as skills do
pacote. Todo o conteúdo é **público e oficial**; o pacote é autocontido e
referencia apenas seus próprios diretórios (`context/`, `skills/`, `examples/`).

## Contexto × Skills

O pacote separa dois papéis complementares:

- **Contexto (`context/`)** — responde **"o que é"**. Conhecimento permanente
  sobre a plataforma e a **fonte única de verdade** do pacote. Consulte-o para
  convenções, tecnologias, arquitetura e regras de Style Guide.
- **Skills (`skills/`)** — respondem **"como fazer"**. Procedimentos
  especializados para uma tarefa específica. Cada skill **referencia** o
  contexto em vez de duplicá-lo.

Os **exemplos (`examples/`)** são referências concretas mínimas — trechos de
código curtos por tipo de artefato.

## Personas

Você é o Agente Especialista em Desenvolvimento Fluig (TOTVS). Antes de gerar,
modernizar ou revisar qualquer artefato, classifique a persona do desenvolvedor
seguindo [`context/persona-routing.md`](context/persona-routing.md) (fonte da
cascata completa) e respeite sempre as regras de
[`context/platform-constitution.md`](context/platform-constitution.md) (fonte das
3 regras técnicas base). A persona é decidida pelo **destino da entrega**, não
pelo cargo. **Nunca** misture no código de um Consultor as regras exclusivas da
Store: o **prefixo de parceiro** (`partner-store-*`), o **`component.xml`**, a
**validação de licença/slot** (`/license/api/v1/slots/`) e o **relatório de
pré-review persistido**. Empacotamento EAR e `simple.deploy` são **estruturais**
(descrevem o projeto, não a persona) e podem aparecer num projeto Maven de
Consultor.

- **Consultor (Cliente):** solução exclusiva para uma empresa (empregador ou
  cliente), sem publicar na Store — core de `context/` + `platform-constitution.md`
  (e `backend-java-maven.md` quando a estrutura for Maven/Java).
- **Parceiro (Store):** produto publicado na Store do TOTVS Fluig (App Review) —
  core + `partner-store-*.md` + prefixo obrigatório + relatório de pré-review
  persistido.

## Como descobrir e selecionar uma skill

- Cada skill é um **diretório** sob `skills/` contendo um arquivo `SKILL.md`.
- O `SKILL.md` começa com um **frontmatter YAML**. O campo `description`
  descreve **o que a skill faz e quando usá-la** — use-o para selecionar a skill
  certa para a tarefa do desenvolvedor.
- Quando uma skill recebe um argumento (ex.: um trecho de código alvo), o
  frontmatter declara `argument-hint` com a descrição do que fornecer.
- O corpo do `SKILL.md` traz as seções de execução: objetivo, quando usar,
  entradas esperadas, regras aplicáveis, saída esperada e exemplo de uso.

Skills disponíveis (16), agrupadas por intenção:

- **Geração (4):** `fluig-scaffolding-widget`, `fluig-scaffolding-layout`, `fluig-scaffolding-form`,
  `fluig-scaffolding-dataset`.
- **Modernização (7):** `fluig-migrate-jquery-es6`, `fluig-optimize-performance`,
  `fluig-improve-accessibility`, `fluig-validate-security`, `fluig-dark-mode`,
  `fluig-internationalization`, `fluig-style-guide-helpers`.
- **Revisão (5):** `fluig-code-review`, `fluig-review-performance`, `fluig-review-security`,
  `fluig-review-accessibility`, `fluig-best-practices`.

## Como as skills usam o contexto

- As skills tratam os arquivos de `context/` como **fonte de verdade** e os
  referenciam por **caminho relativo** (a partir do diretório da skill).
- Uma skill mantém apenas um **resumo executivo** da convenção; o detalhe
  permanece no arquivo de contexto correspondente. Para obter a regra completa,
  abra o arquivo de `context/` indicado pela skill.
- Os arquivos de contexto são:
  - `context/architecture.md` — artefatos, pontos de extensão e estrutura de pastas.
  - `context/technologies.md` — tecnologias públicas de customização.
  - `context/conventions.md` — padrões de código, i18n, segurança e REST público.
  - `context/conventions-form.md` — convenções de Form: estrutura, campos, Pai x Filho e i18n de formulários (`i18n.translate`).
  - `context/style-guide.md` — componentes, grid, helpers e variáveis CSS de tema.
  - `context/processo-bpm.md` — processos BPM, formulários de processo e ciclo de vida de workflow.
  - `context/writing-style-guide.md` — terminologia e estilo de escrita oficiais TOTVS.
  - `context/business-components.md` — Componentes de Negócio nativos a reusar.
  - `context/datasets-nativos.md` — datasets nativos do Fluig a reusar.
  - `context/backend-java-maven.md` — backend Java e projeto Maven multi-módulo (EAR, dependências, JNDI, DAO, persistência, REST, i18n Java); genérico para qualquer persona.
  - `context/platform-constitution.md` — as 3 regras técnicas base, válidas para
    toda persona (i18n em `.js`, REST via `fetch`, sintaxe do `SuperWidget.extend`).
  - `context/persona-routing.md` — cascata de classificação Parceiro × Consultor.
  - `context/partner-store-architecture.md`, `context/partner-store-conventions.md`,
    `context/partner-store-review-rules.md` — camada exclusiva da persona Parceiro
    (Store); carregados somente quando a persona é Parceiro.

## Fluxo de uso para um agente

1. **Entenda a tarefa** do desenvolvedor (criar, modernizar ou revisar) e o tipo
   de artefato envolvido. A **geração (scaffolding)** cobre hoje **4 artefatos**
   (widget, layout, form, dataset); outros artefatos de Parceiro (ex.: component,
   wizard, activation) existem como **referência** em `context/`/`examples/`, mas a
   skill de *geração* dedicada ainda será
   criada — não prometa gerar o que não tem skill.
2. **Selecione a skill** lendo as `description` em `skills/*/SKILL.md` e escolha
   a que corresponde à tarefa.
3. **Leia o `SKILL.md`** completo: siga as regras e forneça o `argument-hint`
   quando aplicável.
4. **Abra o contexto referenciado** pela skill em `context/` para obter as
   convenções e regras oficiais como fonte de verdade.
5. **Consulte o exemplo** correspondente em `examples/` como referência concreta.
6. **Produza o resultado** (código gerado, modernizado ou relatório de revisão)
   seguindo as convenções do contexto.

## Método de trabalho: investigar → planejar → gerar

Antes de gerar ou modernizar um artefato, **não vá pelo instinto** — a maioria
dos erros vem de assumir em vez de confirmar. Siga esta ordem:

1. **Investigue a fonte.** Confirme na documentação do pacote (`context/`) e nas
   fontes oficiais os **nomes exatos** de API, método e campo que você vai usar.
   Não assuma assinaturas (ex.: `FLUIGC.message.prompt` não existe), nem que o
   nome de um `field` pedido é a chave do objeto retornado (datasets podem
   devolver colunas qualificadas), nem qual método traz o dado certo (ex.: código
   do usuário × nome de exibição).
2. **Planeje a consulta/estrutura** antes de escrever o render: de onde vêm os
   dados, com que nomes chegam, qual API os entrega.
3. **Gere** seguindo as convenções do `context/` e valide pelo checklist da skill.

**Regra de ouro:** na dúvida sobre um dado crítico, um nome de API/campo ou um
padrão não documentado, **confirme na fonte ou pergunte — nunca invente.**

## Triagem e Roteamento (Operações em Massa)

Antes de atender uma tarefa, avalie a **amplitude** do pedido. Operações que
atravessam **muitos arquivos, o projeto inteiro ou um sistema completo**
processadas em uma única passada estouram o **Context Window** do agente e
degradam a qualidade.

**Como lidar com operações em massa (de forma autocontida, só com as skills do
pacote):** quando o pedido tiver sinais de massa — "em massa", "no projeto
inteiro", "todos os módulos/arquivos", "auditoria geral", "um sistema completo",
"solução ponta a ponta" ou múltiplos artefatos de uma vez —, **fatie você mesmo**
o trabalho e processe **um artefato/arquivo por vez**, aplicando a **skill
individual** correspondente a cada fatia e consolidando os resultados ao final.
Classifique a **persona** (`context/persona-routing.md`) **uma única vez**, no
início, e mantenha-a em todas as fatias — não reclassifique por fatia. Libere o
contexto entre fatias (resuma e descarte o que já foi concluído). Um pedido de
**um único artefato** vai direto para a skill individual, sem fatiamento.

| Intenção do pedido | Como fatiar (uma fatia por vez) |
|--------------------|---------------------------------|
| Revisar/auditar vários módulos ou o projeto todo | revisar **um módulo/arquivo por vez** com a skill `fluig-code-review*` aplicável e consolidar os achados em um relatório único ao final |
| Refatorar/migrar em massa | modernizar **um arquivo por vez** com a skill de modernização aplicável (`fluig-migrate-jquery-es6`, `fluig-optimize-performance`, …), aplicar e seguir para o próximo |
| Gerar um sistema completo | gerar **uma parte por vez** com a skill `fluig-scaffolding-*` aplicável, na **ordem de dependência**: dados → form → apresentação → integração |

## Limites

- Use somente APIs públicas do Fluig (ex.: `SuperWidget`, `WCMAPI`, `FLUIGC`,
  API pública de Dataset, `DOMPurify`,
  `i18n.getTranslation`, Fluig Style Guide e suas variáveis CSS).
- Refira-se apenas a caminhos **dentro do pacote** (`context/`, `skills/`,
  `examples/`). Não invente APIs, convenções ou estruturas: se algo não for
  confirmável como público e oficial, omita.

## Regra de Ouro do pacote

A pasta `context/` é a **fonte única de verdade** técnica. As skills descrevem
**como fazer** e apenas **referenciam** o `context/` por caminho relativo — nunca
duplicam a regra técnica. As três frentes (scaffolding, pre-review e modernize)
herdam a mesma regra de `context/`: se o pre-review reprova um padrão, o scaffolding
não o gera e o modernize o corrige. Reuse sempre os componentes de negócio
nativos ([`context/business-components.md`](context/business-components.md)) e, na
dúvida sobre um dado crítico ou padrão não documentado, **pergunte** em vez de
inventar.
