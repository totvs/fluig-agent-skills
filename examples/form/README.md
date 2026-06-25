# Exemplo: Form (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos
- `form.example.html` — view/markup do formulário: contêiner `fluig-style-guide` e `<form name="form" role="form">`, com CSS do Style Guide e `<script>` de bibliotecas no `<head>`, campos com atributo `name` (obrigatório) e `id`/`for`/`placeholder` por boa prática, rótulos via i18n e script inline antes de `</body>`.
- `form.example.js` — eventos do formulário: handlers de ciclo de vida (carga e validação) e de campo, em ES6+, com texto visível via i18n e entrada do usuário validada/sanitizada com `WCMAPI.validateXSS`/`DOMPurify.sanitize`.

## Pontos-chave demonstrados
- View envolvida por `fluig-style-guide` + `<form>` nomeado; estilos/scripts de biblioteca no `<head>` e scripts inline antes de `</body>`.
- Todo campo com atributo `name` (obrigatório para o Fluig gravar/ler o valor); `id`/`for`/`placeholder` recomendados por semântica e acessibilidade.
- Handlers nos pontos de extensão públicos do formulário: ciclo de vida (carga e validação) e eventos de campo.
- Entrada do usuário tratada como não confiável e validada/sanitizada (`WCMAPI.validateXSS`, `DOMPurify.sanitize`).
- Texto visível (rótulos/mensagens) via `${i18n.getTranslation('chave')}` — sem strings fixas.
- JavaScript em ES6+ (`const`/`let`, arrow functions, template literals).

> Observação: quando o nome exato de um evento não puder ser confirmado como público,
> o exemplo usa um handler genérico/representativo com comentário para confirmar na
> documentação oficial.
>
> Fonte de verdade: `context/architecture.md` (pontos de extensão do Form) e `context/conventions.md` (i18n e segurança).
