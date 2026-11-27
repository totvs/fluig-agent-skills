# Revisão de Layout de Parceiro Fluig

Use a skill `fluig-code-review-partner-layout` para revisar, em modo somente
leitura, layouts WCM de uma solução de Parceiro destinada à Store do TOTVS Fluig.

## Quando acionar

Acione antes do App Review para avaliar somente módulos
`application.type=layout`. A skill produz o relatório
`pre-review-layout-<AAAA-MM-DD>.md` na raiz do componente revisado, com
inventário de escopo, Tracker de Cobertura, achados e Parecer Final.

Não use esta skill para widgets, datasets, REST, formulários ou para a estrutura
Maven completa. A persona deve ser Parceiro; para Consultor, as regras da Store
não se aplicam. Para layouts de Parceiro, `application.uilayout` é obrigatória:
a ausência é Crítico/Bloqueante, `false` não gera alerta e `true` recebe somente o
apontamento Informativo/Baixa Severidade definido em
[Arquitetura de layouts](../../context/architecture.md). Propriedades `slot.*` são
depreciadas e devem ser completamente ignoradas pela skill.

## Exemplo de solicitação

```text
Use fluig-code-review-partner-layout no componente Maven em ./meu-componente-fluig.
A versão aprovada é 1.2.0. Priorize a conferência da estrutura `layout.ftl` e dos recursos CSS.
```

## Referências

- [Procedimento da skill](../../skills/fluig-code-review-partner-layout/SKILL.md)
- [Regras de review da Store](../../context/partner-store-review-rules.md)
- [Arquitetura de layouts](../../context/architecture.md)
- [Exemplo de layout](../../examples/layout/)
