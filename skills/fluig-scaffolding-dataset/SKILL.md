---
name: fluig-scaffolding-dataset
description: Gera o esqueleto de um Dataset customizado do Fluig — o arquivo JavaScript server-side com a(s) função(ões) nomeada(s) que a plataforma invoca para construir e retornar o conjunto de dados via API pública de Dataset, aplicando filtros/constraints e ordenação. Use quando o desenvolvedor pedir para criar/iniciar um novo dataset customizado a partir de um nome/propósito, campos e fontes de dados.
argument-hint: nome e/ou propósito do dataset, campos e fontes/filtros (ex.: "dataset de filiais com código, nome e UF, filtrando ativas")
---

# Scaffolding de Dataset (customizado, server-side)

Esta skill gera o esqueleto de um Dataset customizado do Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

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
| Serviço externo | Código do serviço cadastrado no Fluig (`serviceCode`) quando a fonte for uma API REST externa | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [architecture.md](../../context/architecture.md) — modelo conceitual do **Dataset**: customização **server-side** que expõe/consulta dados por meio da **API pública de Dataset**; o desenvolvedor implementa **funções nomeadas** que a plataforma invoca em pontos definidos para resolver o dataset; o resultado é **consumido por widgets/forms**. Veja também a seção "Estrutura de um Projeto Fluig Studio": o dataset fica na pasta `datasets/`.
- [technologies.md](../../context/technologies.md) — **runtime público de scripting server-side**: datasets são escritos em **JavaScript executado no servidor sobre o motor Mozilla Rhino** (base **ES5**, com suporte apenas parcial a ES6+), interagindo apenas com a API pública de seu contexto (sem acesso a componentes internos do servidor). Veja a seção "Runtime Rhino: sintaxe rígida (não é ES6+)" para as restrições de sintaxe e a seção de **interoperabilidade com Java**.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- Implemente a(s) **função(ões) nomeada(s)** que a plataforma invoca para construir/retornar o dataset — o ponto de entrada público é a função `createDataset(fields, constraints, sortFields)` → ver `architecture.md`.
- Use **SOMENTE a API pública de Dataset**: construa o resultado com `DatasetBuilder.newDataset()` e adicione colunas/linhas com `addColumn(...)`/`addRow(...)`; para consultar outro dataset, use `DatasetFactory.getDataset(...)` → ver `architecture.md`.
- **Retorne o conjunto de dados** no formato esperado (o objeto de dataset construído pelo `DatasetBuilder`) → ver `architecture.md`.
- Aplique **filtros/constraints** via API pública — `DatasetFactory.createConstraint(field, initialValue, finalValue, ConstraintType.MUST | SHOULD | MUST_NOT)` — e respeite os parâmetros `constraints` e `sortFields` recebidos pela função → ver `architecture.md`.
- **Leia os filtros recebidos** percorrendo o array `constraints` e comparando `constraint.getFieldName()` com o campo desejado, obtendo o valor com `constraint.getInitialValue()` (use os **métodos**, não propriedades). Isolar isso em uma função auxiliar (ex.: `obterParametro(constraints, campo)`) é um padrão comum → ver `architecture.md`.
- Para consumir um **serviço externo (REST)**, não há `fetch`: use o **Cadastro de Serviços** via `fluigAPI.getAuthorizeClientService()`, montando o objeto com `serviceCode`/`endpoint`/`method`/`timeoutService` (o `companyId` é opcional, resolvido a partir do `serviceCode`), invocando com `invoke(JSON.stringify(data))` e lendo a resposta com `vo.getResult()` + `JSON.parse(...)` → ver `technologies.md`.
- **Trate erros retornando dado**, não exceção solta: capture o erro com `try/catch` e retorne um dataset com uma **coluna/linha de erro** (ex.: coluna `ERROR`), para o consumidor receber um resultado previsível → ver `architecture.md`.
- Código **server-side no motor Rhino** (base **ES5**, **não** ES6+): use `var` e `function` tradicionais, concatene strings com `+` e **evite** arrow functions, template literals, `let`/`const`, destructuring, classes ES6 e `Promise`/`async`/`await`; **sem acesso a componentes internos** do servidor. Quando útil, é possível usar **interop com Java** (`Packages.*`, `importPackage`/`importClass`) → ver `technologies.md`.
- Se o nome exato de uma função/método não puder ser confirmado como público, descreva o comportamento de forma genérica (uma função nomeada que a plataforma invoca para resolver o dataset, retornando o conjunto via API pública) em vez de inventar → ver `architecture.md`.

## Procedimento

1. Definir o nome do dataset e os **campos** (colunas) a partir da entrada, além das fontes de dados e dos filtros/ordenação esperados.
2. Criar o arquivo JavaScript do dataset e implementar a **função pública** `createDataset(fields, constraints, sortFields)` como ponto de entrada que a plataforma invoca.
3. Dentro da função, **construir o dataset** com a API pública: `DatasetBuilder.newDataset()`, declarando as colunas com `addColumn(...)` e populando registros com `addRow(...)` (ou consultando outra fonte com `DatasetFactory.getDataset(...)`).
4. **Aplicar filtros/constraints e ordenação** via API pública — usar os parâmetros `constraints`/`sortFields` recebidos e/ou criar constraints com `DatasetFactory.createConstraint(..., ConstraintType.*)`. Quando precisar do valor de um filtro do chamador, lê-lo via `getFieldName()`/`getInitialValue()` (ex.: função auxiliar `obterParametro`).
5. Se a fonte for um **serviço externo REST**, consumi-lo pelo Cadastro de Serviços (`fluigAPI.getAuthorizeClientService()` + `invoke(...)`), parseando `vo.getResult()` e populando as linhas com os campos retornados.
6. **Tratar erros** com `try/catch`, retornando um dataset com coluna/linha de erro (ex.: `ERROR`) em caso de falha.
7. **Retornar** o objeto de dataset construído.
8. Validar o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Esqueleto de dataset pronto para evoluir, contendo:

- O **arquivo JavaScript** server-side do dataset com a(s) **função(ões) pública(s)** que a plataforma invoca — no mínimo `createDataset(fields, constraints, sortFields)`.
- A construção do conjunto de dados via **API pública** (`DatasetBuilder`, colunas e registros), com pontos para aplicar **constraints** e **ordenação**.
- Retorno do conjunto de dados no formato esperado, sem qualquer acesso a componentes internos.

Tudo em conformidade com `context/architecture.md` e `context/technologies.md`.

## Exemplo de Uso

Use `examples/dataset/` como referência mínima. O `dataset.example.js` demonstra a função pública `createDataset`, a construção do conjunto via `DatasetBuilder` e a aplicação de constraints; o `dataset-external-service.example.js` demonstra a leitura de filtro do chamador, o consumo de uma API REST externa pelo Cadastro de Serviços e o tratamento de erro como dado. Trate-os como trechos de referência, não como projeto completo.

## Checklist de Validação

- [ ] A(s) **função(ões) pública(s)** que a plataforma invoca estão implementadas (ex.: `createDataset(fields, constraints, sortFields)`).
- [ ] O conjunto de dados é construído e retornado usando **somente a API pública de Dataset** (`DatasetBuilder`, `DatasetFactory`), sem acesso a componentes internos.
- [ ] Os **campos** (colunas), **filtros/constraints** e a **ordenação** estão corretos e usam a API pública (`createConstraint`/`ConstraintType`, `sortFields`); a leitura de filtros do chamador usa `getFieldName()`/`getInitialValue()`.
- [ ] Consumo de **serviço externo** (se houver) é feito pelo Cadastro de Serviços (`fluigAPI.getAuthorizeClientService()` + `invoke`), nunca por `fetch`/HTTP de navegador.
- [ ] **Erros são retornados como dado** (coluna/linha de erro via `try/catch`), não como exceção solta.
- [ ] Código server-side compatível com o **motor Rhino** (base **ES5**): `var`/`function` tradicionais, sem arrow functions, template literals, `let`/`const` ou outros recursos ES6+ não suportados.
