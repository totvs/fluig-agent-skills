# Exemplo: Layout (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos
- `layout.ftl` — view FreeMarker do layout: importa os utilitários públicos de layout (`<#import "/wcm.ftl" as wcm/>`), define o wrapper raiz com `fluig-style-guide`, usa as macros públicas de portal (`@wcm.header`, `@wcm.menu`, `@wcm.footer`) e declara **slots nomeados** (`SlotA`, `SlotB`) renderizados pela macro pública `@wcm.renderSlot`, com texto visível via i18n.
- `application.info` — descritor do layout com os campos completos (`application.type=layout`, `application.renderer=freemarker`, `layout.file`, `layout.defaultSlot`, `application.responsiveLayout`, `application.newBuilder`, `application.icon`, base de i18n e dados do desenvolvedor).

## Pontos-chave demonstrados
- **Import obrigatório** dos utilitários de layout: `<#import "/wcm.ftl" as wcm/>`.
- Wrapper raiz com a classe `fluig-style-guide` (ativa os estilos/componentes do Style Guide) e a estrutura padrão (`wcm-wrapper-content` → `wcm-all-content` → `wcm-content`).
- **Slots nomeados** (`SlotA`, `SlotB`) renderizados pela macro pública `@wcm.renderSlot id="..."` — é assim que a plataforma encaixa widgets nas regiões; o slot padrão (`SlotA`) deve casar com `layout.defaultSlot` no `application.info`.
- Cada região é um contêiner identificável (ex.: `id="slotFull1"`, classe `editable-slot slotfull layout-1-1`).
- Descritor `application.info` com os campos completos do layout — `application.code` **igual** a `locale.file.base.name`, `layout.defaultSlot=SlotA` (casa com o slot da `layout.ftl`), `application.responsiveLayout=true` e `application.newBuilder=true`.
- Macros públicas de portal para cabeçalho, menu e rodapé (`@wcm.header`, `@wcm.menu`, `@wcm.footer`).
- Verificações de modo de página (`pageRender.isEditMode()` / `isPreviewMode()`) para o comportamento durante a montagem da página.
- Texto visível via i18n — sem strings fixas.

> Fonte de verdade: `context/architecture.md` (modelo do Layout WCM, import de `wcm.ftl`, `@wcm.renderSlot` e slots nomeados) e `context/style-guide.md` (escopo `fluig-style-guide` e grid).
