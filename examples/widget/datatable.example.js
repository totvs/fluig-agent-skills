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
// declarados como `nome: function() {}` (nunca arrow como método) e SEM
// `var ctx = this;`. Os callbacks (onSearch, success, fail, eventos) são
// Arrow Functions, que mantêm o `this` do widget sem cache de escopo.
//
// i18n em .js (ver context/platform-constitution.md#1-internacionalização-em-arquivos-js):
// usa-se a interpolação em colchetes do FreeMarker (alternativa à sintaxe de
// cifrão e chaves), resolvida server-side e sem colidir com template literals
// ES6. Sempre entre aspas ao atribuir a uma variável. Não misture as duas
// sintaxes no mesmo arquivo e nunca escreva a interpolação em comentário: o
// FreeMarker processa o .js inteiro e uma expressão em comentário quebra o
// deploy do i18n.

// Exceção controlada à convenção ES6+: a variável raiz que recebe
// SuperWidget.extend(...) usa `var`.
var DatatableExample = SuperWidget.extend({

  myTable: null,
  dataInit: null,
  pageSize: 5,
  currentPage: 0,

  init: function() {
    this.dataInit = [
      { id: '1', name: 'Acre', uf: 'AC' },
      { id: '2', name: 'Alagoas', uf: 'AL' },
      { id: '3', name: 'Amazonas', uf: 'AM' }
    ];
    this.initDatatable();
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
    this.myTable = FLUIGC.datatable('#targetDatatable_' + this.instanceId, {
      dataRequest: this.paginateData(),
      renderContent: ['id', 'name', 'uf'],
      header: [
        { 'title': 'Código' },
        { 'title': 'Nome' },
        { 'title': 'UF' }
      ],
      actions: {
        enabled: true,
        template: '#datatable-actions_' + this.instanceId,
        actionAreaStyle: 'col-md-6'
      },
      draggable: {
        enabled: true
      },
      search: {
        enabled: true,
        onlyEnterkey: false,
        onSearch: (text) => {
          if (!text) {
            this.myTable.reload(this.dataInit);
            return;
          }
          const filtered = this.dataInit.filter((item) => {
            return item.name.toUpperCase().includes(text.toUpperCase());
          });
          this.myTable.reload(filtered);
        }
      }
    }, (err, data) => {
      if (err) {
        const message = "[=i18n.getTranslation('datatableExample.loadError')]";
        FLUIGC.toast({ message: message, type: 'danger' });
      }
    });

    this.myTable.on('fluig.datatable.drag.end', () => {
      // Mescla a página atual (reordenada) no array completo e persiste via
      // preferências — ver context/conventions.md#preferências-de-widget-persistência-por-instância (Preferências de Widget).
      const reorderedPage = this.myTable.getData();
      const start = this.currentPage * this.pageSize;
      this.dataInit.splice.apply(this.dataInit, [start, reorderedPage.length].concat(reorderedPage));

      const preferences = {
        orderedData: encodeURIComponent(JSON.stringify(this.dataInit))
      };

      WCMSpaceAPI.PageService.UPDATEPREFERENCES({
        async: true,
        success: (result) => {
          const message = "[=i18n.getTranslation('datatableExample.orderSaved')]";
          FLUIGC.toast({ message: message, type: 'success' });
        },
        fail: (xhr, message, errorData) => {
          const errorMessage = "[=i18n.getTranslation('datatableExample.saveError')]";
          FLUIGC.toast({ message: errorMessage, type: 'danger' });
        }
      }, this.instanceId, preferences);
    });

    this.myTable.on('fluig.datatable.forward', () => {
      const maxPage = Math.ceil(this.dataInit.length / this.pageSize) - 1;
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.myTable.reload(this.paginateData());
      }
    });

    this.myTable.on('fluig.datatable.backward', () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.myTable.reload(this.paginateData());
      }
    });
  },

  paginateData: function() {
    const start = this.currentPage * this.pageSize;
    return this.dataInit.slice(start, start + this.pageSize);
  },

  onAddRow: function() {
    const row = { id: '99', name: 'New State', uf: 'XX' };
    this.myTable.addRow(0, row);
  },

  onRemoveRow: function() {
    const selected = this.myTable.selectedRows();
    if (selected.length > 0) {
      this.myTable.removeRow(selected[0]);
    }
  },

  onSelectRow: function() {
    const selected = this.myTable.getRow(this.myTable.selectedRows()[0]);
    const message = "[=i18n.getTranslation('datatableExample.selected')]";
    FLUIGC.toast({ message: message + ' ' + selected.name, type: 'success' });
  }
});
