<#-- Exemplo mínimo de referência — View de Widget "alvo" carregada em um modal -->
<#-- Demonstra a leitura do parâmetro recebido via `data` (FLUIGC.modal) ou    -->
<#-- WCMAPI.convertFtlAsync, direto no FreeMarker — sem round-trip de JS. Ver  -->
<#-- context/conventions.md, seção "Passagem de Dados em Widgets", cenário (c). -->
<#-- Não é um projeto completo.                                                -->

<div id="modalTargetExample_${instanceId}"
     class="fluig-style-guide super-widget wcm-widget-class modal-target-example-widget"
     data-params="ModalTargetExample.instance()">

  <#-- "receivedParam" chega pronto no contexto do FreeMarker — valor padrão
       vazio (!'') cobre o caso de a widget ser aberta fora do fluxo de modal.
       É dado vindo de outro widget / convertFtlAsync (não confiável): escapar
       com ?html para evitar XSS. -->
  <p>${(receivedParam!'')?html}</p>
</div>
