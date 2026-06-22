# Exemplo: Widget (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos
- `view.ftl` — view FreeMarker do widget: elemento raiz com `fluig-style-guide`, `id` com `instanceId`, `data-params` chamando `instance()` sem `instanceId`, elementos interativos com `data-*` e texto via i18n.
- `edit.ftl` — view de edição do widget: pode ser vazia, mas o arquivo precisa existir (o descritor a referencia via `edit.file=edit.ftl`).
- `notifications.widget.js` — `SuperWidget.extend` com `init()` e `bindings` (local/global): a variável raiz usa `var` (exceção controlada) e o restante permanece em ES6+, chamando endpoints internos via `FLUIGC.ajax`/`WCMAPI`.
- `application.info` — descritor do widget com os campos completos (`application.type=widget`, `application.renderer=freemarker`, `view.file`, `edit.file`, `application.version`, recursos CSS/JS, base de i18n e dados do desenvolvedor).

## Pontos-chave demonstrados
- Elemento raiz com a classe `fluig-style-guide` (ativa os componentes/estilos do Style Guide no escopo do widget).
- `instanceId` usado **apenas** em atributos `id`, com separador `_` (ex.: `Notifications_${instanceId}`).
- `.instance()` chamado **sem** `instanceId` no `data-params`; no JS, uso de `this.instanceId`.
- Bindings declarativos com a chave **sem** o prefixo `data-` (escopo `local` e `global`).
- Todo texto visível via `${i18n.getTranslation('chave')}` — sem strings fixas.
- JavaScript em ES6+ (`const`/`let`, arrow functions, template literals); a **variável raiz da SuperWidget** é a exceção controlada que usa `var`.
- View de edição (`edit.ftl`) obrigatória, podendo ser vazia; o descritor a referencia via `edit.file=edit.ftl`.
- Chamadas REST a endpoints internos via `FLUIGC.ajax`/`WCMAPI` (nunca `fetch`/`$.ajax`).

> Fonte de verdade: `context/conventions.md`, `context/style-guide.md` e `context/architecture.md`.
