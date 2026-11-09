// Exemplo de consumo da tabela Pai x Filho via dataset de formulario.
// CONTEXTO DE EXECUÇÃO: server-side (motor Rhino, base ES5) — evento de
// formulário/dataset. Por isso: sintaxe ES5 (var/function, sem const/arrow) e
// DatasetFactory.getDataset SÍNCRONO (sem callback), que é o correto no
// servidor. ⚠️ No CLIENTE (navegador, via vcXMLRPC) a chamada síncrona é
// PROIBIDA — lá use fetch na API REST v2 ou getDataset encapsulado em Promise
// (ver context/conventions.md#consumo-de-datasets-no-front-end-regra-de-performance).
// Filtros obrigatorios: documentid + tablename (+ metadata#active=true).

function getChildTableRows(datasetName, documentId, tableName) {
  var constraints = [
    DatasetFactory.createConstraint("documentid", String(documentId), String(documentId), ConstraintType.MUST),
    DatasetFactory.createConstraint("tablename", tableName, tableName, ConstraintType.MUST),
    DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST)
  ];

  var result = DatasetFactory.getDataset(datasetName, null, constraints, null);

  // LEITURA no servidor (Rhino): getValue(linha, "coluna") + rowsCount.
  // NÃO retorne/itere result.values[i].coluna — no Rhino cada linha é um array
  // Java (java.lang.Object[]) e acessar .coluna lança
  // "Java class [Ljava.lang.Object; has no public instance field named ...".
  var linhas = [];
  if (result != null) {
    for (var i = 0; i < result.rowsCount; i++) {
      linhas.push({
        documentid: result.getValue(i, "documentid"),
        id: result.getValue(i, "id"),
        // ... demais colunas conforme definidas no HTML do form:
        nomeAprovador: result.getValue(i, "nomeAprovador"),
        statusAprovado: result.getValue(i, "statusAprovado")
      });
    }
  }
  return linhas;
}

// Exemplo pratico
var aprovacoesRows = getChildTableRows("dsFormWFAnaliseDaNota", 177, "aprovacoes");

// Campos recorrentes no retorno:
// - Metadados: metadata#id, metadata#version, metadata#active, etc.
// - Pai x Filho: anonymization_date, anonymization_user_id, cardid, companyid,
//   documentid, id, masterid, tableid, version, wdk_sequence_id.
// - Campos da tabela: dtAprovador, aprovadorAtividade, codAprovador,
//   nomeAprovador, obsAprovador, statusAprovado.
