# Convenções de Código Fluig

> Fonte única de verdade do pacote para **convenções de código, i18n e segurança**
> na customização Fluig. As skills referenciam este arquivo em vez de duplicar seu
> conteúdo. Para componentes/grid/helpers do Style Guide e variáveis CSS de dark
> mode, veja [style-guide.md](style-guide.md). Para versões de tecnologias públicas,
> veja [technologies.md](technologies.md).

## Visão Geral

Este documento descreve **o que são** as convenções públicas e oficiais para
escrever código de customização Fluig (widgets, Custom Elements, FreeMarker e
estilos). O objetivo é gerar código correto, seguro, internacionalizado e
compatível com a plataforma. Aqui não há passo a passo de execução — isso é
responsabilidade das skills em `skills/`.

Princípio de idioma: **conteúdo em Português (Brasil)**; **identificadores de
código (variáveis, funções, classes, comentários) em Inglês**.

## JavaScript Moderno (ES6+)

Código novo de frontend deve usar **ES6+**. jQuery é aceitável apenas para
manutenção de código legado já escrito em jQuery — não misture paradigmas no
mesmo arquivo.

| Recurso | Recomendação para código novo |
|---------|-------------------------------|
| Declaração de variável | `const` por padrão; `let` quando há reatribuição; evitar `var` |
| Funções anônimas | Arrow functions (concisão e `this` léxico) |
| Concatenação de texto | Template literals |
| Assíncrono | `async/await` em vez de cadeias longas de `.then()` |
| Organização | Módulos ES6; funções pequenas com responsabilidade única |

## Nomenclatura

| Item | Regra | Exemplo |
|------|-------|---------|
| Nomes em geral | Descritivos, em Inglês; evitar abreviações obscuras | `calculateTotalPrice` |
| Booleanos | Prefixos `is` / `has` / `can` / `should` | `isActive`, `hasPermission` |
| Classe (Custom Element) | PascalCase com sufixo de tipo | `UserProfileComponent` |
| Métodos/propriedades | camelCase, orientados a ação | `getUserList()` |

## Convenções de Widget (`SuperWidget.extend`)

Regras críticas e específicas do padrão de widget:

| Regra | Diretriz |
|-------|----------|
| Classe raiz | O elemento raiz **deve** conter a classe `fluig-style-guide` (ativa os estilos/componentes do Style Guide no escopo do widget) |
| `instanceId` | Usar **exclusivamente** em atributos `id`, com separador `_` (underscore). Ex.: `id="MyWidget_${instanceId}"` |
| `instanceId` proibido em | Atributos `data-*` e `class` (devem ser estáticos) |
| `.instance()` | Chamar **sem** o `instanceId` — ele é injetado automaticamente pelo framework. Dentro do JS, use `this.instanceId` |
| Separador | Sempre `_`, nunca `-`, antes do `instanceId` |

Bindings declarativos associam eventos a métodos. A chave do binding é o valor do
atributo `data-*` **sem** o prefixo `data-` (o framework adiciona `data-`
automaticamente).

| Escopo | Propriedade | Quando usar |
|--------|-------------|-------------|
| Local | `bindings.local` | Elementos **dentro** da `div` raiz do widget |
| Global | `bindings.global` | Elementos **fora** do escopo (modais, dropdowns renderizados no `body`) |

```html
<!-- ✅ raiz com fluig-style-guide; instanceId só no id, com _ -->
<div id="MyWidget_${instanceId}" class="fluig-style-guide wcm-widget-class"
     data-params="MyWidget.instance({})">
  <button data-save-filter>...</button>
</div>
```

```javascript
// chave do binding sem o prefixo data-
bindings: { local: { 'save-filter': ['click_onSaveFilter'] } }
```

## Convenções de Custom Elements (Web Components)

| Item | Regra | Exemplo |
|------|-------|---------|
| Nome de arquivo | `[name].[category].js` em kebab-case | `user-profile.component.js` |
| Categorias | Sufixo por ponto: `component`, `service`, `api` | `user-auth.service.js` |
| Nome de classe | PascalCase com sufixo de tipo | `UserProfileComponent` |
| Tag | kebab-case, registrada via `customElements.define` | `user-profile` |
| Shadow DOM | **Não** utilizar (`attachShadow`/`shadowRoot`) | — |
| Escopo do arquivo | Fora da classe, **apenas** `import`; nada de `function`/`const`/`let`/`var` no topo | — |
| Membros privados | Prefixar com `#` quando sensíveis ao componente | `#userData` |

## Internacionalização (i18n)

Todo texto visível ao usuário **deve** vir de i18n — nunca usar strings fixas.
A tradução é resolvida server-side pelo FreeMarker antes de chegar ao navegador.

| Contexto | Sintaxe | Observação |
|----------|---------|------------|
| FreeMarker (`.ftl`) e `.js` de widget | `${i18n.getTranslation('key')}` | Padrão geral |
| Alternativa em `.js` | `[=i18n.getTranslation('key')]` | Comum em Web Components |
| Com 1 parâmetro | `${i18n.getTranslationP1('key', param)}` | — |
| Com N parâmetros | `${i18n.getTranslationPn('key', p1, p2)}` | — |

Regras:

- **Nunca** acessar `i18n` como objeto JavaScript (`i18n.key` ou `i18n['key']`) — não funciona.
- A string com a expressão precisa de aspas: `const t = "${i18n.getTranslation('key')}";`.
- **Cuidado com template literals:** dentro de backticks, `${...}` é interpretado pelo JavaScript, não pelo FreeMarker. Declare a tradução em uma variável separada e só então concatene: `const msg = \`${t}: ${name}\`;`.

## Segurança (APIs públicas)

Tratar toda entrada do usuário como não confiável e sanitizar antes de uso no DOM.

| Objetivo | API pública |
|----------|-------------|
| Converter HTML em texto puro (elimina XSS) | `WCMAPI.validateXSS(value)` |
| Manter HTML válido removendo código malicioso | `DOMPurify.sanitize(value)` |
| Bloquear qualquer HTML (retorna texto puro) | `DOMPurify.sanitize(value, { USE_PROFILES: { html: false } })` |

Boas práticas:

- Preferir `textContent` a `innerHTML`; quando precisar de HTML, sanitizar com `DOMPurify` antes.
- Em FreeMarker, escapar dados dinâmicos: `${value?html}` (e `${value?js_string}` para JS inline).
- Não usar `eval()` nem `new Function()` com dados dinâmicos.
- Sanitizar tanto ao enviar (POST/PUT) quanto ao receber (GET) dados do usuário.

## Chamadas REST internas

Para endpoints internos do Fluig, usar as APIs públicas de cliente — assim os
tokens de sessão são enviados automaticamente. **Não** usar `fetch()` ou
`$.ajax()` direto para endpoints internos.

| Cenário | Abordagem pública |
|---------|-------------------|
| Código novo (ES6+) | `FLUIGC.ajax` (pode ser encapsulado em `Promise`) |
| Código legado (jQuery/ES5) | `WCMAPI.Read` / `WCMAPI.Create` / `WCMAPI.Update` / `WCMAPI.Delete` |

## CSS

- **Reutilizar** classes e componentes do Fluig Style Guide antes de criar CSS próprio (ver [style-guide.md](style-guide.md)).
- **Escopar** o CSS à classe raiz do widget (ou à tag do Custom Element); evitar seletores por `id`, cadeias longas e `!important`.
- **Sem** `style` inline e **sem** blocos `<style>` em templates.
- **Sem** hexadecimais fixos para cores de tema — usar variáveis CSS que suportam dark mode. As regras de cores e variáveis (`var(--fs-color-*)`) são consolidadas em [style-guide.md](style-guide.md); não as duplique aqui.
- Evitar "números mágicos": usar CSS custom properties com nomes descritivos.

## Referências Cruzadas

- Para "como fazer" (gerar, modernizar e revisar código), ver as skills em `skills/`.
- Para componentes, helpers, grid e variáveis CSS de dark mode do Style Guide: [style-guide.md](style-guide.md) (fonte única de verdade dessas regras).
- Para versões de tecnologias públicas de customização (ES6+, libs client-side, runtime de datasets/eventos): [technologies.md](technologies.md).
