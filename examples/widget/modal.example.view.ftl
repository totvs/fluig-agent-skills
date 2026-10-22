<#-- Exemplo mínimo de referência — View de Widget "opener" de modal (FreeMarker) -->
<#-- Demonstra os 4 botões que disparam cada variação de FLUIGC.modal e o      -->
<#-- template Mustache usado pela variação 2. Ver context/conventions.md,      -->
<#-- seção "Modais em Widgets". Não é um projeto completo.                     -->

<div id="modalExample_${instanceId}"
     class="fluig-style-guide super-widget wcm-widget-class modal-example-widget"
     data-params="ModalExample.instance({})">

  <div class="row">
    <div class="col-xs-12">
      <#-- Chave do binding = valor do data-* SEM o prefixo data- -->
      <button type="button" class="btn btn-default" data-open-static-modal>
        ${i18n.getTranslation('modalExample.openStatic')}
      </button>
      <button type="button" class="btn btn-default" data-open-mustache-modal>
        ${i18n.getTranslation('modalExample.openMustache')}
      </button>
      <button type="button" class="btn btn-default" data-open-widget-modal>
        ${i18n.getTranslation('modalExample.openWidget')}
      </button>
      <button type="button" class="btn btn-default" data-open-convert-ftl-modal>
        ${i18n.getTranslation('modalExample.openConvertFtl')}
      </button>
    </div>
  </div>

  <#-- Template Mustache usado pela variação 2 (openMustacheModal). O id leva o
       instanceId para não colidir quando há mais de uma instância do widget
       na mesma página. -->
  <script type="text/template" id="tpl-modal_${instanceId}">
    <h4>{{param1}}</h4>
  </script>
</div>
