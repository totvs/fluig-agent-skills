# Checklist de Validação de Widget e Código Frontend Fluig

> Asset da skill `fluig-code-review`. Checklist completo, organizado por categoria, para
> revisar e **validar widgets** e demais código frontend de customização Fluig. A
> fonte de verdade das regras está em `../../../context/conventions.md` e
> `../../../context/style-guide.md` (a skill `SKILL.md` referencia o contexto por
> `../../context/...`; este asset, por estar em `assets/`, usa `../../../context/...`).
> Aqui ficam apenas os **itens verificáveis no código de customização externo** —
> backend Java, CI interno e estrutura de módulos do monorepo estão fora de escopo.
> Cada grupo aponta a **regra-fonte completa** no contexto; para cada item marcado
> como desvio, registre um achado com severidade e a regra de contexto correspondente.

## 1. JavaScript Moderno (ES6+)

> Regra-fonte: [`../../../context/conventions.md`](../../../context/conventions.md) › "JavaScript Moderno (ES6+)".

- [ ] Usa `const` por padrão e `let` apenas quando há reatribuição; **não** usa `var`.
- [ ] Usa arrow functions para funções anônimas (concisão e `this` léxico).
- [ ] Usa template literals em vez de concatenação com `+`.
- [ ] Trata assíncrono com `async/await` em `try/catch`, não cadeias longas de `.then()`.
- [ ] Funções pequenas, com responsabilidade única; organização em módulos ES6.
- [ ] **Não** mistura jQuery e ES6+ no mesmo arquivo (jQuery só em manutenção de legado); **não** usa `$()` em código novo.

## 2. Nomenclatura

> Regra-fonte: [`../../../context/conventions.md`](../../../context/conventions.md) › "Nomenclatura".

- [ ] Nomes descritivos em Inglês; sem abreviações obscuras.
- [ ] Booleanos com prefixo `is`/`has`/`can`/`should`.
- [ ] Classes de Custom Element em PascalCase com sufixo de tipo.
- [ ] Métodos/propriedades em camelCase, orientados a ação.
- [ ] Conteúdo (textos/comentários ao usuário) em Português; identificadores em Inglês.

## 3. Convenções de Widget (`SuperWidget.extend`)

> Regra-fonte: [`../../../context/conventions.md`](../../../context/conventions.md) › "Convenções de Widget (`SuperWidget.extend`)".

- [ ] Elemento raiz contém a classe `fluig-style-guide`.
- [ ] `instanceId` usado **exclusivamente** em atributos `id`, com separador `_` (ex.: `MyWidget_${instanceId}`).
- [ ] `instanceId` **não** aparece em atributos `class` nem `data-*`.
- [ ] `.instance()` é chamado **sem** `instanceId` (injetado pelo framework); no JS usa `this.instanceId`.
- [ ] Separador antes do `instanceId` é sempre `_`, nunca `-`.
- [ ] Chave de binding é o valor do `data-*` **sem** o prefixo `data-` (o framework adiciona `data-`).
- [ ] `bindings.local` para elementos dentro da raiz; `bindings.global` para elementos fora (modais/dropdowns no `body`).

## 4. Convenções de Custom Elements (Web Components)

> Regra-fonte: [`../../../context/conventions.md`](../../../context/conventions.md) › "Convenções de Custom Elements (Web Components)".

- [ ] Nome de arquivo `[name].[category].js` em kebab-case (ex.: `user-profile.component.js`).
- [ ] Categoria por sufixo: `component`, `service`, `api`.
- [ ] Nome de classe PascalCase com sufixo de tipo; tag em kebab-case via `customElements.define`.
- [ ] **Não** usa Shadow DOM (`attachShadow`/`shadowRoot`).
- [ ] Topo do arquivo contém **apenas** `import` — sem `function`/`const`/`let`/`var` no escopo do módulo.
- [ ] Membros privados sensíveis prefixados com `#`.

## 5. Internacionalização (i18n)

> Regra-fonte: [`../../../context/conventions.md`](../../../context/conventions.md) › "Internacionalização (i18n)".

- [ ] Todo texto visível ao usuário vem de i18n (`${i18n.getTranslation('key')}`); sem strings fixas.
- [ ] **Não** acessa `i18n` como objeto JavaScript (`i18n.key` / `i18n['key']`).
- [ ] A expressão de i18n está entre aspas quando atribuída a variável.
- [ ] Em template literals, a tradução é declarada em variável separada antes de concatenar (evita conflito entre `${...}` do JS e do FreeMarker).
- [ ] Usa `getTranslationP1`/`getTranslationPn` quando há parâmetros.

## 6. Segurança

> Regra-fonte: [`../../../context/conventions.md`](../../../context/conventions.md) › "Segurança (APIs públicas)".

- [ ] Toda entrada do usuário é tratada como não confiável antes de uso no DOM ou persistência.
- [ ] HTML derivado de input é sanitizado com `DOMPurify.sanitize` antes de inserir.
- [ ] Usa `WCMAPI.validateXSS` quando o objetivo é reduzir o valor a texto puro.
- [ ] Prefere `textContent` a `innerHTML`; não há `innerHTML` inseguro.
- [ ] **Não** usa `eval()` nem `new Function()` com dados dinâmicos.
- [ ] Dados dinâmicos escapados em FreeMarker (`${value?html}`, `${value?js_string}` em JS inline).
- [ ] Sanitização aplicada tanto na entrada (POST/PUT) quanto na exibição (GET).

## 7. Chamadas REST internas

> Regra-fonte: [`../../../context/conventions.md`](../../../context/conventions.md) › "Chamadas REST internas".

- [ ] Endpoints internos chamados via `FLUIGC.ajax` (código novo) ou `WCMAPI.Read/Create/Update/Delete` (legado).
- [ ] **Não** usa `fetch()` nem `$.ajax()` direto para endpoints internos.
- [ ] Erros de rede tratados (ex.: `try/catch` com `async/await`).

## 8. CSS e Style Guide

> Regra-fonte: [`../../../context/conventions.md`](../../../context/conventions.md) › "CSS" e
> [`../../../context/style-guide.md`](../../../context/style-guide.md) › "Classes helper `fs-*`" e "Theming e dark mode (variáveis CSS)".

- [ ] Reutiliza classes/componentes do Fluig Style Guide antes de criar CSS próprio.
- [ ] CSS escopado à classe raiz do widget (ou à tag do Custom Element); evita seletores por `id`, cadeias longas e `!important`.
- [ ] **Sem** `style` inline e **sem** blocos `<style>` em templates.
- [ ] **Sem** hexadecimais fixos para cores de tema — usa `var(--fs-color-*)` (suporte a dark mode).
- [ ] Evita "números mágicos"; usa custom properties com nomes descritivos.
- [ ] Usa o grid do Style Guide (Bootstrap 3.4.1) em vez de medidas fixas.

## 9. Acessibilidade

> Regra-fonte: [`../../../context/conventions.md`](../../../context/conventions.md) e
> [`../../../context/style-guide.md`](../../../context/style-guide.md) (HTML semântico, nome acessível, contraste via `var(--fs-color-*)`).

- [ ] HTML semântico (`header`, `nav`, `main`, `button`, `label`) em vez de `div`/`span` genéricos.
- [ ] Campos com rótulo associado (`label`/`for`) ou nome acessível (`aria-label`), com texto via i18n.
- [ ] Navegável por teclado, ordem de tabulação lógica e foco visível/gerenciado (modais).
- [ ] Texto alternativo em imagens/ícones informativos; decorativos com `aria-hidden`.
- [ ] ARIA usado apenas quando a semântica nativa não basta.
- [ ] Contraste adequado via `var(--fs-color-*)`.

## 10. Performance

> Regra-fonte: [`../../../context/conventions.md`](../../../context/conventions.md) (manipulação de DOM, eventos de alta frequência, carga sob demanda).

- [ ] Alterações de DOM agrupadas (ex.: `DocumentFragment`); sem inserções repetidas em laço.
- [ ] Referências de elementos cacheadas; sem seletores redundantes.
- [ ] Eventos de alta frequência (scroll/resize/input) com debounce/throttle e/ou delegação.
- [ ] Dados carregados sob demanda (paginação/lazy load).
- [ ] Listeners/timers liberados ao destruir o widget (sem vazamento).
