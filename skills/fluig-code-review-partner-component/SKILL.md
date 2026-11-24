---
name: fluig-code-review-partner-component
description: Revisa em modo somente leitura a ESTRUTURA do projeto Maven multi-módulo de uma solução de Parceiro destinada à Store do TOTVS Fluig — POM raiz (packaging pom), módulos e ordenação, empacotamento EAR, dependências Maven, descritores (component.xml, pages.xml, jboss-web.xml, web.xml), campos estruturais do application.info, prefixo de parceiro, Versionamento Semântico entre descritores, provisionamento e artefatos de desenvolvimento na árvore empacotável. NÃO revisa o código-fonte (Java, JS, FTL, CSS) dos módulos — o JS/FTL/CSS de widget é da skill fluig-code-review-partner-widgets. Exclusiva da persona Parceiro (Store). Grava um relatório pre-review-component-AAAA-MM-DD.md por severidade (Crítico→Baixo), com cobertura 100% dos arquivos estruturais. Use antes do App Review/submissão à Store para auditar a montagem do projeto, não o conteúdo dos artefatos.
argument-hint: o caminho raiz do componente Maven (pasta que contém o POM raiz com <packaging>pom</packaging>)
---

# Revisão de Componente (Projeto Maven) de Parceiro Fluig

Esta skill revisa a **estrutura** do projeto Maven de um componente de parceiro e
emite um relatório por severidade. Ela **não duplica** regra técnica: os arquivos de
`context/` são a fonte única de verdade, referenciada por caminho relativo. A skill
é **somente leitura** — diagnostica e recomenda, nunca altera o projeto.

## Passo 0 — Estrutura e Persona

Antes de revisar, identifique a **estrutura do projeto** seguindo
[Detecção de estrutura do projeto](../../context/architecture.md#detecção-de-estrutura-do-projeto)
e emita `Estrutura: <Studio|Maven|Híbrida> (motivo)`. A estrutura **não** define a
persona.

Em seguida, classifique a persona pela cascata de
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Emita `Persona: <Parceiro|Consultor> (motivo)` antes de
continuar. Quando acionada por uma orquestração que já classificou a persona, use a
persona recebida e não a reclassifique.

- **Parceiro:** prossiga com o procedimento abaixo.
- **Consultor:** esta skill **não se aplica** — ela revisa a montagem de uma solução
  destinada à Store (`component.xml`, `pages.xml`, `application.info` da Store,
  prefixo, Versionamento Semântico entre descritores, provisionamento). Responda
  **"não se aplica"** e informe que as regras genéricas de build Maven/EAR estão em
  [Checklist de Build e Empacotamento](../../context/backend-java-maven.md#checklist-de-build-e-empacotamento).
  Não grave relatório.
- **Ambíguo:** pare e pergunte antes de continuar.

> Projeto Studio sem `pom.xml` na raiz não tem estrutura de build Maven a revisar:
> informe que está fora do escopo desta skill e encerre.

## Objetivo

Revisar, em modo **somente leitura**, a **montagem estrutural** do projeto Maven
multi-módulo de uma solução de parceiro para a Store e produzir um **relatório único**
por severidade (Crítico → Baixo), com **cobertura de 100% dos arquivos estruturais**.

A skill localiza o POM raiz (`<packaging>pom</packaging>`), mapeia os módulos, monta
um inventário e verifica **como o componente é montado e empacotado** — POMs,
ordenação de módulos, empacotamento EAR, descritores, dependências Maven,
Versionamento Semântico e provisionamento. Toda regra aplicada é referenciada de
`context/`.

## Escopo e Fronteira (o que NÃO é desta skill)

Esta skill cuida **apenas dos arquivos de montagem** do projeto Maven. Ela **não abre
o código-fonte** dos módulos.

| Dentro do escopo | Fora do escopo — encaminhar para |
|------------------|-----------------------------------|
| POM raiz e POMs de módulo; ordenação; dependências Maven; empacotamento EAR (ear-plugin, `webModule`) | — |
| Descritores: `component.xml`, `pages.xml`, `jboss-web.xml`, `web.xml`, `beans.xml`; campos **estruturais** do `application.info` (tipo, `code`, `context-root`, recursos declarados, slots) | — |
| Prefixo de parceiro no `application.code` dos módulos e na identidade do componente | — |
| Versionamento Semântico entre descritores; provisionamento (ZIP no pack, wizard); integridade `component.xml` `<dependency>` → arquivo físico; artefatos de desenvolvimento na árvore empacotável | — |
| **JS/FTL/CSS** de widget (XSS, CDN no código, performance, acessibilidade) | skill `fluig-code-review-partner-widgets` |
| Código **Java** dos módulos, layouts, datasets, formulários, eventos e wizard | revisão do conteúdo do artefato correspondente, com as skills de revisão aplicáveis |
| Revisão do **projeto inteiro** (estrutura + conteúdo numa passada) | composição manual: esta skill + as revisões de conteúdo por artefato, uma por vez, consolidadas ao final (fatiamento de operações em massa do `AGENTS.md`) |

A skill pode citar a **existência** de um recurso quando um descritor o referencia
(integridade referencial), mas a análise do **conteúdo** desse recurso pertence à
revisão do artefato correspondente.

## Quando Usar

- Antes do **App Review** / submissão do componente à Store.
- Para revisar a coesão do projeto Maven (POM raiz + módulos `config` e `pack`).
- Para auditar o empacotamento **EAR** (`webModule` por WAR, coerência do pack).
- Para conferir os descritores (`component.xml`, `pages.xml`, `jboss-web.xml`) e a
  integridade referencial entre eles.
- Para validar dependências Maven, prefixo de parceiro e a sincronia de versão
  (Versionamento Semântico) entre descritores.

Para revisar o **conteúdo** de um artefato (código de widget, dataset, REST, layout),
use a revisão específica daquele artefato.

## Entradas Esperadas

| Entrada | Obrigatoriedade | Descrição |
|---------|-----------------|-----------|
| Caminho raiz do componente Maven | **Obrigatória** | Pasta que contém o POM raiz com `<packaging>pom</packaging>`. |
| Tipo de solução | Opcional | Flows / Aplicativo / Runner, para ajustar o escopo ([§ 10](../../context/partner-store-review-rules.md#10-classificação-de-achados--app-review)). |
| Contexto de submissão | Opcional | Versão já aprovada, para avaliar o delta de Versionamento Semântico ([§ 4](../../context/partner-store-conventions.md#4-versionamento-semântico-e-sincronia-de-descritores)). |
| Foco / sintoma | Opcional | Área observada que orienta a priorização, sem reduzir a cobertura de 100% dos arquivos estruturais. |

Dado crítico ausente ou ambíguo (ex.: `groupId`/`artifactId`, prefixo vigente) → a
skill **interrompe e pergunta**, sem inventar valores.

## Contexto de Referência (Fonte de Verdade)

Ler antes de executar — **não reproduzir** o conteúdo; a regra vive em `context/`:

| Domínio | Referência |
|---------|------------|
| Estrutura multi-módulo, empacotamento EAR, dependências e escopos Maven, Nexus, `sourceEncoding`, context-root, `security-domain`, checklist de build | [backend-java-maven.md](../../context/backend-java-maven.md) — [Modelo Conceitual de Módulos](../../context/backend-java-maven.md#modelo-conceitual-de-módulos), [Empacotamento EAR (Módulo Pack)](../../context/backend-java-maven.md#empacotamento-ear-módulo-pack), [Context-root por Tipo de Módulo](../../context/backend-java-maven.md#context-root-por-tipo-de-módulo), [Segurança TOTVSTech](../../context/backend-java-maven.md#segurança-totvstech-security-domain), [Checklist de Build e Empacotamento](../../context/backend-java-maven.md#checklist-de-build-e-empacotamento) |
| `application.info` (campos estruturais, integridade de recursos), slots, chaves de identidade | [architecture.md](../../context/architecture.md) — [Integridade dos recursos e chaves (review)](../../context/architecture.md#integridade-dos-recursos-e-chaves-review), [Remapeamento de slots](../../context/architecture.md#remapeamento-de-slots), [Chaves de identidade](../../context/architecture.md#chaves-de-identidade-do-artefato-publicado) |
| Módulo config (`component.xml`, `pages.xml`), Ciclo de Provisionamento, wizard, `ActivationListener` | [partner-store-architecture.md](../../context/partner-store-architecture.md) |
| Nomenclatura da solução, `application.info` da Store, Versionamento Semântico, imutabilidade do `code`, prefixo de parceiro | [partner-store-conventions.md](../../context/partner-store-conventions.md) — [§ 1](../../context/partner-store-conventions.md#1-nomenclatura-da-solução), [§ 2](../../context/partner-store-conventions.md#2-applicationinfo-exigido-pela-store), [§ 4](../../context/partner-store-conventions.md#4-versionamento-semântico-e-sincronia-de-descritores), [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro) |
| Regras de review da Store (`component.xml`, `pages.xml`, EAR, exigências de build, anti-falso-positivo) e metodologia do relatório | [partner-store-review-rules.md](../../context/partner-store-review-rules.md) — [§ 6](../../context/partner-store-review-rules.md#6-componentxml), [§ 6.1](../../context/partner-store-review-rules.md#61-pagesxml--estrutura-unicidade-e-coerência-da-hierarquia), [§ 7](../../context/partner-store-review-rules.md#7-modelo-de-distribuição-ear), [§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo), [§ 28](../../context/partner-store-review-rules.md#28-java-build-e-empacotamento--exigências-da-store), [§ 32](../../context/partner-store-review-rules.md#32-metodologia-do-relatório-de-pré-review-contrato-transversal) |
| Slots de layouts nativos | [layouts-nativos-slots.md](../../context/references/layouts/layouts-nativos-slots.md) |

Esta skill produz **apenas achados estruturais** (`origem = delta`) e **não delega**
a skills base: a análise do conteúdo dos artefatos pertence às revisões listadas em
"Escopo e Fronteira".

## Estrutura de Saída

Um **relatório Markdown único** que segue o contrato transversal de pré-review em
[§ 32](../../context/partner-store-review-rules.md#32-metodologia-do-relatório-de-pré-review-contrato-transversal):

- **Ordem fixa** ([§ 32.3](../../context/partner-store-review-rules.md#323-ordem-fixa-das-seções-do-relatório)): Resumo → Tracker de Cobertura → Achados por Severidade (Crítico → Baixo) → Pontos Positivos → Plano de Ação Priorizado → Parecer Final.
- **Contrato de cada achado** ([§ 32.4](../../context/partner-store-review-rules.md#324-contrato-de-conteúdo-de-cada-achado)): `categoria`, `arquivo:linha`, `severidade`, `impacto`, `evidência` (3 a 15 linhas reais), `recomendação` segura, `referência` a `context/` e `origem` — aqui sempre `delta`.
- **Tracker de Cobertura** ([§ 32.2](../../context/partner-store-review-rules.md#322-cobertura-100-e-tracker-de-cobertura)): `arquivo` × `linhas` × `lido100` (`✅`/`❌`), cobrindo os **arquivos estruturais**; qualquer `❌` marca **"NÃO CONCLUÍDO — Cobertura Incompleta"**.
- **Parecer Final** ([§ 32.5](../../context/partner-store-review-rules.md#325-parecer-final)): exatamente um de **Provável Aprovação** \| **Atenção** \| **Correções Obrigatórias**.
- **Aviso de escopo** ([§ 32.7](../../context/partner-store-review-rules.md#327-aviso-de-escopo-pré-review-não-substitui-o-app-review)): o Resumo declara que a revisão cobre **apenas a estrutura do componente** e **não garante aprovação na Store**.
- **Severidade calibrada** ([§ 32.8](../../context/partner-store-review-rules.md#328-calibração-de-severidade-não-inflar-além-do-que-reprova)): Crítico só para o que reprova de fato; higiene de build (Nexus/metadado em `http://`) é Médio/Baixo "VERIFICAR MANUALMENTE".

## Regras Aplicáveis (resumo executivo)

Índice executivo: cada item aponta para a seção de `context/` com a regra completa.
Nenhum texto de regra é copiado. Todos os achados são estruturais (`origem = delta`).

**Estrutura, build e empacotamento:**

- **POM raiz** (packaging `pom`, `${revision}`, Nexus, `dependencyManagement` da plataforma como `provided`, plugins efetivos, `sourceEncoding` UTF-8; coerência do `artifactId`/`finalName`/`applicationName` × `<title>`, checada **por variante/módulo** como Baixo/Médio "VERIFICAR MANUALMENTE"; metadados e Nexus em `http://` são higiene de build) → [Checklist de Build e Empacotamento](../../context/backend-java-maven.md#checklist-de-build-e-empacotamento); [§ 1](../../context/partner-store-conventions.md#1-nomenclatura-da-solução); [§ 15](../../context/partner-store-review-rules.md#15-codificação-utf-8); [§ 18](../../context/partner-store-review-rules.md#18-ssltls-obrigatório-em-serviços-externos).
- **Dependências Maven** (escopo por `groupId`, `${fluig.version}` e exceções, `exclusions`, `system` scope/`systemPath` como anti-pattern, versão pré-release, falsos positivos de "limpeza", auditoria por escopo/CVE contra o baseline `sample-component`) → [backend-java-maven.md](../../context/backend-java-maven.md); [§ 20](../../context/partner-store-review-rules.md#20-dependências-de-produção-enxutas); [§ 28](../../context/partner-store-review-rules.md#28-java-build-e-empacotamento--exigências-da-store).
- **Módulos e ordenação** (`pack` obrigatório e por último; `config` obrigatório na Store; todo WAR no disco declarado em `<modules>`) → [Modelo Conceitual de Módulos](../../context/backend-java-maven.md#modelo-conceitual-de-módulos); [Módulo config](../../context/partner-store-architecture.md#módulo-config-componentxml-e-pagesxml); [§ 28](../../context/partner-store-review-rules.md#28-java-build-e-empacotamento--exigências-da-store).
- **Empacotamento EAR** (um `<webModule>` por WAR, `<type>` correto, `contextRoot` `/{application.code}`, `bundleFileName`/`finalName`; **cruzamento das três listas** — `<modules>` do POM raiz ↔ dependências do pack ↔ `<webModule>` do ear-plugin) → [Empacotamento EAR (Módulo Pack)](../../context/backend-java-maven.md#empacotamento-ear-módulo-pack); [Context-root por Tipo de Módulo](../../context/backend-java-maven.md#context-root-por-tipo-de-módulo); [§ 7](../../context/partner-store-review-rules.md#7-modelo-de-distribuição-ear).
- **Exigências de build da Store** (minificação, manifesto `Dependencies: com.fluig.common`, `warSourceExcludes`, artefatos soltos na raiz — salvo wizard que os instale) → [§ 28](../../context/partner-store-review-rules.md#28-java-build-e-empacotamento--exigências-da-store).

**Descritores e integridade referencial** (origem ambígua → "VERIFICAR MANUALMENTE", [§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo)):

- **`component.xml`** (`code` único e diferente do baseline `sample_component_app`; campos `developer*`; `<activationClass>` **opcional** — quando presente, confirmar que existe classe implementando `ActivationListener`, sem casar o valor com o FQN; cada `<dependency>` cruzada com o arquivo físico; integridade de campos — `<icon>` não-vazio, `<title>`≈`<description>`, placeholder residual, typo — como Baixo "VERIFICAR MANUALMENTE"; campos opcionais não são cobrados). O `<code>` é **chave de identidade**: não recomendar renomeá-lo em app já publicado → [§ 6](../../context/partner-store-review-rules.md#6-componentxml); [§ 4.5](../../context/partner-store-conventions.md#45-imutabilidade-do-code-do-componentxml); [ActivationListener na Store](../../context/partner-store-architecture.md#activationlistener-na-store-activationclass-e-keyring).
- **`pages.xml`** (página raiz agrupadora, hierarquia recursiva, coerência `parentCode` ↔ `code`, unicidade de `<code>`, `slot` ↔ layout, `permissions`; papéis nativos não são reportados) → [§ 6.1](../../context/partner-store-review-rules.md#61-pagesxml--estrutura-unicidade-e-coerência-da-hierarquia); [Remapeamento de slots](../../context/architecture.md#remapeamento-de-slots); [layouts-nativos-slots.md](../../context/references/layouts/layouts-nativos-slots.md).
- **`jboss-web.xml`** (context-root sem hifens; `security-domain` por tipo de módulo — config/widget/rest/wizard declaram, layout não declara), **`beans.xml`**, **`web.xml`** → [Segurança TOTVSTech](../../context/backend-java-maven.md#segurança-totvstech-security-domain); [Context-root por Tipo de Módulo](../../context/backend-java-maven.md#context-root-por-tipo-de-módulo).
- **`application.info` (campos estruturais)** (tipo, `code`, `context-root`, recursos declarados existem fisicamente; `simple.deploy` coerente com a presença de Java; propriedades `slot.*` são depreciadas e não entram na validação; **não possui campo de versão** — não reportar "versão ausente") → [Integridade dos recursos e chaves (review)](../../context/architecture.md#integridade-dos-recursos-e-chaves-review); [§ 2](../../context/partner-store-conventions.md#2-applicationinfo-exigido-pela-store).
- **Prefixo de parceiro** (`application.code` de widgets e layouts com `<prefixoparceiro>` aglutinado; um único prefixo no projeto; prefixo vigente lido do contexto e do repositório, nunca inventado) → [§ 6.2](../../context/partner-store-conventions.md#62-aplicação-por-tipo-de-artefato); [§ 6.4](../../context/partner-store-conventions.md#64-persistência-este-arquivo-é-a-memória-permanente-do-prefixo).
- **`groupId`/`artifactId` reservados e credenciais Nexus** (identificadores reservados, `settings.xml`, credencial exposta) → [backend-java-maven.md](../../context/backend-java-maven.md); [§ 2](../../context/partner-store-review-rules.md#2-credenciais-e-tokens-expostos); [§ 10](../../context/partner-store-review-rules.md#10-classificação-de-achados--app-review).

**Versionamento, provisionamento e higiene:**

- **Versionamento Semântico** (sincronia de **valor** entre `.mvn/maven.config`, `pom.xml`, `component.xml`, `STORE-INFO.md` e `MANUAL.md` — divergência é bloqueante; delta PATCH/MINOR/MAJOR frente à versão aprovada, apenas sugerido) → [§ 4.3](../../context/partner-store-conventions.md#43-detecção-de-delta-para-nova-release); [§ 4.4](../../context/partner-store-conventions.md#44-sincronia-mandatória-de-descritores).
- **Provisionamento e parametrização** (valor fixo externalizado; recursos como ZIP no pack; wizard idempotente) → [Ciclo de Provisionamento e Parametrização via Wizard](../../context/partner-store-architecture.md#ciclo-de-provisionamento-e-parametrização-via-wizard); [§ 16](../../context/partner-store-review-rules.md#16-valores-fixos-de-ambiente-hardcode-proibido); [§ 17](../../context/partner-store-review-rules.md#17-parametrização-configurações-alteráveis).
- **Artefatos de desenvolvimento na árvore empacotável** (`.project`, `.map`, `node_modules/`, `.git/`, temporários de IDE) → [Checklist de Build e Empacotamento](../../context/backend-java-maven.md#checklist-de-build-e-empacotamento); [§ 28](../../context/partner-store-review-rules.md#28-java-build-e-empacotamento--exigências-da-store).
- **Anti-falso-positivo e precedência** (ler o arquivo real antes de acusar ausência; precedência exceção > segurança > domínio > genérica) → [§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo); [§ 32.6](../../context/partner-store-review-rules.md#326-portão-de-deduplicação-base--delta).

## Política de Fallback

Na dúvida, **investigar mais**; sem dado ou padrão confirmado, **parar e perguntar** —
nunca inventar estrutura, valor ou achado.

| Condição | Resposta |
|----------|----------|
| Persona Consultor | Responder **"não se aplica"** (ver Passo 0) e encerrar sem relatório. |
| POM raiz não encontrado / caminho inválido | Informar que não é um componente Maven Fluig válido e **encerrar sem inventar estrutura**. |
| Nenhum arquivo estrutural encontrado | Informar **"Nenhum artefato encontrado"** e encerrar, sem relatório vazio. |
| Falha ao ler um arquivo estrutural | Registrar **❌** no Tracker, marcar **"NÃO CONCLUÍDO — Cobertura Incompleta"** e listar os arquivos não lidos ([§ 32.2](../../context/partner-store-review-rules.md#322-cobertura-100-e-tracker-de-cobertura)). |
| Pedido para revisar o **conteúdo** de um artefato ou o **projeto inteiro** | Informar que está **fora do escopo** e encaminhar conforme "Escopo e Fronteira"; **não** abrir o código dos módulos. |
| Dado crítico ausente (ex.: `groupId`/`artifactId`, prefixo vigente) | **Interromper**, listar o que falta e **perguntar**; nunca inventar valor. |
| Origem ambígua (recurso de `pages.xml`, papel/grupo, slot) | Reportar como **Médio / "VERIFICAR MANUALMENTE"** com o trecho exato ([§ 22](../../context/partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo)). |
| Padrão exigido não documentado em `context/` | **Parar** e pedir que o padrão oficial seja adicionado a `context/` antes de prosseguir; não extrapolar por analogia. |
| Recomendação potencialmente perigosa | Nunca sugerir correção que introduza risco; propor a alternativa segura ([§ 14](../../context/partner-store-review-rules.md#14-recomendações-de-correção-seguras)). |

## Procedimento

Execução **somente leitura**, focada na **estrutura**, com leitura **integral, sem
amostragem** ([§ 32.2](../../context/partner-store-review-rules.md#322-cobertura-100-e-tracker-de-cobertura)) dos arquivos estruturais.

1. **Passo 0.** Emitir `Estrutura` e `Persona`. Consultor ou Studio → Fallback.
2. **Inventário + escopo.** Localizar o POM raiz (`<packaging>pom</packaging>`), mapear os módulos (incluindo `config`/`pack` e a ordenação) e listar os **arquivos estruturais** (POMs, `.mvn/maven.config`, descritores, `application.info`, `STORE-INFO.md`, `MANUAL.md`). POM raiz ausente → Fallback.
3. **Leitura 100% + Tracker de Cobertura.** Ler por inteiro cada arquivo estrutural e registrar uma linha por arquivo. O código-fonte dos módulos **não entra** no Tracker desta skill.
4. **Verificações estruturais (`origem = delta`).** Aplicar "Regras Aplicáveis", incluindo o cruzamento das três listas de módulos, a integridade de campos do `component.xml`, o `security-domain` por tipo de módulo, o `application.info` estrutural, o prefixo de parceiro, a sincronia de versão e a varredura de artefatos de desenvolvimento.
5. **Portão anti-falso-positivo.** Rastrear a origem real, aplicar exceções e precedência; origem ambígua → "VERIFICAR MANUALMENTE"; calibrar a severidade ([§ 32.8](../../context/partner-store-review-rules.md#328-calibração-de-severidade-não-inflar-além-do-que-reprova)).
6. **Consolidação.** Montar o relatório único na ordem de [§ 32.3](../../context/partner-store-review-rules.md#323-ordem-fixa-das-seções-do-relatório), sem achado duplicado, com o aviso de escopo no Resumo.
7. **Parecer Final e gravação.** Emitir exatamente um rótulo de [§ 32.5](../../context/partner-store-review-rules.md#325-parecer-final) e gravar o arquivo (ver "Saída Esperada").

## Saída Esperada

Um arquivo Markdown **gravado na raiz do alvo**, nomeado
`pre-review-component-<AAAA-MM-DD>.md` — a **única escrita permitida** no repositório
do parceiro ([§ 32.1](../../context/partner-store-review-rules.md#321-modo-somente-leitura) /
[§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).
O arquivo abre por um **cabeçalho de pré-review** que declara que o resultado é um
**pré-review preparatório** — passar nele **não** significa aprovação e **não**
substitui o App Review oficial ([§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)) —
resumindo escopo, Parecer Final e contagem por severidade. Em seguida vem o relatório
completo na ordem fixa. Nenhum outro arquivo do projeto é criado, alterado ou removido,
e o código-fonte dos módulos não é aberto.

## Exemplo de Uso

```
fluig-code-review-partner-component ./meu-componente-fluig
```

Esqueleto do relatório (arquivo `pre-review-component-<AAAA-MM-DD>.md`):

```markdown
# Pré-Review de Componente — <componente>

> ⚠️ **Pré-review preparatório.** Este resultado é um passo interno de higiene e
> **não** significa aprovação: **não substitui o App Review oficial** da Store.
> - **Escopo:** estrutura do componente (POMs, EAR, descritores).
> - **Parecer:** Provável Aprovação | Atenção | Correções Obrigatórias
> - **Achados:** Crítico <n> · Alto <n> · Médio <n> · Baixo <n>

## Resumo
- Módulos inventariados: <n>
- Aviso de escopo: esta revisão cobre apenas a estrutura do componente; o conteúdo de
  widgets, REST, datasets, layouts e eventos é avaliado pelas revisões específicas.

## Tracker de Cobertura
| Arquivo | Linhas | Lido 100% |
|---------|--------|-----------|
| pom.xml | 140 | ✅ |
| meucomp-config/src/main/resources/component.xml | 32 | ✅ |

## Achados por Severidade
### Crítico
- **[Versionamento]** `meucomp-config/src/main/resources/component.xml:5` — <impacto>
  - Evidência (3–15 linhas): <trecho real>
  - Recomendação: <correção segura>
  - Referência: context/partner-store-conventions.md § 4.4
  - Origem: delta

## Pontos Positivos
- <o que já está em conformidade>

## Plano de Ação Priorizado
1. <correção mais urgente>

## Parecer Final
Correções Obrigatórias
```

Como referência de **estrutura** de um componente Maven multi-módulo (POM raiz +
`config` + `pack` + descritores + EAR), consulte
[`../../examples/component/`](../../examples/component/). O exemplo é molde para
cruzar desvios; não substitui a fonte de verdade em `context/`.

## Checklist de Validação

- [ ] Estrutura e persona classificadas (Passo 0) e emitidas como `Estrutura: <Studio|Maven|Híbrida> (motivo)` e `Persona: <Parceiro|Consultor> (motivo)`; se Consultor, a skill respondeu "não se aplica" e não gravou relatório.
- [ ] A revisão cobriu **apenas arquivos estruturais**; o código-fonte dos módulos não foi aberto.
- [ ] Tracker de Cobertura com 100% dos arquivos estruturais `✅`, ou incompletude sinalizada com a lista dos não lidos ([§ 32.2](../../context/partner-store-review-rules.md#322-cobertura-100-e-tracker-de-cobertura)).
- [ ] Três listas de módulos coerentes: todo WAR dependência do pack tem `<webModule>` e todo módulo do agregador chega ao pack.
- [ ] Prefixo de parceiro verificado no `application.code` dos módulos, com o prefixo vigente lido do contexto/repositório ([§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)).
- [ ] Divergência de valor de versão entre descritores gerou Crítico e Parecer "Correções Obrigatórias" ([§ 4.4](../../context/partner-store-conventions.md#44-sincronia-mandatória-de-descritores)).
- [ ] Só os campos obrigatórios do `component.xml` foram cobrados; achados semânticos (typo, `title`≈`description`, `artifactId` genérico) ficaram como Baixo/Médio "VERIFICAR MANUALMENTE".
- [ ] Nenhuma recomendação de renomear o `<code>` de app já publicado ([§ 4.5](../../context/partner-store-conventions.md#45-imutabilidade-do-code-do-componentxml)).
- [ ] Cada achado com `arquivo:linha`, evidência de 3–15 linhas, recomendação segura, referência a `context/` e `origem = delta` ([§ 32.4](../../context/partner-store-review-rules.md#324-contrato-de-conteúdo-de-cada-achado)).
- [ ] Severidade calibrada: Crítico só para o que reprova; higiene de build como Médio/Baixo ([§ 32.8](../../context/partner-store-review-rules.md#328-calibração-de-severidade-não-inflar-além-do-que-reprova)).
- [ ] Aviso de escopo no Resumo ([§ 32.7](../../context/partner-store-review-rules.md#327-aviso-de-escopo-pré-review-não-substitui-o-app-review)) e cabeçalho de pré-review presente ([§ 32.9](../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)).
- [ ] Parecer Final é exatamente um dos três rótulos ([§ 32.5](../../context/partner-store-review-rules.md#325-parecer-final)).
- [ ] Relatório gravado em `pre-review-component-<AAAA-MM-DD>.md` na raiz do alvo, e nenhum outro arquivo foi alterado ([§ 32.1](../../context/partner-store-review-rules.md#321-modo-somente-leitura) / [§ 32.10](../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md)).
- [ ] Nenhuma regra técnica foi copiada para a skill — apenas referenciada.
