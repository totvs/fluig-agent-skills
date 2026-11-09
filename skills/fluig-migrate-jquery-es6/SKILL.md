---
name: fluig-migrate-jquery-es6
description: Migra e moderniza código jQuery para JavaScript ES6+ em customizações Fluig, preservando o comportamento, a internacionalização e a compatibilidade com a plataforma. Use quando o desenvolvedor pedir para converter/atualizar um trecho ou arquivo legado em jQuery para ES6+ (DOM nativo, eventos, REST via APIs públicas).
argument-hint: o código jQuery alvo a ser migrado (trecho ou arquivo selecionado)
---

# Migração de jQuery para ES6+

Esta skill converte código jQuery legado em ES6+ equivalente; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Passo 0 — Persona

Antes de modernizar, classifique a persona do desenvolvedor seguindo a cascata em
[persona-routing.md](../../context/persona-routing.md): conversa > marcador de
arquivo > marcador técnico de Store (`component.xml` ou API de slot) > estrutura
do projeto > pergunta. Se restar ambígua, pare e pergunte antes de
continuar. Emita `Persona: <Parceiro|Consultor> (motivo)` — esta skill aplica as
mesmas regras técnicas independentemente da persona (não há camada da Store
envolvida na migração jQuery → ES6+).

## Objetivo

Migrar, com responsabilidade única, **código jQuery de aplicação para ES6+**, substituindo cada uso de jQuery pelo equivalente nativo (ou pela API pública do Fluig) sem alterar o comportamento, a i18n nem a compatibilidade com a plataforma. **Não** se remove o jQuery exigido pelos **plugins embutidos** da plataforma (jQuery UI, Mustache, eventos `fluig.datatable.*` e demais helpers do Style Guide que expõem API jQuery): esse uso é legítimo e suportado — ver `fluig-style-guide-helpers` e `technologies.md`.

## Quando Usar

- Ao **modernizar um widget ou Custom Element** que ainda usa jQuery.
- Quando o desenvolvedor seleciona um trecho/arquivo jQuery e pede a versão ES6+.
- Antes de evoluir código legado, para padronizá-lo em ES6+ e remover dependência de jQuery em código novo.

> 🚫 **Escopo: só código client-side (navegador).** Esta skill é para JS de
> widget/Custom Element que roda no browser. **NÃO** aplique a eventos
> **server-side** de form/dataset/processo (`events/*.js`, `datasets/*.js`,
> eventos de workflow) — eles rodam no motor **Rhino (ES5)** e lá as mesmas
> "modernizações" **introduzem bugs**: `var`→`const`/arrow/template literal podem
> não ter suporte, e trocar `==` por `===` em valores vindos da API Java
> (`getFormMode`, `getValue`, `getIsEditMode`) deixa a comparação **sempre falsa**
> (os retornos são `java.lang.String`, não primitivos JS). Se o alvo for
> server-side, **pare e não migre**; nesse contexto o padrão correto é ES5 +
> `String(valor)` + `==` → ver `technologies.md` › "Princípio: valores vindos de
> API Java no Rhino" e `conventions-form.md` › "Eventos server-side".

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código jQuery alvo | Trecho ou arquivo legado a ser migrado | sim |
| Contexto do artefato | Tipo do artefato em que o código roda (widget `SuperWidget` ou Custom Element) | não |
| Chaves i18n | Chaves de tradução já usadas no código, a preservar | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — ES6+ (`const`/`let`, arrow functions, template literals), DOM nativo, REST via `fetch()`, bindings de widget, i18n e segurança.
- [technologies.md](../../context/technologies.md) — jQuery **3.7.1 é embutido e suportado** pela plataforma (não é "legado"); ES6+ é o padrão para **código novo de aplicação**, mas o jQuery dos **plugins embutidos** (jQuery UI, Mustache, `fluig.datatable.*`) permanece válido. Só o plugin **jQuery Migrate** está em descontinuação. Bibliotecas client-side disponíveis listadas aqui.
- [platform-constitution.md](../../context/platform-constitution.md) — regras invioláveis de i18n (`[=i18n.getTranslation(...)]` em `.js`, `${i18n.getTranslation(...)}` em `.ftl`) e HTTP (`fetch`).

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a migração; o detalhe está no contexto. Equivalências comuns jQuery → ES6+:

- `$(sel)` → `document.querySelector` / `document.querySelectorAll` → ver `conventions.md`.
- `.on('click', fn)` / `$.proxy` → `addEventListener` (ou bindings declarativos do widget quando aplicável) → ver `conventions.md`.
- `$.ajax()` → `fetch()` + `async/await` + `try/catch` para qualquer chamada; domínio do próprio Fluig só com API pública, URL via `WCMAPI.getServerURL()` → ver `platform-constitution.md`.
- `var` → `const` por padrão, `let` quando há reatribuição → ver `conventions.md`. **Exceção que permanece `var` (regra 3 da constituição):** apenas a **variável raiz** que recebe `SuperWidget.extend({...})` (ex.: `var MyWidget = SuperWidget.extend(...)`). **Não** converta essa para `const` → ver `platform-constitution.md` e `conventions.md`.
- **Dentro de `.extend({})` (regra 3):** manter métodos como `nome: function() {}` (nunca method shorthand nem arrow como método). **Remover** `var ctx = this;` / `var that = this;` (usar `this` direto no método) e **converter** os callbacks `function() {}` para Arrow Functions `() => {}` — a migração nunca ensina ES5 → ver `platform-constitution.md`.
- Concatenação de strings → template literals, **exceto** em `.js` **legado** que usa `${i18n...}` e é minificado pelo Closure Compiler: nesse caso **manter concatenação (`+`)**, não converter para template literal (a minificação conflita com template strings que contêm `${i18n...}`). Com `[=i18n...]` não há restrição: converta normalmente → ver `conventions.md` e `platform-constitution.md`.
- `.each()` → `for...of` ou `Array.prototype.forEach` → ver `conventions.md`.
- Preservar **comportamento** e **i18n**: manter a sintaxe já usada no arquivo (`[=i18n.getTranslation('chave')]` em `.js` novo, `${i18n.getTranslation('chave')}` em `.ftl` ou em `.js` legado), sem misturar as duas e sem trocá-la a menos que solicitado → ver `platform-constitution.md`.

## Procedimento

1. Ler o código alvo e mapear cada uso de jQuery (seletores, eventos, manipulação de DOM, chamadas REST, iterações).
2. Para cada uso, escolher o equivalente ES6+/Fluig conforme as equivalências acima e o `conventions.md`.
3. Substituir preservando o comportamento observável (mesma lógica, mesmos efeitos colaterais, mesma i18n).
4. Converter chamadas REST para `fetch()` + `async/await` + `try/catch`, com domínio do próprio Fluig via API pública e URL montada a partir de `WCMAPI.getServerURL()` — nunca `$.ajax` direto.
5. Validar que **nenhum novo uso de jQuery de aplicação** foi introduzido e que o código resultante está em ES6+ — **preservando** o uso legítimo dos plugins embutidos (jQuery UI, Mustache, `fluig.datatable.*`), que não devem ser removidos.
6. Conferir o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Código migrado para **ES6+ equivalente** ao original, sem regressões de comportamento nem de i18n, sem dependência de jQuery no código novo e com chamadas REST ao domínio do próprio Fluig via APIs públicas.

## Exemplo de Uso

Trecho ilustrativo (antes/depois), usando apenas APIs públicas:

```javascript
// Antes (jQuery)
var $list = $('#MyWidget_' + instanceId + ' .items');
$list.on('click', '.item', function () {
  $(this).addClass('active');
});
```

```javascript
// Depois (ES6+) — este trecho NÃO usa i18n, então o template literal é seguro.
// ⚠️ Se o arquivo for legado, usar `${i18n...}` e for minificado pelo Closure
// Compiler, prefira concatenação (`+`) a template literal ao montar textos com
// a tradução. Com `[=i18n...]` o template literal é liberado.
// Obs.: este é um listener de DOM comum (arrow é ok aqui). Dentro de
// SuperWidget.extend({}) os MÉTODOS continuam `nome: function() {}`, com `this` direto (sem `var ctx = this;`).
const list = document.querySelector('#MyWidget_' + this.instanceId + ' .items');
list.addEventListener('click', (event) => {
  const item = event.target.closest('.item');
  if (item) item.classList.add('active');
});
```

## Checklist de Validação

- [ ] O alvo é **client-side** (widget/Custom Element no navegador) — **não** é evento server-side de form/dataset/processo (Rhino/ES5). Se for server-side, a migração foi **interrompida** (ES6+/`===` quebrariam o Rhino) → ver `technologies.md`/`conventions-form.md`.
- [ ] Sem jQuery no código novo **de aplicação** (`$()`, `$.ajax`, `$.proxy`); **exceção:** uso legítimo dos **plugins embutidos** da plataforma que expõem API jQuery (jQuery UI, Mustache, eventos `fluig.datatable.*`) permanece válido — ver `fluig-style-guide-helpers` e `technologies.md`.
- [ ] `const`/`let` no código em geral, **exceto** a variável raiz do `SuperWidget.extend` (`var`) (regra 3 da constituição).
- [ ] Dentro de `.extend({})`: métodos como `nome: function() {}` (sem shorthand/arrow como método), `this` direto (sem `var ctx = this;`) e callbacks em Arrow Functions `() => {}`.
- [ ] Chamadas REST via `fetch()` + `async/await` + `try/catch`; domínio do próprio Fluig só com API pública via `WCMAPI.getServerURL()`.
- [ ] Comportamento original preservado (mesma lógica e efeitos).
- [ ] i18n preservada com a sintaxe do arquivo (`[=i18n.getTranslation('...')]` em `.js` novo; `${i18n.getTranslation('...')}` em `.ftl` ou `.js` legado), sem misturar as duas.
