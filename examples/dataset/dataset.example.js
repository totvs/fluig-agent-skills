// Exemplo mínimo de referência — Dataset customizado Fluig (server-side)
// Demonstra: função pública createDataset(fields, constraints, sortFields),
// construção do resultado via DatasetBuilder, consulta a outra fonte via
// DatasetFactory e aplicação de filtros/constraints (ConstraintType).
// O código roda no motor Rhino (base ES5): usa var/function tradicionais, sem
// arrow functions nem template literals. Ver context/technologies.md (seção
// "Runtime Rhino: sintaxe rígida") e context/architecture.md.
// Não é um projeto completo.

// Função pública nomeada que a plataforma invoca para resolver o dataset.
function createDataset(fields, constraints, sortFields) {
  // Constrói o conjunto de dados usando SOMENTE a API pública de Dataset.
  var dataset = DatasetBuilder.newDataset();

  // Declara as colunas do dataset.
  dataset.addColumn('code');
  dataset.addColumn('name');
  dataset.addColumn('state');

  // Opção A — dados informados diretamente (registros estáticos).
  dataset.addRow(['001', 'Matriz', 'SP']);
  dataset.addRow(['002', 'Filial Sul', 'RS']);

  // Opção B — consulta a outro dataset via API pública, aplicando filtros.
  // Filtra apenas registros ativos (campo 'active' = 'true').
  var activeConstraint = DatasetFactory.createConstraint(
    'active',
    'true',
    'true',
    ConstraintType.MUST
  );

  // Repassa também os filtros/ordenação recebidos pela função, quando houver.
  var queryConstraints = [activeConstraint].concat(constraints || []);
  var branches = DatasetFactory.getDataset('branches', fields, queryConstraints, sortFields);

  // Copia os registros consultados para o dataset de saída (laço clássico).
  var rows = (branches && branches.values) || [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    dataset.addRow([row.code, row.name, row.state]);
  }

  // Interop com Java (recurso do Rhino) — ex.: registrar a data de geração.
  // O acesso a classes Java é feito via a variável global Packages.
  var now = new Packages.java.util.Date();
  var formatter = new Packages.java.text.SimpleDateFormat('yyyy-MM-dd');
  dataset.addRow(['_meta', 'generatedAt', String(formatter.format(now))]);

  // Retorna o objeto de dataset construído.
  return dataset;
}
