# Exemplos de Uso — fluig-best-practices

Prompts prontos para acionar a skill `fluig-best-practices` com um agente de IA, em três níveis de complexidade.

## Simples

> Revise se este trecho de código segue as boas práticas oficiais do Fluig e me devolva os achados por severidade.

## Intermediário

> Vou colar o arquivo de um widget Fluig. Faça uma revisão de aderência às boas práticas oficiais, com foco nas convenções de widget (`fluig-style-guide` na raiz, `instanceId` apenas no `id`, bindings) e em i18n, e gere um relatório de achados por severidade sem reescrever o código.

## Completo

> Segue o arquivo de um widget que usa `SuperWidget`, com markup FreeMarker e CSS. Faça uma revisão de conformidade com os padrões oficiais do Fluig antes do merge avaliando ES6+ (`const`/`let`, arrow functions, `async/await`, sem misturar jQuery), convenções de widget (`fluig-style-guide` na raiz, `instanceId` só no `id` com `_`, `instance()` sem `instanceId`, bindings), Custom Elements (nome `[name].[category].js`, classe PascalCase, sem Shadow DOM), i18n via `i18n.getTranslation`, reutilização do Style Guide com helpers `fs-*` e `var(--fs-color-*)`, chamadas REST internas via `FLUIGC.ajax`/`WCMAPI` e nomenclatura descritiva. Para cada desvio, informe localização, severidade e a regra de contexto correspondente, ordene do mais grave ao menos grave e aponte a skill especializada aplicável (ex.: `internationalization`, `style-guide-helpers`, `migrate-jquery-es6`). Apenas diagnostique, sem alterar o código.
