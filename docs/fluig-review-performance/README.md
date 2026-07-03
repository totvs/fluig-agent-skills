# Exemplos de Uso — fluig-review-performance

Prompts prontos para acionar a skill `fluig-review-performance` com um agente de IA, em três níveis de complexidade.

## Simples

> Revise a performance deste trecho de código frontend Fluig e aponte os gargalos por severidade.

## Intermediário

> Vou colar o arquivo de um widget Fluig que apresenta lentidão ao renderizar uma lista grande. Faça uma revisão focada em performance, olhando manipulação de DOM em laço e eventos de alta frequência, e gere um relatório de achados por severidade sem reescrever o código.

## Completo

> Segue o arquivo de um Custom Element que trava no scroll e dispara muitas chamadas REST. O sintoma é travamento ao rolar a lista e atraso ao carregar os dados. Faça uma revisão de performance antes do merge avaliando manipulação de DOM em laço (uso de `DocumentFragment`), reflow/repaint, seletores não cacheados, listeners e eventos de alta frequência sem debounce/throttle, requisições redundantes via `FLUIGC.ajax`/`WCMAPI`, carga de dados sob demanda e liberação de recursos. Para cada gargalo, informe localização, severidade e a regra de contexto correspondente, ordene do mais grave ao menos grave e indique a skill `fluig-optimize-performance` para aplicar as correções. Apenas diagnostique, sem alterar o código.
