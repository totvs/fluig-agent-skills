# Exemplos de Uso — fluig-internationalization

Prompts prontos para acionar a skill `fluig-internationalization` com um agente de IA, em três níveis de complexidade.

## Simples

> Internacionalize este trecho de código, removendo os textos fixos.

## Intermediário

> Vou colar um arquivo `.js` de widget com rótulos e mensagens em strings fixas. Externalize cada texto visível para chaves de tradução usando a sintaxe do Fluig `${i18n.getTranslation('chave')}` (entre aspas ao atribuir a variável); em template literals, declare a tradução em variável separada antes de concatenar.

## Completo

> Segue o arquivo de um Custom Element com strings fixas, acesso incorreto a `i18n` como objeto JavaScript (`i18n['key']`) e traduções montadas dentro de template literals. Internacionalize tudo: em `.js` use `${i18n.getTranslation('chave')}` (entre aspas ao atribuir a variável; em template literals, tradução em variável separada antes de concatenar), aplique `getTranslationP1`/`getTranslationPn` para os valores dinâmicos com marcadores `{0}`/`{1}`, corrija os acessos incorretos a `i18n` e propague cada chave nova nos quatro arquivos `.properties` (base + `pt_BR`/`en_US`/`es`), marcando `# TODO i18n` onde faltar tradução. Ignore strings técnicas e preserve o comportamento.
