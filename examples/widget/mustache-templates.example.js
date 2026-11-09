// Exemplo mínimo de referência — Widget Fluig com templates Mustache
// Demonstra: interpolação simples + valor computado, iteração sobre array
// (seção {{#lista}}) e seção invertida ({{^condicao}}) para fallback "sem
// dados". Mustache já é embutido na plataforma (ver
// context/style-guide.md#plugins-embutidos-jquery-jquery-ui-mustache).
// Não é um projeto completo. Ver context/conventions.md#templating-com-mustache
// (Templating com Mustache).
//
// Sintaxe obrigatória dentro de .extend({}) — ver
// context/conventions.md#sintaxe-de-métodos-dentro-de-extend (Sintaxe de métodos dentro de .extend):
// métodos como `nome: function() {}`, SEM `var ctx = this;` (use `this`
// direto e Arrow Functions nos callbacks).
//
// i18n em .js (ver context/platform-constitution.md#1-internacionalização-em-arquivos-js):
// este arquivo não possui textos visíveis; ao incluir, use a interpolação em
// colchetes do FreeMarker (alternativa à sintaxe de cifrão e chaves, sem
// colidir com template literals ES6), sempre entre aspas ao atribuir a uma
// variável, sem misturar as duas sintaxes e nunca em comentário.

// Exceção controlada à convenção ES6+: a variável raiz que recebe
// SuperWidget.extend(...) usa `var`.
var MustacheTemplatesExample = SuperWidget.extend({

  init: function() {
    this.renderSimpleExample();
    this.renderListExample();
  },

  bindings: {
    local: {},
    global: {}
  },

  // 1) Interpolação simples + valor computado (função no objeto view).
  renderSimpleExample: function() {
    const view = {
      title: 'Joe',
      calc: () => 2 + 4 // valor computado
    };

    const template = document.getElementById('tplSimple_' + this.instanceId).innerHTML;
    const output = Mustache.render(template, view);

    document.getElementById('targetSimple_' + this.instanceId).innerHTML = output;
  },

  // 2) Iteração ({{#items}}) + seção invertida ({{^rating}}) para fallback.
  renderListExample: function() {
    const view = {
      items: [
        { name: 'Item A', rating: '5' },
        { name: 'Item B', rating: null }
      ]
    };

    const template = document.getElementById('tplList_' + this.instanceId).innerHTML;
    const output = Mustache.render(template, view);

    document.getElementById('targetList_' + this.instanceId).innerHTML = output;
  }
});
