// Exemplo mínimo de referência — Dataset customizado Fluig (server-side)
// Demonstra: função pública createDataset(fields, constraints, sortFields),
// construção do resultado via DatasetBuilder, consulta a outra fonte via
// DatasetFactory e aplicação de filtros/constraints (ConstraintType), em ES6+.
// Não é um projeto completo. Ver context/architecture.md e context/technologies.md.

// Função pública nomeada que a plataforma invoca para resolver o dataset.
function createDataset(fields, constraints, sortFields) {
  // Constrói o conjunto de dados usando SOMENTE a API pública de Dataset.
  const dataset = DatasetBuilder.newDataset();

  // Declara as colunas do dataset.
  dataset.addColumn('code');
  dataset.addColumn('name');
  dataset.addColumn('state');

  // Opção A — dados informados diretamente (registros estáticos).
  dataset.addRow(['001', 'Matriz', 'SP']);
  dataset.addRow(['002', 'Filial Sul', 'RS']);

  // Opção B — consulta a outro dataset via API pública, aplicando filtros.
  // Filtra apenas registros ativos (campo 'active' = 'true').
  const activeConstraint = DatasetFactory.createConstraint(
    'active',
    'true',
    'true',
    ConstraintType.MUST
  );

  // Repassa também os filtros/ordenação recebidos pela função, quando houver.
  const queryConstraints = [activeConstraint].concat(constraints || []);
  const branches = DatasetFactory.getDataset('branches', fields, queryConstraints, sortFields);

  // Copia os registros consultados para o dataset de saída.
  (branches.values || []).forEach((row) => {
    dataset.addRow([row.code, row.name, row.state]);
  });

  // Retorna o objeto de dataset construído.
  return dataset;
}
