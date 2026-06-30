# Exemplos de Uso — scaffolding-widget

Prompts prontos para acionar a skill `scaffolding-widget` com um agente de IA, em três níveis de complexidade.

## Simples

> Crie um novo widget de notificações para o Fluig.

## Intermediário

> Crie um widget de notificações com uma lista de itens e um botão de marcar como lido, usando `SuperWidget.extend` e os componentes do Fluig Style Guide.

## Completo

> Crie o esqueleto de um widget de notificações chamado `Notifications` para o portal, com elemento raiz contendo as classes `fluig-style-guide super-widget wcm-widget-class`, `instanceId` apenas no `id` da div raiz (camelCase, um único `_`), `.instance()` sem `instanceId` e `init()` em ES6+. Inclua bindings declarativos para marcar itens como lidos, todos os textos visíveis via `${i18n.getTranslation('chave')}` com os quatro arquivos `.properties` (base + `pt_BR`/`en_US`/`es`) e estilos reutilizando o Style Guide, usando `var(--fs-color-*)` para as cores de tema.
