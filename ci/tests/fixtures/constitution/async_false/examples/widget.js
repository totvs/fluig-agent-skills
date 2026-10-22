// Exemplo com violação — async: false (requisição síncrona).
var MyWidget = SuperWidget.extend({
  loadData: function() {
    $.ajax({ url: '/api/recurso', async: false });
  }
});
