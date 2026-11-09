<#-- Exemplo mínimo de referência — View de Widget com templates Mustache  -->
<#-- Demonstra os <script type="text/template"> usados pelos 2 exemplos:   -->
<#-- interpolação simples + valor computado, e iteração + seção invertida. -->
<#-- Ver context/conventions.md, seção "Templating com Mustache". Não é    -->
<#-- um projeto completo.                                                  -->

<div id="mustacheTemplatesExample_${instanceId}"
     class="fluig-style-guide super-widget wcm-widget-class mustache-templates-example-widget"
     data-params="MustacheTemplatesExample.instance({})">

  <#-- Exemplo 1: interpolação simples ({{title}}) + valor computado ({{calc}}). -->
  <script type="text/template" id="tplSimple_${instanceId}">
    {{title}} spends {{calc}}
  </script>
  <div id="targetSimple_${instanceId}"></div>

  <#-- Exemplo 2: iteração ({{#items}}) + seção invertida ({{^rating}}) para
       fallback quando o item não tem avaliação. -->
  <script type="text/template" id="tplList_${instanceId}">
    {{#items}}
    <p>
      {{name}}:
      {{#rating}}{{rating}} stars{{/rating}}
      {{^rating}}No rating yet{{/rating}}
    </p>
    {{/items}}
  </script>
  <div id="targetList_${instanceId}"></div>
</div>
