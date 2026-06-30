# Exemplos de Uso — improve-accessibility

Prompts prontos para acionar a skill `improve-accessibility` com um agente de IA, em três níveis de complexidade.

## Simples

> Melhore a acessibilidade deste trecho de markup.

## Intermediário

> Vou colar o markup de um componente com botões só de ícone e campos sem rótulo. Torne-o acessível adicionando nomes acessíveis e `label` associados, com os textos vindos de `${i18n.getTranslation('chave')}`.

## Completo

> Segue o arquivo `.ftl` de um modal deste widget para você tornar acessível seguindo as WCAG: substitua os `div`/`span` genéricos por HTML semântico, associe rótulos aos campos, garanta navegação por teclado com foco visível e gerenciado no diálogo, adicione `aria-label`/`alt` e estados como `aria-expanded` onde necessário, e ajuste o contraste usando `var(--fs-color-*)` em vez de hexadecimais fixos. Mantenha todos os textos acessíveis via i18n e preserve o comportamento.
