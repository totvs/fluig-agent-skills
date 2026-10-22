# Tecnologias Públicas de Customização Fluig

> Fonte única de verdade do pacote para as **tecnologias e versões públicas**
> usadas na customização externa do Fluig. As skills e os demais arquivos de
> contexto referenciam este arquivo em vez de duplicar versões. Para convenções
> de código, i18n e segurança, veja [conventions.md](conventions.md). Para
> componentes, grid e variáveis CSS do design system, veja
> [style-guide.md](style-guide.md).

## Visão Geral

Este documento descreve **o que são** as tecnologias públicas e oficiais que o
desenvolvedor externo utiliza para customizar a plataforma Fluig (widgets,
layouts, forms e datasets). Cobre apenas o que está
**exposto publicamente** para customização — linguagens, bibliotecas
client-side, o motor de templates de view, o runtime de scripting server-side de
customização e o scaffolding público de artefatos.

Aqui não há passo a passo de execução (isso é responsabilidade das skills em
`skills/`) nem detalhes de infraestrutura de servidor: o foco é estritamente o
ferramental que o código de customização toca.

## Linguagem e ambiente client-side

O frontend de customização é escrito em **JavaScript moderno (ES6+)**, com
**Strict Mode** (`'use strict';`) e recursos modernos (arrow functions, template
literals, desestruturação, `async/await`) como padrão. Para componentes novos, o
padrão são **Web Components** (Custom Elements ES6+); jQuery é uma via válida e
suportada para código escrito em jQuery. As diretrizes de quando usar cada
paradigma estão em [conventions.md](conventions.md).

> **Princípio de manutenibilidade no frontend (preferir o embarcado/nativo).**
> Assim como no backend, **prefira o que o Fluig já embarca** (Style Guide,
> `FLUIGC.*`, jQuery UI, Mustache) e **JavaScript puro** antes de trazer uma
> biblioteca de terceiro. Toda lib externa entra **com cautela**: ela vira risco
> de manutenção futura (conflito com o que a plataforma atualiza, peso, segurança).
> Antes de adicionar uma dependência frontend, pergunte: **o Style Guide/`FLUIGC`
> já faz isso? dá para resolver com JS nativo ou com um plugin já embarcado?**

As bibliotecas client-side abaixo são as que o desenvolvedor efetivamente
consome ao customizar a interface:

- **jQuery** — biblioteca suportada; em código novo, ES6+ é a via recomendada.
- **jQuery UI** — conjunto curado de interações, efeitos e widgets de UI sobre o
  jQuery (`draggable`, `sortable`, `droppable`, `resizable`, `selectable`,
  `datepicker`, etc.). Já é **carregado pela plataforma** junto do Style Guide —
  não requer import manual nos artefatos que o Style Guide alcança. Antes de
  recriar uma interação do zero (ex.: arrastar-e-soltar), verifique se o jQuery
  UI já a resolve — ver [style-guide.md](style-guide.md), seção "Plugins
  embutidos (jQuery, jQuery UI, Mustache)".
- **Bootstrap** — base de CSS e grid responsivo sobre a qual o Style Guide é
  construído.
- **Kendo UI** — componentes de UI avançados disponíveis na plataforma.
- **Mustache** — templating client-side usado por widgets `SuperWidget`,
  também já carregado pela plataforma junto do Style Guide.
- **Fluig Style Guide** (`@fluig/lib-styleguide`) — design system oficial e sua
  API JavaScript pública `FLUIGC`. Detalhes de componentes, grid, ícones e
  variáveis CSS estão em [style-guide.md](style-guide.md) (não duplicar aqui).

### Integrações HTTP no client-side

Ao consumir APIs REST e Datasets no navegador, a regra é **única** para qualquer
chamada (ao domínio do próprio Fluig ou a terceiro): use **`fetch()` com
`async/await` e `try/catch`**. Diretrizes transversais:

- **Sempre assíncrono:** toda integração (APIs e Datasets) deve ser assíncrona.
  Nunca use `async: false` nem chamadas síncronas — elas bloqueiam a interface.
- **Paralelismo:** dispare chamadas independentes em paralelo com `Promise.all`
  para reduzir o tempo de carregamento da interface.
- **Tratamento de erros:** use `try/catch` com `async/await`, sempre fornecendo
  feedback ao usuário.

As regras completas de chamadas REST, paralelismo e tratamento de erros são
fonte de verdade de [conventions.md](conventions.md), seção "Chamadas REST e
Integrações". Não as duplique.

## Templating de view (server-side)

A camada de view de widgets e layouts usa **FreeMarker** (arquivos `.ftl`),
renderizado no servidor antes de chegar ao navegador. É o mecanismo público para
montar a marcação e, principalmente, para resolver **internacionalização (i18n)**
server-side via `${i18n.getTranslation('chave')}`. As regras completas de i18n e
escaping em FreeMarker estão em [conventions.md](conventions.md).

## Scripting server-side de customização

A customização de **datasets** é escrita em
**JavaScript executado no servidor sobre o motor Mozilla Rhino**. Esse é o
runtime público de scripting de customização: o desenvolvedor escreve funções
que a plataforma invoca em pontos de extensão definidos, usando a API pública
exposta para esse contexto (API pública de Dataset).

O código de scripting interage somente com essas APIs públicas — não há acesso a
componentes internos de servidor a partir do código de customização.

### Runtime Rhino: sintaxe rígida (não é ES6+)

> **Importante:** ao contrário do frontend (ES6+), o scripting server-side roda
> sobre o **Rhino**, um motor JavaScript escrito em Java. A base é **ECMAScript 5
> (ES5)** com suporte apenas **parcial** a recursos de ES6+. Trate o ambiente
> como **ES5** por padrão e **não** assuma que sintaxe moderna está disponível.

Diretrizes práticas para datasets:

- **Declarações:** use `var`. Não dependa de `let`/`const` (escopo de bloco não é
  garantido no runtime).
- **Funções:** use `function` tradicional. Evite **arrow functions** (`=>`).
- **Strings:** concatene com `+`. Evite **template literals** (backticks/`${...}`).
- Evite também **destructuring**, **spread/rest**, **default parameters**,
  classes ES6, `for...of`, `Promise`/`async`/`await` e módulos `import`/`export`
  — recursos que não são confiáveis no Rhino.
- Prefira laços clássicos (`for`/`while`) e funções nomeadas.

### Interoperabilidade com Java (Rhino)

Por rodar sobre a JVM, o Rhino permite **acessar classes Java a partir do
JavaScript** — um recurso do motor, fora do padrão ECMAScript. É comum em
datasets para tarefas como datas, coleções e formatação.
Os mecanismos públicos do Rhino para isso são:

- A variável global **`Packages`** (ex.: `Packages.java.util.Date`,
  `Packages.java.text.SimpleDateFormat`).
- **`importPackage(...)`** e **`importClass(...)`** para encurtar referências.
- Pacotes sob `java.*` podem ser acessados diretamente (ex.: `java.util.ArrayList`).

> Use a interop com Java apenas quando necessário e prefira sempre a **API pública
> do Fluig** (`DatasetBuilder`/`DatasetFactory`, `hAPI`) para o domínio do
> artefato. A interop não dá acesso a componentes internos do servidor: restringe-se
> às classes Java padrão da plataforma de execução.

#### Princípio: valores vindos de API Java no Rhino são objetos Java, não primitivos JS

> **Regra base (vale para todo código server-side: eventos de form, datasets,
> eventos de processo).** Métodos da plataforma que "retornam String/boolean"
> (ex.: `form.getFormMode()`, `form.getValue(...)`, `WCMAPI.getIsEditMode()`
> **no server-side**, retornos de interop `Packages.*`) normalmente devolvem um
> **objeto Java** (`java.lang.String`, etc.), **não** um primitivo JS. Isso gera
> três armadilhas recorrentes — todas com a mesma causa e a mesma cura
> (`String(valor)` + igualdade solta `==`):
>
> 1. **Sobrecarga ambígua** ao encadear métodos de texto (`.replace`, `.split`) —
>    ver abaixo.
> 2. **Igualdade estrita sempre falsa:** `valorJava === 'ADD'` é **sempre `false`**
>    porque `===` exige mesmo tipo e identidade, e um `java.lang.String` nunca é um
>    literal JS. Use `==` (ou normalize com `String(...)` e então compare). Ex.:
>    `form.getFormMode() == 'ADD'`; `WCMAPI.getIsEditMode() == 'true'`.
> 3. **Coerção silenciosa inesperada** (ex.: um `boolean` Java tratado como objeto
>    "truthy"): quando o valor importa para a lógica, **normalize antes**
>    (`String(valor)` e compare com `==`).
>
> Resumo operacional: **compare com `==`** e, para comparação estrita ou para
> encadear métodos de texto, **converta antes com `String(valor)`**.

As subseções abaixo detalham a armadilha nº 1 (a de diagnóstico menos óbvio).

##### Sobrecarga ambígua ao chamar métodos de `java.lang.String`

No Rhino, um valor vindo da API Java (ex.: um campo lido via `hAPI`/`form`) pode
ser uma instância de **`java.lang.String`**, não uma string JS nativa. Ao chamar
um método Java sobrecarregado nesse objeto passando argumentos JS, o motor tenta
casar os tipos e pode **não conseguir decidir qual sobrecarga usar**, lançando:

```
The choice of Java method java.lang.String.replace matching JavaScript argument
types (object,string) is ambiguous; candidate methods are:
replace(CharSequence,CharSequence) / replace(char,char)
```

Isso acontece porque, enquanto o valor for `java.lang.String`, o `.replace` (e
`.split`, `.indexOf`, etc.) é resolvido como o **método Java sobrecarregado** —
`.replace(",", ".")` fica ambíguo entre `replace(CharSequence,CharSequence)` e
`replace(char,char)`. **Passar um regex JS não evita o erro:** o método Java não
aceita regex, então o Rhino ainda tenta casar as sobrecargas e cai na mesma
ambiguidade `(object, string)`.

> ⚠️ **`.toString()` NÃO resolve.** No Rhino, `objetoJava.toString()` devolve
> **outra `java.lang.String`**, não uma string JS — logo `.toString().replace(...)`
> continua caindo no método Java e quebra, inclusive com regex. A única correção
> confiável é **`String(valor)`** (construtor JS), que produz uma string primitiva
> JS cujo `.replace` é o método do próprio JavaScript.

Para evitar, force uma **string JS nativa** com `String(...)` antes de operar — aí
o método que roda é o do próprio JavaScript, sem casamento de sobrecarga Java:

```javascript
// ❌ ambíguo: valorRaw é java.lang.String e .replace vira método Java
var valor = parseFloat(valorRaw.replace(",", "."));

// ❌ ainda ambíguo: .toString() devolve outra java.lang.String
var valor = parseFloat(valorRaw.toString().replace(/,/g, "."));

// ✅ String(...) produz string JS nativa; .replace é o método JS (aceita regex)
var valor = parseFloat(String(valorRaw).replace(/,/g, "."));

// ✅ também vale para trim/limpeza: troque .toString() por String(...)
var descricao = String(form.getValue("descricao")).replace(/^\s+|\s+$/g, "");

// ✅ alternativa: normalizar para string JS e então operar
var valor = parseFloat(String(valorRaw).replace(",", "."));
```

> Regra prática: em eventos/datasets server-side, **envolva valores vindos do Java
> com `String(...)`** antes de encadear métodos de texto (`.replace`, `.split`,
> `.trim`, etc.). Não basta passar regex nem chamar `.toString()`: enquanto o valor
> for `java.lang.String`, o método resolvido é o do Java e a sobrecarga continua
> ambígua. Só `String(...)` garante uma string JS nativa.

### Sem APIs de navegador; HTTP externo via Cadastro de Serviços

O runtime server-side **não** tem APIs de navegador: não existem `fetch`,
`XMLHttpRequest`, `window`, `document`, DOM nem `jQuery`. Para consumir um sistema
**externo via HTTP/REST**, o caminho público e oficial é o **Cadastro de Serviços**
do Fluig — a URL base e as credenciais são cadastradas na plataforma e o código
apenas referencia o serviço pelo seu **código** (`serviceCode`):

- Obtenha o cliente com **`fluigAPI.getAuthorizeClientService()`**.
- Monte um objeto com `serviceCode` (código do serviço cadastrado),
  `endpoint` (complementa a URL base), `method` (`get`/`post`/...) e
  `timeoutService`. O `companyId` é **opcional** — quando omitido, é resolvido
  a partir do `serviceCode` do serviço cadastrado.
- Invoque com **`clientService.invoke(JSON.stringify(data))`** e leia a resposta
  com **`vo.getResult()`** (texto, normalmente JSON) — parseando com `JSON.parse(...)`.

> O serviço **precisa estar previamente cadastrado** no Fluig; o código não define
> URL base nem credenciais.

## Build e empacotamento público de artefatos WCM

Para iniciar artefatos WCM (widgets, layouts e temas), o Fluig publica
**archetypes Maven** oficiais que servem de scaffolding do projeto:

| Archetype | Gera |
|-----------|------|
| `widget-wcm` | Estrutura base de um widget |
| `layout-wcm` | Estrutura base de um layout |
| `theme-wcm` | Estrutura base de um tema |

Esses archetypes são o recurso público recomendado para criar o esqueleto de um
artefato; o ciclo de empacotamento e publicação do artefato gerado segue a
documentação oficial do Fluig.

## Tabela de versões

| Tecnologia | Versão | Uso na customização |
|------------|--------|---------------------|
| ES6+ (Web Components / Custom Elements) | ECMAScript moderno | Padrão para frontend novo |
| jQuery | 3.7.1 | Embutido e **suportado** pela plataforma (não é legado); usado pelos plugins embutidos (jQuery UI, Mustache, `fluig.datatable.*`) — só o plugin jQuery Migrate está em descontinuação |
| jQuery UI | 1.13.2 | Interações de UI prontas (`draggable`/`sortable`/`droppable`/`resizable`/`selectable`), já carregadas pela plataforma — ver [style-guide.md](style-guide.md) |
| Bootstrap | 3.4.1 | CSS e grid (base do Style Guide) |
| Kendo UI | 2025.1.211 | Componentes de UI avançados |
| Mustache | 4.2.0 | Templating client-side **suportado**, já carregado pela plataforma (uso legítimo, não legado) |
| Fluig Style Guide (`@fluig/lib-styleguide`) | 2.0.0 | Design system e API `FLUIGC` |
| FreeMarker (`.ftl`) | — | View server-side e i18n |
| JavaScript server-side (motor Mozilla Rhino) | ECMAScript 5 (ES6+ parcial) | Scripting de datasets; permite interop com Java |

## Referências Cruzadas

- Para "como fazer" (gerar, modernizar e revisar código), ver as skills em `skills/`.
- Para convenções de código, ES6+, i18n e segurança: [conventions.md](conventions.md).
- Para componentes, grid, ícones e variáveis CSS (dark mode) do Style Guide:
  [style-guide.md](style-guide.md).
