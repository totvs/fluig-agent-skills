// Exemplo correto — sem violações da constituição.
var MyWidget = SuperWidget.extend({
  init: function() {
    var ctx = this;
    ctx.loadData();
  },

  loadData: async function() {
    var ctx = this;
    try {
      const url = WCMAPI.getServerURL() + '/api/public/recurso';
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      ctx.render(data);
    } catch (error) {
      console.error('Falha ao carregar dados:', error);
      var message = "${i18n.getTranslation('error.load')}";
      FLUIGC.toast({ message: message, type: 'danger' });
    }
  },

  render: function(data) {
    var ctx = this;
    console.log(data, ctx.instanceId);
  }
});
