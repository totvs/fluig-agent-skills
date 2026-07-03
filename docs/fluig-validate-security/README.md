# Exemplos de Uso — fluig-validate-security

Prompts prontos para acionar a skill `fluig-validate-security` com um agente de IA, em três níveis de complexidade.

## Simples

> Valide e sanitize este trecho de código frontend contra XSS.

## Intermediário

> Vou colar um trecho de widget que insere entrada do usuário no DOM via `innerHTML`. Sanitize-o usando `DOMPurify.sanitize` quando precisar manter HTML válido ou `WCMAPI.validateXSS` para reduzir a texto puro, sem alterar o comportamento.

## Completo

> Segue o arquivo de um Custom Element em que os dados vêm da query string e de uma resposta de API. Valide e sanitize as vulnerabilidades de frontend: substitua os usos inseguros de `innerHTML` por `textContent` ou conteúdo sanitizado com `DOMPurify.sanitize`, aplique `WCMAPI.validateXSS` onde só texto for necessário, escape os dados dinâmicos em FreeMarker com `${value?html}`/`${value?js_string}`, remova qualquer `eval()`/`new Function()` com dados dinâmicos e troque chamadas REST internas por `FLUIGC.ajax`/`WCMAPI`. Sanitize tanto na entrada quanto na exibição e preserve o comportamento.
