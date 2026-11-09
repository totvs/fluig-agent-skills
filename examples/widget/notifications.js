// Exemplo mínimo de referência — Widget Fluig (SuperWidget.extend)
// Demonstra: init() e bindings (local/global), this.instanceId, chamadas REST
// internas via fetch()/async-await (API pública, WCMAPI.getServerURL()) e i18n
// para texto visível.
// Não é um projeto completo. Ver context/conventions.md#convenções-de-widget-superwidgetextend
// e context/style-guide.md#api-javascript-pública-fluigc (API JavaScript pública).
//
// Sintaxe obrigatória dentro de .extend({}) (ver
// context/conventions.md#sintaxe-de-métodos-dentro-de-extend): métodos declarados como
// `nome: function() {}` (nunca method shorthand ES6 nem arrow como método) e SEM
// `var ctx = this;`. Os callbacks (eventos, forEach, success, fail) são Arrow
// Functions, que mantêm o `this` do widget.
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
var Notifications = SuperWidget.extend({

  // Ciclo de vida: ponto de entrada invocado pela plataforma ao montar o widget.
  init: function() {
    this.loadNotifications();
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
    this.loadNotifications();
  },

  onMarkAllRead: async function() {
    const url = WCMAPI.getServerURL() + '/api/public/2.0/notification/markAllAlertsAsRead';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);

      const message = "[=i18n.getTranslation('notifications.allRead')]";
      FLUIGC.toast({ message: message, type: 'success' });
      this.loadNotifications();
    } catch (error) {
      const errorMessage = "[=i18n.getTranslation('notifications.loadError')]";
      FLUIGC.toast({ message: errorMessage, type: 'danger' });
    }
  },

  loadNotifications: async function() {
    const url = WCMAPI.getServerURL() + '/api/public/2.0/notification/listAllAlerts';

    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error('HTTP ' + response.status);

      const notifications = await response.json();
      this.renderList(notifications);
    } catch (error) {
      const message = "[=i18n.getTranslation('notifications.loadError')]";
      FLUIGC.toast({ message: message, type: 'danger' });
    }
  },

  renderList: function(notifications) {
    const items = notifications || [];

    // instanceId é usado apenas para compor o id do elemento (separador "_").
    const list = document.getElementById('notificationsList_' + this.instanceId);
    if (!list) {
      return;
    }

    list.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      // Entrada não confiável: usar textContent (evita XSS).
      li.textContent = item.title;
      list.appendChild(li);
    });
  }
});
