// Exemplo de consumo da tabela Pai x Filho via dataset de formulario.
// Filtros obrigatorios: documentid + tablename (+ metadata#active=true).

function getChildTableRows(datasetName, documentId, tableName) {
  const constraints = [
    DatasetFactory.createConstraint("documentid", String(documentId), String(documentId), ConstraintType.MUST),
    DatasetFactory.createConstraint("tablename", tableName, tableName, ConstraintType.MUST),
    DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST)
  ];

  const result = DatasetFactory.getDataset(datasetName, null, constraints, null);
  return (result && result.values) || [];
}

// Exemplo pratico
const aprovacoesRows = getChildTableRows("dsFormWFAnaliseDaNota", 177, "aprovacoes");

// Campos recorrentes no retorno:
// - Metadados: metadata#id, metadata#version, metadata#active, etc.
// - Pai x Filho: anonymization_date, anonymization_user_id, cardid, companyid,
//   documentid, id, masterid, tableid, version, wdk_sequence_id.
// - Campos da tabela: dtAprovador, aprovadorAtividade, codAprovador,
//   nomeAprovador, obsAprovador, statusAprovado.
