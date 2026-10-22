// Exemplo mínimo de referência — Widget Fluig com templates Mustache
// Demonstra: interpolação simples + valor computado, iteração sobre array
// (seção {{#lista}}) e seção invertida ({{^condicao}}) para fallback "sem
// dados". Mustache já é embutido na plataforma (ver
// context/style-guide.md#plugins-embutidos-jquery-jquery-ui-mustache).
// Não é um projeto completo. Ver context/conventions.md#templating-com-mustache
// (Templating com Mustache).
//
// Sintaxe obrigatória dentro de .extend({}) — ver
// context/conventions.md#sintaxe-de-métodos-dentro-de-extend (Sintaxe de métodos dentro de .extend).
//
// i18n em .js (ver context/platform-constitution.md#1-internacionalização-em-arquivos-js): mesma sintaxe do .ftl —
// i18n.getTranslation('chave') interpolado por FreeMarker (com ${...} no CÓDIGO,
// nunca em comentário: o FreeMarker processa o .js inteiro e um ${...} mal-formado
// em comentário quebra o deploy do i18n).

// Exceção controlada à convenção ES6+: a variável raiz que recebe
// SuperWidget.extend(...) usa `var`.
var MustacheTemplatesExample = SuperWidget.extend({

  init: function() {
    var ctx = this;
    ctx.renderSimpleExample();
    ctx.renderListExample();
  },

  bindings: {
    local: {},
    global: {}
  },

  // 1) Interpolação simples + valor computado (função no objeto view).
  renderSimpleExample: function() {
    var ctx = this;
    var view = {
      title: 'Joe',
      calc: function() { return 2 + 4; } // valor computado
    };

    var template = document.getElementById('tplSimple_' + ctx.instanceId).innerHTML;
    var output = Mustache.render(template, view);

    document.getElementById('targetSimple_' + ctx.instanceId).innerHTML = output;
  },

  // 2) Iteração ({{#items}}) + seção invertida ({{^rating}}) para fallback.
  renderListExample: function() {
    var ctx = this;
    var view = {
      items: [
        { name: 'Item A', rating: '5' },
        { name: 'Item B', rating: null }
      ]
    };

    var template = document.getElementById('tplList_' + ctx.instanceId).innerHTML;
    var output = Mustache.render(template, view);

    document.getElementById('targetList_' + ctx.instanceId).innerHTML = output;
  }
});
