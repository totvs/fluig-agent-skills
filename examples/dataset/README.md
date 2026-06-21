# Exemplo: Dataset (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos
- `dataset.example.js` — Dataset customizado server-side: função pública `createDataset(fields, constraints, sortFields)` que constrói o resultado com `DatasetBuilder.newDataset()`, declara colunas com `addColumn(...)`, popula registros com `addRow(...)`, consulta outro dataset com `DatasetFactory.getDataset(...)` e aplica filtros com `DatasetFactory.createConstraint(...)` / `ConstraintType.*`. Em ES6+.

## Pontos-chave demonstrados
- Função pública nomeada `createDataset(fields, constraints, sortFields)` como ponto de entrada que a plataforma invoca.
- Construção do conjunto via **API pública de Dataset**: `DatasetBuilder.newDataset()`, `addColumn(...)`, `addRow(...)`.
- Consulta a outra fonte via `DatasetFactory.getDataset(...)` (somente API pública).
- Filtros/constraints com `DatasetFactory.createConstraint(field, initialValue, finalValue, ConstraintType.MUST | SHOULD | MUST_NOT)`.
- Respeito aos parâmetros `constraints` e `sortFields` recebidos pela função.
- Retorno do objeto de dataset construído, sem acesso a componentes internos do servidor.
- JavaScript server-side em ES6+ (`const`/`let`, arrow functions, template literals).

> Fonte de verdade: `context/architecture.md` e `context/technologies.md`.
