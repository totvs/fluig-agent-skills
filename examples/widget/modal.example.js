// Exemplo mínimo de referência — Widget Fluig "opener" de modal (SuperWidget.extend)
// Demonstra as 4 variações de `content` aceitas por FLUIGC.modal e a regra
// crítica de binding do botão de ação do modal (bindings.global, nunca local,
// pois o modal é renderizado fora da raiz do widget, direto no body).
// Não é um projeto completo. Ver context/conventions.md#modais-em-widgets
// (Modais em Widgets) e examples/widget/modal-target.example.js (widget alvo
// usada pelas variações 3 e 4 abaixo).
//
// Sintaxe obrigatória dentro de .extend({}) (ver
// context/conventions.md#sintaxe-de-métodos-dentro-de-extend): métodos
// declarados como `nome: function() {}`, com `var ctx = this;` no topo.
//
// i18n em .js (ver context/platform-constitution.md#1-internacionalização-em-arquivos-js): mesma sintaxe do .ftl —
// i18n.getTranslation('chave') interpolado por FreeMarker (com ${...} no CÓDIGO,
// nunca em comentário: o FreeMarker processa o .js inteiro e um ${...} mal-formado
// em comentário quebra o deploy do i18n).

// Exceção controlada à convenção ES6+: a variável raiz que recebe
// SuperWidget.extend(...) usa `var`.
var ModalExample = SuperWidget.extend({

  // Guarda a instância do modal aberto para poder fechá-la (.remove()).
  myModal: null,

  init: function() {
  },

  bindings: {
    local: {
      // Botões que ABREM o modal ficam DENTRO da raiz do widget → local.
      'open-static-modal': ['click_openStaticModal'],
      'open-mustache-modal': ['click_openMustacheModal'],
      'open-widget-modal': ['click_openWidgetModal'],
      'open-convert-ftl-modal': ['click_openConvertFtlModal']
    },
    global: {
      // Botão de AÇÃO do modal (ex.: "Salvar") é renderizado pelo FLUIGC.modal
      // fora da raiz do widget, direto no body → DEVE ser global. Se fosse
      // declarado em "local", o clique nunca dispararia.
      'save-modal-data': ['click_onSaveModalData']
    }
  },

  onSaveModalData: function() {
    var ctx = this;
    var message = "${i18n.getTranslation('modalExample.saved')}";
    FLUIGC.toast({ message: message, type: 'success' });
    ctx.myModal.remove();
  },

  // 1) Conteúdo estático — HTML fixo, sem dados dinâmicos.
  openStaticModal: function() {
    var ctx = this;
    ctx.myModal = FLUIGC.modal({
      title: 'Title',
      content: '<h1>Modal Content</h1>',
      id: 'fluig-modal',
      actions: [{
        'label': 'Salvar',
        'bind': 'data-save-modal-data', // casa com a chave global 'save-modal-data'
        'classType': 'btn-info'
      }, {
        'label': 'Close',
        'autoClose': true
      }]
    }, function(err, data) {
      if (err) {
        // tratamento de erro
      }
    });
  },

  // 2) Conteúdo via Mustache — template na própria view.ftl, renderizado com
  // Mustache.render (já embutido pela plataforma; ver
  // context/style-guide.md#plugins-embutidos-jquery-jquery-ui-mustache).
  openMustacheModal: function() {
    var ctx = this;
    var view = {
      param1: "${i18n.getTranslation('modalExample.mustacheParam')}"
    };
    var content = Mustache.render($('#tpl-modal_' + ctx.instanceId).html(), view);

    ctx.myModal = FLUIGC.modal({
      title: 'Title',
      content: content,
      id: 'fluig-modal',
      actions: [{
        'label': 'Salvar',
        'bind': 'data-save-modal-data',
        'classType': 'btn-info'
      }, {
        'label': 'Close',
        'autoClose': true
      }]
    });
  },

  // 3) Conteúdo de OUTRA widget — carrega a view de "ModalTargetExample"
  // dentro do modal, enviando dados via `data`.
  openWidgetModal: function() {
    var ctx = this;
    ctx.myModal = FLUIGC.modal({
      title: 'Title',
      content: {
        'widgetCode': 'modalTargetExample', // application.code da widget alvo
        'ftl': 'view.ftl',
        'data': {
          'receivedParam': "${i18n.getTranslation('modalExample.widgetParam')}"
        }
      },
      id: 'fluig-modal',
      actions: [{
        'label': 'Salvar',
        'bind': 'data-save-modal-data',
        'classType': 'btn-info'
      }, {
        'label': 'Close',
        'autoClose': true
      }]
    });
  },

  // 4) Conteúdo via WCMAPI.convertFtlAsync — pré-renderiza o FTL da widget
  // alvo de forma assíncrona antes de montar o modal (equivalente à variação
  // 3, mas com callback explícito).
  openConvertFtlModal: function() {
    var ctx = this;
    WCMAPI.convertFtlAsync('modalTargetExample', 'view.ftl', JSON.stringify({
      'receivedParam': "${i18n.getTranslation('modalExample.convertFtlParam')}"
    }), function(data) {
      ctx.myModal = FLUIGC.modal({
        title: 'Title',
        content: data,
        id: 'fluig-modal',
        actions: [{
          'label': 'Salvar',
          'bind': 'data-save-modal-data',
          'classType': 'btn-info'
        }, {
          'label': 'Close',
          'autoClose': true
        }]
      });
    });
  }
});
