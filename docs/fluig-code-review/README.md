# Exemplos de Uso — fluig-code-review

Prompts prontos para acionar a skill `fluig-code-review` com um agente de IA, em três níveis de complexidade.

## Simples

> Revise este trecho de código frontend Fluig e me devolva um relatório de achados por severidade.

## Intermediário

> Vou colar o arquivo de um widget Fluig (`SuperWidget`). Faça uma revisão geral de qualidade antes do merge, com foco em segurança e i18n, e gere um relatório de achados classificados por severidade, sem reescrever o código.

## Completo

> Segue o arquivo completo de um widget que usa `SuperWidget`, com markup FreeMarker e CSS. Faça uma revisão transversal de qualidade antes do merge cobrindo ES6+, convenções de widget (`fluig-style-guide` na raiz, `instanceId` apenas no `id`, bindings), i18n via `i18n.getTranslation`, segurança (`DOMPurify.sanitize`/`WCMAPI.validateXSS`), chamadas REST internas via `FLUIGC.ajax`, reutilização do Style Guide com `var(--fs-color-*)`, acessibilidade e performance. Para cada achado, informe localização, severidade (crítico a baixo) e a regra de contexto correspondente, ordenando do mais grave ao menos grave e apontando a skill especializada aplicável. Apenas diagnostique e recomende, sem alterar o código.
