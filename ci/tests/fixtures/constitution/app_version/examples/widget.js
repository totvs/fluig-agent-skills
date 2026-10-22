// Exemplo com violação — referência a application.version (propriedade inexistente).
var MyWidget = SuperWidget.extend({
  init: function() {
    console.log('application.version não existe no application.info');
  }
});
