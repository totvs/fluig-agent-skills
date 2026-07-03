---
name: fluig-scaffolding-form
description: Gera o esqueleto de um Form (formulário eletrônico) do Fluig — a definição dos campos, a view/markup do formulário e o arquivo de eventos com os handlers de ciclo de vida e de campos para validação e regras, aplicando as convenções oficiais. Use quando o desenvolvedor pedir para criar/iniciar um novo formulário do Fluig a partir de um nome ou propósito e seus campos.
argument-hint: nome e/ou propósito do formulário, campos e regras de validação (ex.: "formulário de solicitação de férias com nome, data de início e dias")
---

# Scaffolding de Form (Formulário eletrônico)

Esta skill gera o esqueleto de um Form do Fluig; ela **não duplica** convenções — os arquivos de `context/` são a fonte de verdade, referenciada abaixo.

## Objetivo

Produzir, com responsabilidade única, o **esqueleto de um Form (formulário eletrônico)** do Fluig: a definição dos campos, a view/markup do formulário e o arquivo de eventos com os **handlers de ciclo de vida e de campos** que implementam validação e regras de preenchimento, já em conformidade com as convenções públicas.

## Quando Usar

- Ao criar um **novo formulário eletrônico** do Fluig a partir do zero.
- Quando o desenvolvedor fornece um nome/propósito e a lista de campos e quer um ponto de partida correto (campos + view + eventos) seguindo as convenções oficiais.
- Quando é preciso garantir, desde o início, i18n nos textos visíveis, validação/sanitização da entrada do usuário e código em ES6+.

## Entradas Esperadas

| Entrada | Descrição | Obrigatória |
|---------|-----------|-------------|
| Nome do formulário | Identificador camelCase do formulário — usado como nome do arquivo HTML **e** como prefixo dos arquivos `.properties` (ex.: `registroIncidenteTI`) | sim |
| Campos | Lista de campos do formulário (nome, tipo e se é obrigatório) | sim |
| Regras de validação | Regras de preenchimento/consistência por campo ou para o formulário | não |

## Contexto de Referência (Fonte de Verdade)

Leia antes de executar — não reproduza o conteúdo aqui:

- [architecture.md](../../context/architecture.md) — modelo conceitual do **Form** e seus **pontos de extensão públicos**: a **view/markup** do formulário, os handlers que reagem aos **eventos de ciclo de vida do formulário** (ex.: carga e validação) e aos **eventos de campos** (validação e reação a mudanças). Veja também a seção "Estrutura de um Projeto Fluig Studio": o form fica em `forms/` e seus eventos em `forms/events/`.
- [conventions.md](../../context/conventions.md) — **Convenções de Form**: contêiner `fluig-style-guide`, `<form>` nomeado, ordem de scripts/estilos no `<head>`, scripts inline antes de `</body>`, atributo `name` obrigatório nos campos, **i18n de formulários** (`i18n.translate("chave")` no HTML e em eventos, 3 arquivos `.properties` por locale, codificação `\uXXXX`), JavaScript em **ES6+** e **segurança** (`WCMAPI.validateXSS`/`DOMPurify.sanitize`).

> ⚠️ **Atenção:** o i18n de formulários usa `i18n.translate("chave")` — mecanismo
> **completamente diferente** do i18n de widgets/layouts (`${i18n.getTranslation(...)}`).
> Nunca misture os dois padrões.

## Regras Aplicáveis (Resumo Executivo)

Somente o mínimo para orientar a geração; o detalhe está no contexto:

- A **view/markup** envolve os campos em `fluig-style-guide` + `<form>` nomeado; CSS/libs no `<head>`, scripts inline antes de `</body>` → ver `conventions.md`.
- **Todo campo tem o atributo `name`** (obrigatório para o Fluig gravar/ler o valor); `id`, `for`, `placeholder` são recomendados por semântica/acessibilidade → ver `conventions.md`.
- O desenvolvedor implementa **handlers nos eventos públicos do formulário** (ciclo de vida e campos) → ver `architecture.md`.
- **i18n — HTML:** todo texto exibido ao usuário usa `i18n.translate("chave")`. **Nunca** gerar texto fixo em elementos visíveis → ver `conventions.md`.
- **i18n — Eventos JS:** mensagens em handlers usam `i18n.translate("chave")` — chave **sempre entre aspas duplas**. Em variável: `var t = 'i18n.translate("chave")'`; em template literal: `placeholder="i18n.translate("chave")"`. **Nunca** strings literais → ver `conventions.md`.
- **i18n — Arquivos:** gerar **obrigatoriamente** os 3 arquivos `.properties` (`_pt_BR`, `_en_US`, `_es`). Todas as chaves do HTML e dos eventos devem estar presentes nos 3 arquivos → ver `conventions.md`.
- **i18n — Codificação:** todos os 3 arquivos `.properties` seguem padrão Java Properties; **nenhum** caractere não-ASCII diretamente — usar `\uXXXX` → ver `conventions.md`.
- **Chaves descritivas** em dot-notation: `customer.name`, `validation.required.field` → ver `conventions.md`.
- JavaScript em **ES6+** (`const`/`let`, arrow functions); evitar `var` → ver `conventions.md`.
- **Validar e sanitizar** toda entrada do usuário (`WCMAPI.validateXSS`/`DOMPurify.sanitize`) → ver `conventions.md`.

## Procedimento

1. Definir o **nome do formulário** em camelCase (ex.: `registroIncidenteTI`) — ele será usado como nome do arquivo HTML **e** como prefixo dos 3 arquivos `.properties`. O nome do `.html` e o prefixo dos `.properties` devem ser **exatamente iguais**:
   ```
   registroIncidenteTI.html
   registroIncidenteTI_pt_BR.properties
   registroIncidenteTI_en_US.properties
   registroIncidenteTI_es.properties
   ```
2. Levantar todas as **chaves de i18n** necessárias — uma por rótulo, placeholder e mensagem de validação visível — seguindo a convenção dot-notation.
3. Criar a **view/markup** (`<nomeFormulario>.html`) — o nome do arquivo HTML deve ser **idêntico** ao prefixo dos `.properties`.
4. Criar o **arquivo de eventos** com os handlers dos eventos públicos (ciclo de vida e campos). Mensagens de validação via `i18n.translate("chave")`; sanitizar a entrada com `WCMAPI.validateXSS`/`DOMPurify.sanitize`.
5. Criar os **3 arquivos `.properties`** (`_pt_BR`, `_en_US`, `_es`) com todas as chaves levantadas no passo 2. Em todos os arquivos: **nenhum** caractere não-ASCII diretamente — usar `\uXXXX`.
6. Validar o resultado com o checklist abaixo antes de entregar.

## Saída Esperada

Esqueleto de formulário pronto para evoluir, contendo:

- A **view/markup** com contêiner `fluig-style-guide`, `<form>` nomeado, cada campo com `name` (e `id`/`for`/`placeholder` quando aplicável) e todos os rótulos via `i18n.translate("chave")`.
- O **arquivo de eventos** com handlers de ciclo de vida e de campos, mensagens via `i18n.translate`, entrada sanitizada, em ES6+.
- Os **3 arquivos `.properties`** (`_pt_BR`, `_en_US`, `_es`) com todas as chaves, sem caracteres não-ASCII diretos (usar `\uXXXX`).

Tudo em conformidade com `context/architecture.md` e `context/conventions.md`.

## Exemplo de Uso

Use `examples/form/` como referência mínima que demonstra `i18n.translate` no HTML, handlers de evento com `i18n.translate` em mensagens, sanitização e os 3 arquivos `.properties`. Trate-o como trecho de referência, não como projeto completo.

## Checklist de Validação

- [ ] A **view** envolve os campos em `fluig-style-guide` + `<form>` nomeado; CSS/scripts de biblioteca no `<head>` e scripts inline antes de `</body>`.
- [ ] **Todo campo tem o atributo `name`**; `id`/`for`/`placeholder` aplicados quando fizerem sentido.
- [ ] **Todo texto visível** no HTML usa `i18n.translate("chave")` — nenhum texto fixo em rótulos, placeholders ou mensagens.
- [ ] **Mensagens em handlers** usam `i18n.translate("chave")` — nenhuma string literal lançada diretamente.
- [ ] O **nome do arquivo HTML** é idêntico ao prefixo dos `.properties` (ex.: `registroIncidenteTI.html` + `registroIncidenteTI_pt_BR.properties`, etc.).
- [ ] Os **3 arquivos `.properties`** foram gerados (`_pt_BR`, `_en_US`, `_es`).
- [ ] Todas as **chaves do HTML e dos eventos** existem nos 3 arquivos `.properties`.
- [ ] Nenhum arquivo `.properties` contém caracteres não-ASCII diretos — todos convertidos para `\uXXXX`.
- [ ] A entrada do usuário é validada/sanitizada (`WCMAPI.validateXSS`/`DOMPurify.sanitize`).
- [ ] JavaScript em ES6+ (sem `var`; `const`/`let`, arrow functions, template literals).
