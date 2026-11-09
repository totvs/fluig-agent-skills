# Convenções da Solução para a Store do TOTVS Fluig (Parceiro)

> **Delta sobre a base.** Este arquivo documenta exclusivamente as **convenções
> específicas da Store** do TOTVS Fluig: nomenclatura da solução, campos do
> `application.info` exigidos pela Store, URLs externas declaradas, versionamento
> semântico e sincronia de descritores, avaliação de bibliotecas de terceiros e
> namespacing por prefixo de parceiro. As convenções **genéricas** de código Java
> e de projeto Maven multi-módulo (coordenadas Maven, JNDI, DAO, persistência,
> i18n Java) são fonte de verdade em
> [backend-java-maven.md](backend-java-maven.md); as convenções de **frontend**
> (ES6+, SuperWidget, recursos locais, UTF-8, parametrização) vivem em
> [conventions.md](conventions.md). Para a **arquitetura de provisionamento da
> Store**, veja [partner-store-architecture.md](partner-store-architecture.md);
> para as **regras de review da Store**, veja
> [partner-store-review-rules.md](partner-store-review-rules.md).
>
> **Quando se aplica.** Somente quando o **destino da entrega é a Store** (persona
> Parceiro — detecção por marcador técnico de Store conforme
> [persona-routing.md](persona-routing.md)). Uma solução entregue a uma única
> empresa (persona Consultor) **não** carrega estas convenções: ela usa o core e,
> quando for projeto Maven, [backend-java-maven.md](backend-java-maven.md).

---

## 1. Nomenclatura da solução

O `{nome}` do `artifactId` (e, por consequência, o `finalName`/`applicationName`
derivados dele no pack) DEVE ser **descritivo e coerente** com o propósito da
solução — o mesmo nome que aparece no `<title>` do `component.xml`. Um `artifactId`
genérico ou desconexo do nome da solução dificulta identificação e manutenção.

A escolha das coordenadas Maven em si (`groupId`, `artifactId`, `version` via
`${revision}`) e os anti-patterns de `groupId` reservado são fonte de verdade em
[Nomenclatura Maven (coordenadas)](backend-java-maven.md#nomenclatura-maven-coordenadas);
aqui vale o delta de **coerência de nome com o metadado de vitrine** da Store.

| Verificação | Regra | Severidade |
|-------------|-------|------------|
| `artifactId` descritivo | O `{nome}` deve remeter à solução, não a um rótulo genérico | Baixo · "VERIFICAR MANUALMENTE" |
| `artifactId`/`finalName`/`applicationName` × `<title>` | Devem ser coerentes entre si e com o nome de exibição da solução | Médio · "VERIFICAR MANUALMENTE" |

> **Verificação obrigatória por variante/módulo:** a checagem de `artifactId` não é
> opcional — DEVE ser aplicada a **cada** POM raiz e a **cada** módulo do projeto.
> Quando o projeto tem múltiplas variantes (ex.: básico/intermediário/avançado) que
> compartilham um módulo com `artifactId` **genérico** (ex.: um `-install` idêntico
> nas três), esse nome genérico não distingue a variante nem remete à solução —
> emitir o achado (Médio "VERIFICAR MANUALMENTE") por variante afetada. Ausência
> desse achado quando o nome é claramente genérico é **gap de execução**, não
> tolerância da regra.

> **Anti-falso-positivo:** a adequação do nome é **semântica** — reportar como
> Baixo/Médio com "VERIFICAR MANUALMENTE" (ver
> [§ 22](partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo)),
> nunca como violação bloqueante. Um `artifactId` diferente do `<title>` pode ser
> intencional (nome técnico vs. nome comercial).

---

## 2. `application.info` exigido pela Store

A estrutura geral do descritor `application.info` (campos comuns a widget e layout,
tabela de validação e verificações de integridade) é fonte de verdade em
[architecture.md](architecture.md) (seções de validação do `application.info` e
[Integridade dos recursos e chaves (review)](architecture.md#integridade-dos-recursos-e-chaves-review)).
O `context-root` por tipo de módulo e o significado de `simple.deploy` em função de
código Java são fonte de verdade em
[Context-root por tipo de módulo](backend-java-maven.md#context-root-por-tipo-de-módulo)
e em [O campo `simple.deploy`](architecture.md#o-campo-simpledeploy). Esta seção
documenta exclusivamente os **campos exigidos pela Store** sobre esse mesmo descritor.
Violações nestas regras são a **causa nº 1 de reprovação no App Review**.

### Campos obrigatórios

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `application.code` | ✅ | Código único do artefato (sem hífens, lowercase) |
| `application.title` | ✅ | Título visível na plataforma |
| `application.description` | ✅ | Descrição do artefato |
| `application.category` | ✅ | Categoria (ex.: `AGILITY`) |
| `application.type` | ✅ | Tipo: `widget`, `layout`, `2` (config) |
| `developer.code` | ✅ | Código do parceiro desenvolvedor |
| `developer.name` | ✅ | Nome do parceiro |
| `developer.url` | ✅ | URL do parceiro (sempre `https://`) |
| `simple.deploy` | ✅ | **Obrigatório** no modelo Store. Valor conforme a presença de código Java no módulo: **`true`** sem Java (só recursos web); **`false`** com Java. Na integridade do `application.info` (review): ausência **Alta**; valor incoerente com o tipo do módulo **Alta** |

### Campos condicionais

| Campo | Quando |
|-------|--------|
| `application.uiwidget` | Widgets — flag booleana (`true`/`false`): se o widget aparece na seleção ao editar páginas (ver [§ 9](partner-store-review-rules.md#9-applicationuiwidget-e-documentação)). DEVE existir com valor explícito |
| `application.uilayout` | Layouts — flag booleana (`true`/`false`): se o layout aparece na seleção de layouts. DEVE existir com valor explícito |
| `slot.{NomeSlot}={NomeSlot}` | Layouts — uma entrada por slot declarado na `layout.ftl` |
| `resources` | Declaração de recursos estáticos |

### Exemplo completo (widget)

```properties
application.type=widget
application.code=samplewidget
application.title=Sample Widget
application.description=Widget de exemplo do componente parceiro
application.category=AGILITY
developer.code=PARCEIRO01
developer.name=Parceiro Exemplo LTDA
developer.url=https://www.parceiro.com.br
simple.deploy=true
application.uiwidget=false
```

### Exemplo completo (layout com slots)

```properties
application.type=layout
application.code=samplelayout
application.title=Sample Layout
application.description=Layout customizado do componente
application.category=AGILITY
developer.code=PARCEIRO01
developer.name=Parceiro Exemplo LTDA
developer.url=https://www.parceiro.com.br
simple.deploy=true
application.uilayout=false
slot.SlotHeader=SlotHeader
slot.SlotContent=SlotContent
slot.SlotSidebar=SlotSidebar
```

---

## 3. URLs externas declaradas

Toda URL externa (que NÃO seja API interna do Fluig) consumida pelo componente
**deve** ser declarada no `application.info`:

```properties
application.external.url.1=https://api.exemplo.com/v1
application.external.url.2=https://webhook.parceiro.com/notify
```

> **Motivo:** o App Review verifica endereços externos para avaliar riscos de
> segurança e privacidade. URLs não declaradas causam reprovação. O protocolo DEVE
> ser sempre `https://` — a regra de SSL/TLS é fonte de verdade em
> [URLs externas com SSL/TLS](conventions.md#urls-externas-com-ssltls) e em
> [§ 18](partner-store-review-rules.md#18-ssltls-obrigatório-em-serviços-externos).

---

## 4. Versionamento semântico e sincronia de descritores

Esta seção define o **Protocolo de Governança de Versionamento Semântico & Ciclo
de Submissão** da Store e é a referência única sobre o tema — nunca duplicar seu
conteúdo. O mecanismo físico da versão é a propriedade `${revision}` em
`.mvn/maven.config` (`-Drevision=X.Y.Z`), herdada por todos os POMs de módulo via
`<parent>` (ver [Herança de POM nos Módulos](backend-java-maven.md#herança-de-pom-nos-módulos)).

O versionamento segue **Semantic Versioning** no formato `MAJOR.MINOR.PATCH`
(ex.: `3.4.2`). Cinco diretrizes governam o ciclo de vida da versão.

### 4.1 Scaffolding nasce em 1.0.0

Todo projeto novo nasce **estritamente** na versão `1.0.0`. A geração inicial
grava `1.0.0` de forma idêntica em `.mvn/maven.config` (`-Drevision=1.0.0`) e em
todos os descritores de manifesto ([§ 4.4](#44-sincronia-mandatória-de-descritores)).
É proibido gerar um projeto novo em qualquer outra versão inicial.

### 4.2 Congelamento em desenvolvimento (In-Flight)

Durante ciclos de ajuste, correções de App Review ou refatoração dirigida a uma
versão-alvo (ex.: `3.4.2`), a versão **DEVE permanecer congelada** nessa
versão-alvo. É **PROIBIDO** incrementar a versão a cada refatoração/alteração
enquanto a submissão não for concluída — a versão só muda quando uma nova release
é deliberadamente preparada ([§ 4.3](#43-detecção-de-delta-para-nova-release)).

| Situação in-flight | Ação sobre a versão |
|--------------------|---------------------|
| Correção de achado de App Review na versão em submissão | Manter congelada |
| Refatoração/ajuste para atingir a versão-alvo | Manter congelada |
| Múltiplas alterações antes de concluir a submissão | Nunca incrementar por alteração |

### 4.3 Detecção de delta para nova release

Quando o projeto já teve uma versão **aprovada** e são detectadas alterações no
código para uma **nova submissão**, a versão deve ser incrementada conforme o
delta real das mudanças. O incremento é **validado/sugerido**, nunca aplicado
automaticamente sem intenção explícita de nova release:

| Incremento | Formato | Quando aplicar |
|------------|---------|----------------|
| **PATCH** | `x.y.Z` | Correções de bugs, correções de segurança ou pequenos ajustes sem novas funcionalidades |
| **MINOR** | `x.Y.0` | Novas funcionalidades, novos formulários, novos widgets ou novos módulos (retrocompatíveis) |
| **MAJOR** | `X.0.0` | Mudanças estruturais com **quebra de compatibilidade** (contratos REST, dados, remoção de recurso) |

> **Regra:** o incremento deve **refletir o maior delta** presente no conjunto de
> alterações (uma nova funcionalidade + um bugfix ⇒ MINOR, não PATCH).

### 4.4 Sincronia mandatória de descritores

A versão definida DEVE ser **100% idêntica** em todos os arquivos de manifesto do
pacote. Qualquer divergência entre eles é violação de conformidade.

| Descritor | Campo/Local da versão |
|-----------|-----------------------|
| `.mvn/maven.config` | `-Drevision=X.Y.Z` (origem canônica herdada pelos `pom.xml` via `${revision}`) |
| `pom.xml` (raiz e módulos) | `<version>${revision}</version>` — resolve para o valor de `.mvn/maven.config` |
| `component.xml` (módulo config) | `<version>X.Y.Z</version>` (ver [§ 6](partner-store-review-rules.md#6-componentxml)) |
| `STORE-INFO.md` | Versão declarada da publicação na Store |
| `MANUAL.md` | Versão documentada para o usuário |

> **Verificação anti-falso-positivo:** ao comparar versões entre descritores,
> **ler os valores reais** de cada arquivo antes de acusar divergência — nunca por
> memória/cache (ver [§ 22](partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo)).
> Como `pom.xml` usa `${revision}`, a comparação do POM é feita contra o valor
> resolvido em `.mvn/maven.config`, não contra o literal `${revision}`.

> **Anti-pattern:** `pom.xml`/`.mvn/maven.config` em `1.2.0` e `component.xml`
> em `1.1.0` — divergência de descritor, achado Crítico/Bloqueante na revisão.

> **`application.info` NÃO carrega versão:** o descritor `application.info` **não
> possui** a propriedade `application.version` (ver os campos oficiais em
> [§ 2](#2-applicationinfo-exigido-pela-store)). Portanto ele **não entra** nesta
> sincronia e **não é achado** a "ausência" de versão nele — nunca reportar
> `application.version` faltando.

### 4.5 Imutabilidade do `code` do `component.xml`

Certas chaves não são apenas nomes: são a **identidade** com que a plataforma liga
uma atualização ao artefato já publicado. O `<code>` do `component.xml` é a chave de
identidade do app na Store — trocar seu **valor** após a publicação não atualiza o
app existente: a plataforma passa a tratá-lo como um app **novo/distinto**, quebrando
o canal de atualização de quem já o instalou. A regra genérica de imutabilidade das
demais chaves de identidade do artefato (`application.code` de widget/layout,
coordenadas Maven) é fonte de verdade em
[Chaves de identidade do artefato publicado](architecture.md#chaves-de-identidade-do-artefato-publicado).

**Aplicação por frente do Triângulo de Ferro:**

- **Scaffolding** — define o `<code>` na criação, já na convenção correta (lowercase
  sem separadores, alinhado ao `application.code` e ao context-root — ver
  [§ 2](#2-applicationinfo-exigido-pela-store) e
  [§ 6](#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro)).
- **Modernize** — **preserva** o `<code>` como está. É PROIBIDO renomeá-lo durante
  refatoração de um app existente, mesmo que o valor atual esteja fora da convenção.
  A troca só é admitida quando o desenvolvedor **confirmar explicitamente** que o app
  ainda **não foi publicado** (mesma lógica de congelamento in-flight de
  [§ 4.2](#42-congelamento-em-desenvolvimento-in-flight)).
- **Pré-review** — **não recomenda renomear** o `<code>` de app já publicado. Valor
  fora da convenção em app publicado é, no máximo,
  **informativo/"VERIFICAR MANUALMENTE"** (ver
  [§ 22](partner-store-review-rules.md#22-análise-contextual-e-heurísticas-anti-falso-positivo)).
  Só sugerir padronização com confirmação de que o app ainda não foi publicado.

---

## 5. Bibliotecas de terceiros e acoplamento à plataforma

Toda biblioteca JavaScript de terceiros embarcada no WAR é um **ponto de
acoplamento** que afeta a longevidade do componente na Store. A dimensão
**arquitetural** desse acoplamento — acoplamento à versão global do jQuery mantida
pela plataforma, superfície de manutenção e autonomia do artefato — importa porque a
atualização ou descontinuação da versão global pela plataforma impacta diretamente o
componente publicado. A prioridade a APIs nativas (ver
[JavaScript Moderno (ES6+)](conventions.md#javascript-moderno-es6)) e a componentes
nativos ([business-components.md](business-components.md)) mantém o artefato autônomo
e resiliente a mudanças da plataforma. A proibição de CDN externo na Store é fonte de
verdade em [§ 5](partner-store-review-rules.md#5-cdn-externo); aqui vale o processo de
avaliação quando uma lib de terceiros é cogitada.

> **Princípio de tom:** o objetivo não é apenas "barrar" a lib, e sim **ajudar o
> parceiro a construir a melhor solução a longo prazo** — esgotando o nativo,
> avaliando em conjunto com a TOTVS e, quando fizer sentido, evoluindo o produto.

### 5.1 Prioridade nativa antes de qualquer lib

Antes de introduzir **qualquer** biblioteca JavaScript de terceiros, a IA DEVE
avaliar se não existe:

1. Um **componente/solução nativo** da plataforma (Style Guide `FLUIGC.*`,
   Componentes de Negócio nativos de [business-components.md](business-components.md),
   API pública documentada); ou
2. Uma **alternativa em Vanilla JS** (API nativa do navegador — ver
   [JavaScript Moderno (ES6+)](conventions.md#javascript-moderno-es6)).

Só quando **nenhuma** dessas alternativas for viável a inclusão da lib externa é
considerada.

### 5.2 Alerta de Acoplamento jQuery

Quando a intenção for incluir uma biblioteca de terceiros que **dependa de
jQuery**, a IA DEVE emitir um **alerta explícito** ao parceiro:

> A biblioteca ficará **acoplada à versão global do jQuery** mantida pela
> plataforma. Caso a plataforma **atualize ou descontinue** essa versão no futuro,
> a biblioteca do parceiro será **diretamente impactada** (quebra ou
> incompatibilidade), sem que o parceiro controle esse ciclo de vida.

O alerta é **obrigatório** e deve constar do relatório (pré-review) ou do resumo de
execução (Scaffolding/Modernize).

### 5.3 Processo Colaborativo de Avaliação (3 passos)

Quando a intenção for incluir uma biblioteca de terceiros (com ou sem dependência
de jQuery), a IA **não** deve simplesmente barrar nem injetar a dependência de
imediato. Deve conduzir o parceiro por um **processo colaborativo de avaliação em
3 passos**, com tom consultivo e profissional, incentivando a melhor solução a
longo prazo:

**Passo 1 — Self-Service (esgotar o nativo).** O parceiro primeiro esgota as
buscas na **documentação oficial** e no **Style Guide do Fluig** para confirmar se
não existe um componente/solução **nativo** que resolva o problema (ver
[§ 5.1](#51-prioridade-nativa-antes-de-qualquer-lib) — `FLUIGC.*`, Componentes de
Negócio nativos, API pública, ou equivalente em Vanilla JS). Havendo nativo, ele é a
recomendação — a lib externa não entra.

**Passo 2 — Avaliação Conjunta (acionar Parcerias/Alianças).** Se, comprovadamente,
**não existir** solução nativa, em vez de injetar a dependência de imediato, o
parceiro deve **acionar o time de Parcerias/Alianças da TOTVS** para uma
**avaliação arquitetural conjunta** — não decidir unilateralmente pela inclusão.

**Passo 3 — Evolução de Produto (o porquê do contato).** Essa avaliação conjunta
serve para:

- **(a) Feature oficial:** avaliar com os **Product Owners (POs)** se a necessidade
  faz sentido entrar como uma **nova feature oficial da plataforma** (resolvendo o
  problema de forma nativa para todo o ecossistema); e/ou
- **(b) Homologação segura:** analisar, de forma segura, se a biblioteca de
  terceiros pode ser **homologada como exceção** — sem risco de quebra futura no
  App Review.

| Situação | Postura consultiva da IA |
|----------|--------------------------|
| Existe nativo/Vanilla JS equivalente | Recomendar o nativo (Passo 1); a lib externa não é necessária |
| Lib de terceiros depende de jQuery | Emitir **Alerta de Acoplamento jQuery** ([§ 5.2](#52-alerta-de-acoplamento-jquery)) e explicar o processo de 3 passos |
| Sem alternativa nativa e lib potencialmente necessária | Orientar o **Passo 2** (avaliação conjunta com Parcerias/Alianças) e o **Passo 3** (feature de produto ou homologação segura) **antes da submissão** |
| Nova dependência jQuery sem justificativa | Sinalizar de forma consultiva e conduzir os 3 passos — não introduzir sem passar pelo processo |

> **Anti-pattern:** adicionar biblioteca de terceiros dependente de jQuery
> assumindo estabilidade permanente da versão global, **pulando o processo de
> avaliação conjunta**. A versão do jQuery é controlada pela plataforma e pode
> mudar; a homologação/evolução via Parcerias é o caminho seguro para não quebrar
> no App Review.

---

## 6. Namespacing e isolamento de artefatos (prefixo de parceiro)

O Fluig resolve artefatos (datasets, serviços, processos, mecanismos, widgets,
layouts) em um **escopo global** — não há isolamento automático por fornecedor. Sem
um prefixo dedicado, um artefato do parceiro pode **colidir** com um artefato nativo
da plataforma ou de **outro fornecedor** instalado no mesmo ambiente, causando
sobrescrita, resolução ambígua ou falha silenciosa. As três frentes do Triângulo de
Ferro herdam esta regra: Scaffolding gera **já com o prefixo**, pré-review
**bloqueia** artefato sem prefixo, Modernize **refatora** o legado sem prefixo.

### 6.1 Regra: todo artefato carrega o prefixo oficial do parceiro

Todos os artefatos gerados por este pacote **devem obrigatoriamente** carregar o
prefixo oficial do parceiro. O prefixo é representado por dois placeholders,
conforme a restrição de caracteres de cada tipo de artefato:

| Placeholder | Forma | Onde se aplica |
|-------------|-------|----------------|
| `<PREFIXO_PARCEIRO>_` | Prefixo + `_` (aceita underscore) | Datasets, Serviços, Processos e Mecanismos |
| `<prefixoparceiro>` | Aglutinado, minúsculo, sem `_` nem especiais | `application.code` de Widgets e Layouts |

> **Por que dois formatos:** o `application.code` de widget/layout aceita **apenas
> letras minúsculas sem caracteres especiais** (ver
> [§ 2](#2-applicationinfo-exigido-pela-store)). Por isso o prefixo é **aglutinado**
> no início, sem separador. Nos demais artefatos, o padrão de nomenclatura já usa
> `_` como separador, então o prefixo entra como um segmento adicional no início.

### 6.2 Aplicação por tipo de artefato

**Datasets, Serviços, Processos e Mecanismos** — o prefixo `<PREFIXO_PARCEIRO>_`
é adicionado **antes** da nomenclatura padrão do artefato:

```
<PREFIXO_PARCEIRO>_crm_consulta_cliente
```

| Artefato | Sem prefixo (ERRADO) | Com prefixo (CORRETO) |
|----------|----------------------|-----------------------|
| Dataset | `crm_consulta_cliente` | `<PREFIXO_PARCEIRO>_crm_consulta_cliente` |
| Serviço | `crm_integracao` | `<PREFIXO_PARCEIRO>_crm_integracao` |
| Processo | `rh_admissao` | `<PREFIXO_PARCEIRO>_rh_admissao` |
| Mecanismo | `crm_alcada` | `<PREFIXO_PARCEIRO>_crm_alcada` |

**Widgets e Layouts (`application.code`)** — o prefixo `<prefixoparceiro>` é
**aglutinado** no início do código, sem separador:

```
<prefixoparceiro>graficovendas
```

| Artefato | Sem prefixo (ERRADO) | Com prefixo (CORRETO) |
|----------|----------------------|-----------------------|
| Widget | `graficovendas` | `<prefixoparceiro>graficovendas` |
| Layout | `portalcliente` | `<prefixoparceiro>portalcliente` |

> **Anti-pattern:** gerar um dataset `crm_consulta_cliente` ou um widget com
> `application.code=graficovendas` sem o prefixo do parceiro — risco de colisão no
> escopo global do Fluig. É achado bloqueante na revisão.

### 6.3 Onboarding: setup interativo guiado pela IA (aprovação humana obrigatória)

O prefixo real do parceiro **não é inventado** pela IA nem assumido por padrão. Ele
é definido em um **fluxo de onboarding interativo** na **primeira interação** com um
novo parceiro que clonou o template. O fluxo é:

1. **Explicar a regra.** A IA explica **brevemente** a regra de Namespacing (por que
   o escopo global do Fluig exige um prefixo para evitar colisão).
2. **Perguntar o nome da empresa.** A IA pergunta o **nome da empresa** do parceiro.
3. **Sugerir uma sigla.** Com base no nome, a IA **sugere** uma sigla nas duas formas
   necessárias (`<PREFIXO_PARCEIRO>` com underscore e `<prefixoparceiro>` aglutinada).
4. **Pedir aprovação ou contraproposta.** A IA solicita a **aprovação explícita** do
   parceiro **ou** uma **contraproposta** de sigla.
5. **Executar o Find and Replace global — somente após aprovação.** Apenas após a
   **aprovação explícita** do parceiro, a IA está autorizada a executar o *Find and
   Replace* global que substitui os placeholders `<PREFIXO_PARCEIRO>` e
   `<prefixoparceiro>` pelo prefixo aprovado em todo o pacote.

> **Trava de certeza técnica:** os placeholders **nunca** são substituídos sem a
> aprovação explícita do parceiro. O prefixo é um **dado crítico** definido pelo
> humano — pode ser sugerido, mas não decidido unilateralmente nem inventado
> (proibição de alucinação paramétrica).

### 6.4 Persistência: este arquivo é a memória permanente do prefixo

Após a substituição inicial no onboarding ([§ 6.3](#63-onboarding-setup-interativo-guiado-pela-ia-aprovação-humana-obrigatória)),
**este arquivo (`partner-store-conventions.md`) torna-se a memória permanente do
prefixo do parceiro**. A partir daí:

- A IA **deve sempre consultar este arquivo e o repositório** para descobrir o
  **prefixo vigente** antes de gerar qualquer novo artefato em novas skills.
- A IA está **proibida de inventar novas siglas a cada prompt** — o prefixo é único
  por parceiro e permanece estável ao longo de todo o ciclo de vida do projeto.
- Qualquer novo dataset, serviço, processo, mecanismo, widget ou layout gerado
  **reutiliza o prefixo já registrado**, nunca um prefixo novo ou improvisado.

> **Anti-pattern:** gerar um segundo artefato com uma sigla diferente da já
> aprovada e registrada — quebra o isolamento e cria namespaces divergentes dentro
> do mesmo projeto de parceiro. Na dúvida sobre qual é o prefixo vigente, **consultar
> este arquivo e o repositório** antes de gerar; nunca improvisar.

---

## Referências Cruzadas

Esta camada é o **delta de Store** das convenções. A base genérica vive em:

- Backend Java/Maven (coordenadas, JNDI, DAO, persistência, i18n Java): [backend-java-maven.md](backend-java-maven.md).
- Convenções de frontend (ES6+, recursos locais, UTF-8, parametrização): [conventions.md](conventions.md).
- Arquitetura (validação de `application.info`, `simple.deploy`, chaves de identidade): [architecture.md](architecture.md).
- Arquitetura de provisionamento da Store: [partner-store-architecture.md](partner-store-architecture.md).
- Regras de review da Store: [partner-store-review-rules.md](partner-store-review-rules.md).
- Componentes de negócio nativos: [business-components.md](business-components.md).
