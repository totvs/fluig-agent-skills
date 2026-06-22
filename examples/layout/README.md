# Exemplo: Layout (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos
- `layout.ftl` — view FreeMarker do layout: reproduz a **estrutura HTML rígida** de um layout de portal (imports `<#import "/wcm.ftl" as wcm/>` e `<#import "/layout-globals.ftl" as globals />`, bloco de preview, wrapper `wcm-wrapper-content` → `wcm-all-content` → `wcm-content` → `${divMasterId}`, blocos condicionais de edição e footer) e declara **slots nomeados** (`SlotA`, `SlotB`) renderizados pela macro pública `@wcm.renderSlot`.
- `responsive_layout.css` — CSS padrão de responsividade das regiões/slots, criado junto com todo layout. Empilha as colunas em telas estreitas, em edição (`#edicaoPagina`, via container query) e visualização (`#visualizacaoPagina`, via media query), com fallback `.not-supports-container-queries`. Declarado no descritor via `application.resource.css.N`.
- `application.info` — descritor do layout com os campos completos (`application.type=layout`, `application.renderer=freemarker`, `layout.file`, `layout.defaultSlot`, `application.responsiveLayout`, `application.newBuilder`, `application.icon`, os dois recursos CSS — `application.resource.css.1` para a folha global do Fluig e `application.resource.css.2` para o `responsive_layout.css` do layout —, base de i18n e dados do desenvolvedor).

## Pontos-chave demonstrados
- **Imports obrigatórios** no topo: `<#import "/wcm.ftl" as wcm/>` e `<#import "/layout-globals.ftl" as globals />`.
- **Estrutura HTML rígida**: wrapper raiz `wcm-wrapper-content` (com `${wcmLayoutEditClass!""}`/`${pageAuthTypeClass!""}`) → `wcm-all-content` → `wcm-content` → `${divMasterId!""}`. O wrapper e as classes estruturais **não** mudam; a liberdade está nos slots internos. Em layout de portal **não** se usa `fluig-style-guide` no wrapper raiz.
- **Blocos condicionais fixos**: preview (`pageRender.isPreviewMode()`), cabeçalho/menu fora da edição (`pageRender.isEditMode() != true` → `@wcm.header`/`@wcm.menu`), controles do construtor na edição (`@wcm.editHeader`/`@wcm.widgetsList`) e footer fora do tema responsivo (`fluigThemeCode != "responsive_theme"` → `@wcm.footer`).
- **Slots nomeados** (`SlotA`, `SlotB`) renderizados por `@wcm.renderSlot id="..."` dentro de `${divMasterId}` — é assim que a plataforma encaixa widgets nas regiões; o slot padrão (`SlotA`) deve casar com `layout.defaultSlot` no `application.info`.
- Cada região é um contêiner `editable-slot slotfull <grid>` (ex.: `id="slotFull1"`, classe `layout-1-1`); o grid varia com `layout-1-1`, `layout-1-2left`/`right`, `layout-1-3`.
- Descritor `application.info` com os campos completos do layout — `application.code` **igual** a `locale.file.base.name`, `layout.defaultSlot=SlotA` (casa com o slot da `layout.ftl`), `application.responsiveLayout=true` e `application.newBuilder=true`.
- **`responsive_layout.css` padrão** em `webapp/resources/css/`, declarado via `application.resource.css.2` — garante a responsividade das regiões/slots; o `application.resource.css.1` aponta para a folha global do Fluig (`/portal/resources/css/wcm_responsive_layout.css`).
- Texto visível via i18n — sem strings fixas.

> Fonte de verdade: `context/architecture.md` (modelo do Layout WCM, estrutura HTML rígida da `layout.ftl`, `@wcm.renderSlot` e slots nomeados) e `context/style-guide.md` (grid e variáveis de tema).
