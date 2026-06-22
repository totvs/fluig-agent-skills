# fluig-agent-skills

Pacote de **Agent Skills** para desenvolvimento de customizações da plataforma
**Fluig**. Reúne, em um único lugar autocontido, o **conhecimento permanente**
("o que é") e os **procedimentos especializados** ("como fazer") que um agente
de IA (Kiro, Claude Code, ChatGPT, Gemini CLI e similares) precisa para ajudar
desenvolvedores externos a **criar, modernizar e revisar** código Fluig com
qualidade.

Todo o conteúdo é baseado em **APIs, convenções e recursos públicos e oficiais**
do Fluig, voltados à customização externa.

## ⚠️ Aviso legal

> **A TOTVS NÃO PODERÁ SER RESPONSABILIZADA EM QUALQUER CASO DE MAL
> FUNCIONAMENTO DE SEUS PRODUTOS, SERVIÇOS OU SOLUÇÕES DECORRENTE DA UTILIZAÇÃO
> DE CÓDIGO GERADO POR FERRAMENTAS DE INTELIGÊNCIA ARTIFICIAL. TODO CÓDIGO GERADO
> DEVERÁ SER ANALISADO, REVISADO, VALIDADO E TESTADO PELO USUÁRIO ANTES DE SUA
> UTILIZAÇÃO. AS INFORMAÇÕES E MATERIAIS DISPONIBILIZADOS TÊM CARÁTER ORIENTATIVO
> E NÃO SUBSTITUEM A DOCUMENTAÇÃO OFICIAL NEM AS DIRETRIZES ADQUIRIDAS
> DIRETAMENTE DOS CANAIS OFICIAIS DE SUPORTE DA TOTVS.**

## Propósito

O objetivo não é documentar o Fluig por completo, e sim oferecer um conjunto
enxuto e especializado que:

- Concentra o conhecimento permanente da plataforma em `context/` (fonte única
  de verdade).
- Oferece skills focadas em `skills/`, cada uma com responsabilidade única.
- Aponta para exemplos mínimos de referência em `examples/`.

A filosofia central que organiza o pacote:

- **Contexto** responde **"o que é"** — conhecimento permanente sobre a
  plataforma. Vive em `context/` e é a fonte única de verdade.
- **Skills** respondem **"como fazer"** — procedimentos passo a passo para uma
  tarefa específica. Vivem em `skills/<nome>/SKILL.md` e são selecionadas pela
  `description` do seu frontmatter.
- **Exemplos** mostram **"como se parece"** — trechos de código mínimos de
  referência em `examples/`.

As skills **não duplicam** o conteúdo do contexto: elas o **referenciam** como
fonte de verdade e mantêm apenas um resumo executivo do necessário para a tarefa.

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
└── examples/                         # referências concretas mínimas — "como se parece"
    ├── widget/  ├── layout/  ├── form/  ├── dataset/  └── process-event/
```

## Como usar

Fluxo de consumo por um agente de IA:

1. **Comece pela entrada.** Leia este `README.md` (ou `AGENTS.md` / `CLAUDE.md`,
   conforme o agente) para entender o propósito e a navegação do pacote.
2. **Selecione a skill.** Identifique a tarefa do desenvolvedor e escolha a skill
   cuja `description` (no frontmatter do `SKILL.md`) corresponde ao que fazer e
   quando usar.
3. **Leia o contexto.** A skill referencia os arquivos de `context/` relevantes
   como fonte de verdade — consulte-os para convenções, tecnologias e regras.
4. **Consulte os exemplos.** Use `examples/` como referência concreta mínima do
   artefato em questão.
5. **Produza o código** seguindo as convenções oficiais descritas no contexto.

## Uso com VS Code + GitHub Copilot

O GitHub Copilot no VS Code suporta o padrão aberto **Agent Skills**: cada skill
é uma pasta com um `SKILL.md`, descoberta automaticamente em locais fixos. Como o
pacote já segue esse formato, basta posicioná-lo onde o Copilot procura.

O Copilot descobre **skills de projeto** em `.github/skills/` (também aceita
`.claude/skills/` e `.agents/skills/`). Como as nossas skills referenciam os
arquivos de `context/` e `examples/` por **caminho relativo** (ex.:
`../../context/conventions.md`), o `context/` e o `examples/` precisam ficar em
uma posição que preserve esses caminhos. A forma mais segura é replicar a
estrutura `skills/` + `context/` + `examples/` lado a lado dentro de `.github/`.

Já o **`AGENTS.md`** é uma instrução de repositório (não é uma skill) e **deve
ficar na raiz do projeto** (`seu-projeto/AGENTS.md`) — o Copilot usa o
`AGENTS.md` mais próximo na árvore de diretórios, e a raiz é o local canônico e
mais previsível:

```text
seu-projeto/
├── AGENTS.md          # instrução de repositório — fica na RAIZ do projeto
└── .github/
    ├── skills/        # copie o skills/ deste pacote
    │   └── <nome>/SKILL.md
    ├── context/       # copie o context/ deste pacote
    │   ├── architecture.md
    │   ├── technologies.md
    │   ├── conventions.md
    │   └── style-guide.md
    └── examples/      # copie o examples/ deste pacote
        ├── widget/  ├── layout/  ├── form/  ├── dataset/  └── process-event/
```

Com essa disposição os links relativos das skills resolvem corretamente:

- De `.github/skills/<skill>/SKILL.md`, o caminho `../../context/conventions.md`
  resolve para `.github/context/conventions.md`.
- De um asset em `.github/skills/<skill>/assets/`, o caminho
  `../../../context/conventions.md` resolve para `.github/context/conventions.md`.

> **Atenção aos caminhos do `AGENTS.md`:** o `AGENTS.md` deste pacote referencia
> `context/`, `skills/` e `examples/` por caminho relativo. Ao colocá-lo na raiz
> com as pastas em `.github/`, ajuste essas referências para apontar para
> `.github/context/...`, `.github/skills/...` e `.github/examples/...`.

> **Importante:** o campo `name` no frontmatter de cada `SKILL.md` **deve ser
> igual ao nome da pasta** da skill (já é o caso neste pacote). Nomes divergentes
> fazem a skill falhar silenciosamente ao carregar.

### Passo a passo

1. Crie a pasta `.github/` no seu projeto (se ainda não existir).
2. Copie as pastas `skills/`, `context/` e `examples/` deste pacote para dentro
   de `.github/`.
3. No VS Code, abra o chat do Copilot e digite `/` — as skills aparecem como
   slash commands (ex.: `/scaffolding-widget`, `/code-review`). Você também pode
   rodar **Chat: Open Customizations** na paleta de comandos para visualizar e
   gerenciar as skills.
4. Invoque uma skill com contexto adicional, por exemplo:
   `/scaffolding-widget widget de notificações`.

> **Escopo de projeto vs. pessoal:** `.github/skills/` deixa as skills versionadas
> e isoladas no projeto — ideal para testes e para o time. Para reusar as skills
> em vários projetos, há também os locais pessoais (`~/.copilot/skills/`,
> `~/.claude/skills/`, `~/.agents/skills/`); nesse caso, o `context/` e o
> `examples/` também precisam ficar em uma posição que preserve os caminhos
> relativos. Alternativamente, o setting `chat.agentSkillsLocations` permite
> apontar outras pastas de skills, mas ele não altera a resolução dos links para
> `context/` — por isso a estrutura lado a lado continua sendo o caminho mais
> seguro.


## Arquivos de contexto disponíveis

| Arquivo | Responde |
|---------|----------|
| `context/architecture.md` | O modelo conceitual dos artefatos (widget, layout, form, dataset, evento de processo), seus pontos de extensão públicos, o ciclo de vida visível ao código e a estrutura oficial de pastas/arquivos (incluindo o projeto Fluig Studio). |
| `context/technologies.md` | As tecnologias públicas de customização: ES6+, bibliotecas client-side (jQuery, Kendo UI, Bootstrap), Fluig Style Guide e o runtime de scripting server-side. |
| `context/conventions.md` | Padrões de código, convenções de widget, i18n, segurança via APIs públicas e chamadas REST públicas. |
| `context/style-guide.md` | Componentes, grid, helpers e utilitários do Fluig Style Guide, além das variáveis CSS de tema (`var(--fs-color-*)`). |

## Skills disponíveis

Skills agrupadas por intenção. Cada uma vive em `skills/<nome>/SKILL.md` e é
selecionada pela sua `description`.

### Geração (scaffolding) — "criar do zero"

| Skill | O que faz |
|-------|-----------|
| `scaffolding-widget` | Gera o esqueleto de um Widget WCM com `SuperWidget.extend`. |
| `scaffolding-layout` | Gera o esqueleto de um Layout WCM com declaração de slots/regiões. |
| `scaffolding-form` | Gera o esqueleto de um Form (campos, view e eventos). |
| `scaffolding-dataset` | Gera o esqueleto de um Dataset via API pública de Dataset. |
| `scaffolding-process-event` | Gera o esqueleto de eventos de processo BPM. |

### Modernização — "melhorar o que existe"

| Skill | O que faz |
|-------|-----------|
| `migrate-jquery-es6` | Migra código jQuery para JavaScript ES6+. |
| `optimize-performance` | Otimiza a performance de código frontend. |
| `improve-accessibility` | Melhora a acessibilidade de markup/UI. |
| `validate-security` | Sanitiza entradas e previne vulnerabilidades (XSS e afins). |
| `dark-mode` | Adapta estilos ao modo escuro com variáveis CSS de tema. |
| `internationalization` | Aplica i18n, externalizando texto visível. |
| `style-guide-helpers` | Substitui CSS customizado por helpers do Style Guide. |

### Revisão — "avaliar antes do merge"

| Skill | O que faz |
|-------|-----------|
| `code-review` | Revisão geral de qualidade de código Fluig. |
| `review-performance` | Revisão focada em performance. |
| `review-security` | Revisão de segurança conforme OWASP Top 10. |
| `review-accessibility` | Revisão de acessibilidade alinhada às WCAG. |
| `fluig-best-practices` | Revisão de aderência às boas práticas oficiais do Fluig. |

As skills de revisão classificam os achados por severidade e referenciam a regra
correspondente nos arquivos de `context/`.

## Exemplos disponíveis

`examples/` contém referências mínimas para os cinco tipos de artefato:
`widget/`, `layout/`, `form/`, `dataset/` e `process-event/`. Cada exemplo é um
trecho de código curto que reflete as APIs e convenções descritas em `context/`.
