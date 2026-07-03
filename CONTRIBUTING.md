# Contribuindo com o fluig-agent-skills

Obrigado pelo interesse em contribuir! Este projeto é um pacote autocontido de
**Agent Skills** que ajudam agentes de IA (Kiro, Claude Code, ChatGPT, Gemini
CLI, GitHub Copilot e similares) a auxiliar desenvolvedores a **criar,
modernizar e revisar** customizações da plataforma **Fluig**.

Este guia explica como criar ou evoluir skills mantendo o pacote consistente,
focado e com qualidade. O objetivo é facilitar a contribuição, sem burocracia.

## Filosofia

O pacote é organizado em torno de uma ideia central: **separar o conhecimento
permanente dos procedimentos.**

- **Contexto (`context/`) responde "o que é".** Conhecimento permanente da
  plataforma e a **fonte única de verdade** do pacote: convenções, tecnologias,
  arquitetura e regras de Style Guide.
- **Skills (`skills/`) respondem "como fazer".** Procedimentos especializados e
  de responsabilidade única para uma tarefa. Cada skill **referencia** o contexto
  em vez de duplicá-lo.
- **Exemplos (`examples/`) mostram "como se parece".** Trechos de código mínimos
  e concretos por tipo de artefato (widget, layout, form, dataset).

Princípios a seguir ao contribuir:

- **Fonte única de verdade.** O conhecimento vive em `context/`. As skills mantêm
  apenas um resumo executivo curto e referenciam o arquivo de contexto relevante.
- **Sem duplicação.** Se você se pegar copiando uma regra para dentro de uma
  skill, mova a regra para `context/` e referencie-a.
- **Responsabilidade única.** Uma skill faz uma coisa bem feita. Se ela tenta
  cobrir várias tarefas não relacionadas, divida-a.
- **Apenas público e oficial.** Use somente APIs e recursos públicos e oficiais
  do Fluig (ex.: `SuperWidget`, `WCMAPI`, `FLUIGC`, API pública de Dataset,
  `DOMPurify`, `i18n.getTranslation` e o Fluig Style Guide). Se algo não for
  confirmável como público e oficial, omita — nunca invente APIs, convenções ou
  estruturas.
- **Caminhos autocontidos.** Refira-se apenas a caminhos dentro do pacote
  (`context/`, `skills/`, `examples/`).

## Estrutura do repositório

```text
fluig-agent-skills/
├── README.md, AGENTS.md, CLAUDE.md   # pontos de entrada — "por onde começar"
├── context/                          # conhecimento permanente — "o que é"
│   ├── architecture.md               # artefatos, pontos de extensão, estrutura de pastas
│   ├── technologies.md               # tecnologias públicas (ES6+, libs client-side, runtime)
│   ├── conventions.md                # convenções de código, i18n, segurança, REST público
│   └── style-guide.md                # componentes, grid, helpers, variáveis CSS de tema
├── skills/                           # procedimentos especializados — "como fazer"
│   └── <nome>/SKILL.md               # cada skill é um diretório com um SKILL.md
├── examples/                         # referências concretas mínimas — "como se parece"
│   ├── widget/
│   ├── layout/
│   ├── form/
│   └── dataset/
└── docs/                             # prompts de uso por skill
    └── <nome>/README.md              # prompts de exemplo para acionar a skill
```

## Anatomia de uma skill

Cada skill é um **diretório** sob `skills/` contendo um arquivo `SKILL.md`. O
`SKILL.md` começa com um **frontmatter YAML** seguido das seções de execução.

### Frontmatter

```yaml
---
name: fluig-scaffolding-widget
description: Gera o esqueleto de um Widget WCM do Fluig usando SuperWidget.extend... Use quando o desenvolvedor pedir para criar/iniciar um novo widget client-side do Fluig.
argument-hint: nome e/ou propósito do widget a ser gerado (ex.: "widget de notificações")
---
```

- **`name`** — deve ser **idêntico ao nome do diretório da skill**. Uma
  divergência faz a skill falhar silenciosamente ao carregar.
- **`description`** — descreve **o que a skill faz e quando usá-la**. É assim que
  humanos e agentes selecionam a skill certa, então seja preciso e orientado à
  ação.
- **`argument-hint`** — presente quando a skill recebe um argumento (ex.: um
  trecho de código alvo); descreve o que o contribuidor deve fornecer.

### Seções do corpo

Siga a estrutura usada pelas skills existentes para que o pacote permaneça
previsível:

- **Título + introdução de uma linha** afirmando que a skill não duplica o contexto.
- **Objetivo** — o que a skill produz, em um parágrafo.
- **Quando Usar** — os cenários que selecionam esta skill.
- **Entradas Esperadas** — uma tabela de entradas indicando quais são obrigatórias.
- **Contexto de Referência (Fonte de Verdade)** — links para os arquivos de
  `context/` relevantes por **caminho relativo** (ex.: `../../context/conventions.md`).
  Não reproduza o conteúdo deles.
- **Estrutura de Saída** — o layout do artefato ou o formato do relatório que a
  skill produz.
- **Regras Aplicáveis (Resumo Executivo)** — o mínimo necessário para orientar a
  tarefa, cada linha apontando para o arquivo de contexto que detém a regra completa.
- **Política de Fallback** — o que fazer quando entradas obrigatórias estão ausentes.
- **Procedimento** — os passos ordenados.
- **Saída Esperada** — o que o desenvolvedor obtém ao final.
- **Exemplo de Uso** — aponta para a referência correspondente em `examples/`.
- **Checklist de Validação** — as verificações a fazer antes de entregar o resultado.

As skills de revisão (`fluig-code-review`, `review-*`) seguem a mesma forma, mas
classificam os achados por severidade e referenciam a regra correspondente em
`context/`.

## Quando criar uma nova skill vs. evoluir uma existente

Crie uma **nova skill** quando:

- A tarefa é uma intenção distinta não coberta por nenhuma skill existente.
- Uma `description` clara consegue selecioná-la sem sobrepor outra skill.

**Reutilize ou evolua uma skill existente** quando:

- A tarefa é uma variação ou refinamento do que uma skill já faz. Melhore o
  `SKILL.md` existente em vez de criar uma quase-duplicata.
- A mudança é, na verdade, sobre uma regra ou convenção. Nesse caso, atualize o
  **arquivo de contexto** relevante para que todas as skills se beneficiem, e
  então referencie-o.

Se uma nova skill compartilharia a maioria de suas regras com outra, isso é um
sinal de que o conhecimento compartilhado pertence a `context/`, não copiado
entre skills.

## Reutilizando o contexto para evitar duplicação

Os arquivos de contexto são a espinha dorsal do pacote. Antes de documentar uma
regra em uma skill, verifique se ela já existe em:

| Arquivo | Responde por |
|---------|--------------|
| `context/architecture.md` | Artefatos, pontos de extensão, ciclo de vida, estrutura oficial de pastas/arquivos. |
| `context/technologies.md` | Tecnologias públicas de customização (ES6+, libs client-side, runtime server-side). |
| `context/conventions.md` | Padrões de código, i18n, segurança via APIs públicas, chamadas REST públicas. |
| `context/style-guide.md` | Componentes, grid, helpers e variáveis CSS de tema (`var(--fs-color-*)`). |

Diretrizes:

- Mantenha a **regra completa** no arquivo de contexto; mantenha apenas um
  **resumo executivo** na skill.
- Referencie o contexto por **caminho relativo** a partir do diretório da skill
  (ex.: `../../context/conventions.md`).
- Se uma regra estiver ausente ou desatualizada, corrija-a no arquivo de
  contexto. Não a corrija localmente dentro de uma skill.

## Estilo de escrita para o SKILL.md

- **Seja objetivo.** Frases curtas, passos concretos. Prefira tabelas para
  entradas, regras e checklists.
- **Responsabilidade única.** Mantenha a skill focada em uma tarefa.
- **Não duplique.** Resuma e referencie o contexto em vez de repetir regras.
- **Seja explícito sobre regras críticas.** Marque claramente regras não óbvias
  que quebram algo (ex.: "isto quebra a i18n se violado").
- **Convenção de idioma.** Conteúdo em prosa em **Português (Brasil)**, alinhado
  ao pacote existente; **identificadores de código, nomes de arquivo e
  comentários em Inglês.**
- **Mantenha-se público e oficial.** Nunca referencie APIs internas ou
  estruturas inventadas.

## Nomenclatura e organização

- **Diretório e `name` da skill** — kebab-case, idênticos entre si
  (ex.: `fluig-scaffolding-widget`). Agrupe por intenção mentalmente, mas mantenha os
  nomes planos sob `skills/`.
- **Arquivos de contexto** — atenha-se aos quatro arquivos canônicos; estenda o
  conteúdo deles em vez de adicionar arquivos avulsos, salvo um domínio novo claro.
- **Exemplos** — coloque trechos mínimos sob a pasta do artefato correspondente
  (`examples/widget/`, `examples/layout/`, `examples/form/`, `examples/dataset/`).
- **Docs de uso** — ao adicionar uma skill, crie `docs/<nome>/README.md` com
  prompts de exemplo (simples, intermediário, completo) que a acionam.
- **Nomenclatura de arquivos de código** — siga `context/conventions.md`
  (ex.: `[name].[category].js` em kebab-case para Custom Elements).

## Documentação

Ao adicionar ou alterar uma skill, mantenha sincronizados:

- A `description` no frontmatter da skill (precisão na seleção).
- O `docs/<nome>/README.md` com prompts de exemplo.
- As tabelas de skills em `README.md` e `AGENTS.md` (para que seja descobrível).
- Qualquer arquivo de `context/` afetado, quando a mudança toca uma regra compartilhada.

## Checklist antes do Pull Request

Antes de abrir um Pull Request, confirme:

- [ ] O nome do diretório da skill e o `name` do frontmatter são **idênticos**.
- [ ] A `description` deixa claro **o que a skill faz e quando usá-la**.
- [ ] O `argument-hint` está presente quando a skill recebe um argumento.
- [ ] A skill tem **responsabilidade única** e não se sobrepõe a uma existente.
- [ ] As regras são **referenciadas de `context/`** por caminho relativo, não duplicadas.
- [ ] Os links relativos para `context/` e `examples/` resolvem corretamente.
- [ ] Apenas APIs e recursos **públicos e oficiais** do Fluig são referenciados.
- [ ] Todos os caminhos referenciados permanecem **dentro do pacote**.
- [ ] Existe uma referência correspondente em `examples/` e um `docs/<nome>/README.md` (para skills novas).
- [ ] As tabelas de skills em `README.md` e `AGENTS.md` foram atualizadas (para skills novas).
- [ ] A convenção de idioma é respeitada (prosa em pt-BR, identificadores em Inglês).
- [ ] O Markdown renderiza corretamente (títulos, tabelas, blocos de código).

## Fluxo de contribuição

1. **Faça um fork** do repositório e clone o seu fork.
2. **Crie um branch** com nome descritivo
   (ex.: `feat/scaffolding-report-widget` ou `fix/conventions-i18n-typo`).
3. **Implemente** sua mudança seguindo este guia. Mantenha commits focados e
   escreva mensagens de commit claras.
4. **Faça uma autorrevisão** com o checklist acima. Verifique se os links
   resolvem e se os exemplos são mínimos e corretos.
5. **Abra um Pull Request** descrevendo o que mudou e por quê. Referencie a issue
   relacionada. Para uma skill nova, resuma sua intenção e os arquivos de contexto
   que ela utiliza.
6. **Revisão e merge.** Um mantenedor revisa a consistência, a responsabilidade
   única e a aderência ao modelo de fonte única de verdade. Trate o feedback, e
   então um mantenedor faz o merge após a aprovação.

## Aviso legal

Todo o conteúdo deve ser baseado em APIs, convenções e recursos **públicos e
oficiais** do Fluig. O código gerado pelas skills tem caráter orientativo e deve
sempre ser revisado, validado e testado pelo usuário antes do uso, conforme
descrito no [README](README.md) e no [SECURITY](SECURITY.md) do projeto.
