# Exemplos de Uso — scaffolding-form

Prompts prontos para acionar a skill `scaffolding-form` com um agente de IA, em três níveis de complexidade.

## Simples

> Crie um novo formulário de solicitação de férias no Fluig.

## Intermediário

> Crie um formulário de solicitação de férias com os campos nome do colaborador, data de início e quantidade de dias, todos com o atributo `name` e rótulos via `i18n.translate("chave")`.

## Completo

> Crie o esqueleto de um formulário chamado `solicitacaoFerias` com os campos nome do colaborador (texto, obrigatório), data de início (data, obrigatório) e quantidade de dias (numérico, obrigatório). Envolva os campos em `fluig-style-guide` dentro de um `<form>` nomeado, com cada campo usando o atributo `name`. Aplique a regra de validação de que a quantidade de dias deve ser maior que zero e a data de início não pode ser no passado, implementada no arquivo de eventos com mensagens via `i18n.translate("chave")` e entrada sanitizada com `WCMAPI.validateXSS`/`DOMPurify.sanitize`, em ES6+. Gere os três arquivos `.properties` (`_pt_BR`, `_en_US`, `_es`) com todas as chaves do HTML e dos eventos, sem caracteres não-ASCII diretos (usar `\uXXXX`), garantindo que o nome do arquivo HTML seja idêntico ao prefixo dos `.properties`.
