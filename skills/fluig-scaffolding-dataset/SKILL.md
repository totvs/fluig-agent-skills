---
name: fluig-scaffolding-dataset
description: Gera o esqueleto de um Dataset customizado do Fluig — o arquivo JavaScript server-side com a(s) função(ões) nomeada(s) que a plataforma invoca para construir e retornar o conjunto de dados via API pública de Dataset, aplicando filtros/constraints e ordenação. Use quando o desenvolvedor pedir para criar/iniciar um novo dataset customizado a partir de um nome/propósito, campos e fontes de dados.
argument-hint: 'nome e/ou propósito do dataset, campos e fontes/filtros (ex.: "dataset de filiais com código, nome e UF, filtrando ativas")'
---

# Scaffolding de Dataset (customizado, server-side)

Esta skill gera o esqueleto de um Dataset customizado do Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Passo 0a — Estrutura

Antes de gerar, identifique a **estrutura do projeto** — ela decide o **layout de
pastas**, e é independente da persona. Emita
`Estrutura: <Studio|Maven|Híbrida> (motivo)`:

- **Studio** — projeto Fluig sem `pom.xml` na raiz. O dataset é gerado em
  `datasets/`.
- **Maven** — projeto multi-módulo com `pom.xml` na raiz. O dataset fica em
  `datasets/` do projeto (P4: forms/datasets ficam em `forms/` e `datasets/`, e o
  agente pergunta na dúvida) — ver [backend-java-maven.md](../../context/backend-java-maven.md).
- **Híbrida** — estrutura Studio com agregador Maven interno, sem `pom.xml` na
  raiz. Trate como Studio para o layout de pastas.

## Passo 0b — Persona

Classifique a persona do desenvolvedor seguindo a cascata em
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Se restar ambígua, pare e pergunte antes de continuar.
Emita `Persona: <Parceiro|Consultor> (motivo)` antes de gerar — a persona
determina **apenas** se a **camada Store** entra: Consultor cria o dataset sem a
camada Store; Parceiro aplica o prefixo `<PREFIXO_PARCEIRO>_` ao nome do dataset
(ver
[§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)).

## Objetivo

Produzir, com responsabilidade única, o **esqueleto de um Dataset customizado** do Fluig: o arquivo JavaScript executado no servidor com a(s) **função(ões) nomeada(s)** que a plataforma invoca para **construir e retornar** o conjunto de dados, usando **somente a API pública de Dataset**, já com pontos para aplicar filtros/constraints e ordenação.

## Quando Usar

- Ao criar um **novo dataset customizado** do Fluig a partir do zero, para expor/consultar dados a serem consumidos por widgets e forms.
- Quando o desenvolvedor fornece um nome/propósito, os campos do dataset e a(s) fonte(s) de dados e quer um ponto de partida correto (função pública + estrutura) seguindo as convenções oficiais.
- Quando é preciso garantir, desde o início, o uso exclusivo da API pública de Dataset e a aplicação correta de filtros (constraints) e ordenação.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Nome do dataset | Identificador do dataset customizado (ex.: `branches`) | sim |
| Campos | Lista de colunas/campos do dataset (nome de cada coluna) | sim |
| Filtros/constraints | Critérios de filtragem esperados (campo, valores, tipo) | não |
| Ordenação | Campo(s) por que o resultado deve ser ordenado | não |
| Fonte de dados | Origem dos registros (ex.: outro dataset, dados informados, serviço externo) | não |
| Serviço externo | Código do serviço cadastrado no Fluig (`serviceCode`) quando a fonte for uma API REST de terceiro | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [architecture.md](../../context/architecture.md) — modelo conceitual do **Dataset**: customização **server-side** que expõe/consulta dados por meio da **API pública de Dataset**; o desenvolvedor implementa **funções nomeadas** que a plataforma invoca em pontos definidos para resolver o dataset; o resultado é **consumido por widgets/forms**. Veja também a seção "Estrutura de um Projeto Fluig": o dataset fica na pasta `datasets/`.
- [technologies.md](../../context/technologies.md) — **runtime público de scripting server-side**: datasets são escritos em **JavaScript executado no servidor sobre o motor Mozilla Rhino** (base **ES5**, com suporte apenas parcial a ES6+), interagindo apenas com a API pública de seu contexto (sem acesso a componentes internos do servidor). Veja a seção "Runtime Rhino: sintaxe rígida (não é ES6+)" para as restrições de sintaxe e a seção de **interoperabilidade com Java**.
- [datasets-nativos.md](../../context/datasets-nativos.md) — Datasets nativos da plataforma (colleague, group, folder, document, cardIndex, appointment, etc.) — **verificar antes de criar dataset customizado** que replica funcionalidade nativa.
- [conventions.md](../../context/conventions.md) — "Convenções de Dataset" (nomenclatura `ds` + descritor; anti-padrão "Dataset chamando Dataset").
- [partner-store-conventions.md](../../context/partner-store-conventions.md) — [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro): prefixo de namespacing do parceiro (quando persona = Parceiro).

## Estrutura de Saída

Diferentemente de widget/layout, o dataset customizado **não gera uma árvore de
pastas**: o artefato é **um único arquivo JavaScript server-side** com a(s)
função(ões) nomeada(s) que a plataforma invoca. A estrutura oficial e o local do
arquivo são fonte de verdade em `architecture.md` (seção "Estrutura de um Projeto
Fluig": o dataset fica em `datasets/`).

```text
datasets/
└── <nomeDataset>.js        # JS server-side (Rhino/ES5): createDataset(fields, constraints, sortFields)
```

> **Nome do arquivo × nome do dataset.** O **nome do dataset** (o identificador
> registrado na plataforma) segue a convenção **por persona** — Consultor: `ds` +
> descritor camelCase (ex.: `dsBranches`); Parceiro: prefixo de namespacing do
> parceiro no padrão snake por cima (ex.: `<prefixoparceiro>_ds_branches`, do
> onboarding — **nunca inventado**; ver `partner-store-conventions.md` [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)). Detalhe em
> "Regras Aplicáveis" abaixo.
>
> **Ponto de entrada.** O arquivo implementa a função pública
> `createDataset(fields, constraints, sortFields)`, que constrói o conjunto com a
> API pública (`DatasetBuilder`) e retorna o dataset — ver `architecture.md`,
> "API pública de Dataset — assinaturas". **Nenhum** descritor/empacotamento extra
> é gerado por esta skill (o dataset customizado é só o `.js`).
>
> **Se a necessidade já é atendida por dataset nativo, não há saída** — ver a
> "Política de Fallback" abaixo (orientar o reuso do nativo em vez de gerar o `.js`).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- **Antes de criar dataset customizado, verificar se a necessidade já é atendida por dataset nativo** (colleague, group, folder, document, cardIndex, appointment, etc.) — não duplicar funcionalidade da plataforma. Se já existir dataset nativo adequado, orientar o desenvolvedor a usar o nativo via `DatasetFactory.getDataset()` ou API REST v2 → ver `datasets-nativos.md`.
- **Nomenclatura do dataset (uma regra, por persona):**
  - **Consultor:** prefixo `ds` + nome descritivo em camelCase (ex.: `dsBranches`) → ver `conventions.md`, "Convenções de Dataset".
  - **Parceiro:** o nome recebe o **prefixo de namespacing do parceiro** antes do descritor, no padrão snake definido em `partner-store-conventions.md` [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro) (ex.: `<prefixoparceiro>_ds_branches`). O prefixo vem do onboarding na Store — **nunca invente**; se não for conhecido, trate como pendência e pergunte.
  - Os exemplos neutros usam nomes simples (ex.: `branches`) **apenas** para ilustrar a função; ao gerar de verdade, aplique a convenção da persona classificada no Passo 0.
- Implemente a(s) **função(ões) nomeada(s)** que a plataforma invoca para construir/retornar o dataset — o ponto de entrada público é a função `createDataset(fields, constraints, sortFields)` → ver `architecture.md`.
- Use **SOMENTE a API pública de Dataset**: construa o resultado com `DatasetBuilder.newDataset()` e adicione colunas/linhas com `addColumn(...)`/`addRow(...)`; para consultar outro dataset, use `DatasetFactory.getDataset(name, fields, constraints, order[, callback])` (no servidor, **sempre síncrono** — não passe `callback`) → ver `architecture.md`, seção "API pública de Dataset — assinaturas".
- **Retorne o conjunto de dados** no formato esperado (o objeto de dataset construído pelo `DatasetBuilder`); o retorno de `getDataset(...)` expõe os registros em `.values` e as colunas em `.columns` → ver `architecture.md`.
- Aplique **filtros/constraints** via API pública com a assinatura exata `DatasetFactory.createConstraint(field, initialValue, finalValue, type[, likeSearch])`, onde `type` é `ConstraintType.MUST` (1) | `SHOULD` (2) | `MUST_NOT` (3) e `likeSearch` (booleano opcional) habilita busca parcial (LIKE). Para igualdade simples, repita o valor em `initialValue`/`finalValue`; para faixa (BETWEEN), informe limites distintos. Respeite os parâmetros `constraints` e `sortFields` recebidos pela função → ver `architecture.md`, seção "API pública de Dataset — assinaturas".
- **Leia os filtros recebidos** percorrendo o array `constraints` e lendo cada item pelas **propriedades** `fieldName`, `initialValue`, `finalValue` e `constraintType` (doc oficial TDN "Construção do Dataset Avançado" — ex.: `constraints[i].fieldName`, e tipo comparado direto: `constraints[i].constraintType == ConstraintType.MUST`). No Rhino os valores podem vir como `java.lang.String` — normalize com `String(...)` antes de comparar. Isolar isso numa função auxiliar (ex.: `obterParametro(constraints, campo)`) é um padrão comum → ver `architecture.md`.
- **⚠️ Ignore constraints de CONTROLE ao filtrar:** a plataforma injeta `sqlLimit` (limite; é o `resultLimit` do zoom, padrão 300), e possivelmente `sqlOffset`/`sqlOrderBy` — **não** são colunas. Tratar toda constraint como filtro de coluna faz o dataset **descartar todos os registros** (zoom/datatable vazio). Pule constraints de controle e também as cujo `fieldName` **não é** coluna do dataset → ver `architecture.md` › "Constraints de CONTROLE".
- **⚠️ Honre o `likeSearch`:** quando a constraint tem `likeSearch=true`, o filtro é **parcial (LIKE)** — compare por "contém" (`indexOf`), não por igualdade; é como o **zoom** busca enquanto o usuário digita. Só igualdade exata deixaria a busca do zoom quebrada (exigiria o valor inteiro) → ver `architecture.md` › "Constraints de CONTROLE / likeSearch".
- Para consumir um **serviço externo (REST)**, não há `fetch`: use o **Cadastro de Serviços** via `fluigAPI.getAuthorizeClientService()`, montando o objeto com `serviceCode`/`endpoint`/`method`/`timeoutService` (o `companyId` é opcional, resolvido a partir do `serviceCode`), invocando com `invoke(JSON.stringify(data))` e lendo a resposta com `vo.getResult()` + `JSON.parse(...)` → ver `technologies.md`.
- **Trate erros retornando dado**, não exceção solta: capture o erro com `try/catch` e retorne um dataset com uma **coluna/linha de erro** (ex.: coluna `ERROR`), para o consumidor receber um resultado previsível → ver `architecture.md`.
- Código **server-side no motor Rhino** (base **ES5**, **não** ES6+): use `var` e `function` tradicionais, concatene strings com `+` e **evite** arrow functions, template literals, `let`/`const`, destructuring, classes ES6 e `Promise`/`async`/`await`; **sem acesso a componentes internos** do servidor. Quando útil, é possível usar **interop com Java** (`Packages.*`, `importPackage`/`importClass`) → ver `technologies.md`.
- **Valores que vêm do Java** (campos, constraints) podem ser `java.lang.String` — encadear métodos sobrecarregados (`.replace`, `.split`) gera erro de **sobrecarga ambígua**, inclusive com regex e após `.toString()`. Envolva com `String(...)` antes de operar → ver `technologies.md` › "Interoperabilidade com Java (Rhino)".
- Se o nome exato de uma função/método não puder ser confirmado como público, descreva o comportamento de forma genérica (uma função nomeada que a plataforma invoca para resolver o dataset, retornando o conjunto via API pública) em vez de inventar → ver `architecture.md`.

## Política de Fallback

- **Dataset nativo existe:** se a consulta/necessidade corresponde a funcionalidade já oferecida por dataset nativo (ver `datasets-nativos.md` — colleague, group, folder, document, cardIndex, appointment, etc.), **não gerar o customizado**. Orientar o desenvolvedor a consumir o dataset nativo via `DatasetFactory.getDataset(nome, fields, constraints, order)` ou API REST v2 (`/dataset/api/v2/<nome>/search`). Apresentar o nome do dataset nativo aplicável, as colunas principais e exemplo de chamada.
- **Faltando nome, campos ou fonte de dados essenciais:** solicitar antes de gerar — não assumir colunas nem inventar a origem dos registros.
- **Nome exato de função/método/API não confirmável como público:** descrever o comportamento de forma genérica (uma função nomeada que a plataforma invoca para resolver o dataset, retornando o conjunto via API pública) e **perguntar/registrar como pendência** em vez de inventar assinaturas → ver `architecture.md`.
- **Parceiro — prefixo de namespacing:** vem do onboarding na Store (`partner-store-conventions.md` [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)) — **nunca inventar**; se desconhecido, tratar como pendência e perguntar.

## Procedimento

1. **Consultar `datasets-nativos.md`** para confirmar que a necessidade não é atendida por dataset nativo existente (colleague, group, folder, document, cardIndex, appointment, etc.). Se já existir dataset nativo adequado, **não gerar o customizado** e orientar o desenvolvedor a consumir o dataset nativo via `DatasetFactory.getDataset()` ou API REST v2. Só prosseguir para o passo 2 se a necessidade **não** for atendida por dataset nativo.
2. Definir o nome do dataset customizado e os **campos** (colunas) a partir da entrada, além das fontes de dados e dos filtros/ordenação esperados.
3. Criar o arquivo JavaScript do dataset e implementar a **função pública** `createDataset(fields, constraints, sortFields)` como ponto de entrada que a plataforma invoca.
4. Dentro da função, **construir o dataset** com a API pública: `DatasetBuilder.newDataset()`, declarando as colunas com `addColumn(...)` e populando registros com `addRow(...)` (ou consultando outra fonte com `DatasetFactory.getDataset(...)`).
5. **Aplicar filtros/constraints e ordenação** via API pública — usar os parâmetros `constraints`/`sortFields` recebidos e/ou criar constraints com `DatasetFactory.createConstraint(field, initialValue, finalValue, type[, likeSearch])` usando `ConstraintType.*`. Quando precisar do valor de um filtro do chamador, lê-lo pelas **propriedades** da constraint (`fieldName`/`initialValue`/`finalValue`/`constraintType`; ex.: função auxiliar `obterParametro`), normalizando com `String(...)` no Rhino.
6. Se a fonte for um **serviço externo REST**, consumi-lo pelo Cadastro de Serviços (`fluigAPI.getAuthorizeClientService()` + `invoke(...)`), parseando `vo.getResult()` e populando as linhas com os campos retornados.
7. **Tratar erros** com `try/catch`, retornando um dataset com coluna/linha de erro (ex.: `ERROR`) em caso de falha.
8. **Retornar** o objeto de dataset construído.
9. Validar o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Esqueleto de dataset pronto para evoluir, contendo:

- O **arquivo JavaScript** server-side do dataset com a(s) **função(ões) pública(s)** que a plataforma invoca — no mínimo `createDataset(fields, constraints, sortFields)`.
- A construção do conjunto de dados via **API pública** (`DatasetBuilder`, colunas e registros), com pontos para aplicar **constraints** e **ordenação**.
- Retorno do conjunto de dados no formato esperado, sem qualquer acesso a componentes internos.

Tudo em conformidade com `context/architecture.md` e `context/technologies.md`.

## Exemplo de Uso

Use `examples/dataset/` como referência mínima. O `dataset.example.js` demonstra a função pública `createDataset`, a construção do conjunto via `DatasetBuilder` e a aplicação de constraints; o `dataset-external-service.example.js` demonstra a leitura de filtro do chamador, o consumo de uma API REST externa pelo Cadastro de Serviços e o tratamento de erro como dado. Trate-os como trechos de referência, não como projeto completo.

## Checklist de Validação

- [ ] Consultou `datasets-nativos.md` e confirmou que a necessidade **não** é atendida por dataset nativo (colleague, group, folder, document, cardIndex, appointment, etc.) — se dataset nativo adequado existe, não gerou o customizado e orientou o desenvolvedor a usar o nativo.
- [ ] A(s) **função(ões) pública(s)** que a plataforma invoca estão implementadas (ex.: `createDataset(fields, constraints, sortFields)`).
- [ ] O conjunto de dados é construído e retornado usando **somente a API pública de Dataset** (`DatasetBuilder`, `DatasetFactory`), sem acesso a componentes internos.
- [ ] Os **campos** (colunas), **filtros/constraints** e a **ordenação** estão corretos e usam a API pública com as assinaturas exatas — `createConstraint(field, initialValue, finalValue, type[, likeSearch])` com `ConstraintType.*` e `getDataset(name, fields, constraints, order[, callback])` (servidor sempre síncrono, sem `callback`); a leitura de filtros do chamador usa as **propriedades** `fieldName`/`initialValue`/`finalValue`/`constraintType` (não getters), normalizadas com `String(...)`.
- [ ] A filtragem **ignora constraints de controle** (`sqlLimit`/`sqlOffset`/...) e constraints cujo `fieldName` **não é** coluna do dataset — tratá-las como filtro zeraria o resultado (zoom/datatable vazio). Ver `architecture.md` › "Constraints de CONTROLE".
- [ ] A filtragem **honra `likeSearch`**: `likeSearch=true` faz busca **parcial** (contém/`indexOf`), não igualdade — senão a busca do zoom só retorna com o valor exato digitado. Ver `architecture.md` › "likeSearch".
- [ ] **Leitura do retorno de `getDataset` server-side** usa `result.getValue(i, "coluna")` + `result.rowsCount` — **não** `result.values[i].coluna` (no Rhino quebra com `Java class "[Ljava.lang.Object;" has no ... field`). `.values[i].col` só no cliente. Ver `architecture.md` › "API pública de Dataset".
- [ ] Consumo de **serviço externo** (se houver) é feito pelo Cadastro de Serviços (`fluigAPI.getAuthorizeClientService()` + `invoke`), nunca por `fetch`/HTTP de navegador.
- [ ] **Erros são retornados como dado** (coluna/linha de erro via `try/catch`), não como exceção solta.
- [ ] Código server-side compatível com o **motor Rhino** (base **ES5**): `var`/`function` tradicionais, sem arrow functions, template literals, `let`/`const` ou outros recursos ES6+ não suportados.
- [ ] **Arquitetura:** o dataset consulta a fonte real (banco/serviço) diretamente, sem encadear chamadas a outros datasets customizados (ver anti-padrão "Dataset chamando Dataset" em `context/conventions.md`).
- [ ] **Query:** filtros/constraints são aplicados na origem da consulta (não filtrados depois, em memória, sobre o conjunto completo).
- [ ] **Performance (PK + empresa):** quando consulta um dataset nativo, filtra pelos campos da **Chave Primária** e, quando a PK inclui `companyId`, **também pela empresa/tenant** (campos indexados) — ver `datasets-nativos.md` › "Performance: filtrar pela PK e pela empresa". Em dataset **avançado**, o código foi projetado para **honrar** esses filtros (PK/`companyId`) na origem, lendo-os do parâmetro `constraints`.
- [ ] **Performance:** o dataset não retorna mais colunas/linhas do que o consumidor precisa; sem consulta redundante dentro de laço.
- [ ] **Integração:** consumo de serviço externo passa pelo Cadastro de Serviços, nunca por acesso direto não autorizado.
- [ ] **Sincronização/versionamento:** mudanças de estrutura (campos/colunas) são compatíveis com os consumidores existentes ou versionadas de forma a não quebrá-los.
- [ ] **Nomenclatura por persona:** Consultor → prefixo `ds` + descritor camelCase (ex.: `dsBranches`, ver `context/conventions.md`); Parceiro → prefixo de namespacing do parceiro no padrão snake por cima (ex.: `<prefixoparceiro>_ds_branches`, ver `partner-store-conventions.md` [§ 6](../../context/partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro); prefixo do onboarding, nunca inventado).
