# Exemplos de Uso — fluig-review-accessibility

Prompts prontos para acionar a skill `fluig-review-accessibility` com um agente de IA, em três níveis de complexidade.

## Simples

> Revise a acessibilidade deste trecho de markup Fluig e aponte as barreiras por severidade.

## Intermediário

> Vou colar o markup de um componente Fluig usado em um formulário. Faça uma revisão de acessibilidade alinhada às WCAG, com foco em rótulos associados e nome acessível de botões, e gere um relatório de achados por severidade sem reescrever o código.

## Completo

> Segue o markup de um widget Fluig que abre como modal, com botões só de ícone e campos de formulário. Faça uma revisão de acessibilidade antes do merge alinhada às WCAG avaliando HTML semântico, rótulos e nome acessível (`label`/`for`, `aria-label` com texto via `i18n.getTranslation`), navegação por teclado e foco visível no modal, uso de ARIA apenas quando necessário, texto alternativo em ícones informativos (`aria-hidden` nos decorativos), contraste via `var(--fs-color-*)` e comunicação de estados. Para cada barreira, informe localização, severidade e a regra de contexto correspondente, ordene do mais grave ao menos grave, considere que a conformidade WCAG completa exige teste manual com tecnologias assistivas e revisão por especialista, e aponte a skill `fluig-improve-accessibility`. Apenas diagnostique, sem alterar o código.
