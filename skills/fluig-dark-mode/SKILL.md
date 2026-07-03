---
name: fluig-dark-mode
description: Adapta CSS de customizações Fluig ao modo escuro (dark mode) substituindo cores fixas por variáveis CSS de tema no formato var(--fs-color-*), garantindo que o componente acompanhe a troca de tema automaticamente sem código adicional. Use quando o desenvolvedor pedir para dar suporte a dark mode, adaptar estilos ao tema ativo ou remover hexadecimais fixos de cores de um trecho/arquivo CSS.
argument-hint: o código/CSS alvo a adaptar ao dark mode (trecho ou arquivo com cores fixas)
---

# Adaptação ao Modo Escuro (Dark Mode)

Esta skill adapta o CSS de customizações Fluig ao dark mode usando variáveis de tema; ela **não duplica** os tokens de cor nem a **tabela de mapeamento de cores** (uso comum → `var(--fs-color-*)` e hexadecimal → `var(--fs-color-*)`) — o arquivo de `context/` é a fonte de verdade, referenciada abaixo.

## Objetivo

Adaptar, com responsabilidade única, o **CSS de uma customização ao modo escuro**, substituindo cores fixas (hexadecimais, `rgb()`, nomes de cor) por **variáveis CSS de tema no formato `var(--fs-color-*)`**, para que o componente acompanhe a troca de tema (claro/escuro) automaticamente, sem alterar o comportamento nem o layout.

## Quando Usar

- Quando um widget/Custom Element usa **hexadecimais fixos** (`#fff`, `#202020`) para cores de tema.
- Quando o componente **não acompanha** a troca de tema e fica ilegível no modo escuro.
- Antes de publicar uma customização que precisa **dar suporte a dark mode**.
- Ao revisar CSS próprio e detectar cores que deveriam vir do tema (texto, fundo, borda, sombra).

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código/CSS alvo | Trecho ou arquivo CSS com cores a adaptar ao tema | sim |
| Contexto do componente | Tipo/função do elemento (cabeçalho, card, botão, texto) para escolher a família de token adequada | não |
| Tokens já em uso | Variáveis `var(--fs-color-*)` já adotadas no componente, a manter consistentes | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [style-guide.md](../../context/style-guide.md) — seção **Theming e dark mode (variáveis CSS)**: regra obrigatória de usar `var(--fs-color-*)`, proibição de hexadecimais fixos e de variáveis SCSS para cores de tema, tabelas completas de todas as famílias de tokens (marca, ação, neutros, feedback com tons `lightest`→`darkest`, sombras `--fs-shadow-*`) e a **tabela de mapeamento de cores** (uso comum → `var(--fs-color-*)` e hexadecimal → `var(--fs-color-*)`) usada para converter cores fixas.
- Referência completa das **variáveis CSS**: `references/helpers-and-variables-css/css-variables.md`.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a tarefa; o detalhe e o catálogo de tokens estão no contexto:

- Para **qualquer cor de tema**, usar variáveis CSS no formato `var(--fs-color-*)` → ver `style-guide.md`.
- ⚠️ **Proibido inventar variáveis CSS.** Usar **somente** as variáveis documentadas em `references/helpers-and-variables-css/css-variables.md`. Se uma variável não estiver nessa referência, ela não existe no Style Guide — nesse caso, use um valor CSS convencional ou CSS próprio escopado.
- **Hexadecimais fixos e variáveis SCSS (`$...`) para cores de tema são proibidos** — não acompanham a troca de tema e quebram o dark mode → ver `style-guide.md`.
- Ao converter cores fixas, consultar a **tabela de mapeamento de cores** (uso comum → variável e hexadecimal → variável) que vive em `style-guide.md` → ver `style-guide.md`.
- Escolher a **família de token** conforme o papel da cor: marca (`--fs-color-brand-*`), ação (`--fs-color-action-*`), neutros (`--fs-color-neutral-*`), feedback (`--fs-color-positive/negative/warning/info-*`) → ver `style-guide.md`.
- Usar tokens de **sombra** (`--fs-shadow-*`) e **tipografia** (`--fs-font-*`) em vez de valores fixos, quando aplicável → ver `style-guide.md`.
- **Reutilizar componentes/classes do Style Guide** já adaptados ao tema, em vez de recriar estilos → ver `style-guide.md`.
- **Preservar** o layout e o comportamento: trocar apenas a origem da cor, não a estrutura.

## Procedimento

1. Ler o CSS alvo e listar todas as cores fixas usadas (hexadecimais, `rgb()`, nomes de cor) e sombras com valores fixos.
2. Classificar cada cor pelo seu papel (texto, fundo, borda, ação, feedback) para escolher a família de token correta.
3. Substituir cada cor fixa pela variável `var(--fs-color-*)` correspondente, consultando a **tabela de mapeamento de cores** (uso comum → variável e hexadecimal → variável) em `style-guide.md`.
4. Trocar sombras fixas por tokens `--fs-shadow-*` e, quando houver, fonte/cor de texto por tokens `--fs-font-*`.
5. Verificar que **nenhum hexadecimal fixo de cor de tema** permaneceu e que o layout não mudou.
6. Conferir o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

CSS adaptado ao dark mode, com todas as cores de tema expressas como `var(--fs-color-*)` (e sombras/tipografia via tokens quando aplicável), sem hexadecimais fixos de tema, com layout e comportamento preservados e adaptação automática à troca de tema. Em conformidade com `context/style-guide.md`.

## Exemplo de Uso

Antes (cores fixas — não acompanham o tema, quebram no dark mode):

```css
/* ❌ hexadecimal fixo: ilegível ao trocar para o modo escuro */
.my-widget__header {
  color: #202020;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}
```

Depois (variáveis de tema — adaptam-se automaticamente):

```css
/* ✅ usa var(--fs-color-*) e token de sombra: adapta a dark mode sem código extra */
.my-widget__header {
  color: var(--fs-color-neutral-dark-90);
  background-color: var(--fs-color-neutral-light-00);
  box-shadow: var(--fs-shadow-sm);
}
```

## Checklist de Validação

- [ ] Toda cor de tema usa `var(--fs-color-*)`; nenhum hexadecimal fixo de tema permaneceu.
- [ ] A família de token escolhida corresponde ao papel da cor (marca/ação/neutros/feedback).
- [ ] Sombras usam `--fs-shadow-*` e tipografia usa `--fs-font-*` quando aplicável.
- [ ] Layout e comportamento preservados (somente a origem da cor mudou).
- [ ] Tokens consistentes com os já adotados no componente e com `style-guide.md`.
