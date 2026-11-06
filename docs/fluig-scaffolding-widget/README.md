# Exemplos de Uso — fluig-scaffolding-widget

Prompts prontos para acionar a skill `fluig-scaffolding-widget` com um agente de IA, em três níveis de complexidade.

## Simples

> Crie um novo widget de notificações para o Fluig.

## Intermediário

> Crie um widget de notificações com uma lista de itens e um botão de marcar como lido, usando `SuperWidget.extend` e os componentes do Fluig Style Guide.

## Completo

> Crie o esqueleto de um widget de notificações chamado `Notifications` para o portal, com elemento raiz contendo as classes `fluig-style-guide super-widget wcm-widget-class`, `instanceId` apenas no `id` da div raiz (camelCase, um único `_`), `.instance()` sem `instanceId` e os métodos do `SuperWidget.extend({})` declarados como `init: function() { ... }` usando `this` direto e Arrow Functions nos callbacks, sem `var ctx = this;` (nunca method shorthand ES6 nem arrow como método — regra 3 da constituição). Inclua bindings declarativos para marcar itens como lidos, todos os textos visíveis via `${i18n.getTranslation('chave')}` com os quatro arquivos `.properties` (base + `pt_BR`/`en_US`/`es`) e estilos reutilizando o Style Guide, usando `var(--fs-color-*)` para as cores de tema.

## Consulta a datasets no cliente

> Crie o esqueleto de um widget chamado `BranchList` que lista filiais consultando um dataset no lado cliente via `DatasetFactory`. Como a consulta ocorre no cliente, importe obrigatoriamente na `view.ftl` o script `<script src="/webdesk/vcXMLRPC.js" type="text/javascript"></script>` (exatamente nessa forma), mantendo o restante das convenções (raiz com as 3 classes obrigatórias, `instanceId` só no `id`, i18n para textos visíveis e Style Guide).

## Widget que abre um modal carregando dados de outra widget

> Crie um widget chamado `ContractDetails` com um botão que abre um modal via `FLUIGC.modal`, carregando dentro do modal a widget `widget_reutilizavel` e enviando um parâmetro para ela (variação `content: {widgetCode, ftl, data}`). O modal deve ter um botão "Salvar" que fecha o modal (`.remove()`) e exibe um `FLUIGC.toast` de sucesso. Lembre-se: o botão "Salvar" do modal é vinculado via `bindings.global`, nunca `bindings.local`, pois o modal é renderizado fora da raiz do widget.

## Widget com tabela de dados paginável, busca e ações por linha

> Crie um widget chamado `EmployeeList` com uma tabela de funcionários usando `FLUIGC.datatable`: colunas de nome, cargo e e-mail, busca por nome, botões de "Editar" e "Remover" por linha (via `actions.template`) e paginação manual client-side. Lembre-se: o template de ações por linha é vinculado via `bindings.local`, pois é renderizado dentro da raiz do widget — diferente do botão de ação de um modal, que usa `bindings.global`.
