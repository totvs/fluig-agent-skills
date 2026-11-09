# Exemplo: Component (referência mínima de estrutura)

> Referência mínima de **estrutura de módulos** de um componente parceiro (projeto
> Maven multi-módulo). Não é um projeto completo nem gera código: serve para o
> revisor **cruzar desvios** de organização física do artefato.
>
> Esta referência **não duplica** regra técnica — todo detalhe ("o que é") vive na
> fonte de verdade em [`../../context/partner-store-architecture.md`](../../context/partner-store-architecture.md).

## Uso

Este README é o baseline estrutural que o revisor compara contra o componente real
para apontar módulos ausentes, ordenação incorreta ou empacotamento fora do padrão.

## Placeholders (nunca inventar valores críticos)

Os valores abaixo são **placeholders explícitos**. Dados críticos que só o
desenvolvedor pode fornecer nunca são inventados — na dúvida, a skill interrompe e
pergunta (ver a Política de Fallback da skill):

| Placeholder | Significado |
|-------------|-------------|
| `<SEU_GROUP_ID>` | `groupId` Maven do projeto do parceiro |
| `<SEU_ARTIFACT_ID>` | `artifactId` base do projeto (prefixo dos diretórios dos módulos) |
| `<SEU_APPLICATION_CODE>` | `application.code` da solução (usado no `contextRoot` do EAR) |

## Estrutura de módulos esperada

Um componente parceiro é um **projeto Maven multi-módulo**: um POM raiz agregador
(`<packaging>pom</packaging>`) que agrupa módulos com packaging próprio (WAR, EJB,
JAR ou EAR). O build gera um **EAR** para deploy no servidor Fluig.

Os módulos **`config`** (WAR) e **`pack`** (EAR) são **obrigatórios** em todo
projeto; os demais são opcionais conforme o que a solução entrega. A regra completa
de módulos, obrigatoriedade e papel está na tabela "Modelo Conceitual de Módulos"
de [`../../context/backend-java-maven.md`](../../context/backend-java-maven.md).

```text
<SEU_ARTIFACT_ID>/                       ← POM raiz (packaging: pom)
├── pom.xml
├── .gitignore
├── .mvn/
│   └── maven.config                     ← origem canônica da versão (-Drevision=X.Y.Z)
├── <SEU_ARTIFACT_ID>-config/            ← WAR (obrigatório) — component.xml, pages.xml
│   ├── pom.xml
│   └── src/main/...
├── <SEU_ARTIFACT_ID>-widget/            ← WAR (opcional)
│   ├── pom.xml
│   └── src/main/...
├── <SEU_ARTIFACT_ID>-layout/            ← WAR (opcional)
│   ├── pom.xml
│   └── src/main/...
├── <SEU_ARTIFACT_ID>-entity/            ← JAR (opcional — exceção de persistência)
│   ├── pom.xml
│   └── src/main/...
├── <SEU_ARTIFACT_ID>-service/           ← EJB (opcional — exceção de persistência)
│   ├── pom.xml
│   └── src/main/...
├── <SEU_ARTIFACT_ID>-rest/              ← WAR (opcional)
│   ├── pom.xml
│   └── src/main/...
├── <SEU_ARTIFACT_ID>-wizard/            ← WAR (opcional) — instalação idempotente
│   ├── pom.xml
│   └── src/main/...
└── <SEU_ARTIFACT_ID>-pack/              ← EAR (obrigatório, SEMPRE último)
    └── pom.xml
```

> Convenção de nomenclatura de diretório, ordenação canônica dos módulos no POM
> raiz (pack sempre por último) e a estrutura interna de cada artefato: ver
> [`../../context/backend-java-maven.md`](../../context/backend-java-maven.md).

## Empacotamento EAR (módulo `pack`)

O módulo `pack` (`<packaging>ear</packaging>`) agrega os demais módulos. A forma de
declaração **depende do packaging** de cada módulo:

- Módulos **WAR** (config, widget, layout, rest, wizard) → declarados como
  `<webModule>` no `maven-ear-plugin`, com `<contextRoot>/<SEU_APPLICATION_CODE></contextRoot>`.
- Módulos **EJB** (service) e **JAR** (entity) → incluídos **apenas** como
  `<dependency>` do pack com `<type>` correspondente e `scope compile` (o Maven os
  empacota pelo `<type>`, sem `<ejbModule>`/`<jarModule>` explícito).

O contrato completo do EAR (webModule por WAR, `<type>` por módulo, `finalName`,
herança de POM, `${revision}`, Nexus, `dependencyManagement`) é fonte de verdade em
[`../../context/backend-java-maven.md`](../../context/backend-java-maven.md)
(seções "Empacotamento EAR", "POM Raiz — Elementos Estruturais" e "Herança de POM
nos Módulos").

## O que o revisor cruza contra este baseline

- Presença dos módulos obrigatórios (`config` + `pack`) e ordenação canônica.
- Coerência do empacotamento EAR (cada WAR como `webModule`; EJB/JAR como
  `dependency` por `<type>`).
- `contextRoot` alinhado ao `<SEU_APPLICATION_CODE>`.
- Sincronia de versão entre os descritores do pacote (`.mvn/maven.config`,
  `pom.xml`, `application.info`, `component.xml`, `STORE-INFO.md`, `MANUAL.md`).

> Fonte de verdade: [`../../context/partner-store-architecture.md`](../../context/partner-store-architecture.md)
> (estrutura multi-módulo, empacotamento EAR, ciclo de provisionamento e sincronia
> de descritores).
