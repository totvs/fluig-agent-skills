---
name: fluig-code-review-partner-layout
description: Revisa, somente em leitura, os layouts WCM (application.type=layout) de uma solução de Parceiro destinada à Store do TOTVS Fluig e grava um único relatório pre-review-layout-AAAA-MM-DD.md com inventário de escopo, Tracker de Cobertura e achados por severidade. Confere application.info, a estrutura de layout.ftl, CSS, i18n, descritores web, recursos externos e regras exclusivas de Parceiro; consolida as validações genéricas sem duplicar achados. Não revisa widgets, datasets, REST, formulários ou a estrutura Maven completa. Use antes do App Review/submissão à Store.
argument-hint: caminho raiz do componente Maven e persona Parceiro já classificada pelo orquestrador
---

# Revisão de Layout de Parceiro Fluig

Esta skill revisa exclusivamente layouts WCM de uma solução de Parceiro para a Store do TOTVS Fluig, em modo somente leitura.
Esta skill não duplica o contexto; os arquivos em `context/` são a fonte única de verdade.

## Objetivo

Produzir um pré-review Markdown único dos módulos `application.type=layout`, com cobertura integral, inventário de escopo, achados por severidade e parecer de publicação.

## Quando Usar

- Antes do App Review ou da submissão de uma solução de Parceiro à Store.
- Para revisar o conteúdo de layouts WCM em um componente Maven.
- Para conferir `application.info`, `layout.ftl`, slots, CSS, i18n, responsividade, descritores web e recursos do layout.

Não use para widgets, datasets, REST, formulários ou para a estrutura Maven completa. A persona Parceiro é recebida do orquestrador e não é reclassificada.

## Entradas Esperadas

| Parâmetro | Descrição | Obrigatório |
|---|---|---|
| Caminho raiz do componente Maven | Diretório que contém o POM raiz com `<packaging>pom</packaging>`. | Sim |
| Persona | `Parceiro`, já classificada uma vez pelo orquestrador. | Sim |
| Contexto de submissão | Versão aprovada e delta conhecido para avaliar o versionamento semântico. | Não |
| Foco ou sintoma observado | Área que merece atenção adicional, sem reduzir a cobertura. | Não |

## Contexto de Referência

- [Roteamento de persona](../../context/persona-routing.md)
- [Constituição da plataforma](../../context/platform-constitution.md)
- [Arquitetura de layouts e descritores](../../context/architecture.md)
- [Convenções de código e i18n](../../context/conventions.md)
- [Style Guide e modo escuro](../../context/style-guide.md)
- [Projeto Maven e descritores web](../../context/backend-java-maven.md)
- [Convenções da Store](../../context/partner-store-conventions.md)
- [Regras de revisão da Store e layouts](../../context/partner-store-review-rules.md)
- [Componentes de Negócio nativos](../../context/business-components.md)
- [Slots de layouts nativos](../../context/references/layouts/layouts-nativos-slots.md)

## Estrutura de Saída

O relatório segue o contrato de [metodologia de pré-review](../../context/partner-store-review-rules.md#32-metodologia-do-relatório-de-pré-review-contrato-transversal):

1. Resumo, incluindo Inventário de Escopo com localização dos layouts, arquivos agrupados por tipo e total consolidado de linhas.
2. Tracker de Cobertura por arquivo.
3. Achados por Severidade, de Crítico a Baixo.
4. Pontos Positivos.
5. Plano de Ação Priorizado.
6. Parecer Final.

Cada achado usa o contrato definido no contexto, incluindo categoria, `arquivo:linha`, severidade, impacto, evidência, recomendação segura, referência e origem (`base` ou `delta`).

## Regras Aplicáveis

- Aplique somente à persona Parceiro herdada. A regra de roteamento e o limite para Consultor estão em [persona-routing.md](../../context/persona-routing.md).
- Restrinja o escopo aos módulos WAR com `application.type=layout`, conforme a [revisão de layouts](../../context/partner-store-review-rules.md#33-revisão-de-layouts-de-parceiro).
- No descritor, valide os recursos e `simple.deploy` ausente para layout de Parceiro. Ignore completamente propriedades `slot.*`. Para `application.uilayout`, aplique exclusivamente a política canônica: ausência é Crítico/Bloqueante; `false` não gera alerta; `true` registra somente o apontamento Informativo/Baixa Severidade e a recomendação literal definidos em [architecture.md](../../context/architecture.md#integridade-dos-recursos-e-chaves-review). Consulte também [partner-store-conventions.md](../../context/partner-store-conventions.md#2-applicationinfo-exigido-pela-store).
- Aplique a estrutura de portal, a renderização de slots, a responsividade, i18n, UTF-8, CSS de tema, descritores web e recursos locais pelas regras completas em [architecture.md](../../context/architecture.md), [conventions.md](../../context/conventions.md), [style-guide.md](../../context/style-guide.md) e [backend-java-maven.md](../../context/backend-java-maven.md).
- Aplique o delta da Store, o portão anti-falso-positivo, a severidade calibrada, o reuso de Componentes de Negócio e as recomendações seguras conforme [partner-store-review-rules.md](../../context/partner-store-review-rules.md) e [business-components.md](../../context/business-components.md).
- Consolide os eixos genéricos de [qualidade](../fluig-code-review/SKILL.md), [segurança](../fluig-review-security/SKILL.md), [desempenho](../fluig-review-performance/SKILL.md), [acessibilidade](../fluig-review-accessibility/SKILL.md) e [manutenibilidade](../fluig-best-practices/SKILL.md), sem duplicar achados.
- Use somente APIs e recursos públicos oficiais do Fluig.

## Política de Fallback

Aplique integralmente os limites e as respostas obrigatórias de [fallback da revisão de layouts](../../context/partner-store-review-rules.md#332-fallback-e-limites-da-revisão). Sem persona Parceiro, POM raiz Maven válido, layout no escopo ou dado crítico confirmável, interrompa conforme o contexto. Se não houver módulo `application.type=layout`, informe exatamente **"Nenhum artefato encontrado"** e encerre sem relatório vazio. Nunca invente estrutura, valor, slot, versão, achado ou recomendação insegura.

## Procedimento

1. Confirme que a persona recebida do orquestrador é Parceiro. Para persona ausente ou diferente, aplique o fallback sem reclassificá-la.
2. Localize o POM raiz e inventarie somente os módulos WAR cujo `application.info` declara `application.type=layout`.
3. Registre no Inventário de Escopo a localização de cada layout, os arquivos agrupados por tipo e o total consolidado de linhas. Registre cada arquivo no Tracker: `application.info`, `layout.ftl`, recursos `.css`/`.scss`, arquivos `.properties`, `jboss-web.xml` e `web.xml`.
4. Leia integralmente os arquivos do escopo antes de afirmar conformidade ou ausência de propriedade.
5. Execute ou receba os achados das revisões genéricas aplicáveis e registre-os como `base`.
6. Execute o delta de layout na sequência definida em [partner-store-review-rules.md](../../context/partner-store-review-rules.md#331-escopo-e-sequência-de-análise).
7. Aplique o portão anti-falso-positivo, calibre a severidade e elimine duplicações entre `base` e `delta`.
8. Consolide o relatório, defina um único Parecer Final e grave somente o arquivo permitido na raiz do alvo.

## Saída Esperada

Um arquivo `pre-review-layout-<AAAA-MM-DD>.md` na raiz do componente revisado. O arquivo declara que é um pré-review preparatório, registra o inventário, a cobertura, os achados e o Parecer Final. Nenhum outro arquivo do repositório do parceiro é alterado.

## Exemplo de Uso

Use `fluig-code-review-partner-layout ./meu-componente-fluig` com a persona Parceiro já classificada pelo orquestrador. Consulte o [exemplo de layout](../../examples/layout/) para reconhecer a estrutura de referência; ele não substitui o contexto.

## Checklist de Validação

- [ ] A persona Parceiro foi recebida do orquestrador e não foi reclassificada.
- [ ] Somente módulos `application.type=layout` entraram no escopo.
- [ ] O Inventário de Escopo informa localização, arquivos por tipo e total de linhas.
- [ ] O Tracker registra leitura integral ou a incompletude foi declarada.
- [ ] O descritor, `layout.ftl`, recursos, i18n e descritores web foram cobertos.
- [ ] As verificações genéricas e o delta de layout não duplicam achados.
- [ ] Cada achado contém o contrato definido no contexto e uma referência válida.
- [ ] O Parecer Final usa um dos rótulos oficiais.
- [ ] O relatório está no nome e local permitidos.
- [ ] A revisão usou somente APIs e recursos públicos oficiais do Fluig.
