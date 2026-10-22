// Exemplo mínimo de referência — Widget Fluig "alvo" carregada dentro de um
// modal (SuperWidget.extend). Demonstra o lado reutilizável do padrão de
// modal: esta widget não abre nada, apenas recebe e exibe um parâmetro
// enviado por outra widget via FLUIGC.modal({content: {widgetCode, ftl, data}})
// ou WCMAPI.convertFtlAsync — ver examples/widget/modal.example.js e
// context/conventions.md#modais-em-widgets (Modais em Widgets).
// Não é um projeto completo.
//
// Sintaxe obrigatória dentro de .extend({}) — ver
// context/conventions.md#sintaxe-de-métodos-dentro-de-extend (Sintaxe de métodos dentro de .extend).

// Exceção controlada à convenção ES6+: a variável raiz que recebe
// SuperWidget.extend(...) usa `var`.
var ModalTargetExample = SuperWidget.extend({

  init: function() {
    // Nenhuma lógica adicional necessária: o parâmetro "receivedParam" já é
    // lido e exibido direto no view.ftl (ver modal-target.example.view.ftl) —
    // o mesmo padrão de "Passagem de Dados em Widgets", cenário (c), descrito
    // em context/conventions.md#passagem-de-dados-em-widgets (Passagem de Dados em Widgets).
  },

  bindings: {
    local: {},
    global: {}
  }
});
