# Exemplos de Uso — fluig-scaffolding-layout

Prompts prontos para acionar a skill `fluig-scaffolding-layout` com um agente de IA, em três níveis de complexidade.

## Simples

> Crie um novo layout de página para o portal do Fluig.

## Intermediário

> Crie um layout de duas colunas para o portal, definindo as regiões/slots onde os widgets serão posicionados com o grid responsivo do Fluig Style Guide.

## Completo

> Crie o esqueleto de um layout de portal chamado `PortalTwoColumns` com a estrutura HTML rígida (imports `/wcm.ftl` e `/layout-globals.ftl`, hierarquia `wcm-wrapper-content` → `wcm-all-content` → `wcm-content` → `${divMasterId!""}` e os blocos condicionais de preview, header/menu e edição). Declare dois slots renderizados por `<@wcm.renderSlot ... />`, definindo o slot padrão em `layout.defaultSlot`, usando classes de grid como `layout-1-2left`/`layout-1-2right` para as regiões. Inclua o `responsive_layout.css` padrão, todos os textos visíveis via `${i18n.getTranslation('chave')}` com os arquivos `.properties` (base + `pt_BR`/`en_US`/`es`) e cores de tema via `var(--fs-color-*)`, sem hexadecimais fixos.
