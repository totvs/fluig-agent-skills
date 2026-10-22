<#-- Exemplo mínimo de referência — View de Widget Fluig (FreeMarker) -->
<#-- Padrão de view de widget: div raiz com as 3 classes fixas, instanceId só   -->
<#-- no id (PascalCase + exatamente um _), data-params com                       -->
<#-- <NomeWidget>.instance() SEM {}, data-* para bindings e i18n para texto      -->
<#-- visível. Não é um projeto completo.                                         -->
<#-- Ver context/conventions.md e context/style-guide.md.                        -->

<div id="Notifications_${instanceId}"
     class="super-widget wcm-widget-class fluig-style-guide notifications-widget"
     data-params="Notifications.instance()">

  <div class="row">
    <div class="col-xs-12">
      <h2 class="notifications-widget__title">
        ${i18n.getTranslation('notifications.title')}
      </h2>
    </div>
  </div>

  <div class="row">
    <div class="col-xs-12">
      <ul id="notificationsList_${instanceId}" class="notifications-widget__list">
        <#-- A lista é preenchida pelo init() via fetch() ao domínio próprio do Fluig
             (WCMAPI.getServerURL() + API pública) — ver notifications.js. -->
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
