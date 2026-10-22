// Exemplo com violação — sintaxe inventada [=i18n...] (não existe na doc oficial).
var MyWidget = SuperWidget.extend({
  init: function() {
    var ctx = this;
    const message = "[=i18n.getTranslation('error.load')]";
    FLUIGC.toast({ message: message, type: 'danger' });
  }
});
