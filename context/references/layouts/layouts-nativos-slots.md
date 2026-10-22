# Catálogo de Layouts Nativos do Fluig

> **Referência oficial** dos layouts que vêm pré-instalados na plataforma Fluig.
> Use este catálogo para saber quais slots estão disponíveis ao configurar páginas
> em `pages.xml` sem precisar criar um layout customizado.

---

## Como Usar no pages.xml

O elemento `<layout>` dentro de uma `<page>` referencia o **code** do layout
nativo. Os slots disponíveis são declarados com `<slot><name>...</name></slot>`:

```xml
<page>
    <code>minha-pagina</code>
    <title>Minha Página</title>
    <layout>default</layout>
    <slot>
        <name>SlotA</name>
        <!-- widgets posicionados neste slot -->
    </slot>
    <slot>
        <name>SlotB</name>
        <!-- widgets posicionados neste slot -->
    </slot>
</page>
```

> Os nomes dos slots (`SlotA`, `SlotB`, etc.) devem corresponder **exatamente**
> aos nomes definidos pelo layout. Nomes incorretos resultam em widgets que não
> aparecem na interface.

---

## Layouts Nativos Disponíveis

### 1. default

| Propriedade | Valor |
|-------------|-------|
| **Code** | `default` |
| **Descrição** | Layout padrão com 2 colunas (3/4 à esquerda + 1/4 à direita). É o layout mais utilizado em páginas autenticadas do Fluig. |

| Slot | CSS Classes |
|------|-------------|
| `SlotA` | `layout-2-3left` |
| `SlotB` | `all-slots-right layout-1-3right` |

---

### 2. defaultpublic

| Propriedade | Valor |
|-------------|-------|
| **Code** | `defaultpublic` |
| **Descrição** | Layout para páginas públicas (sem autenticação). Mesma distribuição de colunas do `default`, mas renderizado no contexto de acesso público. |

| Slot | CSS Classes |
|------|-------------|
| `SlotA` | `layout-2-3left` |
| `SlotB` | `all-slots-right layout-1-3right` |

---

### 3. simple

| Propriedade | Valor |
|-------------|-------|
| **Code** | `simple` |
| **Descrição** | Layout simples de coluna única (largura total). Ideal para páginas com conteúdo que ocupa toda a largura disponível. |

| Slot | CSS Classes |
|------|-------------|
| `SlotA` | `slotfull layout-1-1` |

---

### 4. arsocial

| Propriedade | Valor |
|-------------|-------|
| **Code** | `arsocial` |
| **Descrição** | Layout social com sidebar à direita. Usado em páginas com timeline/feed social e coluna lateral para informações complementares. |

| Slot | CSS Classes |
|------|-------------|
| `SlotA` | `layout-2-3left` |
| `SlotB` | `all-slots-right layout-1-3right` |

---

### 5. fixedslot

| Propriedade | Valor |
|-------------|-------|
| **Code** | `fixedslot` |
| **Descrição** | Layout com slot fixo (sticky) à direita. O SlotB permanece visível durante o scroll da página, útil para navegação ou resumos persistentes. |

| Slot | CSS Classes |
|------|-------------|
| `SlotA` | `layout-2-3left` |
| `SlotB` | `fixed-slot layout-1-3right` |

---

### 6. fullcontent

| Propriedade | Valor |
|-------------|-------|
| **Code** | `fullcontent` |
| **Descrição** | Layout de conteúdo completo (largura total). Similar ao `simple`, voltado para páginas onde o conteúdo principal deve ocupar 100% da largura sem barras laterais. |

| Slot | CSS Classes |
|------|-------------|
| `SlotA` | `slotfull layout-1-1` |

---

### 7. tabs

| Propriedade | Valor |
|-------------|-------|
| **Code** | `tabs` |
| **Descrição** | Layout com interface de abas (tabs). O SlotA é renderizado dentro de um container de abas, permitindo organização de widgets em diferentes tabs. |

| Slot | CSS Classes |
|------|-------------|
| `SlotA` | `slotfull layout-1-1` |

> **Nota:** os widgets posicionados neste slot são organizados em abas pela
> plataforma. Cada widget se torna uma aba individual.

---

### 8. clean

| Propriedade | Valor |
|-------------|-------|
| **Code** | `clean` |
| **Descrição** | Layout limpo sem decoração. Não inclui molduras, bordas ou espaçamentos extras da plataforma. Usado para páginas que precisam de controle total sobre a apresentação visual. |

| Slot | CSS Classes |
|------|-------------|
| `SlotA` | `slotfull layout-1-1` |

---

## Tabela Resumo

| Layout | Slots | Distribuição |
|--------|-------|--------------|
| `default` | SlotA, SlotB | 2/3 + 1/3 |
| `defaultpublic` | SlotA, SlotB | 2/3 + 1/3 |
| `simple` | SlotA | Coluna única (100%) |
| `arsocial` | SlotA, SlotB | 2/3 + 1/3 |
| `fixedslot` | SlotA, SlotB | 2/3 + 1/3 (direita fixa) |
| `fullcontent` | SlotA | Coluna única (100%) |
| `tabs` | SlotA | Coluna única com interface de abas |
| `clean` | SlotA | Coluna única sem decoração |

---

## CSS Classes de Grid

| Classe | Significado |
|--------|-------------|
| `layout-2-3left` | Coluna à esquerda ocupando 2/3 da largura |
| `layout-1-3right` | Coluna à direita ocupando 1/3 da largura |
| `all-slots-right` | Agrupador de slots posicionados à direita |
| `fixed-slot` | Slot com posição fixa (sticky) durante scroll |
| `slotfull` | Slot de largura total |
| `layout-1-1` | Coluna única (100% da largura) |

---

## Layouts Customizados e Remapeamento de Slots

Quando um parceiro cria um **layout customizado** (módulo `layout` no projeto
Maven), esse layout substitui os nativos listados acima. Ao referenciá-lo em
`pages.xml`, os nomes de slots devem corresponder aos declarados no layout
customizado — **não** aos slots nativos.

### Impacto no pages.xml

Se o `pages.xml` usava um layout nativo com slots `SlotA` e `SlotB`, e o parceiro
substitui por um layout customizado com slots `SlotHeader`, `SlotContent` e
`SlotSidebar`, os nomes no `pages.xml` **devem ser atualizados** para os novos
nomes:

```xml
<!-- ANTES (layout nativo "default") -->
<layout>default</layout>
<slot><name>SlotA</name></slot>
<slot><name>SlotB</name></slot>

<!-- DEPOIS (layout customizado "meulayout") -->
<layout>meulayout</layout>
<slot><name>SlotHeader</name></slot>
<slot><name>SlotContent</name></slot>
<slot><name>SlotSidebar</name></slot>
```

### Procedimento de Remapeamento

1. Identificar os slots do layout antigo usados nas páginas do `pages.xml`
2. Identificar os slots do novo layout (declarados na `layout.ftl` e no
   `application.info` com `slot.{Nome}={Nome}`)
3. Validar correspondência entre slots antigos e novos
4. Se houver divergência, propor mapeamento ao parceiro antes de aplicar
5. Atualizar `pages.xml` somente após confirmação

> ⚠️ **Anti-pattern:** aplicar layout customizado sem validar slots — resulta em
> widgets "perdidos" que não aparecem na interface.

Para detalhes completos sobre o procedimento de remapeamento, consulte
[architecture.md](../../architecture.md) — [Remapeamento de slots](../../architecture.md#remapeamento-de-slots)
(Remapeamento de Slots).
