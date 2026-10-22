// Exemplo com violação — arrow function como método dentro de .extend({}).
var MyWidget = SuperWidget.extend({
  init: () => {
    console.log('init');
  }
});
