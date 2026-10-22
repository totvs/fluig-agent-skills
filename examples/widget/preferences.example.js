// Exemplo mínimo de referência — Widget Fluig (SuperWidget.extend)
// Demonstra: persistência de preferências por instância via
// WCMSpaceAPI.PageService.UPDATEPREFERENCES, leitura em modo view (dataset
// filtrado pela preferência), formulário de edição com validação e
// FLUIGC.toast no retorno do salvamento.
// Não é um projeto completo. Ver
// context/conventions.md#preferências-de-widget-persistência-por-instância
// (Preferências de Widget).
//
// ⚠️ CICLO DA PREFERÊNCIA (a view é parte essencial deste exemplo):
// A preferência salva NÃO aparece sozinha nas propriedades do JS. Ela volta via
// FreeMarker e a VIEW precisa repassá-la no data-params. A view.ftl/edit.ftl
// correspondente DEVE ter:
//   <#assign parametros = "{'numberOfArticles':'${numberOfArticles!''?js_string}'}">
//   <div ... data-params="NewsPreferences.instance(${parametros})">
// Só assim `this.numberOfArticles` chega preenchido. Sem isso, vem null (salva,
// mas no F5 o form não repopula e a view não exibe nada). Ver o ciclo completo
// em context/conventions.md#preferências-de-widget-persistência-por-instância (Preferências de Widget).
//
// Sintaxe obrigatória dentro de .extend({}) (ver
// context/conventions.md#sintaxe-de-métodos-dentro-de-extend): métodos declarados como
// `nome: function() {}`, com `var ctx = this;` no topo, evitando method
// shorthand ES6 e arrow functions como método.
//
// i18n em .js (ver context/platform-constitution.md#1-internacionalização-em-arquivos-js): mesma sintaxe do .ftl —
// i18n.getTranslation('chave') interpolado por FreeMarker (com ${...} no CÓDIGO,
// nunca em comentário: o FreeMarker processa o .js inteiro e um ${...} mal-formado
// em comentário quebra o deploy do i18n).

// Exceção controlada à convenção ES6+: a variável raiz que recebe
// SuperWidget.extend(...) usa `var`.
var NewsPreferences = SuperWidget.extend({

  // Propriedade de preferência: recebe o valor via data-params (ver cabeçalho).
  // O nome é o MESMO usado ao salvar em UPDATEPREFERENCES. Chega como string.
  numberOfArticles: null,

  init: function() {
    var ctx = this;

    // Detecção de modo: getIsEditMode() retorna STRING ('true'/'false') —
    // compare com 'true'. Nunca this.isEditMode (inexistente) nem o retorno
    // direto num if (a string 'false' é truthy).
    if (WCMAPI.getIsEditMode() === 'true') {
      // Modo edição: popula o formulário de configuração com o valor atual,
      // convertendo para número ao exibir.
      ctx.renderSettingsForm();
    } else {
      // Modo view: usa this.numberOfArticles (recebido via data-params) para
      // montar a consulta de dataset.
      ctx.loadNews();
    }
  },

  bindings: {
    local: {
      'save-preferences': ['click_onSavePreferences']
    },
    global: {}
  },

  renderSettingsForm: function() {
    var ctx = this;
    var input = document.getElementById('numberOfArticles_' + ctx.instanceId);
    if (input) {
      // Tudo é persistido como string — converte ao exibir no formulário.
      input.value = parseInt(ctx.numberOfArticles, 10) || 5;
    }
  },

  // Consulta de dataset no CLIENTE. Preferência de ordem (ver
  // context/conventions.md#consumo-de-datasets-no-front-end-regra-de-performance):
  //   1ª opção — API REST /dataset/api/v2/dataset-handle/search via fetch
  //              (async/await + try/catch), que é o padrão recomendado;
  //   2ª opção — DatasetFactory (via vcXMLRPC.js), SOMENTE quando necessário
  //              (ex.: processamento server-side do motor de datasets).
  // Este exemplo demonstra a 2ª opção (DatasetFactory). Regra obrigatória do
  // client-side: NUNCA chamar getDataset sem callback (modo síncrono trava a
  // interface). O padrão canônico é encapsular em `new Promise` e consumir com
  // `await` — nunca callback cru.
  loadNews: async function() {
    var ctx = this;
    try {
      var dataset = await ctx.getNewsPromise();
      ctx.renderList(dataset);
    } catch (error) {
      var message = "${i18n.getTranslation('preferences.loadError')}";
      FLUIGC.toast({ message: message, type: 'danger' });
    }
  },

  // Encapsula DatasetFactory.getDataset em Promise (success: resolve /
  // error: reject), tornando a chamada assíncrona de forma consumível por
  // async/await. Requer importar /webdesk/vcXMLRPC.js na view.
  getNewsPromise: function() {
    var ctx = this;
    var limit = parseInt(ctx.numberOfArticles, 10) || 5;
    return new Promise(function(resolve, reject) {
      DatasetFactory.getDataset('news', ['title', 'publishDate'], [
        DatasetFactory.createConstraint('sqlLimit', limit, limit, ConstraintType.MUST)
      ], null, {
        success: resolve,
        error: reject
      });
    });
  },

  renderList: function(dataset) {
    var ctx = this;
    var list = document.getElementById('newsList_' + ctx.instanceId);
    if (!list) {
      return;
    }

    list.innerHTML = '';
    // `dataset` é o objeto resolvido pela Promise (retorno do getDataset no
    // cliente). O acesso aos registros segue o formato devolvido por esse
    // retorno; aqui iteramos as linhas e lemos cada campo pelo nome.
    var rows = dataset ? dataset.values : [];
    rows.forEach(function(row) {
      var li = document.createElement('li');
      // Dado vindo de dataset: usar textContent (evita XSS).
      li.textContent = row.title;
      list.appendChild(li);
    });
  },

  onSavePreferences: function() {
    var ctx = this;
    var input = document.getElementById('numberOfArticles_' + ctx.instanceId);
    var rawValue = input ? input.value : '';
    var parsedValue = parseInt(rawValue, 10);

    // Validação: número inválido não chama UPDATEPREFERENCES.
    if (isNaN(parsedValue) || parsedValue <= 0) {
      if (input) {
        input.classList.add('has-error');
      }
      return;
    }

    if (input) {
      input.classList.remove('has-error');
    }

    // Objeto plano chaveado pelos MESMOS nomes das propriedades declaradas
    // acima em .extend({}). Na próxima renderização, a plataforma reinjeta o
    // valor como variável FreeMarker (${numberOfArticles}); a view o repassa ao
    // JS via data-params (ver cabeçalho).
    var preferences = {
      numberOfArticles: parsedValue
    };

    WCMSpaceAPI.PageService.UPDATEPREFERENCES({
      async: true,
      success: function(data) {
        var message = "${i18n.getTranslation('preferences.saved')}";
        FLUIGC.toast({ message: message, type: 'success' });
      },
      fail: function(xhr, message, errorData) {
        var errorMessage = "${i18n.getTranslation('preferences.saveError')}";
        FLUIGC.toast({ message: errorMessage, type: 'danger' });
      }
    }, ctx.instanceId, preferences);
  }
});
