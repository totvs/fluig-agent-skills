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
layouts, forms, datasets e eventos de processo). Cobre apenas o que está
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

A customização de **datasets** e **eventos de processo (BPM)** é escrita em
**JavaScript (ECMAScript) executado no servidor**. Esse é o runtime público de
scripting de customização: o desenvolvedor escreve funções que a plataforma
invoca em pontos de extensão definidos, usando as APIs públicas expostas para
cada contexto (API pública de Dataset; API pública de eventos de processo).

O código de scripting interage somente com essas APIs públicas — não há acesso a
componentes internos de servidor a partir do código de customização.

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
| JavaScript server-side | ECMAScript | Scripting de datasets e eventos de processo |

## Referências Cruzadas

- Para "como fazer" (gerar, modernizar e revisar código), ver as skills em `skills/`.
- Para convenções de código, ES6+, i18n e segurança: [conventions.md](conventions.md).
- Para componentes, grid, ícones e variáveis CSS (dark mode) do Style Guide:
  [style-guide.md](style-guide.md).
