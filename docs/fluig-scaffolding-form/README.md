# Exemplos de Uso — fluig-scaffolding-form

Prompts prontos para acionar a skill `fluig-scaffolding-form` com um agente de IA, em três níveis de complexidade.

## Simples

> Crie um novo formulário de solicitação de férias no Fluig.

## Intermediário

> Crie um formulário de solicitação de férias com os campos nome do colaborador, data de início e quantidade de dias, todos com o atributo `name` e rótulos via `i18n.translate("chave")`.

## Intermediário (Pai x Filho)

> Crie um formulário com uma tabela Pai x Filho chamada `aprovacoes`, com `tablename` na tag `<table>`, linha-base no `<tbody id="aprovacoes">` e campos `dtAprovador`, `aprovadorAtividade`, `codAprovador`, `nomeAprovador`, `obsAprovador`, `statusAprovado`. Considere que o Fluig aplica sufixo automático `___n` nas linhas geradas.

## Completo

> Crie o esqueleto de um formulário chamado `solicitacaoFerias` com os campos nome do colaborador (texto, obrigatório), data de início (data, obrigatório) e quantidade de dias (numérico, obrigatório). Envolva os campos em `fluig-style-guide` dentro de um `<form>` nomeado, com cada campo usando o atributo `name`. Aplique a regra de validação de que a quantidade de dias deve ser maior que zero e a data de início não pode ser no passado, implementada no arquivo de eventos com mensagens via `i18n.translate("chave")` e entrada sanitizada com `WCMAPI.validateXSS`/`DOMPurify.sanitize`, em ES6+. Gere os três arquivos `.properties` (`_pt_BR`, `_en_US`, `_es`) com todas as chaves do HTML e dos eventos, sem caracteres não-ASCII diretos (usar `\uXXXX`), garantindo que o nome do arquivo HTML seja idêntico ao prefixo dos `.properties`.

## Completo (Pai x Filho + Dataset)

> Crie um formulário chamado `analiseNota` com dados gerais no cabeçalho e uma tabela Pai x Filho `aprovacoes`. Na tabela, use `<table tablename="aprovacoes" noaddbutton="false" nodeletebutton="false">` e `<tbody id="aprovacoes">` com a linha-base dos campos `dtAprovador`, `aprovadorAtividade`, `codAprovador`, `nomeAprovador`, `obsAprovador`, `statusAprovado`. Não sufixe nomes manualmente; o Fluig deve gerar `___1`, `___2`, etc. Inclua exemplo de uso de `wdkAddChild("aprovacoes")` e `wdkRemoveChild(...)`, explique versionamento/histórico de linhas e gere um snippet de consulta ao dataset do formulário com constraints `documentid`, `tablename="aprovacoes"` e `metadata#active=true`.
