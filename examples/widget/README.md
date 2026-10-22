# Exemplo: Widget (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos
- `view.ftl` — view FreeMarker do widget: elemento raiz com `fluig-style-guide`, `id` com `instanceId`, `data-params` chamando `instance()` sem `instanceId`, elementos interativos com `data-*` e texto via i18n.
- `edit.ftl` — view de edição do widget: pode ser vazia, mas o arquivo precisa existir (o descritor a referencia via `edit.file=edit.ftl`).
- `notifications.js` — `SuperWidget.extend` com `init` e `bindings` (local/global): a variável raiz usa `var` (exceção controlada) e os métodos dentro de `.extend({})` usam `nome: function() {}` com `var ctx = this;` (sintaxe padronizada e segura na minificação), chamando endpoints internos via `fetch()` + `async/await` + `try/catch`, com a URL montada a partir de `WCMAPI.getServerURL()`. O nome do arquivo (`notifications.js`) casa com `application.code=notifications` e com `application.resource.js.1`.
- `notifications.properties` — bundle base de i18n (fallback, em Português, com acentuação direta permitida).
- `notifications_pt_BR.properties` — bundle de i18n em Português (Brasil), com escapes `\uXXXX`.
- `notifications_en_US.properties` — bundle de i18n em Inglês (EUA).
- `notifications_es.properties` — bundle de i18n em Espanhol, com escapes `\uXXXX`.
- `application.info` — descritor do widget com os campos completos (`application.type=widget`, `application.renderer=freemarker`, `view.file`, `edit.file`, recursos CSS/JS, base de i18n e dados do desenvolvedor).
- `preferences.example.js` — exemplo adicional: persistência de preferências por instância via `WCMSpaceAPI.PageService.UPDATEPREFERENCES`. Mostra o **ciclo completo**: salvar; a view repassar a preferência reinjetada pelo FreeMarker via `data-params`; e o JS lê por `this.<prop>`. Inclui detecção de modo com `WCMAPI.getIsEditMode() === 'true'` (retorno é string), leitura em modo view e `FLUIGC.toast`. Ver `context/conventions.md`, seção "Preferências de Widget (persistência por instância)".
- `modal.example.js` + `modal.example.view.ftl` — widget "opener" com as 4 variações de `content` de `FLUIGC.modal` (estática, Mustache, outra widget via `widgetCode`/`ftl`/`data`, `WCMAPI.convertFtlAsync`) e a regra crítica de binding do botão de ação do modal em `bindings.global` (nunca `local`, pois o modal é renderizado fora da raiz do widget). Ver `context/conventions.md`, seção "Modais em Widgets".
- `modal-target.example.js` + `modal-target.example.view.ftl` — widget "alvo" reutilizável mínima, carregada dentro do modal pelas variações 3 e 4 acima; demonstra a leitura do parâmetro recebido direto no `view.ftl` (`${receivedParam!''}`). Ver `context/conventions.md`, seção "Passagem de Dados em Widgets", cenário (c).
- `datatable.example.js` + `datatable.example.view.ftl` — widget com `FLUIGC.datatable`: configuração básica (`dataRequest`/`renderContent`/`header`), template de ações por linha com `bindings.local` (contraste com o botão do modal, que usa `global`), busca local, reordenação com `draggable` + persistência via `UPDATEPREFERENCES`, e paginação manual client-side. Ver `context/conventions.md`, seção "Datatable em Widgets", e `context/style-guide.md`, seção "Datatable (`FLUIGC.datatable`)".
- `mustache-templates.example.js` + `mustache-templates.example.view.ftl` — templates Mustache: interpolação simples + valor computado, iteração sobre array (`{{#items}}`) e seção invertida (`{{^rating}}`) para fallback "sem dados". Ver `context/conventions.md`, seção "Templating com Mustache".

## Pontos-chave demonstrados
- Elemento raiz com a classe `fluig-style-guide` (ativa os componentes/estilos do Style Guide no escopo do widget).
- `instanceId` usado **apenas** em atributos `id`, com separador `_` (ex.: `notifications_${instanceId}`).
- `.instance()` chamado **sem** `instanceId` no `data-params`; no JS, uso de `this.instanceId`.
- Bindings declarativos com a chave **sem** o prefixo `data-` (escopo `local` e `global`).
- Todo texto visível via i18n — sem strings fixas: `${i18n.getTranslation('chave')}`, mesma sintaxe na `view.ftl`/`edit.ftl` e em `notifications.js` (ver `context/platform-constitution.md`).
- **Sintaxe dentro de `.extend({})`:** métodos como `nome: function() {}` com `var ctx = this;` no topo e callbacks internos em `function() {}` acessando `ctx` — evitando method shorthand ES6 e arrow functions (que não vinculam `this` e podem quebrar na minificação do build). A **variável raiz da SuperWidget** usa `var` (exceção controlada). Fora do objeto `.extend({})`, ES6+ segue como padrão.
- **i18n do widget:** 4 arquivos `.properties` (base `notifications.properties` + `_pt_BR`/`_en_US`/`_es`); o base em Português admite acentos diretos e os locales usam escapes `\uXXXX`.
- View de edição (`edit.ftl`) obrigatória, podendo ser vazia; o descritor a referencia via `edit.file=edit.ftl`.
- Chamadas REST a endpoints internos via `fetch()` + `async/await` + `try/catch`, com a URL pública montada a partir de `WCMAPI.getServerURL()` (ver `context/platform-constitution.md`).
- **Modais:** `FLUIGC.modal` com as 4 variações de `content` e o botão de ação sempre em `bindings.global` (modal renderizado fora da raiz do widget).
- **Passagem de dados entre widgets:** `edit.ftl` → `view.ftl` por interpolação direta, preferências por instância, `data`/`convertFtlAsync` para carregar outra widget em um modal, e eventos (`WCMAPI.fireEvent`/`addListener`) para widgets já renderizados.
- **Datatable:** `FLUIGC.datatable` com ações por linha em `bindings.local` (diferente do modal), busca local, reordenação persistida e paginação manual client-side.
- **Templating com Mustache:** interpolação, valores computados, iteração (`{{#lista}}`) e seções invertidas (`{{^condicao}}`), reutilizadas tanto em modal quanto em Datatable.

> Fonte de verdade: `context/conventions.md`, `context/style-guide.md`, `context/architecture.md` e `context/platform-constitution.md`.
