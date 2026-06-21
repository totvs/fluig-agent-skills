---
name: migrate-jquery-es6
description: Migra e moderniza código jQuery para JavaScript ES6+ em customizações Fluig, preservando o comportamento, a internacionalização e a compatibilidade com a plataforma. Use quando o desenvolvedor pedir para converter/atualizar um trecho ou arquivo legado em jQuery para ES6+ (DOM nativo, eventos, REST via APIs públicas).
argument-hint: o código jQuery alvo a ser migrado (trecho ou arquivo selecionado)
---

# Migração de jQuery para ES6+

Esta skill converte código jQuery legado em ES6+ equivalente; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Objetivo

Migrar, com responsabilidade única, **código jQuery para ES6+**, substituindo cada uso de jQuery pelo equivalente nativo (ou pela API pública do Fluig) sem alterar o comportamento, a i18n nem a compatibilidade com a plataforma.

## Quando Usar

- Ao **modernizar um widget ou Custom Element** que ainda usa jQuery.
- Quando o desenvolvedor seleciona um trecho/arquivo jQuery e pede a versão ES6+.
- Antes de evoluir código legado, para padronizá-lo em ES6+ e remover dependência de jQuery em código novo.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Código jQuery alvo | Trecho ou arquivo legado a ser migrado | sim |
| Contexto do artefato | Tipo do artefato em que o código roda (widget `SuperWidget` ou Custom Element) | não |
| Chaves i18n | Chaves de tradução já usadas no código, a preservar | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [conventions.md](../../context/conventions.md) — ES6+ (`const`/`let`, arrow functions, template literals), DOM nativo, REST via `WCMAPI`/`FLUIGC`, bindings de widget, i18n e segurança.
- [technologies.md](../../context/technologies.md) — jQuery (3.7.1) é **legado**; ES6+ é o padrão para código novo; bibliotecas client-side disponíveis.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a migração; o detalhe está no contexto. Equivalências comuns jQuery → ES6+:

- `$(sel)` → `document.querySelector` / `document.querySelectorAll` → ver `conventions.md`.
- `.on('click', fn)` / `$.proxy` → `addEventListener` (ou bindings declarativos do widget quando aplicável) → ver `conventions.md`.
- `$.ajax()` / `fetch()` para endpoints internos → `WCMAPI.*` (legado) ou `FLUIGC.ajax` (novo); nunca `$.ajax`/`fetch` direto a endpoints internos → ver `conventions.md`.
- `var` → `const` por padrão, `let` quando há reatribuição → ver `conventions.md`.
- Concatenação de strings → template literals (cuidado com `${...}` vs i18n) → ver `conventions.md`.
- `.each()` → `for...of` ou `Array.prototype.forEach` → ver `conventions.md`.
- Preservar **comportamento** e **i18n** (`${i18n.getTranslation('chave')}`) → ver `conventions.md`.

## Procedimento

1. Ler o código alvo e mapear cada uso de jQuery (seletores, eventos, manipulação de DOM, chamadas REST, iterações).
2. Para cada uso, escolher o equivalente ES6+/Fluig conforme as equivalências acima e o `conventions.md`.
3. Substituir preservando o comportamento observável (mesma lógica, mesmos efeitos colaterais, mesma i18n).
4. Manter as chamadas REST a endpoints internos via `WCMAPI`/`FLUIGC.ajax` — não introduzir `fetch`/`$.ajax` diretos.
5. Validar que **nenhum novo uso de jQuery** foi introduzido e que o código resultante está em ES6+.
6. Conferir o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Código migrado para **ES6+ equivalente** ao original, sem regressões de comportamento nem de i18n, sem dependência de jQuery no código novo e com chamadas REST internas via APIs públicas do Fluig.

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
// Depois (ES6+)
const list = document.querySelector(`#MyWidget_${this.instanceId} .items`);
list.addEventListener('click', (event) => {
  const item = event.target.closest('.item');
  if (item) item.classList.add('active');
});
```

## Checklist de Validação

- [ ] Sem `$()`, `$.ajax`, `$.proxy` ou outros usos de jQuery no código novo.
- [ ] Sem `var` — apenas `const`/`let`.
- [ ] Chamadas REST a endpoints internos via `WCMAPI`/`FLUIGC.ajax`.
- [ ] Comportamento original preservado (mesma lógica e efeitos).
- [ ] i18n preservada via `${i18n.getTranslation('...')}`.
