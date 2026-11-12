---
name: fluig-code-review-partner-widgets
description: >-
  Revisa (somente leitura) todos os widgets (application.type=widget) de uma
  solução de Parceiro destinada à Store do TOTVS Fluig, no modelo Maven
  multi-módulo, e grava um único relatório pre-review-widget-AAAA-MM-DD.md de
  achados por severidade — campos de Store do application.info, SuperWidget/JS,
  escopo DOM, FTL, performance e segurança frontend, APIs públicas, visual/i18n,
  frameworks SPA, ícones, incremento de versão e reuso de Componentes de Negócio
  nativos. Delega as validações genéricas de frontend às skills base e aplica por
  cima o delta exclusivo de parceiro. NÃO revisa a estrutura Maven/EAR nem os
  descritores do componente (skill fluig-code-review-partner-component).
  Exclusiva da persona Parceiro. Use antes do App Review/submissão à Store,
  quando o desenvolvedor pedir auditoria de widget sem reescrever o código.
argument-hint: caminho raiz do componente Maven (pasta com o POM raiz <packaging>pom</packaging>)
---

# Revisão de Widget de Parceiro Fluig

Skill de **como fazer** a revisão de widgets de parceiro. Ela **não duplica** regra
técnica: o detalhe ("o que é") vive em `context/` e é apenas **referenciado** por
caminho relativo. A skill é **somente leitura** — diagnostica e recomenda, nunca
altera o código do parceiro.

## Passo 0 — Estrutura e Persona

Antes de revisar, identifique a **estrutura do projeto** seguindo
[Detecção de estrutura do projeto](../../context/architecture.md#detecção-de-estrutura-do-projeto)
e emita `Estrutura: <Studio|Maven|Híbrida> (motivo)`.

Em seguida, classifique a persona pela cascata de
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Emita `Persona: <Parceiro|Consultor> (motivo)` antes de
continuar. Quando acionada por uma orquestração que já classificou a persona, use a
persona recebida e não a reclassifique.

- **Parceiro:** prossiga com o procedimento abaixo.
- **Consultor:** esta skill **não se aplica** — ela aplica o **delta exclusivo de
  Store** sobre o widget. A revisão **genérica** do código do widget (segurança,
  performance, acessibilidade, qualidade) vale para qualquer persona e é feita
  pela skill [`fluig-code-review`](../fluig-code-review/SKILL.md). Responda
  **"não se aplica"**, indique essa skill e não grave relatório.
- **Ambíguo:** pare e pergunte antes de continuar.

## Objetivo

Produzir um **relatório Markdown único** que revisa, com cobertura de 100%, cada
widget (`application.type=widget`) de uma solução de parceiro para a Store,
classificando os achados por severidade (Crítico → Baixo) e emitindo um parecer de
publicação. A skill delega as validações genéricas de frontend às skills base e
aplica por cima o **delta exclusivo de parceiro**.

## Escopo e Fronteira (o que NÃO é desta skill)

| Dentro do escopo | Fora do escopo — encaminhar para |
|------------------|-----------------------------------|
| Arquivos de cada módulo `application.type=widget`: `.js`, `.ftl`, `.css`/`.scss`, `.properties`, `application.info` | — |
| Campos exigidos pela Store no `application.info` do widget, `application.uiwidget`, ícone | — |
| Incremento de versão sugerido quando o widget muda | — |
| POMs, módulos, empacotamento EAR, `component.xml`, `pages.xml`, `jboss-web.xml`, cruzamento entre módulos, prefixo do `application.code`, sincronia de versão entre descritores | skill `fluig-code-review-partner-component` |
| Layouts, datasets, formulários, eventos, REST, wizard | revisão do artefato correspondente, com as skills de revisão aplicáveis |

## Quando Usar

- Antes do **App Review** / submissão do componente à Store.
- Quando o desenvolvedor pedir **auditoria de widget** sem reescrever o código.
- Para diagnosticar conformidade do `application.info`, segurança e performance
  frontend de um ou mais widgets.
- Quando houver dúvida sobre uso de APIs públicas ou reuso de componentes nativos.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Caminho raiz do componente | Pasta com o POM raiz Maven (`<packaging>pom</packaging>`) que lista os módulos em `<modules>` | sim |
| Contexto da submissão | Se o componente já teve versão aprovada (para sugerir o incremento de versão) | não |
| Sintoma/foco observado | Área de atenção específica indicada pelo desenvolvedor | não |

## Contexto de Referência (Fonte de Verdade)

Ler antes de executar — **não reproduzir** o conteúdo; a regra vive em `context/`:

| Domínio | Referência |
|---------|-----------|
| Regras de review da Store (CDN, credenciais, XSS, `async:false`, UTF-8, valores fixos, SSL, acesso, dependências, ícones, anti-falso-positivo, frameworks SPA, BC, FTL) e metodologia do relatório | [partner-store-review-rules.md](../../context/partner-store-review-rules.md) — [§ 32](../../context/partner-store-review-rules.md#32-metodologia-do-relatório-de-pré-review-contrato-transversal) |
| SuperWidget, escopo DOM, i18n, performance/segurança/APIs frontend | [conventions.md](../../context/conventions.md) |
| Variáveis CSS de tema, grid, dark mode, FLUIGC | [style-guide.md](../../context/style-guide.md) |
| `application.info` (validação e integridade de recursos), estrutura de pastas do widget | [architecture.md](../../context/architecture.md) |
| Módulo widget no projeto Maven | [Modelo Conceitual de Módulos](../../context/backend-java-maven.md#modelo-conceitual-de-módulos) |
| `application.info` exigido pela Store, Versionamento Semântico, bibliotecas de terceiros e acoplamento jQuery | [partner-store-conventions.md](../../context/partner-store-conventions.md) |
| Componentes de Negócio nativos (ECMBC/SOCIALBC/WCMBC/LMSBC) | [business-components.md](../../context/business-components.md) |
| Anti-falso-positivo e precedência de classificação | [§ 11](../../context/partner-store-review-rules.md#11-exceções-anti-falso-positivo--widgets) / [§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo) |

## Estrutura de Saída

Um **relatório Markdown único** que segue o contrato transversal de pré-review em
[§ 32](../../context/partner-store-review-rules.md#32-metodologia-do-relatório-de-pré-review-contrato-transversal):

- **Ordem fixa** ([§ 32.3](../../context/partner-store-review-rules.md#323-ordem-fixa-das-seções-do-relatório)): Resumo → Tracker de Cobertura → Achados por Severidade (Crítico → Baixo) → Pontos Positivos → Plano de Ação Priorizado → Parecer Final.
- **Contrato de cada achado** ([§ 32.4](../../context/partner-store-review-rules.md#324-contrato-de-conteúdo-de-cada-achado)): `categoria`, `arquivo:linha`, `severidade`, `impacto`, `evidência` (3 a 15 linhas reais), `recomendação` segura, `referência` a `context/` e `origem` (`base` \| `delta`).
- **Tracker de Cobertura** ([§ 32.2](../../context/partner-store-review-rules.md#322-cobertura-100-e-tracker-de-cobertura)): por widget, `arquivo` × `linhas` × `lido100` (`✅`/`❌`); qualquer `❌` marca **"NÃO CONCLUÍDO — Cobertura Incompleta"**.
- **Parecer Final** ([§ 32.5](../../context/partner-store-review-rules.md#325-parecer-final)): exatamente um de **Provável Aprovação** \| **Atenção** \| **Correções Obrigatórias**.
- **Aviso de escopo** ([§ 32.7](../../context/partner-store-review-rules.md#327-aviso-de-escopo-pré-review-não-substitui-o-app-review)): o Resumo declara que a revisão cobre **apenas os widgets** e **não garante aprovação na Store**.
- **Severidade calibrada** ([§ 32.8](../../context/partner-store-review-rules.md#328-calibração-de-severidade-não-inflar-além-do-que-reprova)): Crítico só para o que reprova de fato; na dúvida, severidade menor com "VERIFICAR MANUALMENTE".

## Regras Aplicáveis (resumo executivo)

Cada domínio abaixo é apenas um índice; a regra completa (severidades, limiares e
exceções) vive na referência indicada.

| Domínio revisado | Onde a regra vive |
|------------------|-------------------|
| `application.info` do widget (campos exigidos pela Store, `simple.deploy`, `application.uiwidget`, recursos declarados) | [§ 2](../../context/partner-store-conventions.md#2-applicationinfo-exigido-pela-store); [Regras de Validação do `application.info`](../../context/architecture.md#regras-de-validação-do-applicationinfo); [Integridade dos recursos e chaves (review)](../../context/architecture.md#integridade-dos-recursos-e-chaves-review); [§ 9](../../context/partner-store-review-rules.md#9-applicationuiwidget-e-documentação) |
| Ícones personalizados | [§ 21](../../context/partner-store-review-rules.md#21-ícones-personalizados-de-páginas-e-widgets) |
| SuperWidget / isolamento JS | [Convenções de Widget](../../context/conventions.md#convenções-de-widget-superwidgetextend) |
| Escopo DOM (`this.DOM`, `instanceId`) | [Escopo de busca via `this.DOM`](../../context/conventions.md#escopo-de-busca-via-thisdom-obrigatório-em-widget) |
| FTL (script/style inline, `src`/`href`, CDN) | [§ 31](../../context/partner-store-review-rules.md#31-separação-de-responsabilidades-no-ftl-widget); [§ 5](../../context/partner-store-review-rules.md#5-cdn-externo) |
| Performance frontend (`async:false`, dataset no cliente, DOM, console) | [§ 23](../../context/partner-store-review-rules.md#23-contagem-e-classificação-de-chamadas-síncronas-volumetria); [Classificação de performance frontend (review)](../../context/conventions.md#classificação-de-performance-frontend-review) |
| Segurança frontend (XSS, `eval`, `atob`, `eruda`, endpoints) | [Segurança (APIs públicas)](../../context/conventions.md#segurança-apis-públicas); [Classificação de segurança frontend (review)](../../context/conventions.md#classificação-de-segurança-frontend-review); [§ 2](../../context/partner-store-review-rules.md#2-credenciais-e-tokens-expostos); [§ 12](../../context/partner-store-review-rules.md#12-classificação-de-origem-xss) |
| APIs públicas frontend | [Chamadas REST e Integrações](../../context/conventions.md#chamadas-rest-e-integrações) |
| Visual/Style Guide e i18n | [style-guide.md](../../context/style-guide.md); [Internacionalização (i18n) — Widgets e Layouts](../../context/conventions.md#internacionalização-i18n--widgets-e-layouts) |
| Frameworks SPA (Angular/React/Vue) | [§ 27](../../context/partner-store-review-rules.md#27-integração-de-frameworks-front-end-angular--react--vue) |
| Codificação, valores fixos, parametrização | [§ 15](../../context/partner-store-review-rules.md#15-codificação-utf-8); [§ 16](../../context/partner-store-review-rules.md#16-valores-fixos-de-ambiente-hardcode-proibido); [§ 17](../../context/partner-store-review-rules.md#17-parametrização-configurações-alteráveis) |
| SSL/TLS, acesso, dependências, acoplamento jQuery | [§ 18](../../context/partner-store-review-rules.md#18-ssltls-obrigatório-em-serviços-externos); [§ 19](../../context/partner-store-review-rules.md#19-falhas-de-segurança-de-acesso); [§ 20](../../context/partner-store-review-rules.md#20-dependências-de-produção-enxutas); [JavaScript Moderno (ES6+)](../../context/conventions.md#javascript-moderno-es6); [§ 5.3](../../context/partner-store-conventions.md#53-processo-colaborativo-de-avaliação-3-passos) |
| Reuso de Componentes de Negócio nativos | [§ 30](../../context/partner-store-review-rules.md#30-reuso-de-componentes-de-negócio-nativos); [business-components.md](../../context/business-components.md) |
| Incremento de versão quando o widget muda (PATCH/MINOR/MAJOR, apenas sugerido) | [§ 4.3](../../context/partner-store-conventions.md#43-detecção-de-delta-para-nova-release) |
| Exceções obrigatórias e precedência anti-falso-positivo | [§ 11](../../context/partner-store-review-rules.md#11-exceções-anti-falso-positivo--widgets); [§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo); [§ 32.6](../../context/partner-store-review-rules.md#326-portão-de-deduplicação-base--delta) |

**Delegação (Decorator).** As validações **genéricas** de frontend são **delegadas**
às skills base e não reimplementadas aqui:
[fluig-review-security](../fluig-review-security/SKILL.md),
[fluig-review-performance](../fluig-review-performance/SKILL.md),
[fluig-code-review](../fluig-code-review/SKILL.md),
[fluig-review-accessibility](../fluig-review-accessibility/SKILL.md) e
[fluig-best-practices](../fluig-best-practices/SKILL.md) (quando aplicável). Ao
delegar:

- repasse a persona já classificada no Passo 0 — a skill base não a reclassifica;
- colete os achados da skill base com `origem = base`; a skill base **não grava** o
  próprio arquivo de relatório — o único arquivo gravado é o desta skill;
- aplique o delta de parceiro por cima, com `origem = delta`.

**Anti-falso-positivo (obrigatório).** Decidir por **contexto real**, nunca por
padrão sintático isolado: ler o arquivo por inteiro, rastrear a origem da variável e
aplicar as exceções e a precedência **exceção > segurança > domínio > genérica** de
[§ 11](../../context/partner-store-review-rules.md#11-exceções-anti-falso-positivo--widgets) e
[§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo).
Na dúvida, reportar **Médio** com "VERIFICAR MANUALMENTE" e o trecho exato.

## Política de Fallback

| Condição | Resposta |
|----------|----------|
| Persona Consultor | Responder **"não se aplica"** e indicar `fluig-code-review` (ver Passo 0); não gravar relatório. |
| POM raiz não encontrado / caminho inválido | Informar que o caminho **não** é um componente Maven Fluig válido e **encerrar sem inventar estrutura**. |
| Nenhum módulo `application.type=widget` | Informar exatamente **"Nenhum widget encontrado"** e **encerrar**. |
| Falha ao ler um arquivo (permissão/encoding) | Registrar **❌** no Tracker e marcar **"NÃO CONCLUÍDO — Cobertura Incompleta"**, listando os arquivos não lidos. |
| Dado crítico ausente que só o desenvolvedor fornece (ex.: versão aprovada) | **Interromper**, listar o que falta e **perguntar** — nunca chutar. |
| Origem de dado ambígua em suspeita de XSS | Reportar **Médio** com "VERIFICAR MANUALMENTE" e o trecho exato ([§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo)). |
| Pedido para revisar estrutura, descritores ou outros artefatos | Informar que está fora do escopo e encaminhar conforme "Escopo e Fronteira". |
| Padrão exigido **não documentado** em `context/` | **Parar** e pedir que o padrão oficial seja adicionado a `context/` antes de prosseguir — não extrapolar. |
| Recomendação potencialmente perigosa | Nunca sugerir correção que introduza risco; propor a alternativa segura ([§ 14](../../context/partner-store-review-rules.md#14-recomendações-de-correção-seguras)). |

## Procedimento

1. **Passo 0.** Emitir `Estrutura` e `Persona`. Consultor → Fallback.
2. **Inventário e escopo.** Localizar o POM raiz (`<packaging>pom</packaging>`),
   listar os `<modules>`, ler o `application.info` de cada módulo e **filtrar apenas
   `application.type=widget`**. Sem widget → Fallback.
3. **Leitura completa 100% + Tracker de Cobertura.** Para cada widget, ler **todas**
   as linhas de cada arquivo (`.js`, `.ftl`, `.css`/`.scss`, `.properties`,
   `application.info`) — sem amostragem — e registrar o Tracker. Cobertura < 100% →
   Fallback.
4. **Camada base (delegada).** Invocar as skills base conforme "Delegação" e coletar
   seus achados com `origem = base`.
5. **Delta de parceiro (por cima).** Sobre a mesma leitura, percorrer cada widget na
   ordem `application.info → SuperWidget/JS → escopo DOM → FTL → Performance →
   Segurança → Visual/i18n → APIs`, aplicando as camadas transversais (frameworks
   SPA, codificação/parametrização, SSL/dependências, ícones, componentes nativos,
   incremento de versão). Cada achado leva `origem = delta`.
6. **Portão anti-falso-positivo.** Cruzar cada achado com as exceções obrigatórias e a
   precedência de [§ 11](../../context/partner-store-review-rules.md#11-exceções-anti-falso-positivo--widgets) e
   [§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo);
   descartar usos legítimos e calibrar a severidade ([§ 32.8](../../context/partner-store-review-rules.md#328-calibração-de-severidade-não-inflar-além-do-que-reprova)).
7. **Consolidação.** Fundir base + delta em **um único relatório** sem duplicar o
   mesmo achado ([§ 32.6](../../context/partner-store-review-rules.md#326-portão-de-deduplicação-base--delta)),
   ordenar por severidade, incluir o aviso de escopo e emitir o Parecer Final.

## Saída Esperada

Um arquivo Markdown **gravado na raiz do alvo**, nomeado
`pre-review-widget-<AAAA-MM-DD>.md` — a **única escrita permitida** no repositório do
parceiro ([§ 32.1](../../context/partner-store-review-rules.md#321-modo-somente-leitura) /
[§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).
O arquivo abre por um **cabeçalho de pré-review** que declara que o resultado é um
**pré-review preparatório** — passar nele **não** significa aprovação e **não**
substitui o App Review oficial ([§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) —
resumindo escopo, Parecer Final e contagem por severidade. Em seguida vem o relatório
completo na ordem fixa. Nenhum outro arquivo do parceiro é alterado.

## Exemplo de Uso

```
fluig-code-review-partner-widgets ./meu-componente-fluig
```

Esqueleto do relatório (arquivo `pre-review-widget-<AAAA-MM-DD>.md`):

```markdown
# Pré-Review de Widget — <componente>

> ⚠️ **Pré-review preparatório.** Este resultado é um passo interno de higiene e
> **não** significa aprovação: **não substitui o App Review oficial** da Store.
> - **Escopo:** widgets (`application.type=widget`) do componente.
> - **Parecer:** Provável Aprovação | Atenção | Correções Obrigatórias
> - **Achados:** Crítico <n> · Alto <n> · Médio <n> · Baixo <n>

## Resumo
- Widgets revisados: <n>
- Avaliação geral: <síntese>
- Aviso de escopo: esta revisão cobre apenas os widgets; estrutura do componente,
  layouts, datasets e eventos são avaliados pelas revisões específicas.

## Tracker de Cobertura
### Widget: <application.code>
| Arquivo | Linhas | Lido 100% |
|---------|--------|-----------|
| view.ftl | 120 | ✅ |
| notifications.js | 340 | ✅ |

## Achados por Severidade
### Crítico
- **[XSS]** `notifications.js:88` — <impacto>
  - Evidência (3–15 linhas): <trecho real>
  - Recomendação: <correção segura>
  - Referência: context/conventions.md § Segurança (APIs públicas)
  - Origem: delta

## Pontos Positivos
- <o que já está em conformidade>

## Plano de Ação Priorizado
1. <correção mais urgente>

## Parecer Final
Provável Aprovação | Atenção | Correções Obrigatórias
```

Exemplo concreto de widget em [`../../examples/widget/`](../../examples/widget/)
(referência de estrutura).

## Checklist de Validação

- [ ] Estrutura e persona classificadas (Passo 0) e emitidas como `Estrutura: <Studio|Maven|Híbrida> (motivo)` e `Persona: <Parceiro|Consultor> (motivo)`; se Consultor, a skill respondeu "não se aplica", apontou `fluig-code-review` e não gravou relatório.
- [ ] POM raiz localizado e apenas módulos `application.type=widget` no escopo.
- [ ] Tracker de Cobertura com 100% dos arquivos `✅` (ou incompletude sinalizada).
- [ ] Camada base delegada às skills base, sem reimplementação e sem arquivos de relatório gravados por elas.
- [ ] Delta de parceiro aplicado na ordem obrigatória de varredura.
- [ ] Exceções obrigatórias e precedência anti-falso-positivo aplicadas antes de fechar achados; severidade calibrada ([§ 32.8](../../context/partner-store-review-rules.md#328-calibração-de-severidade-não-inflar-além-do-que-reprova)).
- [ ] Cada achado com `arquivo:linha`, evidência de 3–15 linhas, recomendação segura, referência a `context/` e `origem`.
- [ ] Sem achado duplicado entre base e delta ([§ 32.6](../../context/partner-store-review-rules.md#326-portão-de-deduplicação-base--delta)).
- [ ] Aviso de escopo no Resumo ([§ 32.7](../../context/partner-store-review-rules.md#327-aviso-de-escopo-pré-review-não-substitui-o-app-review)).
- [ ] Parecer Final é exatamente um dos três rótulos previstos.
- [ ] Cabeçalho de pré-review presente (não aprova, não substitui o App Review oficial — [§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)).
- [ ] Relatório gravado em `pre-review-widget-<AAAA-MM-DD>.md` na raiz do alvo ([§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).
- [ ] Nenhum arquivo do parceiro foi alterado além do próprio `.md` de relatório ([§ 32.1](../../context/partner-store-review-rules.md#321-modo-somente-leitura)).
- [ ] Nenhuma regra técnica foi copiada para a skill — apenas referenciada.
