<#-- Exemplo mínimo de referência — View de Widget Fluig (FreeMarker) -->
<#-- Demonstra: raiz com 3 classes fixas + classe do widget, instanceId só no id  -->
<#-- (camelCase inicial minúscula + exatamente um _), instance() sem instanceId,  -->
<#-- data-* para bindings e i18n para texto visível.                              -->
<#-- Não é um projeto completo. Ver context/conventions.md e context/style-guide.md. -->

<div id="notifications_${instanceId}"
     class="fluig-style-guide super-widget wcm-widget-class notifications-widget"
     data-params="notifications.instance({})">

  <div class="row">
    <div class="col-xs-12">
      <h2 class="notifications-widget__title">
        ${i18n.getTranslation('notifications.title')}
      </h2>
    </div>
  </div>

  <div class="row">
    <div class="col-xs-12">
      <ul id="NotificationsList_${instanceId}" class="notifications-widget__list">
        <#-- A lista é preenchida pelo init() a partir de um endpoint interno. -->
      </ul>
    </div>
  </div>

  <div class="row">
    <div class="col-xs-12">
      <#-- A chave do binding é o valor do data-* SEM o prefixo data-. -->
      <button type="button" class="btn btn-primary" data-refresh-list>
        ${i18n.getTranslation('notifications.refresh')}
      </button>
      <button type="button" class="btn btn-default" data-mark-all-read>
        ${i18n.getTranslation('notifications.markAllRead')}
      </button>
    </div>
  </div>
</div>
