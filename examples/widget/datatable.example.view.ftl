<#-- Exemplo mínimo de referência — View de Widget com FLUIGC.datatable -->
<#-- Demonstra o alvo do Datatable e o template de ações por linha. Ver     -->
<#-- context/conventions.md, seção "Datatable em Widgets". Não é um projeto -->
<#-- completo.                                                              -->

<div id="datatableExample_${instanceId}"
     class="fluig-style-guide super-widget wcm-widget-class datatable-example-widget"
     data-params="DatatableExample.instance({})">

  <#-- Alvo onde FLUIGC.datatable renderiza a tabela. -->
  <div id="targetDatatable_${instanceId}"></div>

  <#-- Template de ações por linha: renderizado DENTRO da raiz do widget,
       por isso os botões usam bindings.local (ver conventions.md). O id leva
       o instanceId para não colidir com outra instância na mesma página. -->
  <script type="text/template" id="datatable-actions_${instanceId}">
    <button type="button" class="btn btn-success btn-sm" data-add-row>
      ${i18n.getTranslation('datatableExample.addRow')}
    </button>
    <button type="button" class="btn btn-danger btn-sm" data-remove-row>
      ${i18n.getTranslation('datatableExample.removeRow')}
    </button>
    <button type="button" class="btn btn-info btn-sm" data-select-row>
      ${i18n.getTranslation('datatableExample.selectRow')}
    </button>
  </script>
</div>
