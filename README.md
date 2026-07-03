# fluig-agent-skills

Pacote de **Agent Skills** para desenvolvimento de customizações da plataforma **Fluig**. Reúne, em um único lugar autocontido, o **conhecimento permanente** ("o que é") e os **procedimentos especializados** ("como fazer") que um agente de IA (Kiro, Claude Code, ChatGPT, Gemini CLI e similares) precisa para ajudar desenvolvedores externos a **criar, modernizar e revisar** código Fluig com qualidade.

Todo o conteúdo é baseado em **APIs, convenções e recursos públicos e oficiais** do Fluig, voltados à customização externa.

## Versão do Fluig

As skills foram **testadas com o Fluig 2.0.0 (Voyager) ou superior**. Para versões anteriores, APIs, convenções e recursos do Style Guide podem divergir — nesses casos, **considere revisão redobrada** do código gerado e valide sempre contra a documentação oficial da sua versão.

## ⚠️ Aviso legal

> **A TOTVS NÃO PODERÁ SER RESPONSABILIZADA EM QUALQUER CASO DE MAL FUNCIONAMENTO DE SEUS PRODUTOS, SERVIÇOS OU SOLUÇÕES DECORRENTE DA UTILIZAÇÃO DE CÓDIGO GERADO POR FERRAMENTAS DE INTELIGÊNCIA ARTIFICIAL. TODO CÓDIGO GERADO DEVERÁ SER ANALISADO, REVISADO, VALIDADO E TESTADO PELO USUÁRIO ANTES DE SUA UTILIZAÇÃO. AS INFORMAÇÕES E MATERIAIS DISPONIBILIZADOS TÊM CARÁTER ORIENTATIVO E NÃO SUBSTITUEM A DOCUMENTAÇÃO OFICIAL NEM AS DIRETRIZES ADQUIRIDAS DIRETAMENTE DOS CANAIS OFICIAIS DE SUPORTE DA TOTVS.**

## Propósito

O objetivo não é documentar o Fluig por completo, e sim oferecer um conjunto enxuto e especializado que:

- Concentra o conhecimento permanente da plataforma em `context/` (fonte única de verdade).
- Oferece skills focadas em `skills/`, cada uma com responsabilidade única.
- Aponta para exemplos mínimos de referência em `examples/`.

A filosofia central que organiza o pacote:

- **Contexto** responde **"o que é"** — conhecimento permanente sobre a plataforma. Vive em `context/` e é a fonte única de verdade.
- **Skills** respondem **"como fazer"** — procedimentos passo a passo para uma tarefa específica. Vivem em `skills/<nome>/SKILL.md` e são selecionadas pela `description` do seu frontmatter.
- **Exemplos** mostram **"como se parece"** — trechos de código mínimos de referência em `examples/`.

As skills **não duplicam** o conteúdo do contexto: elas o **referenciam** como fonte de verdade e mantêm apenas um resumo executivo do necessário para a tarefa.

## Estrutura

```text
fluig-agent-skills/
├── README.md, AGENTS.md, CLAUDE.md   # arquivos de entrada — "por onde começar"
├── context/                          # conhecimento permanente — "o que é"
│   ├── architecture.md               # artefatos, pontos de extensão, estrutura de pastas
│   ├── technologies.md               # tecnologias públicas (ES6+, libs client-side, runtime)
│   ├── conventions.md                # padrões de código, i18n, segurança, REST público
│   └── style-guide.md                # componentes, grid, helpers e variáveis CSS do Style Guide
├── skills/                           # procedimentos especializados — "como fazer"
│   └── <nome>/SKILL.md               # cada skill é um diretório com um SKILL.md
├── examples/                         # referências concretas mínimas — "como se parece"
│   ├── widget/
│   ├── layout/
│   ├── form/
│   └── dataset/
└── docs/                             # prompts de uso por skill — "como acionar"
    └── <nome>/README.md              # prompts de exemplo para acionar a skill
```

## Como usar

Fluxo de consumo por um agente de IA:

1. **Comece pela entrada.** Leia este `README.md` (ou `AGENTS.md` / `CLAUDE.md`, conforme o agente) para entender o propósito e a navegação do pacote.
2. **Selecione a skill.** Identifique a tarefa do desenvolvedor e escolha a skill cuja `description` (no frontmatter do `SKILL.md`) corresponde ao que fazer e quando usar.
3. **Leia o contexto.** A skill referencia os arquivos de `context/` relevantes como fonte de verdade — consulte-os para convenções, tecnologias e regras.
4. **Consulte os exemplos.** Use `examples/` como referência concreta mínima do artefato em questão.
5. **Produza o código** seguindo as convenções oficiais descritas no contexto.

## Compatível com várias ferramentas de IA

Este pacote **não é exclusivo de uma única ferramenta de IA**. Ele foi escrito no padrão aberto **Agent Skills** (pastas com `SKILL.md` + contexto e exemplos referenciados por caminho relativo), então funciona com qualquer agente de IA capaz de consumir esse tipo de material — GitHub Copilot, Claude Code, Kiro, ChatGPT, Gemini CLI e similares.

A única exigência é **adaptar a disposição das pastas à estrutura que cada ferramenta espera**. Os princípios que valem para todas:

- Mantenha `skills/`, `context/` e `examples/` **lado a lado**, preservando os **caminhos relativos** que as skills usam (ex.: `../../context/conventions.md`). Se os caminhos quebrarem, as skills não encontram a fonte de verdade.
- Posicione o `AGENTS.md` (ou o arquivo de instrução equivalente da ferramenta, como `CLAUDE.md`) no local que o agente lê primeiro — normalmente a **raiz do projeto** — e ajuste as referências de caminho conforme onde você colocou as pastas.
- Cada ferramenta descobre skills em locais próprios (veja a documentação do seu agente). Copie ou aponte o pacote para esse local mantendo a estrutura acima.

A seção a seguir detalha o exemplo do GitHub Copilot no VS Code; use-a como modelo e ajuste os caminhos para a sua ferramenta.

## Modelos de IA recomendados

A qualidade do resultado depende **diretamente** do modelo de IA usado pelo agente. Estas skills envolvem raciocínio sobre múltiplos arquivos, seguir convenções e gerar código correto — tarefas em que **modelos "básicos", pequenos ou econômicos tendem a entregar resultados ruins** (ignoram convenções, inventam APIs, quebram caminhos relativos).

Para bons resultados, prefira modelos de raciocínio de ponta. Sugestões (use a versão mais recente disponível de cada família):

- **Anthropic Claude** — Opus e Sonnet das gerações mais recentes (ex.: Claude Opus 4.x / Sonnet 4.x).
- **OpenAI GPT** — modelos de topo da linha GPT-5 / o-series de raciocínio.
- **Google Gemini** — Gemini 2.5 Pro ou superior.

Evite variantes "mini", "nano", "flash-lite", "instant" ou modelos antigos para estas tarefas — elas priorizam custo/velocidade em detrimento da precisão de que as skills dependem. Se o orçamento exigir um modelo menor, **revise o resultado com atenção redobrada** e valide sempre contra os arquivos de `context/`.

> A disponibilidade de cada modelo varia por ferramenta e plano. Consulte a documentação do seu agente para saber quais modelos ele oferece e como selecioná-los.

## Uso com VS Code + GitHub Copilot

O GitHub Copilot no VS Code suporta o padrão aberto **Agent Skills**: cada skill é uma pasta com um `SKILL.md`, descoberta automaticamente em locais fixos. Como o pacote já segue esse formato, basta posicioná-lo onde o Copilot procura.

O Copilot descobre **skills de projeto** em `.github/skills/` (também aceita `.claude/skills/` e `.agents/skills/`). Como as nossas skills referenciam os arquivos de `context/` e `examples/` por **caminho relativo** (ex.: `../../context/conventions.md`), o `context/` e o `examples/` precisam ficar em uma posição que preserve esses caminhos. A forma mais segura é replicar a estrutura `skills/` + `context/` + `examples/` lado a lado dentro de `.github/`.

Já o **`AGENTS.md`** é uma instrução de repositório (não é uma skill) e **deve ficar na raiz do projeto** (`seu-projeto/AGENTS.md`) — o Copilot usa o `AGENTS.md` mais próximo na árvore de diretórios, e a raiz é o local canônico e mais previsível:

```text
seu-projeto/
├── AGENTS.md                   # instrução de repositório — fica na RAIZ do projeto
└── .github/
    ├── copilot-instructions.md # instrução para o copilot 
    ├── skills/                 # copie o skills/ deste pacote
    │   └── <nome>/SKILL.md
    ├── context/                # copie o context/ deste pacote
    │   ├── architecture.md
    │   ├── technologies.md
    │   ├── conventions.md
    │   └── style-guide.md
    └── examples/               # copie o examples/ deste pacote
        ├── widget/
        ├── layout/
        ├── form/
        └── dataset/
```

Com essa disposição os links relativos das skills resolvem corretamente:

- De `.github/skills/<skill>/SKILL.md`, o caminho `../../context/conventions.md` resolve para `.github/context/conventions.md`.
- De um asset em `.github/skills/<skill>/assets/`, o caminho `../../../context/conventions.md` resolve para `.github/context/conventions.md`.

> **Atenção aos caminhos do `AGENTS.md`:** o `AGENTS.md` deste pacote referencia `context/`, `skills/` e `examples/` por caminho relativo. Ao colocá-lo na raiz com as pastas em `.github/`, ajuste essas referências para apontar para `.github/context/...`, `.github/skills/...` e `.github/examples/...`.

> **Importante:** o campo `name` no frontmatter de cada `SKILL.md` **deve ser igual ao nome da pasta** da skill (já é o caso neste pacote). Nomes divergentes fazem a skill falhar silenciosamente ao carregar.

### Passo a passo

1. Crie a pasta `.github/` no seu projeto (se ainda não existir).
2. Copie as pastas `skills/`, `context/` e `examples/` deste pacote para dentro de `.github/`.
3. No VS Code, abra o chat do Copilot e digite `/` — as skills aparecem como slash commands (ex.: `/fluig-scaffolding-widget`, `/fluig-code-review`). Você também pode rodar **Chat: Open Customizations** na paleta de comandos para visualizar e gerenciar as skills.
4. Invoque uma skill com contexto adicional, por exemplo: `/fluig-scaffolding-widget widget de notificações`.

> **Escopo de projeto vs. pessoal:** `.github/skills/` deixa as skills versionadas e isoladas no projeto — ideal para testes e para o time. Para reusar as skills em vários projetos, há também os locais pessoais (`~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/`); nesse caso, o `context/` e o `examples/` também precisam ficar em uma posição que preserve os caminhos relativos. Alternativamente, o setting `chat.agentSkillsLocations` permite apontar outras pastas de skills, mas ele não altera a resolução dos links para `context/` — por isso a estrutura lado a lado continua sendo o caminho mais seguro.

## Arquivos de contexto disponíveis

| Arquivo | Responde |
|---------|----------|
| `context/architecture.md` | O modelo conceitual dos artefatos (widget, layout, form, dataset), seus pontos de extensão públicos, o ciclo de vida visível ao código e a estrutura oficial de pastas/arquivos (incluindo o projeto Fluig Studio). |
| `context/technologies.md` | As tecnologias públicas de customização: ES6+, bibliotecas client-side (jQuery, Kendo UI, Bootstrap), Fluig Style Guide e o runtime de scripting server-side. |
| `context/conventions.md` | Padrões de código, convenções de widget, i18n, segurança via APIs públicas e chamadas REST públicas. |
| `context/style-guide.md` | Componentes, grid, helpers e utilitários do Fluig Style Guide, além das variáveis CSS de tema (`var(--fs-color-*)`). |

## Skills disponíveis

Skills agrupadas por intenção. Cada uma vive em `skills/<nome>/SKILL.md` e é selecionada pela sua `description`.

### Geração (scaffolding) — "criar do zero"

| Skill | O que faz |
|-------|-----------|
| `fluig-scaffolding-widget` | Gera o esqueleto de um Widget WCM com `SuperWidget.extend`. |
| `fluig-scaffolding-layout` | Gera o esqueleto de um Layout WCM com declaração de slots/regiões. |
| `fluig-scaffolding-form` | Gera o esqueleto de um Form (campos, view e eventos). |
| `fluig-scaffolding-dataset` | Gera o esqueleto de um Dataset via API pública de Dataset. |

### Modernização — "melhorar o que existe"

| Skill | O que faz |
|-------|-----------|
| `fluig-migrate-jquery-es6` | Migra código jQuery para JavaScript ES6+. |
| `fluig-optimize-performance` | Otimiza a performance de código frontend. |
| `fluig-improve-accessibility` | Melhora a acessibilidade de markup/UI. |
| `fluig-validate-security` | Sanitiza entradas e previne vulnerabilidades (XSS e afins). |
| `fluig-dark-mode` | Adapta estilos ao modo escuro com variáveis CSS de tema. |
| `fluig-internationalization` | Aplica i18n, externalizando texto visível. |
| `fluig-style-guide-helpers` | Substitui CSS customizado por helpers do Style Guide. |

### Revisão — "avaliar antes do merge"

| Skill | O que faz |
|-------|-----------|
| `fluig-code-review` | Revisão geral de qualidade de código Fluig. |
| `fluig-review-performance` | Revisão focada em performance. |
| `fluig-review-security` | Revisão de segurança conforme OWASP Top 10. |
| `fluig-review-accessibility` | Revisão de acessibilidade alinhada às WCAG. |
| `fluig-best-practices` | Revisão de aderência às boas práticas oficiais do Fluig. |

As skills de revisão classificam os achados por severidade e referenciam a regra correspondente nos arquivos de `context/`.

## Exemplos disponíveis

`examples/` contém referências mínimas para os quatro tipos de artefato: `widget/`, `layout/`, `form/` e `dataset/`. Cada exemplo é um trecho de código curto que reflete as APIs e convenções descritas em `context/`.

## Feedback da comunidade

Este pacote evolui com quem o usa. **Tem feedback? Envie para nós.** Sugestões, correções, novos casos de uso ou relatos do que funcionou (ou não) com determinada ferramenta ou modelo são muito bem-vindos.

- Abra uma **issue** ou um **pull request** no repositório.
- Descreva, quando possível, a ferramenta de IA e o modelo utilizados, o resultado obtido e o esperado.

Seu retorno ajuda a manter as skills úteis, precisas e alinhadas às práticas oficiais do Fluig.
