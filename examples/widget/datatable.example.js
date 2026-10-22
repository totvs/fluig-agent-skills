// Exemplo mínimo de referência — Widget Fluig com FLUIGC.datatable
// Demonstra: configuração básica (dataRequest/renderContent/header), ações
// por linha (actions.template, com bindings.local — contraste com o botão de
// ação do modal, que usa bindings.global), busca local (search.onSearch),
// reordenação com persistência (draggable + fluig.datatable.drag.end +
// WCMSpaceAPI.PageService.UPDATEPREFERENCES) e paginação manual client-side.
// Não é um projeto completo. Ver context/conventions.md#datatable-em-widgets
// (Datatable em Widgets) e
// context/style-guide.md#api-javascript-pública-fluigc (API JavaScript pública — FLUIGC.datatable).
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
var DatatableExample = SuperWidget.extend({

  myTable: null,
  dataInit: null,
  pageSize: 5,
  currentPage: 0,

  init: function() {
    var ctx = this;
    ctx.dataInit = [
      { id: '1', name: 'Acre', uf: 'AC' },
      { id: '2', name: 'Alagoas', uf: 'AL' },
      { id: '3', name: 'Amazonas', uf: 'AM' }
    ];
    ctx.initDatatable();
  },

  bindings: {
    local: {
      // Template de ações por linha é renderizado DENTRO da raiz do widget
      // → bindings.local (diferente do botão de ação do modal, que usa
      // bindings.global; ver context/conventions.md#modais-em-widgets).
      'add-row': ['click_onAddRow'],
      'remove-row': ['click_onRemoveRow'],
      'select-row': ['click_onSelectRow']
    },
    global: {}
  },

  initDatatable: function() {
    var ctx = this;

    ctx.myTable = FLUIGC.datatable('#targetDatatable_' + ctx.instanceId, {
      dataRequest: ctx.paginateData(),
      renderContent: ['id', 'name', 'uf'],
      header: [
        { 'title': 'Código' },
        { 'title': 'Nome' },
        { 'title': 'UF' }
      ],
      actions: {
        enabled: true,
        template: '#datatable-actions_' + ctx.instanceId,
        actionAreaStyle: 'col-md-6'
      },
      draggable: {
        enabled: true
      },
      search: {
        enabled: true,
        onlyEnterkey: false,
        onSearch: function(text) {
          if (!text) {
            ctx.myTable.reload(ctx.dataInit);
            return;
          }
          var filtered = ctx.dataInit.filter(function(item) {
            return item.name.toUpperCase().includes(text.toUpperCase());
          });
          ctx.myTable.reload(filtered);
        }
      }
    }, function(err, data) {
      if (err) {
        var message = "${i18n.getTranslation('datatableExample.loadError')}";
        FLUIGC.toast({ message: message, type: 'danger' });
      }
    });

    ctx.myTable.on('fluig.datatable.drag.end', function() {
      // Mescla a página atual (reordenada) no array completo e persiste via
      // preferências — ver context/conventions.md#preferências-de-widget-persistência-por-instância (Preferências de Widget).
      var reorderedPage = ctx.myTable.getData();
      var start = ctx.currentPage * ctx.pageSize;
      ctx.dataInit.splice.apply(ctx.dataInit, [start, reorderedPage.length].concat(reorderedPage));

      var preferences = {
        orderedData: encodeURIComponent(JSON.stringify(ctx.dataInit))
      };

      WCMSpaceAPI.PageService.UPDATEPREFERENCES({
        async: true,
        success: function(result) {
          var message = "${i18n.getTranslation('datatableExample.orderSaved')}";
          FLUIGC.toast({ message: message, type: 'success' });
        },
        fail: function(xhr, message, errorData) {
          var errorMessage = "${i18n.getTranslation('datatableExample.saveError')}";
          FLUIGC.toast({ message: errorMessage, type: 'danger' });
        }
      }, ctx.instanceId, preferences);
    });

    ctx.myTable.on('fluig.datatable.forward', function() {
      var ctx2 = ctx;
      var maxPage = Math.ceil(ctx2.dataInit.length / ctx2.pageSize) - 1;
      if (ctx2.currentPage < maxPage) {
        ctx2.currentPage++;
        ctx2.myTable.reload(ctx2.paginateData());
      }
    });

    ctx.myTable.on('fluig.datatable.backward', function() {
      if (ctx.currentPage > 0) {
        ctx.currentPage--;
        ctx.myTable.reload(ctx.paginateData());
      }
    });
  },

  paginateData: function() {
    var ctx = this;
    var start = ctx.currentPage * ctx.pageSize;
    return ctx.dataInit.slice(start, start + ctx.pageSize);
  },

  onAddRow: function() {
    var ctx = this;
    var row = { id: '99', name: 'New State', uf: 'XX' };
    ctx.myTable.addRow(0, row);
  },

  onRemoveRow: function() {
    var ctx = this;
    var selected = ctx.myTable.selectedRows();
    if (selected.length > 0) {
      ctx.myTable.removeRow(selected[0]);
    }
  },

  onSelectRow: function() {
    var ctx = this;
    var selected = ctx.myTable.getRow(ctx.myTable.selectedRows()[0]);
    var message = "${i18n.getTranslation('datatableExample.selected')}";
    FLUIGC.toast({ message: message + ' ' + selected.name, type: 'success' });
  }
});
