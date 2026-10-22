// Exemplo mínimo de referência — Widget Fluig (SuperWidget.extend)
// Demonstra: init() e bindings (local/global), this.instanceId, chamadas REST
// internas via fetch()/async-await (API pública, WCMAPI.getServerURL()) e i18n
// para texto visível.
// Não é um projeto completo. Ver context/conventions.md#convenções-de-widget-superwidgetextend
// e context/style-guide.md#api-javascript-pública-fluigc (API JavaScript pública).
//
// Sintaxe obrigatória dentro de .extend({}) (ver
// context/conventions.md#sintaxe-de-métodos-dentro-de-extend): métodos declarados como
// `nome: function() {}`, com `var ctx = this;` no topo, e callbacks internos em
// `function() {}` acessando `ctx` via closure — evitando method shorthand ES6 e
// arrow functions (que não vinculam `this` e podem quebrar na minificação do build).
//
// i18n em .js (ver context/platform-constitution.md#1-internacionalização-em-arquivos-js): mesma sintaxe do .ftl —
// i18n.getTranslation('chave') interpolado por FreeMarker (com ${...} no CÓDIGO,
// nunca em comentário: o FreeMarker processa o .js inteiro e um ${...} mal-formado
// em comentário quebra o deploy do i18n).

// Exceção controlada à convenção ES6+: a variável raiz que recebe
// SuperWidget.extend(...) usa `var`.
var Notifications = SuperWidget.extend({

  // Ciclo de vida: ponto de entrada invocado pela plataforma ao montar o widget.
  init: function() {
    var ctx = this;
    ctx.loadNotifications();
  },

  // Bindings declarativos: a chave é o valor do data-* SEM o prefixo "data-".
  bindings: {
    local: {
      'refresh-list': ['click_onRefreshList'],
      'mark-all-read': ['click_onMarkAllRead']
    },
    global: {}
  },

  onRefreshList: function() {
    var ctx = this;
    ctx.loadNotifications();
  },

  onMarkAllRead: async function() {
    var ctx = this;
    var url = WCMAPI.getServerURL() + '/api/public/2.0/notification/markAllAlertsAsRead';

    try {
      var response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);

      var message = "${i18n.getTranslation('notifications.allRead')}";
      FLUIGC.toast({ message: message, type: 'success' });
      ctx.loadNotifications();
    } catch (error) {
      var errorMessage = "${i18n.getTranslation('notifications.loadError')}";
      FLUIGC.toast({ message: errorMessage, type: 'danger' });
    }
  },

  loadNotifications: async function() {
    var ctx = this;
    var url = WCMAPI.getServerURL() + '/api/public/2.0/notification/listAllAlerts';

    try {
      var response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error('HTTP ' + response.status);

      var notifications = await response.json();
      ctx.renderList(notifications);
    } catch (error) {
      var message = "${i18n.getTranslation('notifications.loadError')}";
      FLUIGC.toast({ message: message, type: 'danger' });
    }
  },

  renderList: function(notifications) {
    var ctx = this;
    var items = notifications || [];

    // instanceId é usado apenas para compor o id do elemento (separador "_").
    var list = document.getElementById('notificationsList_' + ctx.instanceId);
    if (!list) {
      return;
    }

    list.innerHTML = '';
    items.forEach(function(item) {
      var li = document.createElement('li');
      // Entrada não confiável: usar textContent (evita XSS).
      li.textContent = item.title;
      list.appendChild(li);
    });
  }
});
