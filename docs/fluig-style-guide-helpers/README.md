# Exemplos de Uso — fluig-style-guide-helpers

Prompts prontos para acionar a skill `fluig-style-guide-helpers` com um agente de IA, em três níveis de complexidade.

## Simples

> Substitua o CSS customizado deste trecho por helpers e componentes do Fluig Style Guide.

## Intermediário

> Vou colar um markup com um botão recriado em CSS próprio. Troque-o pelo componente oficial do Style Guide (`btn btn-primary`) e use as classes helper `fs-*` no lugar dos estilos customizados.

## Completo

> Segue o arquivo de markup e CSS de um card com layout em medidas fixas, um modal reimplementado manualmente e cores hexadecimais fixas. Substitua o CSS próprio pelos componentes e classes do Style Guide, converta o layout para o grid responsivo (`.container`/`.row`/`.col-*`), troque o comportamento manual pelo helper `FLUIGC.modal`, aplique classes helper `fs-*` para espaçamento e tipografia e use `var(--fs-color-*)` no CSS remanescente. Garanta a classe `fluig-style-guide` na raiz e preserve o comportamento, usando apenas classes e variáveis documentadas no Style Guide.

## Drag-and-drop com jQuery UI (Kanban)

> Tenho uma widget de Kanban onde o arrastar-e-soltar dos cards entre colunas foi implementado do zero com listeners de `mousedown`/`mousemove`/`mouseup`. Substitua essa implementação pelo jQuery UI já embutido na plataforma (`.draggable()` nos cards e `.droppable()` nas colunas), preservando o comportamento de mover o card entre colunas.
