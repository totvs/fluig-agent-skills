# Exemplos de Uso — fluig-scaffolding-dataset

Prompts prontos para acionar a skill `fluig-scaffolding-dataset` com um agente de IA, em três níveis de complexidade.

## Simples

> Crie um novo dataset customizado de filiais no Fluig.

## Intermediário

> Crie um dataset customizado chamado `branches` com os campos código, nome e UF, filtrando apenas as filiais ativas via constraints da API pública de Dataset.

## Completo

> Crie o esqueleto de um dataset customizado chamado `branches` com as colunas código, nome e UF, implementando a função pública `createDataset(fields, constraints, sortFields)` como ponto de entrada. Construa o resultado com `DatasetBuilder.newDataset()`, declarando as colunas com `addColumn(...)` e populando registros com `addRow(...)`. Leia o filtro de UF recebido do chamador percorrendo `constraints` com `getFieldName()`/`getInitialValue()`, aplique constraints adicionais com `DatasetFactory.createConstraint(..., ConstraintType.MUST)` para trazer apenas filiais ativas e ordene pelo campo nome via `sortFields`. Trate erros com `try/catch`, retornando um dataset com uma coluna `ERROR` em caso de falha. Mantenha o código server-side compatível com o motor Rhino (base ES5): `var`/`function` tradicionais, sem arrow functions, template literals ou `let`/`const`.
