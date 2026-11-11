# Exemplos de Uso — fluig-code-review-partner-widgets

Prompts prontos para acionar a skill `fluig-code-review-partner-widgets` com um agente de IA, em três níveis de complexidade. A skill é exclusiva de soluções de Parceiro destinadas à Store do TOTVS Fluig.

## Simples

> Faça o pré-review dos widgets do meu componente Fluig para a Store. O projeto Maven está em `./meu-componente`.

## Intermediário

> Vou submeter meu componente à Store do TOTVS Fluig. Revise todos os widgets do projeto Maven em `./meu-componente`, com foco em segurança (XSS) e no `application.info`. Não altere o código e grave o relatório de pré-review por severidade na raiz do projeto.

## Completo

> Meu componente já teve a versão 1.2.0 aprovada na Store e eu alterei o widget de notificações. Faça o pré-review de todos os widgets (`application.type=widget`) do projeto Maven em `./meu-componente`, lendo 100% dos arquivos `.js`, `.ftl`, `.css` e `.properties` e o `application.info` de cada um. Cubra campos exigidos pela Store, `application.uiwidget`, ícone, `SuperWidget.extend`, escopo via `this.DOM`, FTL sem script inline nem CDN, `async:false` e `DatasetFactory` no cliente, XSS com rastreio da origem da variável, chamadas REST via `fetch`, Style Guide e `var(--fs-color-*)`, i18n, frameworks SPA e reuso de Componentes de Negócio nativos. Diga também qual incremento de versão devo usar. Marque como "VERIFICAR MANUALMENTE" o que tiver origem ambígua e grave o relatório `pre-review-widget-<data>.md` na raiz.
