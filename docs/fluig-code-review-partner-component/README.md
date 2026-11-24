# Exemplos de Uso — fluig-code-review-partner-component

Prompts prontos para acionar a skill `fluig-code-review-partner-component` com um agente de IA, em três níveis de complexidade. A skill é exclusiva de soluções de Parceiro destinadas à Store do TOTVS Fluig.

## Simples

> Faça o pré-review da estrutura do meu componente Fluig para a Store. O projeto Maven está em `./meu-componente`.

## Intermediário

> Vou submeter meu componente à Store do TOTVS Fluig. Revise a estrutura do projeto Maven em `./meu-componente`: POM raiz, módulos `config` e `pack`, empacotamento EAR e `component.xml`. Não abra o código dos widgets. Grave o relatório de pré-review por severidade na raiz do projeto.

## Completo

> Meu componente já teve a versão 1.2.0 aprovada na Store e agora corrigi um bug e adicionei um widget novo. Faça o pré-review estrutural do projeto Maven em `./meu-componente`, lendo 100% dos arquivos estruturais: POM raiz e POMs de módulo (ordenação, `pack` por último, cruzamento das três listas de módulos com o `maven-ear-plugin`), dependências e escopos Maven, `component.xml` (campos obrigatórios e `<dependency>` de datasets), `pages.xml`, `jboss-web.xml` (`security-domain` por tipo de módulo), campos estruturais do `application.info`, prefixo de parceiro no `application.code`, sincronia de versão entre `.mvn/maven.config`, `pom.xml`, `component.xml`, `STORE-INFO.md` e `MANUAL.md`, e o incremento de versão que devo usar. Marque como "VERIFICAR MANUALMENTE" o que tiver origem ambígua, não altere nenhum arquivo e grave o relatório `pre-review-component-<data>.md` na raiz.
