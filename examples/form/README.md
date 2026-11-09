# Exemplo: Form (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Estrutura de Dupla Pasta (Canônica)

Formulários Fluig seguem **obrigatoriamente** a estrutura de dupla pasta:
`{formName}/{formName}/` — onde `formName` é o nome do formulário cadastrado
na plataforma.

```
vacationRequest/                    ← pasta externa (= formName)
└── vacationRequest/                ← pasta interna (= formName, repetido)
    ├── vacationRequest.html        ← markup do formulário (view)
    ├── vacationRequest_pt_BR.properties  ← i18n Português (Brasil)
    ├── vacationRequest_en_US.properties  ← i18n Inglês (EUA)
    ├── vacationRequest_es.properties     ← i18n Espanhol
    └── events/                     ← handlers de eventos server-side (Rhino/ES5)
        ├── displayFields.js        ← controle de visibilidade/estado dos campos
        └── validateForm.js         ← validação antes de movimentar processo
```

### Regras da estrutura

- **Dupla pasta obrigatória**: a plataforma espera `{formName}/{formName}/`.
  Sem essa estrutura, o formulário não é reconhecido no upload/deploy.
- **Nome do HTML = formName**: o arquivo HTML deve ter o mesmo nome da pasta
  (ex.: `vacationRequest.html` dentro de `vacationRequest/`).
- **Properties = formName + locale**: o nome-base dos `.properties` é o
  `formName` (igual ao `application.code` se houver `application.info`).
- **3 arquivos `.properties`**: `_pt_BR` + `_en_US` + `_es`. Diferentemente de
  widgets/layouts, formulários **não** têm arquivo base (sem sufixo de locale) —
  usam apenas os 3 arquivos com sufixo de locale.
- **events/**: pasta com os eventos de formulário **server-side (Rhino/ES5)**
  (`displayFields`, `validateForm`, etc.) — um arquivo por evento, recebendo
  `FormController`. Lista canônica (evento × contexto × assinatura) em
  `context/conventions-form.md` (seção "Eventos de Formulário"). Eventos
  **client-side** (`beforeMovementOptions`/`beforeSendValidate`) e lógica de UI do
  navegador, quando houver, ficam num `.js` vinculado ao HTML — não em `events/`.

## Arquivos

- `vacationRequest/vacationRequest/vacationRequest.html` — view/markup do formulário: contêiner `fluig-style-guide` e `<form name="form" role="form">`, com CSS/libs no `<head>`, campos com `name` (obrigatório), `id`/`for`/`placeholder` por boa prática, rótulos via `i18n.translate("chave")` e script inline antes de `</body>`.
- `vacationRequest/vacationRequest/vacationRequest_pt_BR.properties` — bundle de i18n em Português (Brasil).
- `vacationRequest/vacationRequest/vacationRequest_en_US.properties` — bundle de i18n em Inglês (EUA).
- `vacationRequest/vacationRequest/vacationRequest_es.properties` — bundle de i18n em Espanhol.
- `vacationRequest/vacationRequest/events/displayFields.js` — evento server-side para controle de visibilidade e estado dos campos.
- `vacationRequest/vacationRequest/events/validateForm.js` — evento server-side para validação antes de movimentação do processo.
- `form-parent-child.example.html` — tabela Pai x Filho no formulário com `tablename`, `<tbody>` base e campos que o Fluig replica com sufixo `___n`.
- `form-parent-child-dataset.example.js` — exemplo de consumo da tabela filha via `DatasetFactory.getDataset(...)` com constraints `documentid`, `tablename` e `metadata#active`.

## Pontos-chave demonstrados

- **Estrutura de dupla pasta** canônica `{formName}/{formName}/` obrigatória para a plataforma.
- View envolvida por `fluig-style-guide` + `<form>` nomeado; estilos/scripts de biblioteca no `<head>` e scripts inline antes de `</body>`.
- Todo campo com atributo `name` (obrigatório para o Fluig gravar/ler o valor); `id`/`for`/`placeholder` recomendados por semântica e acessibilidade.
- **i18n de formulários:** `i18n.translate("chave")` no HTML e em mensagens de eventos — **mecanismo exclusivo de formulários**, diferente do padrão de widgets/layouts (`${i18n.getTranslation(...)}`). Nunca misture os dois.
- **3 arquivos `.properties`** obrigatórios (`_pt_BR` + `_en_US` + `_es`) com todas as chaves; formulários **não** têm arquivo base (sem sufixo de locale) — esse conceito é de widgets/layouts. Nenhum caractere não-ASCII direto — usar `\uXXXX`.
- **events/** com handlers server-side (`displayFields.js`, `validateForm.js`) para controle de visibilidade e validação no contexto de processos BPM.
- Handlers nos pontos de extensão públicos do formulário (ciclo de vida e campos).
- Entrada do usuário tratada como não confiável e sanitizada (`WCMAPI.validateXSS`, `DOMPurify.sanitize`).
- JavaScript em ES6+ (`const`/`let`, arrow functions, template literals).
- **Tabela Pai x Filho:** `<table tablename="...">` + linha-base no `<tbody>`; o Fluig controla índice/sufixo (`___1`, `___2`, ...) e usa `wdkAddChild` (adicionar) e `fnWdkRemoveChild` (remover — prefixo `fn`) para inclusão/remoção de linhas.
- **Consumo analítico da tabela filha:** filtro obrigatório por `documentid` e `tablename` (com `metadata#active=true`) na consulta ao dataset do formulário.

> Fonte de verdade: `context/architecture.md` (pontos de extensão do Form) e
> `context/conventions.md` (seções "Convenções de Form" e "i18n — Formulários").
