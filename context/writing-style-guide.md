# Guia de Padronização de Escrita (Terminologia TOTVS)

> **Escopo:** texto **visível ao usuário final** — strings de i18n (widgets,
> layouts, formulários, processos), documentação do parceiro (`STORE-INFO.md`,
> `MANUAL.md`) e textos de UI em geral. **Não se aplica** a nomes de
> código/variáveis/comentários técnicos, que seguem
> [conventions.md](conventions.md). Fonte: **Guia de padronização de escrita
> técnica** do Fluig (TDN público —
> https://tdn.totvs.com/pages/viewpage.action?pageId=1040987938).

## Nomenclatura da plataforma

| Em vez de | Usar | Observação |
|-----------|------|------------|
| "produto", "produto padrão", "sistema" | "plataforma" | Nomenclatura padrão em texto visível ao usuário |
| "fluig"/"Fluig" em texto para usuário final | "plataforma" | Evitar citar o nome da marca em documentação voltada ao usuário final |
| "versão X.Y" | "atualização X.Y" | Plataforma cloud não tem conceito de "versão" para o usuário; ex.: "É necessário aplicar a atualização 1.8.x" |
| Atualizações nomeadas (ex. "Crystal Lake") | Gênero gramatical **feminino** | Ex.: "a atualização Crystal Lake" |

## Termos de UI/experiência

| Em vez de | Usar | Observação |
|-----------|------|------------|
| "Tela" (interface Web) | "Página" | "Página" é exclusivo da interface Web |
| "Página" (app mobile) | "Tela" | "Tela" é exclusivo dos aplicativos mobile |
| "Tema" | "Modo claro" / "Modo escuro" | Nomenclatura oficial do modo visual |
| "cadastrar"/"cadastro" | "criar", "definir", "configurar", "aplicar" | Verbos mais leves para ações do usuário |

## Termos de desenvolvimento/recursos

| Em vez de | Usar | Observação |
|-----------|------|------------|
| "função"/"funcionalidade"/"módulo" | "recurso" ou "opção" | Terminologia preferida |
| "customizado" | (evitar — termo em desuso) | Usar "Personalizado" (mudança visual: cores, logos, temas) ou "Desenvolvimento sobre a plataforma" (novos apps/processos/widgets), conforme o caso |
| "ficha"/"fichário" | "registros de formulários (Tabela única)" / "formulários", "registros de formulário" | Terminologia de dados persistidos em tabela única |
| "mídia" (distribuição) | "instalador" | Terminologia de distribuição |

## Convenções de estrangeirismos e escrita

- Termos em inglês devem ser **grafados em itálico** (ex.: _layout_, _upload_,
  _widget_).
- Preferir o termo em português quando houver equivalente consagrado (ex.:
  "Assistente" em vez de "Wizard"; "Desempenho" em vez de "Performance").
- **Nunca** criar verbos a partir de termos em inglês (incorreto: "performar",
  "debugado", "startar").
