// Exemplo com violação — method shorthand ES6 dentro de .extend({}).
var MyWidget = SuperWidget.extend({
  init() {
    var ctx = this;
    ctx.loadData();
  }
});
