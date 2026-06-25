# Exemplo: Form (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos

- `form.example.html` — view/markup do formulário: contêiner `fluig-style-guide` e `<form name="form" role="form">`, com CSS/libs no `<head>`, campos com `name` (obrigatório), `id`/`for`/`placeholder` por boa prática, rótulos via `i18n.translate("chave")` e script inline antes de `</body>`.
- `form.example.js` — eventos do formulário: handlers de ciclo de vida (carga e validação) e de campo, em ES6+, com mensagens via `i18n.translate("chave")` e entrada sanitizada com `WCMAPI.validateXSS`/`DOMPurify.sanitize`.
- `vacationRequest_pt_BR.properties` — bundle de i18n em Português (Brasil).
- `vacationRequest_en_US.properties` — bundle de i18n em Inglês (EUA).
- `vacationRequest_es.properties` — bundle de i18n em Espanhol.

## Pontos-chave demonstrados

- View envolvida por `fluig-style-guide` + `<form>` nomeado; estilos/scripts de biblioteca no `<head>` e scripts inline antes de `</body>`.
- Todo campo com atributo `name` (obrigatório para o Fluig gravar/ler o valor); `id`/`for`/`placeholder` recomendados por semântica e acessibilidade.
- **i18n de formulários:** `i18n.translate("chave")` no HTML e em mensagens de eventos — **mecanismo exclusivo de formulários**, diferente do padrão de widgets/layouts (`${i18n.getTranslation(...)}`). Nunca misture os dois.
- **3 arquivos `.properties`** obrigatórios (`_pt_BR`, `_en_US`, `_es`) com todas as chaves; nenhum caractere não-ASCII direto — usar `\uXXXX`.
- Handlers nos pontos de extensão públicos do formulário (ciclo de vida e campos).
- Entrada do usuário tratada como não confiável e sanitizada (`WCMAPI.validateXSS`, `DOMPurify.sanitize`).
- JavaScript em ES6+ (`const`/`let`, arrow functions, template literals).

> Fonte de verdade: `context/architecture.md` (pontos de extensão do Form) e
> `context/conventions.md` (seções "Convenções de Form" e "i18n — Formulários").
