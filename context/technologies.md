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

O frontend de customização é escrito em **JavaScript moderno (ES6+)**. Para
componentes novos, o padrão são **Web Components** (Custom Elements ES6+); jQuery
permanece apenas para manutenção de código legado. As diretrizes de quando usar
cada paradigma estão em [conventions.md](conventions.md).

As bibliotecas client-side abaixo são as que o desenvolvedor efetivamente
consome ao customizar a interface:

- **jQuery** — disponível para compatibilidade com widgets legados; código novo
  deve preferir ES6+.
- **Bootstrap** — base de CSS e grid responsivo sobre a qual o Style Guide é
  construído.
- **Kendo UI** — componentes de UI avançados disponíveis na plataforma.
- **Mustache** — templating client-side usado por widgets legados (`SuperWidget`).
- **Fluig Style Guide** (`@fluig/lib-styleguide`) — design system oficial e sua
  API JavaScript pública `FLUIGC`. Detalhes de componentes, grid, ícones e
  variáveis CSS estão em [style-guide.md](style-guide.md) (não duplicar aqui).

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
| jQuery | 3.7.1 | Compatibilidade com widgets legados |
| Bootstrap | 3.4.1 | CSS e grid (base do Style Guide) |
| Kendo UI | 2025.1.211 | Componentes de UI avançados |
| Mustache | 4.2.0 | Templating client-side (widgets legados) |
| Fluig Style Guide (`@fluig/lib-styleguide`) | 2.0.0 | Design system e API `FLUIGC` |
| FreeMarker (`.ftl`) | — | View server-side e i18n |
| JavaScript server-side (motor Mozilla Rhino) | ECMAScript 5 (ES6+ parcial) | Scripting de datasets; permite interop com Java |

## Referências Cruzadas

- Para "como fazer" (gerar, modernizar e revisar código), ver as skills em `skills/`.
- Para convenções de código, ES6+, i18n e segurança: [conventions.md](conventions.md).
- Para componentes, grid, ícones e variáveis CSS (dark mode) do Style Guide:
  [style-guide.md](style-guide.md).
