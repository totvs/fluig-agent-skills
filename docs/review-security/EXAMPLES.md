# Exemplos de Uso — review-security

Prompts prontos para acionar a skill `review-security` com um agente de IA, em três níveis de complexidade.

## Simples

> Revise a segurança deste trecho de código frontend Fluig e liste as vulnerabilidades por severidade.

## Intermediário

> Vou colar o arquivo de um widget Fluig em que os dados vêm da query string. Faça uma revisão de segurança sob a ótica do OWASP Top 10, com atenção a XSS via `innerHTML`, e gere um relatório de achados por severidade usando apenas API pública, sem reescrever o código.

## Completo

> Segue o arquivo de um Custom Element em que os dados não confiáveis vêm de um formulário, da query string e de uma resposta de API. Faça uma revisão de segurança antes do merge sob a ótica do OWASP Top 10: mapeie o fluxo dos dados do usuário e avalie injeção/XSS (A03) em usos de `innerHTML` e interpolação dinâmica em FreeMarker, exposição de dados sensíveis (A02) e configuração insegura (A05) em chamadas a endpoints internos. Para cada achado, informe localização, categoria OWASP, severidade e a regra de contexto correspondente, e recomende a correção usando apenas API pública (`DOMPurify.sanitize`, `WCMAPI.validateXSS`, escape FreeMarker com `${value?html}`/`${value?js_string}`, `FLUIGC.ajax`/`WCMAPI`), ordenando do mais grave ao menos grave e apontando a skill `validate-security`. Apenas diagnostique, sem alterar o código.
