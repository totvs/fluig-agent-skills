// Exemplo mínimo de referência — Dataset que consome serviço externo (REST)
// Demonstra: leitura de filtro do chamador via constraints (getFieldName/
// getInitialValue), consumo de API externa pelo Cadastro de Serviços
// (fluigAPI.getAuthorizeClientService + invoke) e tratamento de erro como dado
// (coluna/linha de erro). Sintaxe compatível com o motor Rhino (base ES5).
// Ver context/technologies.md (seções "Runtime Rhino" e "HTTP externo via
// Cadastro de Serviços") e context/architecture.md. Não é um projeto completo.
//
// Observações:
// - O serviço externo precisa estar previamente cadastrado no Cadastro de
//   Serviços do Fluig; aqui ele é referenciado pelo código 'wsViaCEP'.
// - Não existe fetch/XMLHttpRequest no runtime server-side.

function createDataset(fields, constraints, sortFields) {
  var dataset = DatasetBuilder.newDataset();

  // Declara as colunas do resultado.
  dataset.addColumn('CEP');
  dataset.addColumn('ENDERECO');
  dataset.addColumn('BAIRRO');
  dataset.addColumn('CIDADE');
  dataset.addColumn('ESTADO');

  try {
    // Lê o filtro 'CEP' recebido do chamador.
    var cepParam = obterParametro(constraints, 'CEP');
    if (!cepParam) {
      throw 'CEP não informado';
    }

    // Interop com Java: normaliza a entrada removendo o que não for dígito.
    var cep = new java.lang.String(cepParam).replaceAll('[^\\d]', '');

    // Consome o serviço externo pelo Cadastro de Serviços.
    // O 'companyId' é opcional: quando omitido, é resolvido a partir do
    // 'serviceCode' do serviço cadastrado.
    var clientService = fluigAPI.getAuthorizeClientService();
    var request = {
      serviceCode: 'wsViaCEP',
      endpoint: '/ws/' + cep + '/json/',
      method: 'get',
      timeoutService: '100'
    };

    var vo = clientService.invoke(JSON.stringify(request));
    var retorno = JSON.parse(vo.getResult());

    if (retorno.erro) {
      throw 'CEP não encontrado';
    }

    dataset.addRow(new Array(
      cep,
      retorno.logradouro,
      retorno.bairro,
      retorno.localidade,
      retorno.uf
    ));
  } catch (err) {
    // Erro retornado como dado: dataset com coluna/linha de erro, em vez de
    // deixar a exceção escapar para o consumidor.
    dataset = DatasetBuilder.newDataset();
    dataset.addColumn('ERROR');
    dataset.addRow(new Array(String(err)));
  }

  return dataset;
}

// Função auxiliar: retorna o initialValue da constraint cujo campo casa com
// 'campo' (comparação case-insensitive). Usa os métodos do objeto constraint.
function obterParametro(constraints, campo) {
  var valor = '';
  if (constraints != null && constraints.length > 0) {
    for (var i = 0; i < constraints.length; i++) {
      var constraint = constraints[i];
      if (constraint.getFieldName().trim().toUpperCase() === campo.trim().toUpperCase()) {
        valor = constraint.getInitialValue();
        break;
      }
    }
  }
  return valor;
}
