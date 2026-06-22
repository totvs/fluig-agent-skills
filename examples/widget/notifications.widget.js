// Exemplo mínimo de referência — Widget Fluig (SuperWidget.extend)
// Demonstra: init() e bindings (local/global), ES6+, this.instanceId,
// chamadas REST internas via FLUIGC.ajax/WCMAPI e i18n para texto visível.
// Não é um projeto completo. Ver context/conventions.md e context/style-guide.md.

// Exceção controlada à convenção ES6+: a variável raiz que recebe
// SuperWidget.extend(...) usa `var`. O restante do código permanece em ES6+.
var Notifications = SuperWidget.extend({

  // Ciclo de vida: ponto de entrada invocado pela plataforma ao montar o widget.
  init() {
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

  onRefreshList() {
    this.loadNotifications();
  },

  onMarkAllRead() {
    const url = `${WCMAPI.getServerURL()}/api/public/notifications/read-all`;

    FLUIGC.ajax({
      url,
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
      .then(() => {
        const message = "${i18n.getTranslation('notifications.allRead')}";
        FLUIGC.toast({ message, type: 'success' });
        this.loadNotifications();
      })
      .catch(() => {
        const message = "${i18n.getTranslation('notifications.loadError')}";
        FLUIGC.toast({ message, type: 'danger' });
      });
  },

  loadNotifications() {
    const url = `${WCMAPI.getServerURL()}/api/public/notifications`;

    FLUIGC.ajax({
      url,
      method: 'GET',
      dataType: 'json'
    })
      .then((notifications) => this.renderList(notifications))
      .catch(() => {
        const message = "${i18n.getTranslation('notifications.loadError')}";
        FLUIGC.toast({ message, type: 'danger' });
      });
  },

  renderList(notifications = []) {
    // instanceId é usado apenas para compor o id do elemento (separador "_").
    const list = document.getElementById(`NotificationsList_${this.instanceId}`);
    if (!list) {
      return;
    }

    list.innerHTML = '';
    notifications.forEach((item) => {
      const li = document.createElement('li');
      // Entrada não confiável: usar textContent (evita XSS).
      li.textContent = item.title;
      list.appendChild(li);
    });
  }
});
