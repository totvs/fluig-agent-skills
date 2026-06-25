# Exemplo: Dataset (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos
- `dataset.example.js` — Dataset customizado server-side: função pública `createDataset(fields, constraints, sortFields)` que constrói o resultado com `DatasetBuilder.newDataset()`, declara colunas com `addColumn(...)`, popula registros com `addRow(...)`, consulta outro dataset com `DatasetFactory.getDataset(...)` e aplica filtros com `DatasetFactory.createConstraint(...)` / `ConstraintType.*`. Em sintaxe compatível com o motor Rhino (base ES5).
- `dataset-external-service.example.js` — Dataset que consome uma **API REST externa** pelo Cadastro de Serviços (`fluigAPI.getAuthorizeClientService()` + `invoke`), lê um filtro do chamador via `getFieldName()`/`getInitialValue()` e trata erro como dado (coluna/linha `ERROR`). Em sintaxe compatível com o motor Rhino (base ES5).

## Pontos-chave demonstrados
- Função pública nomeada `createDataset(fields, constraints, sortFields)` como ponto de entrada que a plataforma invoca.
- Construção do conjunto via **API pública de Dataset**: `DatasetBuilder.newDataset()`, `addColumn(...)`, `addRow(...)`.
- Consulta a outra fonte via `DatasetFactory.getDataset(...)` (somente API pública).
- Filtros/constraints com `DatasetFactory.createConstraint(field, initialValue, finalValue, ConstraintType.MUST | SHOULD | MUST_NOT)`.
- Respeito aos parâmetros `constraints` e `sortFields` recebidos pela função.
- **Leitura de filtros do chamador** percorrendo `constraints` com `getFieldName()`/`getInitialValue()` (função auxiliar `obterParametro`).
- **Consumo de serviço externo (REST)** pelo Cadastro de Serviços (`fluigAPI.getAuthorizeClientService()` + `invoke(JSON.stringify(...))`, lendo `vo.getResult()`); não há `fetch` no runtime server-side.
- **Erro como dado de retorno**: `try/catch` que retorna um dataset com coluna/linha de erro (`ERROR`).
- Retorno do objeto de dataset construído, sem acesso a componentes internos do servidor.
- JavaScript server-side no **motor Rhino** (base **ES5**): `var`/`function` tradicionais, concatenação com `+`, sem arrow functions, template literals ou `let`/`const`.
- Interoperabilidade com **Java** via `Packages.*` / `java.*` (recurso do Rhino), quando útil ao domínio.

> Fonte de verdade: `context/architecture.md` e `context/technologies.md`.
