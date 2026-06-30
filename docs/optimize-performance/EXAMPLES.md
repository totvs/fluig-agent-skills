# Exemplos de Uso — optimize-performance

Prompts prontos para acionar a skill `optimize-performance` com um agente de IA, em três níveis de complexidade.

## Simples

> Otimize a performance deste trecho de código frontend.

## Intermediário

> Este widget está travando ao renderizar uma lista grande. Vou colar o código que insere os itens no DOM dentro de um laço para você otimizar agrupando as alterações de DOM.

## Completo

> Segue o arquivo de um Custom Element que está lento: ele faz muitas requisições, tem vários listeners no evento de scroll e reconsulta o DOM a cada iteração. Otimize aplicando `DocumentFragment` para agrupar escritas de DOM, delegação de eventos e debounce no scroll, carregamento de dados sob demanda com `async/await` em `try/catch`, e mantenha as chamadas REST internas via `FLUIGC.ajax`. Preserve o comportamento observável e a i18n.
